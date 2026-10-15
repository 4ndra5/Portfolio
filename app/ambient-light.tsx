"use client";

import { useEffect, useRef } from "react";
import { createKilogramLight } from "./kilogram-light-shader";

/** Original OpenShaders light field behind the existing portfolio interactions. */
export default function AmbientLight() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const gl = canvas?.getContext("webgl2", { alpha: false, antialias: false, depth: false, stencil: false });
    if (!canvas || !host || !gl) return;

    let shader: ReturnType<typeof createKilogramLight>;
    try { shader = createKilogramLight(gl); }
    catch (error) { console.warn(error); return; }

    let frame = 0;
    let lastFrame = 0;
    let elapsed = 0;
    let width = 0;
    let height = 0;

    function draw() {
      if (!width || !height) return;
      shader.draw(width, height, elapsed);
    }

    function resize() {
      const cssWidth = host!.clientWidth;
      const cssHeight = host!.clientHeight;
      if (!cssWidth || !cssHeight) return;
      const scale = Math.min(window.devicePixelRatio || 1, .85, Math.sqrt(1_000_000 / (cssWidth * cssHeight)));
      const nextWidth = Math.max(1, Math.floor(cssWidth * scale));
      const nextHeight = Math.max(1, Math.floor(cssHeight * scale));
      if (width === nextWidth && height === nextHeight) return;
      width = canvas!.width = nextWidth;
      height = canvas!.height = nextHeight;
      draw();
    }

    function tick(now: number) {
      frame = requestAnimationFrame(tick);
      if (now - lastFrame < 33) return;
      elapsed += lastFrame ? Math.min((now - lastFrame) / 1000, .1) : 0;
      lastFrame = now;
      draw();
    }

    function start() {
      cancelAnimationFrame(frame);
      lastFrame = 0;
      if (document.hidden) draw();
      else frame = requestAnimationFrame(tick);
    }

    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    start();
    document.addEventListener("visibilitychange", start);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", start);
      window.removeEventListener("resize", resize);
      shader.destroy();
    };
  }, []);

  return <div className="entrance-light-background" aria-hidden="true"><canvas ref={canvasRef} /></div>;
}
