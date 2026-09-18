import type { Metadata } from "next";
import Link from "next/link";
import BitcaskSimulator from "@/app/components/BitcaskSimulator";

export const metadata: Metadata = { title: "Bitcask 交互实验" };

export default function BitcaskPage() {
  return (
    <main id="main" className="page lab-page">
      <div className="lab-breadcrumb">
        <Link href="/simulators">交互实验室</Link>
        <span>/</span>
        <span>Bitcask</span>
      </div>
      <div className="lab-heading">
        <div>
          <div className="eyebrow">EXPERIMENT 03 / KEY-VALUE</div>
          <h1>
            Bitcask <span>最新的值，藏在什么位置</span>
          </h1>
          <p>观察一份追加日志和内存索引如何配合，避免读取旧版本。</p>
        </div>
        <Link href="/guide" className="button secondary">
          阅读学习指南 ↗
        </Link>
      </div>
      <BitcaskSimulator />
    </main>
  );
}
