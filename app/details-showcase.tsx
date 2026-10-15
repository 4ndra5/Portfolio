"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import ArrowIcon from "./arrow-icon";
import "./details-showcase.css";

type DetailWork = { title: string; tag: string; image: string };

export default function DetailsShowcase({ works, onPreview }: { works: DetailWork[]; onPreview: (work: DetailWork) => void }) {
  const [active, setActive] = useState(1);
  const activeIndex = useRef(1);
  const gallery = useRef<HTMLDivElement>(null);
  const step = useRef<(direction: number) => void>(() => {});
  const dragged = useRef(false);
  const selected = works[active];
  const change = (direction: number) => step.current(direction);

  useEffect(() => {
    const element = gallery.current;
    if (!element) return;
    const cards = [...element.querySelectorAll<HTMLButtonElement>(".details-showcase-card")];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let position = activeIndex.current % works.length;
    let target = position;
    let velocity = 0;
    let frame = 0;
    let lastTime = 0;
    let selectedIndex = position;
    let snapTimer: ReturnType<typeof setTimeout> | undefined;
    let pointer: { id: number; x: number; y: number; start: number; horizontal: boolean } | null = null;
    const wrap = (value: number) => ((value % works.length) + works.length) % works.length;
    const paint = () => {
      cards.forEach((card, index) => {
        let offset = wrap(index - position);
        if (offset > works.length / 2) offset -= works.length;
        const distance = Math.abs(offset);
        card.style.setProperty("--card-offset", String(offset));
        card.style.setProperty("--card-distance", String(distance));
        card.style.setProperty("--card-tilt", `${-Math.max(-1, Math.min(1, offset)) * 12}deg`);
        card.style.setProperty("--card-shade", String(1 - Math.max(.23, Math.min(1, 1.56 - distance * .58))));
        card.style.zIndex = String(10 - Math.round(distance));
      });
      const next = wrap(Math.round(position));
      if (next !== selectedIndex) { selectedIndex = next; activeIndex.current = next; setActive(next); }
    };
    const tick = (now: number) => {
      const dt = lastTime ? Math.min((now - lastTime) / 1000, .05) : 1 / 60;
      lastTime = now;
      // Critically damped motion keeps velocity when another input arrives.
      // Reduced-motion uses a quicker settle, not an instantaneous jump.
      const frequency = reduced.matches ? 20 : 14;
      const displacement = position - target;
      const decay = Math.exp(-frequency * dt);
      const travel = (velocity + frequency * displacement) * dt;
      position = target + (displacement + travel) * decay;
      velocity = (velocity - frequency * travel) * decay;
      paint();
      if (Math.abs(position - target) > .0005 || Math.abs(velocity) > .003) {
        frame = requestAnimationFrame(tick);
      } else {
        position = target; velocity = 0; frame = 0; lastTime = 0; paint();
      }
    };
    const animate = () => { if (!frame) frame = requestAnimationFrame(tick); };
    const snap = () => { target = Math.round(target); animate(); };
    step.current = direction => {
      clearTimeout(snapTimer);
      target = Math.round(target) + direction;
      animate();
    };
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      const raw = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (!raw) return;
      event.preventDefault();
      const pixels = raw * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientWidth : 1);
      target = Math.max(position - 3, Math.min(position + 3, target + Math.max(-.85, Math.min(.85, pixels / 180))));
      clearTimeout(snapTimer);
      snapTimer = setTimeout(snap, 150);
      animate();
    };
    const down = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0) return;
      dragged.current = false;
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, start: position, horizontal: false };
    };
    const move = (event: PointerEvent) => {
      if (!pointer || pointer.id !== event.pointerId) return;
      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      if (!pointer.horizontal) {
        if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(dy)) return;
        pointer.horizontal = true; dragged.current = true;
        element.setPointerCapture(event.pointerId);
      }
      event.preventDefault();
      clearTimeout(snapTimer);
      const ratio = Number.parseFloat(getComputedStyle(element).getPropertyValue("--detail-step-ratio")) || .185;
      target = pointer.start - dx / (element.clientWidth * ratio);
      animate();
    };
    const up = (event: PointerEvent) => {
      if (!pointer || pointer.id !== event.pointerId) return;
      if (pointer.horizontal) {
        if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
        snap();
      }
      pointer = null;
    };
    paint();
    element.addEventListener("wheel", wheel, { passive: false });
    element.addEventListener("pointerdown", down);
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerup", up);
    element.addEventListener("pointercancel", up);
    return () => {
      cancelAnimationFrame(frame); clearTimeout(snapTimer);
      step.current = () => {};
      element.removeEventListener("wheel", wheel);
      element.removeEventListener("pointerdown", down);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerup", up);
      element.removeEventListener("pointercancel", up);
    };
  }, [works.length]);

  return <section id="details" className="details-showcase" aria-labelledby="details-showcase-heading">
    <header className="details-showcase-header">
      <img className="details-showcase-ribbon" src="/ribbon-details.png" alt="" aria-hidden="true" />
      <img className="details-showcase-logo" src="/seksek-logo-frameless.png" alt="SEKSEK DESIGN STUDIO" />
      <h2 id="details-showcase-heading">让产品信息 清晰有序</h2>
      <span className="image-masked-label">REGARDING DETAILS PAGE</span>
    </header>
    <div className="details-showcase-body">
      <div className="details-showcase-gallery" ref={gallery} role="region" tabIndex={0} aria-label="详情页卡片作品，滚轮或左右方向键切换"
        onKeyDown={event => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); change(event.key === "ArrowRight" ? 1 : -1); } }}>
        <div className="details-showcase-light" aria-hidden="true" />
        {works.map((work, index) => {
          let offset = (index - active + works.length) % works.length;
          if (offset > works.length / 2) offset -= works.length;
          const distance = Math.abs(offset);
          let initialOffset = (index - 1 + works.length) % works.length;
          if (initialOffset > works.length / 2) initialOffset -= works.length;
          const initialDistance = Math.abs(initialOffset);
          return <button key={work.image} type="button" className={`details-showcase-card${distance === 0 ? " is-current" : ""}`}
            style={{ "--card-offset": initialOffset, "--card-distance": initialDistance, "--card-tilt": `${initialOffset === 0 ? 0 : initialOffset < 0 ? 12 : -12}deg`, "--card-shade": 1 - Math.max(.23, Math.min(1, 1.56 - initialDistance * .58)) } as CSSProperties}
            aria-hidden={distance > 2 ? true : undefined} tabIndex={distance > 2 ? -1 : 0}
            aria-label={`放大查看${work.title}详情页`} onClick={() => { if (!dragged.current) onPreview(work); }}>
            <img src={work.image} alt={`${work.title}详情页长图`} loading="eager" decoding="async" draggable={false} />
            <span className="details-showcase-card-dim" aria-hidden="true" />
          </button>;
        })}
      </div>
      <div className="details-showcase-controls">
        <p aria-live="polite">{selected.title}</p>
      </div>
      <footer className="details-showcase-footer">
        <button type="button" aria-label="收起详情页板块" onClick={event => event.currentTarget.closest("dialog")?.requestClose()}><ArrowIcon /></button>
        <p><span>DETAILS PAGE</span><span>将产品卖点转化为清晰、有节奏的视觉叙事</span></p>
      </footer>
    </div>
  </section>;
}
