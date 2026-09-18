import Link from "next/link";
import { Icon } from "./Icon";
export function LabCatalog() {
  return (
    <div className="lab-catalog">
      <Link href="/simulators/bptree" className="lab-card available">
        <div className="card-top">
          <span className="card-icon blue-icon">
            <Icon name="tree" size={25} />
          </span>
          <span className="status available-status">
            <span className="tiny-dot blue" />
            可以开始
          </span>
        </div>
        <div className="card-category">有序索引 · ORDERED INDEX</div>
        <h3>B+ Tree</h3>
        <p>
          一条数据如何找到自己的位置？
          <br />
          亲手观察查找、插入与节点分裂。
        </p>
        <div className="card-tags">
          <span>路径查找</span>
          <span>节点分裂</span>
          <span>逐步回放</span>
        </div>
        <div className="card-bottom">
          <span>
            <Icon name="clock" size={14} />约 10 分钟 · 入门
          </span>
          <span className="card-go">
            进入实验
            <Icon name="arrow" size={17} />
          </span>
        </div>
      </Link>
      <Link href="/simulators/lsm" className="lab-card available">
        <div className="card-top">
          <span className="card-icon amber-icon">
            <Icon name="layers" size={25} />
          </span>
          <span className="status available-status">
            <span className="tiny-dot blue" />
            可以开始
          </span>
        </div>
        <div className="card-category">日志结构 · LOG-STRUCTURED</div>
        <h3>LSM Tree</h3>
        <p>
          写入为什么可以这么快？
          <br />
          从内存中的写入，到磁盘上的合并。
        </p>
        <div className="card-tags">
          <span>MemTable</span>
          <span>SSTable</span>
          <span>Compaction</span>
        </div>
        <div className="card-bottom">
          <span>
            <Icon name="clock" size={14} />约 12 分钟 · 入门
          </span>
          <span className="card-go">
            进入实验
            <Icon name="arrow" size={17} />
          </span>
        </div>
      </Link>
      <Link href="/simulators/bitcask" className="lab-card available">
        <div className="card-top">
          <span className="card-icon purple-icon">
            <Icon name="database" size={25} />
          </span>
          <span className="status available-status">
            <span className="tiny-dot blue" />
            可以开始
          </span>
        </div>
        <div className="card-category">键值存储 · KEY-VALUE</div>
        <h3>Bitcask</h3>
        <p>
          简单的追加写，如何构成存储引擎？
          <br />
          连接内存索引与磁盘数据文件。
        </p>
        <div className="card-tags">
          <span>追加写入</span>
          <span>Keydir</span>
          <span>数据合并</span>
        </div>
        <div className="card-bottom">
          <span>
            <Icon name="clock" size={14} />约 10 分钟 · 入门
          </span>
          <span className="card-go">
            进入实验
            <Icon name="arrow" size={17} />
          </span>
        </div>
      </Link>
    </div>
  );
}
