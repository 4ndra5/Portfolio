"use client";

import { useEffect, useRef, useState } from "react";

/** Pointer-revealed title with a fixed-slot character assembly on entrance. */
export default function VectorWordmark() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !host) return;
    const outline = document.createElement("canvas");
    const outlineCtx = outline.getContext("2d")!;
    type Glyph = { character: string; x: number; baseline: number; top: number; width: number; font: string; fill: CanvasGradient };
    let glyphs: Glyph[] = [];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 1, height = 1, dpr = 1, frame = 0, previous = 0;
    let x = 0, y = 0, targetX = 0, targetY = 0, pointerActive = false;
    let elapsed = 0;
    let inView = true;
    const introEnd = () => reduced.matches ? 1020 : 2450;

    function resize() {
      const nextWidth = host!.clientWidth;
      const nextHeight = host!.clientHeight;
      if (nextWidth <= 0 || nextHeight <= 0) return;
      const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
      if (nextWidth === width && nextHeight === height && nextDpr === dpr) return;
      width = nextWidth;
      height = nextHeight;
      dpr = nextDpr;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      outline.width = canvas!.width; outline.height = canvas!.height;
      outlineCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const hostBounds = host!.getBoundingClientRect();
      const rowElements = host!.querySelectorAll<HTMLElement>(".wordmark-fallback span, .wordmark-fallback strong");
      glyphs = [];
      rowElements.forEach(element => {
        const style = getComputedStyle(element);
        const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        const tracking = Number.parseFloat(style.letterSpacing) || 0;
        const characters = Array.from(element.textContent || "");
        ctx!.font = font;
        const metrics = ctx!.measureText(element.textContent || "");
        const bounds = element.getBoundingClientRect();
        const ascent = metrics.actualBoundingBoxAscent || Number.parseFloat(style.fontSize) * .72;
        const descent = metrics.actualBoundingBoxDescent || Number.parseFloat(style.fontSize) * .2;
        const baseline = bounds.top - hostBounds.top + (bounds.height - ascent - descent) / 2 + ascent;
        const fill = ctx!.createLinearGradient(0, baseline - ascent, 0, baseline + Math.max(descent, 1));
        fill.addColorStop(0, "rgba(214,214,214,1)");
        fill.addColorStop(.38, "rgba(214,214,214,.98)");
        fill.addColorStop(.72, "rgba(214,214,214,.48)");
        fill.addColorStop(1, "rgba(214,214,214,0)");
        const rowWidth = characters.reduce((sum, character) => sum + ctx!.measureText(character).width, 0) + tracking * (characters.length - 1);
        let glyphX = (width - rowWidth) / 2;
        characters.forEach((character, index) => {
          const glyphWidth = ctx!.measureText(character).width;
          glyphs.push({ character, x: glyphX, baseline, top: bounds.top - hostBounds.top, width: glyphWidth, font, fill });
          glyphX += glyphWidth + (index < characters.length - 1 ? tracking : 0);
        });
      });
      x = targetX = width * .62; y = targetY = height * .44;
      draw(0);
    }

    function draw(delta: number) {
      if (!outline.width || !outline.height || !canvas!.width || !canvas!.height) return;
      elapsed += delta;
      if (!pointerActive && !reduced.matches) {
        targetX = width * (.5 + Math.sin(elapsed / 3400) * .34);
        targetY = height * (.48 + Math.cos(elapsed / 2800) * .12);
      }
      const ease = reduced.matches ? 1 : 1 - Math.exp(-Math.max(delta, 16) / 115);
      x += (targetX - x) * ease; y += (targetY - y) * ease;
      ctx!.clearRect(0, 0, width, height);
      ctx!.textAlign = "left"; ctx!.textBaseline = "alphabetic"; ctx!.setLineDash([]);
      outlineCtx.clearRect(0, 0, width, height);
      outlineCtx.textAlign = "left"; outlineCtx.textBaseline = "alphabetic";
      outlineCtx.strokeStyle = "#D6D6D6";
      // Keep a brief, low-motion assembly in reduced-motion mode instead of
      // skipping the requested opening entirely. Only the idle drift is omitted.
      const progress = Math.max(0, Math.min(1, (elapsed - (reduced.matches ? 120 : 550)) / (reduced.matches ? 900 : 1900)));
      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      glyphs.forEach((glyph, index) => {
        // Each slot keeps its final position and width throughout the scramble.
        const settleAt = .18 + ((index * 7) % 19) / 19 * .8;
        const changing = glyph.character !== " " && progress < settleAt;
        const character = changing ? alphabet[(Math.floor(elapsed / (reduced.matches ? 120 : 65)) * 13 + index * 17) % alphabet.length] : glyph.character;
        ctx!.font = glyph.font;
        ctx!.fillStyle = glyph.fill;
        const slotWidth = Math.max(1, glyph.width);
        outlineCtx.font = glyph.font;
        // Scale the dotted edge with the glyph height: the large row must not
        // disappear into subpixel dots while the smaller row stays visible.
        outlineCtx.lineWidth = Math.max(.95, Math.min(1.8, (glyph.baseline - glyph.top) * .009));
        outlineCtx.setLineDash([outlineCtx.lineWidth * 1.35, outlineCtx.lineWidth * 1.65]);
        if (changing) {
          ctx!.fillText(character, glyph.x, glyph.baseline, slotWidth);
          outlineCtx.strokeText(character, glyph.x, glyph.baseline, slotWidth);
        } else {
          ctx!.fillText(character, glyph.x, glyph.baseline);
          outlineCtx.strokeText(character, glyph.x, glyph.baseline);
        }
      });
      const radius = Math.min(width * .26, 290);
      const mask = ctx!.createRadialGradient(x, y, radius * .08, x, y, radius);
      mask.addColorStop(0, "rgba(0,0,0,1)"); mask.addColorStop(.3, "rgba(0,0,0,.99)");
      mask.addColorStop(.62, "rgba(0,0,0,.76)"); mask.addColorStop(1, "rgba(0,0,0,0)");
      ctx!.globalCompositeOperation = "destination-out";
      ctx!.fillStyle = mask; ctx!.fillRect(0, 0, width, height);
      ctx!.globalCompositeOperation = "source-over";
      outlineCtx.globalCompositeOperation = "destination-in";
      outlineCtx.fillStyle = mask; outlineCtx.fillRect(0, 0, width, height);
      outlineCtx.globalCompositeOperation = "source-over";
      ctx!.drawImage(outline, 0, 0, width, height);

      const size = Math.max(34, Math.min(width * .087, 109));
      const pitch = size + Math.min(width * .023, 27);
      const cellX = Math.round(x / pitch), cellY = Math.round(y / pitch);
      const cells = [];
      for (let row = -1; row <= 1; row++) for (let col = -1; col <= 1; col++) {
        const cx = (cellX + col) * pitch, cy = (cellY + row) * pitch;
        cells.push({ x: cx, y: cy, distance: Math.hypot(cx - x, cy - y) });
      }
      const handles = cells.sort((a, b) => a.distance - b.distance).slice(1, 4).map((cell, i) => ({
        x: cell.x + (reduced.matches ? 0 : Math.sin(elapsed / 1800 + i * 2) * 7),
        y: cell.y + (reduced.matches ? 0 : Math.cos(elapsed / 2200 + i * 2) * 7),
      }));
      ctx!.lineWidth = .7; ctx!.strokeStyle = "#777777"; ctx!.setLineDash([3, 4]);
      ctx!.beginPath(); handles.forEach((p, i) => i ? ctx!.lineTo(p.x, p.y) : ctx!.moveTo(p.x, p.y)); ctx!.closePath(); ctx!.stroke();
      ctx!.setLineDash([]); ctx!.font = `${width < 500 ? 8 : 10}px monospace`; ctx!.textAlign = "left";
      handles.forEach(p => {
        ctx!.strokeStyle = "#777777"; ctx!.strokeRect(p.x - size / 2, p.y - size / 2, size, size);
        ctx!.fillStyle = "#a1a1a1";
        ctx!.fillText(`${Math.round(p.x / width * 100)}, ${Math.round(p.y / height * 100)}`, p.x - size / 2 + 3, p.y - size / 2 + 11);
      });
    }
    function tick(now: number) {
      draw(previous ? Math.min(now - previous, 50) : 16); previous = now;
      if (!reduced.matches || elapsed < introEnd()) frame = requestAnimationFrame(tick);
    }
    function start() { cancelAnimationFrame(frame); previous = 0; if (!document.hidden && inView && (!reduced.matches || elapsed < introEnd())) frame = requestAnimationFrame(tick); else if (inView) draw(0); }
    function move(event: PointerEvent) {
      const bounds = host!.getBoundingClientRect();
      targetX = event.clientX - bounds.left; targetY = event.clientY - bounds.top; pointerActive = true;
      if (reduced.matches) draw(0);
    }
    function leave() { pointerActive = false; }
    function release(event: PointerEvent) { if (event.pointerType !== "mouse") leave(); }
    const observer = new ResizeObserver(resize);
    const visibilityObserver = new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      start();
    });
    visibilityObserver.observe(host);
    observer.observe(host); resize(); start(); setReady(true);
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    host.addEventListener("pointerup", release);
    document.addEventListener("visibilitychange", start);
    reduced.addEventListener("change", start);
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); visibilityObserver.disconnect();
      host.removeEventListener("pointermove", move); host.removeEventListener("pointerleave", leave);
      host.removeEventListener("pointerup", release);
      document.removeEventListener("visibilitychange", start); reduced.removeEventListener("change", start);
    };
  }, []);

  return <div className="wordmark-stage">
    <h1 className={`entrance-title wordmark-fallback${ready ? " is-rendered" : ""}`}><span>SHENYU,OVER HERE</span><strong>PORTFOLIO</strong></h1>
    <canvas ref={canvasRef} className="wordmark-canvas" aria-hidden="true" />
  </div>;
}
