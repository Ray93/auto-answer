import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "答题面板",
  description: "登录后查看答题统计，并支持补答",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        style={{
          fontFamily: "'Source Han Sans SC', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
