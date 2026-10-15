"use client";

import { useEffect, useRef, useState } from "react";
import ArrowIcon from "./arrow-icon";
import "./ip-gallery.css";

const portraits = [
  { image: "/ip-character-8.png", title: "雪境出发" },
  { image: "/ip-character-3.png", title: "街头滑行" },
  { image: "/ip-character-1-v2.png", title: "原型形象" },
  { image: "/ip-character-2-v2.png", title: "日光骑行" },
  { image: "/ip-character-4-v2.png", title: "落日敞篷" },
  { image: "/ip-character-5.png", title: "城市双人" },
  { image: "/ip-character-7.png", title: "海岸合影" },
];


export default function IPGallery() {
  const [preview, setPreview] = useState<number | null>(null);
  const [preloadLoop, setPreloadLoop] = useState(false);
  const rail = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const modal = useRef<HTMLDialogElement>(null);
  const shift = useRef<(pixels: number) => void>(() => {});

  useEffect(() => {
    const element = rail.current;
    const strip = track.current;
    if (!element || !strip) return;
    let frame = 0;
    let last = 0;
    let position = 0;
    let remaining = 0;
    let cycle = 0;
    let visible = false;
    let hovered = element.matches(":hover");
    let dragging = false;
    let focused = false;
    let pointer: { id: number; x: number; time: number; velocity: number } | null = null;
    let didDrag = false;
    const stop = () => { cancelAnimationFrame(frame); frame = 0; last = 0; };
    const wrap = () => {
      if (cycle <= 0) return;
      position = cycle + ((position - cycle) % cycle + cycle) % cycle;
      // A composited subpixel translation avoids scrollLeft rounding the slow
      // auto movement into visible one-pixel steps.
      strip.style.transform = `translate3d(${-position}px,0,0)`;
    };
    const start = () => {
      if (!frame && visible && !document.hidden && !dragging && !modal.current?.open) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    };
    const tick = (time: number) => {
      frame = 0;
      if (!visible || document.hidden || dragging || modal.current?.open) { last = 0; return; }
      const delta = last ? Math.min(time - last, 50) : 16;
      last = time;
      if (Math.abs(remaining) > .15) {
        // Ease the accumulated wheel distance instead of kicking the velocity
        // on every event. Keep fractional pixels between frames and inputs.
        const distance = remaining * (1 - Math.exp(-delta / 140));
        position += distance;
        remaining -= distance;
      } else {
        position += remaining;
        remaining = 0;
        if (hovered || focused) { wrap(); last = 0; return; }
        // Decreasing the track offset moves the artwork gently to the right.
        position -= 14 * delta / 1000;
      }
      wrap();
      frame = requestAnimationFrame(tick);
    };
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || modal.current?.open) return;
      const raw = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (!raw) return;
      event.preventDefault();
      const pixels = raw * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientWidth : 1);
      // Match the reference arrow: wheel down moves the artwork right.
      const distance = -pixels;
      if (distance * remaining < 0) remaining = 0;
      const limit = Math.max(600, element.clientWidth * 2);
      remaining = Math.max(-limit, Math.min(limit, remaining + distance));
      start();
    };
    const enter = () => { hovered = true; if (Math.abs(remaining) <= .15) stop(); };
    const leave = () => { hovered = false; start(); };
    const focus = (event: FocusEvent) => { focused = (event.target as HTMLElement).matches(":focus-visible"); if (focused && Math.abs(remaining) <= .15) stop(); };
    const blur = (event: FocusEvent) => { if (!element.contains(event.relatedTarget as Node | null)) { focused = false; start(); } };
    const down = (event: PointerEvent) => {
      remaining = 0; didDrag = false; stop();
      if (event.pointerType === "mouse") return;
      dragging = true;
      pointer = { id: event.pointerId, x: event.clientX, time: event.timeStamp, velocity: 0 };
    };
    const move = (event: PointerEvent) => {
      if (!pointer || pointer.id !== event.pointerId) return;
      const distance = pointer.x - event.clientX;
      if (Math.abs(distance) > 3) didDrag = true;
      if (!didDrag) return;
      if (event.cancelable) event.preventDefault();
      const delta = Math.max(1, event.timeStamp - pointer.time);
      pointer.velocity = pointer.velocity * .6 + distance / delta * .4;
      pointer.x = event.clientX; pointer.time = event.timeStamp;
      position += distance;
      wrap();
    };
    const up = (event: PointerEvent) => {
      if (pointer && pointer.id !== event.pointerId) return;
      if (pointer && didDrag && event.type !== "pointercancel") {
        remaining = Math.max(-element.clientWidth, Math.min(element.clientWidth, pointer.velocity * 160));
      }
      pointer = null; dragging = false; start();
    };
    const click = (event: MouseEvent) => {
      if (didDrag) { event.preventDefault(); event.stopPropagation(); didDrag = false; }
    };
    const nativeScroll = () => {
      // Keyboard focus can scroll overflow:hidden elements into view. Absorb
      // that offset without changing the visible position or animation clock.
      if (!element.scrollLeft) return;
      position += element.scrollLeft;
      element.scrollLeft = 0;
      wrap();
    };
    const visibility = () => { if (document.hidden) stop(); else start(); };
    shift.current = pixels => { const distance = -pixels; if (distance * remaining < 0) remaining = 0; remaining += distance; start(); };
    const resize = new ResizeObserver(() => {
      const width = element.querySelector<HTMLElement>(".ip-showcase-group")?.getBoundingClientRect().width ?? 0;
      if (width > 0) {
        position = cycle > 0 ? width + ((position - cycle) / cycle) * width : width + element.clientWidth * .05;
        cycle = width;
        wrap();
        start();
      }
    });
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) setPreloadLoop(true);
      if (visible) start(); else stop();
    });
    intersection.observe(element);
    resize.observe(element);
    const firstGroup = strip.querySelector(".ip-showcase-group");
    if (firstGroup) resize.observe(firstGroup);
    element.addEventListener("wheel", wheel, { passive: false });
    element.addEventListener("pointerenter", enter);
    element.addEventListener("pointerleave", leave);
    element.addEventListener("focusin", focus);
    element.addEventListener("focusout", blur);
    element.addEventListener("pointerdown", down);
    element.addEventListener("click", click, true);
    element.addEventListener("scroll", nativeScroll, { passive: true });
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    document.addEventListener("visibilitychange", visibility);
    const previewDialog = modal.current;
    previewDialog?.addEventListener("close", start);
    return () => {
      stop(); resize.disconnect(); intersection.disconnect(); shift.current = () => {};
      element.removeEventListener("wheel", wheel); element.removeEventListener("pointerenter", enter); element.removeEventListener("pointerleave", leave);
      element.removeEventListener("focusin", focus); element.removeEventListener("focusout", blur); element.removeEventListener("pointerdown", down);
      element.removeEventListener("click", click, true); element.removeEventListener("scroll", nativeScroll);
      window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", up);
      document.removeEventListener("visibilitychange", visibility); previewDialog?.removeEventListener("close", start);
    };
  }, []);

  useEffect(() => { if (preview !== null) modal.current?.showModal(); }, [preview]);

  return <section className="ip-section ip-showcase" id="ip" aria-labelledby="ip-heading">
    <div className="ip-showcase-frame">
      <header className="ip-showcase-hero">
        <img className="ip-light-ribbon" src="/ribbon-ip.png" alt="" aria-hidden="true" />
        <img className="ip-showcase-logo" src="/seksek-logo-frameless.png" alt="SEKSEK DESIGN STUDIO" />
        <h2 id="ip-heading">让角色鲜活<br />让个性被看见</h2>
        <div className="ip-showcase-statement"><span className="image-masked-label">REGARDING IP CHARACTERS</span><p>从形象到故事<br />赋予每一个角色独特的性格与温度</p></div>
      </header>
      <div className="ip-showcase-rail" ref={rail} tabIndex={0} role="region" aria-label="IP 人物作品，滚轮横向浏览，方向键左右切换" onKeyDown={event => {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          shift.current(event.currentTarget.clientWidth * .28 * (event.key === "ArrowRight" ? 1 : -1));
        }
      }}>
        <div className="ip-showcase-track" ref={track}>
        {[0, 1, 2].map(copy => <div className="ip-showcase-group" key={copy} aria-hidden={copy !== 1 ? true : undefined}>
          {portraits.map((portrait, index) => <button className="ip-showcase-card" key={portrait.image} type="button" tabIndex={copy === 1 ? 0 : -1} aria-label={`查看${portrait.title}完整作品`} onClick={() => setPreview(index)}>
            <img src={portrait.image} alt={portrait.title} loading={preloadLoop || copy === 1 && index < 4 ? "eager" : "lazy"} decoding="async" draggable={false} />
          </button>)}
        </div>)}
        </div>
      </div>
      <footer className="ip-showcase-footer"><button type="button" className="ip-sheet-collapse" aria-label="收起 IP 人物板块" onClick={event => event.currentTarget.closest("dialog")?.requestClose()}><ArrowIcon /></button><p><span>IP CHARACTER CREATION</span><span>探索角色个性，创造独一无二的形象语言</span></p></footer>
    </div>
    <dialog className="orbit-dialog" ref={modal} aria-label="IP 人物完整作品" onClose={() => setPreview(null)} onClick={event => { if (event.currentTarget === event.target) modal.current?.close(); }}>
      <div className="orbit-dialog-bar"><span>{preview === null ? "" : portraits[preview].title}</span><button type="button" autoFocus onClick={() => modal.current?.close()}>关闭 ×</button></div>
      {preview !== null && <img src={portraits[preview].image} alt={portraits[preview].title} />}
    </dialog>
  </section>;
}
