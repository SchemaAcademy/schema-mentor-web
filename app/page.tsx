import Link from "next/link";
import { HomeTreeDemo } from "./components/HomeTreeDemo";
import { LabCatalog } from "./components/LabCatalog";
import { Icon } from "./components/Icon";
export default function Home() {
  return (
    <main id="main" className="page home-page">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-line" />
            EXPLORE THE ENGINE
          </div>
          <h1>
            让存储引擎的每一步，
            <br />
            <span>都看得见。</span>
          </h1>
          <p className="hero-description">
            从一次写入，到一次节点分裂。
            <br />
            亲手操作，逐步观察，把抽象的底层原理变成直觉。
          </p>
          <div className="hero-actions">
            <Link href="/simulators/bptree" className="button primary">
              开始第一个实验
              <Icon name="arrow" size={18} />
            </Link>
            <Link href="/guide" className="text-link">
              如何在这里学习
              <Icon name="external" size={14} />
            </Link>
          </div>
          <div className="hero-meta">
            <span>
              <Icon name="check" size={15} />
              无需配置环境
            </span>
            <span>
              <Icon name="check" size={15} />
              可暂停、可回放
            </span>
            <span>
              <Icon name="check" size={15} />
              从原理出发
            </span>
          </div>
        </div>
        <HomeTreeDemo />
      </section>
      <section className="catalog-section" aria-labelledby="catalog-title">
        <div className="section-heading">
          <div>
            <div className="eyebrow">THE PLAYGROUND</div>
            <h2 id="catalog-title">选择一个引擎，打开它的内部。</h2>
            <p>每个实验，回答一个关于存储的好问题。</p>
          </div>
          <Link href="/simulators" className="text-link">
            全部实验
            <Icon name="arrow" size={17} />
          </Link>
        </div>
        <LabCatalog />
      </section>
      <section className="learning-strip">
        <div className="learning-intro">
          <span className="eyebrow">LEARNING BY DOING</span>
          <h2>
            不止看到结果，
            <br />
            更要理解过程。
          </h2>
          <Link href="/guide" className="text-link">
            查看学习指南
            <Icon name="arrow" size={15} />
          </Link>
        </div>
        <div className="learning-step">
          <span className="step-number">01</span>
          <h3>先提一个问题</h3>
          <p>
            节点满了会怎样？
            <br />
            带着预测开始探索。
          </p>
        </div>
        <div className="learning-step">
          <span className="step-number">02</span>
          <h3>动手改变状态</h3>
          <p>
            插入一个键，调整参数，
            <br />
            让内部过程自己给出答案。
          </p>
        </div>
        <div className="learning-step">
          <span className="step-number">03</span>
          <h3>把变化连成原理</h3>
          <p>
            暂停、回放、比较，
            <br />
            理解每一步为什么发生。
          </p>
        </div>
      </section>
      <footer className="page-footer">
        <span>
          SchemaMentor <span className="footer-dot">·</span> 为好奇心而构建
        </span>
        <span>Small experiments. Deep understanding.</span>
      </footer>
    </main>
  );
}
