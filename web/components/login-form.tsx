"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account, password }),
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message || "登录失败");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full border-white/70 bg-white/92 shadow-xl backdrop-blur">
      <CardHeader className="space-y-0 gap-3 border-b border-stone-200/70 pb-5">
        <div className="flex items-center justify-between">
          <p className="inline-flex w-fit items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            账号登录
          </p>
          <span className="text-xs text-muted-foreground">Auto Answer</span>
        </div>
        <div className="flex flex-col gap-2">
          <CardTitle className="text-2xl tracking-tight text-primary sm:text-[1.75rem]">欢迎回来</CardTitle>
          <CardDescription className="text-sm leading-relaxed">好好学习，天天向上</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form className="flex flex-col gap-5 mt-5" onSubmit={onSubmit} noValidate>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground/90" htmlFor="account">
                账号
              </label>
              <Input
                id="account"
                autoComplete="username"
                value={account}
                onChange={(event) => setAccount(event.target.value)}
                placeholder="请输入账号"
                className="h-10 border-stone-300 bg-white"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground/90" htmlFor="password">
                密码
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="请输入密码"
                className="h-10 border-stone-300 bg-white"
                required
              />
            </div>
          </div>
          {error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          ) : null}
          <Button className="h-10 w-full text-sm font-semibold" type="submit" disabled={loading}>
            {loading ? "登录中..." : "登录"}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground">登录状态仅保存在当前浏览器会话中。</p>
      </CardContent>
    </Card>
  );
}
