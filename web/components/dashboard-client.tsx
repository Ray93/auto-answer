"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import type { QuestionStatic } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = "Asia/Shanghai";

interface StatsPayload {
  month: string;
  startDate: string;
  endDate: string;
  questionStaticList: QuestionStatic[];
  summary: {
    total: number;
    answered: number;
    pending: number;
    holiday: number;
  };
}

const weekdayLabels = ["一", "二", "三", "四", "五", "六", "日"];

function getCellStatus(record: QuestionStatic | undefined, date: string, today: string, loading: boolean) {
  if (loading) return "default";
  if (date > today) return "future";
  if (!record) return "pending";
  if (record.holiday) return "holiday";
  if (record.correctNum > 0) return "answered";
  if (record.practiceNum > 0) return "wrong";
  return "pending";
}

function statusStyle(status: string) {
  switch (status) {
    case "answered":
      return "border-emerald-200 bg-emerald-50";
    case "holiday":
      return "border-slate-200 bg-slate-50";
    case "wrong":
      return "border-rose-200 bg-rose-50";
    case "pending":
      return "border-amber-200 bg-amber-50";
    case "default":
      return "border-stone-200 bg-stone-50";
    default:
      return "border-stone-200 bg-stone-50";
  }
}

export function DashboardClient() {
  const router = useRouter();
  const [month, setMonth] = useState(dayjs().tz(TZ).format("YYYY-MM"));
  const [loading, setLoading] = useState(true);
  const [batchLoading, setBatchLoading] = useState(false);
  const [dailyLoadingDate, setDailyLoadingDate] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const requestIdRef = useRef(0);

  const loadStats = useCallback(
    async (targetMonth: string) => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/stats?month=${targetMonth}`);
        const payload = (await response.json()) as StatsPayload & { message?: string };

        if (!response.ok) {
          throw new Error(payload.message || "读取统计失败");
        }

        if (requestId !== requestIdRef.current) {
          return;
        }
        setStats(payload);
      } catch (err) {
        if (requestId !== requestIdRef.current) {
          return;
        }
        const text = err instanceof Error ? err.message : "读取统计失败";
        setError(text);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    void loadStats(month);
  }, [month, loadStats]);

  const monthStart = useMemo(() => dayjs.tz(`${month}-01`, TZ).startOf("month"), [month]);
  const daysInMonth = monthStart.daysInMonth();
  const firstWeekday = (monthStart.day() + 6) % 7;
  const dateMap = useMemo(() => new Map((stats?.questionStaticList ?? []).map((item) => [item.dateStr, item])), [stats]);
  const today = dayjs().tz(TZ).format("YYYY-MM-DD");
  const isCalendarLoading = loading || stats?.month !== month;

  const cells = useMemo(() => {
    const placeholders = Array.from({ length: firstWeekday }, (_, index) => ({ key: `blank-${index}`, date: "" }));
    const monthCells = Array.from({ length: daysInMonth }, (_, index) => {
      const date = monthStart.date(index + 1).format("YYYY-MM-DD");
      return {
        key: date,
        date,
      };
    });
    return [...placeholders, ...monthCells];
  }, [daysInMonth, firstWeekday, monthStart]);

  const gotoPrevMonth = () => {
    setLoading(true);
    setMonth(monthStart.subtract(1, "month").format("YYYY-MM"));
    setMessage("");
  };

  const gotoNextMonth = () => {
    setLoading(true);
    setMonth(monthStart.add(1, "month").format("YYYY-MM"));
    setMessage("");
  };

  const refresh = async () => {
    await loadStats(month);
  };

  const answerByDate = async (date: string) => {
    setDailyLoadingDate(date);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/answer/day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date }),
      });
      const payload = (await response.json()) as { message?: string; result?: { status: string } };
      if (!response.ok) {
        throw new Error(payload.message || "补答失败");
      }
      const status = payload.result?.status ?? "answered";
      if (status === "holiday") {
        setMessage(`${date} 是休息日，无需补答`);
      } else if (status === "already_answered") {
        setMessage(`${date} 已经答过`);
      } else if (status === "already_wrong") {
        setMessage(`${date} 已答错，无需补答`);
      } else {
        setMessage(`${date} 补答成功`);
      }
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "补答失败");
    } finally {
      setDailyLoadingDate("");
    }
  };

  const answerMonth = async () => {
    setBatchLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/answer/month", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month }),
      });
      const payload = (await response.json()) as {
        message?: string;
        result?: {
          successDates: string[];
          failedDates: { date: string; reason: string }[];
        };
      };
      if (!response.ok) {
        throw new Error(payload.message || "一键补答失败");
      }
      const successCount = payload.result?.successDates.length ?? 0;
      const failCount = payload.result?.failedDates.length ?? 0;
      setMessage(`一键补答完成：成功 ${successCount} 天，失败 ${failCount} 天`);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "一键补答失败");
    } finally {
      setBatchLoading(false);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <div className="container py-8">
      <div className="mb-2 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">答题统计看板</h1>
          <p className="text-sm text-muted-foreground">按日查看是否已答题，支持单日和当月补答。</p>
        </div>
        <Button variant="outline" className="hidden sm:inline-flex" onClick={logout}>
          退出登录
        </Button>
      </div>

      <div className="mb-3 grid grid-cols-4 gap-2 sm:mb-4 sm:gap-3">
        <Card className="bg-white/80">
          <CardHeader className="p-2 pb-1 sm:p-6 sm:pb-2">
            <CardTitle className="text-[11px] font-medium text-muted-foreground sm:text-sm">总天数</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0 sm:p-6 sm:pt-0">
            <div className="text-lg font-bold leading-none sm:text-2xl">{stats?.summary.total ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80">
          <CardHeader className="p-2 pb-1 sm:p-6 sm:pb-2">
            <CardTitle className="text-[11px] font-medium text-muted-foreground sm:text-sm">已答题</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0 sm:p-6 sm:pt-0">
            <div className="text-lg font-bold leading-none text-emerald-600 sm:text-2xl">{stats?.summary.answered ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80">
          <CardHeader className="p-2 pb-1 sm:p-6 sm:pb-2">
            <CardTitle className="text-[11px] font-medium text-muted-foreground sm:text-sm">待补答</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0 sm:p-6 sm:pt-0">
            <div className="text-lg font-bold leading-none text-amber-600 sm:text-2xl">{stats?.summary.pending ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80">
          <CardHeader className="p-2 pb-1 sm:p-6 sm:pb-2">
            <CardTitle className="text-[11px] font-medium text-muted-foreground sm:text-sm">休息</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0 sm:p-6 sm:pt-0">
            <div className="text-lg font-bold leading-none text-slate-500 sm:text-2xl">{stats?.summary.holiday ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/70 bg-white/90 shadow-lg backdrop-blur">
        <CardHeader className="space-y-3 p-3 sm:p-6">
          <div className="flex items-center justify-between gap-2 sm:justify-start">
            <Button variant="outline" size="sm" onClick={gotoPrevMonth}>
              上月
            </Button>
            <h2 className="text-lg font-semibold tabular-nums">{month}</h2>
            <Button variant="outline" size="sm" onClick={gotoNextMonth}>
              下月
            </Button>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-4 sm:gap-1">
              <Badge variant="secondary">黄: 待补答</Badge>
              <Badge className="bg-rose-600 text-white hover:bg-rose-600">红: 答错</Badge>
              <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">绿: 已答</Badge>
              <Badge variant="outline">灰: 休息/未来</Badge>
            </div>
            <Button className="w-full sm:w-auto" onClick={answerMonth} disabled={batchLoading || loading}>
              {batchLoading ? "补答中..." : "一键补答当月"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-3 pt-0 sm:p-6 sm:pt-0">
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {message ? <p className="text-sm text-primary">{message}</p> : null}

          <div className="space-y-1 sm:space-y-2">
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {weekdayLabels.map((label) => (
                <div
                  key={label}
                  className="rounded-md bg-muted px-0.5 py-0.5 text-center text-[10px] font-medium text-muted-foreground sm:px-2 sm:py-1 sm:text-xs"
                >
                  周{label}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {cells.map((cell) => {
                if (!cell.date) {
                  return <div key={cell.key} className="h-14 rounded-lg border border-dashed border-stone-200/70 sm:h-20" />;
                }

                const record = dateMap.get(cell.date);
                const status = getCellStatus(record, cell.date, today, isCalendarLoading);
                const showAction = status === "pending";
                const isWorking = dailyLoadingDate === cell.date;

                return (
                  <div key={cell.key} className={`h-14 rounded-lg border p-0.5 sm:h-20 sm:p-2 ${statusStyle(status)}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold sm:text-sm">{dayjs(cell.date).date()}</span>
                      {status === "answered" ? (
                        <>
                          <Badge className="hidden h-5 bg-emerald-600 text-[10px] text-white sm:inline-flex">已答</Badge>
                          <span className="inline-block h-2 w-2 rounded-full bg-emerald-600 sm:hidden" />
                        </>
                      ) : null}
                      {status === "holiday" ? (
                        <>
                          <Badge variant="outline" className="hidden h-5 text-[10px] sm:inline-flex">休息</Badge>
                          <span className="inline-block h-2 w-2 rounded-full bg-slate-400 sm:hidden" />
                        </>
                      ) : null}
                      {status === "wrong" ? (
                        <>
                          <Badge className="hidden h-5 bg-rose-600 text-[10px] text-white hover:bg-rose-600 sm:inline-flex">答错</Badge>
                          <span className="inline-block h-2 w-2 rounded-full bg-rose-600 sm:hidden" />
                        </>
                      ) : null}
                      {status === "pending" ? (
                        <>
                          <Badge className="hidden h-5 bg-amber-500 text-[10px] text-white sm:inline-flex">待补答</Badge>
                          <span className="inline-block h-2 w-2 rounded-full bg-amber-500 sm:hidden" />
                        </>
                      ) : null}
                      {status === "future" ? (
                        <>
                          <Badge variant="outline" className="hidden h-5 text-[10px] sm:inline-flex">未来</Badge>
                          <span className="inline-block h-2 w-2 rounded-full bg-stone-400 sm:hidden" />
                        </>
                      ) : null}
                    </div>
                    <div className="mt-1 sm:mt-2">
                      {showAction ? (
                        <Button
                          size="sm"
                          className="h-5 w-full px-1 text-[10px] sm:h-7 sm:px-2 sm:text-xs"
                          disabled={isWorking || isCalendarLoading}
                          onClick={() => void answerByDate(cell.date)}
                        >
                          <span className="sm:hidden">{isWorking ? "中" : "补"}</span>
                          <span className="hidden sm:inline">{isWorking ? "处理中..." : "补答"}</span>
                        </Button>
                      ) : (
                        <div className="h-5 sm:h-7" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {isCalendarLoading ? <p className="text-sm text-muted-foreground">加载统计中...</p> : null}
        </CardContent>
      </Card>

      <div className="mt-4 sm:hidden">
        <Button variant="outline" className="w-full" onClick={logout}>
          退出登录
        </Button>
      </div>
    </div>
  );
}
