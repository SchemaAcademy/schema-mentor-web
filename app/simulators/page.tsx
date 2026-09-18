import type { Metadata } from "next";
import { LabCatalog } from "@/app/components/LabCatalog";
export const metadata: Metadata = { title: "交互实验室" };
export default function SimulatorsIndexPage() {
  return (
    <main id="main" className="page">
      <div className="page-heading">
        <div className="eyebrow">THE PLAYGROUND</div>
        <h1>交互实验室</h1>
        <p>从一个可观察的小实验，理解一个真实的存储原理。</p>
      </div>
      <LabCatalog />
      <div className="catalog-note">
        <strong>从 B+ Tree 开始</strong>
        <p>
          不需要数据库环境。先观察一个节点如何分裂，再修改容量与插入顺序，比较同一组数据形成的不同结构。
        </p>
      </div>
    </main>
  );
}
