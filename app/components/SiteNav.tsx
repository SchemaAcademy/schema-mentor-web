"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "./Icon";

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <>
      <a className="skip-link" href="#main">
        跳到主要内容
      </a>
      <button
        className="mobile-menu icon-button"
        onClick={() => setOpen(!open)}
        aria-label={open ? "收起导航" : "展开导航"}
        aria-expanded={open}
      >
        <Icon name="menu" />
      </button>
      <aside className={`sidebar ${open ? "is-open" : ""}`}>
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">
            <Icon name="layers" size={24} />
          </span>
          <span>
            Schema<span className="brand-light">Mentor</span>
            <small>存储引擎 · 交互式学习</small>
          </span>
        </Link>
        <div className="nav-label">WORKSPACE</div>
        <nav aria-label="主导航">
          <Link
            href="/"
            aria-current={pathname === "/" ? "page" : undefined}
            className={`nav-item ${pathname === "/" ? "active" : ""}`}
            onClick={() => setOpen(false)}
          >
            <Icon name="grid" />
            探索空间
          </Link>
          <Link
            href="/simulators"
            aria-current={
              pathname.startsWith("/simulators") ? "page" : undefined
            }
            className={`nav-item ${pathname.startsWith("/simulators") ? "active" : ""}`}
            onClick={() => setOpen(false)}
          >
            <Icon name="terminal" />
            交互实验室<span className="nav-count">03</span>
          </Link>
          <Link
            href="/guide"
            aria-current={pathname === "/guide" ? "page" : undefined}
            className={`nav-item ${pathname === "/guide" ? "active" : ""}`}
            onClick={() => setOpen(false)}
          >
            <Icon name="book" />
            学习指南
          </Link>
        </nav>
        <div className="nav-label topic-label">存储引擎</div>
        <Link
          href="/simulators/bptree"
          className="topic-link"
          onClick={() => setOpen(false)}
        >
          <span className="tiny-dot blue" />
          B+ Tree<span className="tiny-live">可体验</span>
        </Link>
        <Link
          href="/simulators/lsm"
          className="topic-link"
          onClick={() => setOpen(false)}
        >
          <span className="tiny-dot" />
          LSM Tree<span className="tiny-live">可体验</span>
        </Link>
        <Link
          href="/simulators/bitcask"
          className="topic-link"
          onClick={() => setOpen(false)}
        >
          <span className="tiny-dot" />
          Bitcask<span className="tiny-live">可体验</span>
        </Link>
        <div className="sidebar-note">
          <span className="note-icon">↳</span>
          <p>
            理解原理，
            <br />
            从亲手操作开始。
          </p>
          <span>Learn by doing.</span>
        </div>
        <a
          className="github-link"
          href="https://github.com/SchemaAcademy/schema-mentor-web"
          target="_blank"
          rel="noreferrer"
        >
          <Icon name="code" size={18} />
          开源项目
          <Icon name="external" size={14} />
        </a>
        <div className="sidebar-foot">
          <span className="tiny-dot blue" />
          一个持续生长的知识空间
        </div>
      </aside>
      <header className="topbar">
        <span>
          工作空间 <span className="crumb-slash">/</span>{" "}
          <strong>
            {pathname === "/"
              ? "探索空间"
              : pathname === "/guide"
                ? "学习指南"
                : "交互实验室"}
          </strong>
        </span>
        <span className="topbar-note">
          <span className="tiny-dot blue" />
          把抽象原理，变成直觉
        </span>
      </header>
    </>
  );
}
