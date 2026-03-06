import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth";
import { answerMonth } from "@/lib/server-api";

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = "Asia/Shanghai";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ message: "未登录" }, { status: 401 });
    }

    const body = (await request.json()) as { month?: string };
    const month = body.month?.trim() || dayjs().tz(TZ).format("YYYY-MM");

    const result = await answerMonth(token, month);
    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "一键补答失败";
    return NextResponse.json({ message }, { status: 400 });
  }
}
