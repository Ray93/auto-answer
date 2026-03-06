import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth";
import { loginAndGetToken } from "@/lib/server-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { account?: string; password?: string };
    const account = body.account?.trim();
    const password = body.password?.trim();

    if (!account || !password) {
      return NextResponse.json({ message: "账号和密码不能为空" }, { status: 400 });
    }

    const token = await loginAndGetToken(account, password);

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "登录失败";
    return NextResponse.json({ message }, { status: 401 });
  }
}
