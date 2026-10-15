"use client";

import { useEffect, useRef, useState } from "react";
import ArrowIcon from "./arrow-icon";

type Work = { title: string; tag: string; image: string };

export default function OrbitGallery({ works }: { works: Work[] }) {
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<Work | null>(null);
  const motion = useRef({ angle: 0, target: 0 });

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = preference.matches;
    let frame = 0;
    let previous = 0;
    let width = element.clientWidth;
    const paint = () => {
      const radius = Math.min(width * .36, 520);
      cards.current.forEach((card, index) => {
        if (!card) return;
        const theta = motion.current.angle + index * Math.PI * 2 / works.length;
        const depth = Math.cos(theta);
        const x = Math.sin(theta) * radius;
        const y = depth * (width < 600 ? 115 : 155);
        const scale = .64 + (depth + 1) * .18;
        card.style.transform = reduced ? "none" : `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) perspective(1000px) rotateY(${-Math.sin(theta) * 26}deg) scale(${scale})`;
        card.style.zIndex = String(Math.round((depth + 1) * 100));
        card.style.opacity = reduced ? "1" : String(.45 + (depth + 1) * .275);
      });
    };
    const tick = (time: number) => {
      const delta = previous ? Math.min(time - previous, 50) : 16;
      previous = time;
      const state = motion.current;
      state.angle += (state.target - state.angle) * (1 - Math.exp(-delta / 110));
      const settled = Math.abs(state.target - state.angle) < .0005;
      if (settled) state.angle = state.target;
      paint();
      frame = settled ? 0 : window.requestAnimationFrame(tick);
    };
    const sync = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
      motion.current.target = motion.current.angle;
      paint();
    };
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || reduced || dialog.current?.open) return;
      const raw = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (!raw) return;
      event.preventDefault();
      const pixels = raw * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientHeight : 1);
      const state = motion.current;
      const step = Math.max(-.18, Math.min(.18, pixels * .0018));
      state.target = state.angle + Math.max(-.6, Math.min(.6, state.target + step - state.angle));
      if (!frame) { previous = 0; frame = window.requestAnimationFrame(tick); }
    };
    element.addEventListener("wheel", wheel, { passive: false });
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) sync(); });
    observer.observe(element);
    const resize = new ResizeObserver(() => { width = element.clientWidth; paint(); });
    resize.observe(element);
    const changed = () => { reduced = preference.matches; sync(); };
    preference.addEventListener("change", changed);
    document.addEventListener("visibilitychange", sync);
    paint();
    return () => {
      window.cancelAnimationFrame(frame);
      element.removeEventListener("wheel", wheel);
      observer.disconnect();
      resize.disconnect();
      preference.removeEventListener("change", changed);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [works.length]);

  useEffect(() => { if (selected) dialog.current?.showModal(); }, [selected]);

  return (
    <footer className="orbit-gallery" id="contact">
      <div className="orbit-heading shell">
        <span>05 / SELECTED GALLERY</span>
      </div>
      <div className="orbit-stage" ref={stage}>
        <div className="orbit-center"><span>SHEN YU / VISUAL DESIGN</span><h2>作品环游<span>IN ORBIT.</span></h2></div>
        {works.map((work, index) => (
          <button className="orbit-card" key={work.image} ref={(node) => { cards.current[index] = node; }} type="button"
            aria-label={`查看${work.title}作品`}
            onClick={() => setSelected(work)}>
            <img src={work.image} alt={work.title} loading="lazy" draggable={false} />
            <span className="orbit-card-caption"><span>{String(index + 1).padStart(2, "0")} / {work.title}</span><ArrowIcon direction="right" /></span>
          </button>
        ))}
      </div>
      <div className="orbit-bottom shell">
        <p>滚轮环游 · 点击查看作品</p>
        <a href="mailto:2636799416@qq.com">2636799416@qq.com ↗</a>
      </div>
      <div className="orbit-footer shell"><span>© 2026 SHEN YU</span><a href="#top">回到顶部 <ArrowIcon /></a></div>
      <dialog className="orbit-dialog" ref={dialog} onClose={() => setSelected(null)} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
        <div className="orbit-dialog-bar"><span>{selected?.title}</span><button type="button" autoFocus onClick={() => dialog.current?.close()}>关闭 ×</button></div>
        {selected && <img src={selected.image} alt={`${selected.title}完整作品`} />}
      </dialog>
    </footer>
  );
}
