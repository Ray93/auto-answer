import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth";
import { answerDateWithCheck } from "@/lib/server-api";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ message: "未登录" }, { status: 401 });
    }

    const body = (await request.json()) as { date?: string };
    const date = body.date?.trim();
    if (!date) {
      return NextResponse.json({ message: "缺少日期参数" }, { status: 400 });
    }

    const result = await answerDateWithCheck(token, date);
    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "补答失败";
    return NextResponse.json({ message }, { status: 400 });
  }
}
