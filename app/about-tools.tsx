import type { ReactNode } from "react";

function ReferenceIcon({ name, box }: { name: string; box: string }) {
  return <svg className="about-tool-icon" viewBox={box} role="img" aria-label={name}><image href="/about-tool-icons-reference.png" width="2560" height="1258" /></svg>;
}

function CombinedIcon({ source, name }: { source: string; name: string }) {
  // The supplied artwork includes its own overlap and shadow. Only exclude
  // transparent canvas space; do not rebuild or independently move its logos.
  return <svg className="about-tool-combined-icon" viewBox="319 1066 3458 2226" role="img" aria-label={name}>
    <image href={source} width="4096" height="4096" />
  </svg>;
}

function ToolPill({ className, children }: { className: string; children: ReactNode }) {
  return <div className={`about-tool-pill ${className}`}><div className="about-tool-content">{children}</div></div>;
}

export default function AboutTools() {
  return <div className="about-tools" role="group" aria-label="常用创作工具">
    <div className="about-tools-row about-tools-row-first">
      <ToolPill className="about-tool-label">常用创作工具</ToolPill>
      <ToolPill className="about-tool-ai"><span>Banana Pro + ChatGpt image2.5</span><CombinedIcon source="/software-chatgpt-gemini-combined.png" name="ChatGPT 与 Gemini 叠压组合图标" /></ToolPill>
      <ToolPill className="about-tool-codex"><span>Codex</span><ReferenceIcon name="Codex" box="1468 943 54 57" /></ToolPill>
      <ToolPill className="about-tool-jimeng"><span>即梦</span><ReferenceIcon name="即梦" box="1708 944 57 57" /></ToolPill>
      <ToolPill className="about-tool-capcut"><span>剪映</span><img className="about-tool-icon" src="/software-capcut.png" alt="剪映" /></ToolPill>
    </div>
    <div className="about-tools-row about-tools-row-second">
      <ToolPill className="about-tool-adobe"><span>Photoshop + Illustrator</span><CombinedIcon source="/software-adobe-combined.png" name="Photoshop 与 Illustrator 叠压组合图标" /></ToolPill>
      <ToolPill className="about-tool-blender"><span>Blender</span><img className="about-tool-icon" src="/software-blender.png?v=2" alt="Blender" /></ToolPill>
      <ToolPill className="about-tool-kling"><span>可灵</span><img className="about-tool-icon" src="/software-kling.png" alt="可灵" /></ToolPill>
      <ToolPill className="about-tool-english"><span>COMMONLY USED CREATIVE TOOLS</span></ToolPill>
    </div>
  </div>;
}
