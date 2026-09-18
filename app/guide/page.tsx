import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@/app/components/Icon";
export const metadata: Metadata = { title: "学习指南" };
export default function Guide() {
  return (
    <main id="main" className="page guide-page">
      <div className="page-heading">
        <div className="eyebrow">A LITTLE CURIOSITY GOES A LONG WAY</div>
        <h1>带着问题，进入引擎内部。</h1>
        <p>不必先读完一整章。用十分钟，把一个过程弄明白。</p>
      </div>
      <div className="guide-layout">
        <article className="guide-content">
          <h2>你的第一个实验：节点为什么会分裂？</h2>
          <p>
            B+ Tree
            用内部节点的分隔键导航，实际键保存在叶节点。每个节点的空间是有限的：写入超过容量，就需要分裂并更新索引。
          </p>
          <ol className="guide-steps">
            <li>
              <strong>预测</strong>
              <p>
                每个节点最多放 3 个键。已有 [10, 20, 30]，再插入
                40，会发生什么？
              </p>
            </li>
            <li>
              <strong>操作</strong>
              <p>
                进入实验室，选择“第一次分裂”。用“下一步”逐帧观察定位、写入和分裂。
              </p>
            </li>
            <li>
              <strong>观察</strong>
              <p>
                留意临时溢出的叶节点。分裂后，右侧最小键会复制到父节点，同时仍保留在叶节点中。
              </p>
            </li>
            <li>
              <strong>验证</strong>
              <p>
                把容量改为
                4，再播放同一组数据。树还会分裂吗？切换到查找模式，搜索 30
                和不存在的 35，比较结果。
              </p>
            </li>
          </ol>
          <Link className="button primary" href="/simulators/bptree">
            打开 B+ Tree 实验
            <Icon name="arrow" size={18} />
          </Link>
          <h2>接下来：让写入走完两条不同的路</h2>
          <p>
            LSM Tree 把写入先放进有序 MemTable，达到阈值后冻结、刷成
            SSTable，并通过 compaction 合并重叠版本。Bitcask
            则把每次写入直接追加到日志中，让内存里的 Keydir 指向最新
            offset；它不改写旧记录，而是在合并时回收它们。
          </p>
          <p>
            两个实验都使用同一组观察方法：先预测更新同一个 key
            后旧版本在哪里，再单步查看内存结构、磁盘文件或日志，以及最后的合并结果。
          </p>
          <div className="guide-lab-links">
            <Link className="button secondary" href="/simulators/lsm">
              打开 LSM Tree 实验
              <Icon name="arrow" size={17} />
            </Link>
            <Link className="button secondary" href="/simulators/bitcask">
              打开 Bitcask 实验
              <Icon name="arrow" size={17} />
            </Link>
          </div>
          <h2>学完之后，试着回答</h2>
          <p>
            为什么分隔键可能同时出现在索引节点和叶节点？为什么没有找到键，也要走到叶节点？更大的节点容量，如何影响这组数据的树高？
          </p>
        </article>
        <aside className="guide-aside">
          <Icon name="book" size={26} />
          <h3>关于这个教学模型</h3>
          <p>我们用少量整数键展示核心机制，让每一步可以被观察。</p>
          <p>
            当前支持唯一整数键的插入与查找；容量表示最大键数，不等同于实际数据库的页大小。虚线表示叶节点的有序关系。
          </p>
          <p>
            实际引擎还涉及数据页布局、缓存、持久化、并发和恢复，本实验暂不模拟这些部分。
          </p>
          <div className="guide-note">先建立直觉，再追问真实系统里的取舍。</div>
        </aside>
      </div>
    </main>
  );
}
