"use client";

import { useEffect, useRef } from "react";
import ArrowIcon from "./arrow-icon";
import "./scene-showcase.css";

type SceneWork = { title: string; tag: string; image: string };

export default function SceneShowcase({ works, onPreview }: { works: SceneWork[]; onPreview: (work: SceneWork) => void }) {
  const gallery = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = gallery.current;
    if (!element) return;
    let frame = 0;
    let last = 0;
    let cycle = 0;
    let position = element.scrollTop;
    let target = position;
    const stop = () => { cancelAnimationFrame(frame); frame = 0; position = target = element.scrollTop; };
    // Keep the viewport in the middle copy. Move the pending easing target by
    // exactly the same amount so wrapping never changes the scrolling velocity.
    const render = () => {
      if (!cycle) return;
      const wrapped = cycle + ((position - cycle) % cycle + cycle) % cycle;
      target += wrapped - position;
      position = wrapped;
      element.scrollTop = position;
    };
    const measure = () => {
      if (!element.clientHeight) return;
      const group = element.querySelector<HTMLElement>(".scene-showcase-loop");
      const nextCycle = group?.getBoundingClientRect().height ?? 0;
      if (!nextCycle) return;
      const progress = cycle ? ((position - cycle) % cycle + cycle) % cycle / cycle : 0;
      stop();
      cycle = nextCycle;
      position = target = cycle * (1 + progress);
      render();
    };
    const tick = (time: number) => {
      const delta = last ? Math.min(time - last, 50) : 16;
      last = time;
      const distance = target - position;
      position += distance * (1 - Math.exp(-delta / 100));
      render();
      if (Math.abs(distance) > 1) frame = requestAnimationFrame(tick);
      else { position = target; render(); frame = 0; }
    };
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      event.preventDefault();
      const pixels = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientHeight : 1);
      if (!cycle) measure();
      if (!cycle) return;
      if (!frame) position = target = element.scrollTop;
      target += pixels;
      if (!frame) { last = 0; frame = requestAnimationFrame(tick); }
    };
    const scroll = () => {
      // Touch gestures and keyboard scrolling use the same seamless wrap.
      if (!cycle || Math.abs(element.scrollTop - position) <= 1) return;
      stop();
      render();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    const firstGroup = element.querySelector(".scene-showcase-loop");
    if (firstGroup) observer.observe(firstGroup);
    measure();
    element.addEventListener("wheel", wheel, { passive: false });
    element.addEventListener("scroll", scroll, { passive: true });
    element.addEventListener("pointerdown", stop);
    return () => { stop(); observer.disconnect(); element.removeEventListener("wheel", wheel); element.removeEventListener("scroll", scroll); element.removeEventListener("pointerdown", stop); };
  }, []);

  return <section id="scenes" className="scene-showcase" aria-labelledby="scene-showcase-heading">
    <header className="scene-showcase-header">
      <img className="scene-showcase-ribbon" src="/ribbon-scenes.png" alt="" aria-hidden="true" />
      <img className="scene-showcase-logo" src="/seksek-logo-frameless.png" alt="SEKSEK DESIGN STUDIO" />
      <h2 id="scene-showcase-heading">在光影之间 构建想象</h2>
      <span className="image-masked-label">REGARDING 3D RENDERING</span>
    </header>
    <div className="scene-showcase-body">
      <div className="scene-showcase-copy">
        <h3>一个轮廓 一处转折<br />一束落下的光</h3>
        <div className="scene-showcase-rule" aria-hidden="true" />
        <p>从轮廓塑造到细节雕琢<br />从材质表现到光影渲染<br />将创意转化为立体的视觉表达</p>
        <p>在形态、比例与质感之间反复推敲<br />让每一个模型都经得起不同角度的审视</p>
      </div>
      <div className="scene-showcase-gallery" ref={gallery} tabIndex={0} role="region" aria-label="3D 渲染作品，滚轮上下无限循环浏览">
        {[0, 1].map(column => <div className={`scene-showcase-column scene-showcase-column-${column}`} key={column}>
          {[0, 1, 2].map(copy => <div className="scene-showcase-loop" key={copy} aria-hidden={copy !== 1 ? true : undefined}>
            {works.map((work, index) => index % 2 === column ? <button className="scene-showcase-card" key={work.image} type="button" tabIndex={copy === 1 ? 0 : -1} aria-label={`放大查看${work.title}`} onClick={() => onPreview(work)}>
              <img src={work.image} alt={`${work.title}场景作品`} loading={copy === 1 && index < 4 ? "eager" : "lazy"} />
              <span className="scene-showcase-card-caption"><strong>{work.title}</strong><em>{work.tag}</em></span>
            </button> : null)}
          </div>)}
        </div>)}
      </div>
      <footer className="scene-showcase-footer">
        <button type="button" aria-label="收起 3D 渲染板块" onClick={event => event.currentTarget.closest("dialog")?.requestClose()}><ArrowIcon /></button>
        <p><span>3D RENDERING</span><span>通过空间、材质与光影，构建产品的视觉氛围</span></p>
      </footer>
    </div>
  </section>;
}
