import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth";
import { getMonthStats } from "@/lib/server-api";

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = "Asia/Shanghai";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ message: "未登录" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") ?? dayjs().tz(TZ).format("YYYY-MM");

    const stats = await getMonthStats(token, month);
    const summary = stats.questionStaticList.reduce(
      (acc, item) => {
        acc.total += 1;
        if (item.holiday) {
          acc.holiday += 1;
        } else if (item.correctNum > 0) {
          acc.answered += 1;
        } else if (item.practiceNum > 0) {
          acc.answered += 1;
        } else {
          acc.pending += 1;
        }
        return acc;
      },
      { total: 0, answered: 0, pending: 0, holiday: 0 },
    );

    return NextResponse.json({
      ...stats,
      summary,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "读取统计失败";
    return NextResponse.json({ message }, { status: 400 });
  }
}
