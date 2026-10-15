"use client";

import { useEffect, useRef } from "react";

export default function AboutSceneVideo() {
  const background = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = background.current;
    if (!video) return;
    let visible = false;
    const syncPlayback = () => {
      if (visible && !document.hidden) void video.play().catch(() => {});
      else video.pause();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    }, { threshold: .01 });
    observer.observe(video);
    document.addEventListener("visibilitychange", syncPlayback);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      video.pause();
    };
  }, []);

  return <video ref={background} className="about-scene-background" src="/about-working-loop-v2.mp4"
    poster="/about-working-scene.png" autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />;
}
