"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import VectorWordmark from "./vector-wordmark";
import AmbientLight from "./ambient-light";
import "./site-entrance.css";

const entrances = [
  { title: "关于我", english: "ABOUT ME", description: "关于我的设计经历、思考与创作方式", href: "#about", image: "/entrance-spectrum-about.png" },
  { title: "详情页", english: "DETAILS PAGE", description: "将产品卖点转化为清晰、有节奏的视觉叙事", href: "#details", image: "/entrance-geometric-spectrum.png", numberImage: "/entrance-number-1.png", number: 1 },
  { title: "包装设计", english: "PACKAGING DESIGN", description: "从产品定位到视觉落地，建立完整的包装表达体系", href: "#packaging", image: "/entrance-spectrum-packaging.png", numberImage: "/entrance-number-2.png", number: 2 },
  { title: "3D渲染", english: "3D RENDERING", description: "通过空间、材质与光影，构建产品的视觉氛围", href: "#scenes", image: "/entrance-spectrum-scenes.png", numberImage: "/entrance-number-3.png", number: 3 },
  { title: "IP 人物", english: "CHARACTER DESIGN", description: "探索角色个性，创造属于 SEKSEK 的形象语言", href: "#ip", image: "/entrance-spectrum-ip.png", numberImage: "/entrance-number-4.png", number: 4 },
];

function CategoryArrow() {
  return <span className="entrance-project-arrow" aria-hidden="true"><img src="/category-arrow-light.png" alt="" /></span>;
}

export default function SiteEntrance({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<number | null>(null);
  const [opened, setOpened] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);
  const panel = useRef<HTMLDialogElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const openCategory = (index: number, button: HTMLButtonElement) => {
    if (opened !== null) return;
    trigger.current = button;
    setActive(index);
    setClosing(false);
    setOpened(index);
  };
  useEffect(() => {
    document.documentElement.classList.add("portfolio-home-locked");
    return () => document.documentElement.classList.remove("portfolio-home-locked");
  }, []);
  useEffect(() => {
    const dialog = panel.current;
    const body = content.current;
    if (opened === null || !dialog || !body) return;
    dialog.showModal();
    body.scrollTo({ top: 0, behavior: "instant" });
    dialog.focus({ preventScroll: true });
  }, [opened]);
  const closePanel = () => setClosing(true);
  return (
    <>
      <section className="site-entrance" aria-label="欢迎来到沈宇的作品集">
        <AmbientLight />
        <div className="entrance-frame">
          <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
            <defs>
              <clipPath id="about-glass-curve" clipPathUnits="objectBoundingBox"><path d="M0 .15 Q0 0 .04 0 H.40 Q.435 0 .455 .08 L.505 .30 Q.52 .36 .55 .36 H1 V1 H0 Z" /></clipPath>
              <clipPath id="about-glass-curve-narrow" clipPathUnits="objectBoundingBox"><path d="M0 .15 Q0 0 .06 0 H.55 Q.59 0 .615 .08 L.755 .30 Q.78 .36 .82 .36 H1 V1 H0 Z" /></clipPath>
            </defs>
          </svg>
          <VectorWordmark />
          <nav className="entrance-links" aria-label="作品分类入口" onPointerLeave={() => { if (opened === null) setActive(null); }} onBlur={event => { if (opened === null && !event.currentTarget.contains(event.relatedTarget as Node | null)) setActive(null); }}>
            <button type="button" className="entrance-about" onPointerEnter={() => setActive(null)} onFocus={() => setActive(null)} onClick={event => openCategory(0, event.currentTarget)} aria-haspopup="dialog" aria-controls="portfolio-category-dialog" aria-expanded={opened === 0} aria-label="关于我 — 关于我的设计经历、思考与创作方式">
              <img className="entrance-about-portrait" src="/entrance-about-portrait-grain.png" alt="" aria-hidden="true" />
              <span className="entrance-about-caption">
                <strong>关于我</strong>
                <span className="entrance-about-summary"><CategoryArrow /><span>ABOUT ME<small>关于我的设计经历、思考与创作方式</small></span></span>
              </span>
            </button>
            {entrances.slice(1).map((item, projectIndex) => {
              const index = projectIndex + 1;
              return (
              <button type="button" key={item.href} className={`entrance-project${(opened ?? active) === index ? " is-active" : ""}`} onPointerEnter={() => setActive(index)} onFocus={() => setActive(index)} onClick={event => openCategory(index, event.currentTarget)} aria-haspopup="dialog" aria-controls="portfolio-category-dialog" aria-expanded={opened === index} aria-label={`${item.title} — ${item.description}`}>
                <span className="entrance-project-art" aria-hidden="true">
                  <span className="entrance-image-monochrome"><span className="entrance-image-plane" style={{ backgroundImage: `url("${item.image}")` }} /></span>
                  <span className="entrance-image-glass"><span className="entrance-image-plane" style={{ backgroundImage: `url("${item.image}")` }} /></span>
                </span>
                <CategoryArrow />
                <div className="entrance-project-banner"><span>{item.english}<small>{item.description}</small></span></div>
                <div className="entrance-project-body">
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                  {item.numberImage && <span className="entrance-project-number" aria-hidden="true"><img src={item.numberImage} alt="" /></span>}
                </div>
              </button>
            ); })}
            <div className="entrance-endcap" aria-hidden="true" onPointerEnter={() => setActive(null)}><img src="/entrance-endcap-mark.png" alt="" /></div>
          </nav>
          <footer className="entrance-footer">
            <div className="entrance-software"><strong>USING SOFTWARE</strong><span>[Adobe Photo / Illustrator]</span><span>[GPT images2.0 / nano banana 2 / Codex]</span></div>
            <p className="entrance-manifesto">Design is a process of observing, simplifying, and rebuilding. I believe every visual decision should have a reason, balancing function, emotion, and communication. Rather than adding unnecessary complexity, I focus on clarity, proportion, rhythm, material, and detail. For me, good design is not decoration, but a thoughtful way to express ideas, create experiences, and give each project a distinct visual identity.</p>
            <span className="entrance-credit">SHEN YU / SELECTED WORKS</span>
          </footer>
        </div>
      </section>
      <dialog ref={panel} tabIndex={-1} id="portfolio-category-dialog" data-panel={opened === null ? "" : entrances[opened].href.slice(1)} className={`portfolio-category-dialog${closing ? " is-closing" : ""}`} aria-labelledby="portfolio-category-title" onCancel={event => { if (event.target !== event.currentTarget) return; event.preventDefault(); closePanel(); }} onAnimationEnd={event => { if (closing && event.target === event.currentTarget) panel.current?.close(); }} onClose={event => { if (event.target !== event.currentTarget) return; setOpened(null); setClosing(false); trigger.current?.focus({ preventScroll: true }); }} onClick={event => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closePanel();
      }}>
        <header className="portfolio-category-bar">
          <div><span>SEKSEK / SELECTED WORKS</span><h2 id="portfolio-category-title">{opened === null ? "作品" : entrances[opened].title}</h2></div>
        </header>
        <div ref={content} className="portfolio-category-content" data-panel={opened === null ? "" : entrances[opened].href.slice(1)}>{children}</div>
      </dialog>
    </>
  );
}
