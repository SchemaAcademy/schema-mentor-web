import type { Metadata } from "next";
import { SiteNav } from "@/app/components/SiteNav";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SchemaMentor · 看见存储引擎的内部",
    template: "%s · SchemaMentor",
  },
  description:
    "亲手操作 B+ Tree，逐步观察查找、插入与节点分裂。一个可交互的存储引擎知识空间。",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <SiteNav />
        <div className="workspace">{children}</div>
      </body>
    </html>
  );
}
