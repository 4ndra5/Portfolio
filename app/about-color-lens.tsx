"use client";

import { useLayoutEffect, useRef } from "react";

export default function AboutColorLens() {
  const lens = useRef<HTMLButtonElement>(null);
  const picture = useRef<HTMLImageElement>(null);
  const colorFrame = useRef<HTMLCanvasElement>(null);
  const move = useRef<(x: number, y: number) => void>(() => {});
  const geometry = useRef({ x: 0, y: 0, maxX: 0, maxY: 0 });
  const drag = useRef<{ id: number; pointerX: number; pointerY: number; x: number; y: number } | null>(null);

  const stopDragging = () => {
    const element = lens.current;
    const pointer = drag.current;
    drag.current = null;
    element?.classList.remove("is-dragging");
    if (pointer && element?.hasPointerCapture(pointer.id)) element.releasePointerCapture(pointer.id);
  };

  useLayoutEffect(() => {
    const element = lens.current;
    const image = picture.current;
    const panel = element?.closest<HTMLElement>(".about-scene-panel");
    const canvas = colorFrame.current;
    const video = panel?.querySelector<HTMLVideoElement>("video.about-scene-background");
    if (!element || !image || !panel || !canvas) return;
    const context = canvas.getContext("2d");
    let baseX = 0;
    let baseY = 0;
    let frame = 0;
    let progress: { x: number; y: number } | null = null;
    const drawColorFrame = () => {
      if (!context || !video || video.readyState < 2 || !video.videoWidth || !canvas.width || !panel.clientWidth) return;
      const { x, y } = geometry.current;
      const width = panel.clientWidth;
      const height = panel.clientHeight;
      const style = getComputedStyle(video);
      let renderedWidth = width;
      let renderedHeight = height;
      let offsetX = 0;
      let offsetY = 0;
      if (style.objectFit === "cover") {
        const scale = Math.max(width / video.videoWidth, height / video.videoHeight);
        renderedWidth = video.videoWidth * scale;
        renderedHeight = video.videoHeight * scale;
        const [positionX, positionY] = style.objectPosition.split(" ");
        offsetX = (width - renderedWidth) * (parseFloat(positionX) / 100);
        offsetY = (height - renderedHeight) * (parseFloat(positionY) / 100);
      }
      // Sample the same decoded video frame as the monochrome background.
      // This avoids drift from playing a second copy inside the moving mask.
      context.drawImage(video,
        (x - offsetX) * video.videoWidth / renderedWidth,
        (y - offsetY) * video.videoHeight / renderedHeight,
        element.clientWidth * video.videoWidth / renderedWidth,
        element.clientHeight * video.videoHeight / renderedHeight,
        0, 0, canvas.width, canvas.height);
    };
    const paint = () => {
      frame = 0;
      const { x, y } = geometry.current;
      element.style.transform = `translate3d(${x - baseX}px,${y - baseY}px,0)`;
      // Counter-translate the full-size original, so this is a moving mask,
      // not a portrait that follows the frame around the scene.
      image.style.transform = `translate3d(${-x}px,${-y}px,0)`;
      drawColorFrame();
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
    move.current = (x, y) => {
      const state = geometry.current;
      state.x = Math.max(0, Math.min(state.maxX, x));
      state.y = Math.max(0, Math.min(state.maxY, y));
      progress = { x: state.maxX ? state.x / state.maxX : 0, y: state.maxY ? state.y / state.maxY : 0 };
      schedule();
    };
    const measure = () => {
      if (!panel.clientWidth || !panel.clientHeight) return;
      stopDragging();
      baseX = element.offsetLeft;
      baseY = element.offsetTop;
      const maxX = Math.max(0, panel.clientWidth - element.offsetWidth);
      const maxY = Math.max(0, panel.clientHeight - element.offsetHeight);
      geometry.current = {
        x: Math.min(maxX, progress ? progress.x * maxX : baseX),
        y: Math.min(maxY, progress ? progress.y * maxY : baseY),
        maxX, maxY,
      };
      image.style.width = `${panel.clientWidth}px`;
      image.style.height = `${panel.clientHeight}px`;
      const density = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(element.clientWidth * density));
      canvas.height = Math.max(1, Math.round(element.clientHeight * density));
      schedule();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(panel);
    observer.observe(element);
    measure();
    let videoFrame = 0;
    let fallbackFrame = 0;
    const followVideoFrame = () => {
      drawColorFrame();
      if (video) videoFrame = video.requestVideoFrameCallback(followVideoFrame);
    };
    const followFallbackFrame = () => {
      drawColorFrame();
      if (video && !video.paused && !video.ended) fallbackFrame = requestAnimationFrame(followFallbackFrame);
      else fallbackFrame = 0;
    };
    const startFallback = () => { if (!fallbackFrame) followFallbackFrame(); };
    if (video && "requestVideoFrameCallback" in video) videoFrame = video.requestVideoFrameCallback(followVideoFrame);
    else {
      video?.addEventListener("play", startFallback);
      startFallback();
    }
    video?.addEventListener("loadeddata", drawColorFrame);
    video?.addEventListener("seeked", drawColorFrame);
    window.addEventListener("blur", stopDragging);
    return () => {
      stopDragging();
      observer.disconnect();
      cancelAnimationFrame(frame);
      cancelAnimationFrame(fallbackFrame);
      if (videoFrame && video) video.cancelVideoFrameCallback(videoFrame);
      video?.removeEventListener("play", startFallback);
      video?.removeEventListener("loadeddata", drawColorFrame);
      video?.removeEventListener("seeked", drawColorFrame);
      window.removeEventListener("blur", stopDragging);
      move.current = () => {};
    };
  }, []);

  return <button className="about-scene-eyes" type="button" ref={lens}
    aria-label="彩色透视窗：按住拖动查看彩色背景，方向键移动"
    onPointerDown={event => {
      if (event.button !== 0 || !event.isPrimary) return;
      event.preventDefault();
      event.currentTarget.focus({ preventScroll: true });
      const { x, y } = geometry.current;
      drag.current = { id: event.pointerId, pointerX: event.clientX, pointerY: event.clientY, x, y };
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.classList.add("is-dragging");
    }}
    onPointerMove={event => {
      const pointer = drag.current;
      if (!pointer || pointer.id !== event.pointerId) return;
      move.current(pointer.x + event.clientX - pointer.pointerX, pointer.y + event.clientY - pointer.pointerY);
    }}
    onPointerUp={stopDragging} onPointerCancel={stopDragging} onLostPointerCapture={stopDragging}
    onKeyDown={event => {
      const directions: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      const direction = directions[event.key];
      if (!direction) return;
      event.preventDefault();
      const step = event.shiftKey ? 30 : 10;
      move.current(geometry.current.x + direction[0] * step, geometry.current.y + direction[1] * step);
    }}>
    <span className="about-lens-label">SERIOUS STATE</span>
    <span className="about-lens-viewport"><img ref={picture} src="/about-working-scene.png" alt="" draggable={false} /><canvas ref={colorFrame} aria-hidden="true" /></span>
  </button>;
}
