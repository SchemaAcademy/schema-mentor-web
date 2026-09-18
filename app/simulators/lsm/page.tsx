import type { Metadata } from "next";
import Link from "next/link";
import LsmTreeSimulator from "@/app/components/LsmTreeSimulator";

export const metadata: Metadata = { title: "LSM Tree 交互实验" };

export default function LsmTreePage() {
  return (
    <main id="main" className="page lab-page">
      <div className="lab-breadcrumb">
        <Link href="/simulators">交互实验室</Link>
        <span>/</span>
        <span>LSM Tree</span>
      </div>
      <div className="lab-heading">
        <div>
          <div className="eyebrow">EXPERIMENT 02 / LOG-STRUCTURED</div>
          <h1>
            LSM Tree <span>一次写入如何抵达磁盘</span>
          </h1>
          <p>让 MemTable、SSTable 和 Compaction 在同一条时间线上发生。</p>
        </div>
        <Link href="/guide" className="button secondary">
          阅读学习指南 ↗
        </Link>
      </div>
      <LsmTreeSimulator />
    </main>
  );
}
