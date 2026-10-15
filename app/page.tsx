"use client";

import { useEffect, useRef, useState } from "react";
import type { WheelEvent as ReactWheelEvent } from "react";
import OrbitGallery from "./orbit-gallery";
import IPGallery from "./ip-gallery";
import SiteEntrance from "./site-entrance";
import SceneShowcase from "./scene-showcase";
import DetailsShowcase from "./details-showcase";
import AboutTools from "./about-tools";
import AboutSceneVideo from "./about-scene-video";
import "./about-showcase.css";
import "./packaging-showcase.css";

const SCRAMBLE_CHARACTERS = Array.from("包装设计视觉构成品牌产品晶瓷彩砂美缝清洗有机系列结构");
const AURORA_RIBBON_A = "M-120 590 C80 510 226 580 400 530 C560 486 642 420 748 500 C826 558 842 340 920 452 C974 530 1046 410 1120 500 L1120 660 L-120 660 Z";
const AURORA_RIBBON_B = "M-120 570 C74 548 252 596 420 508 C566 430 658 512 760 456 C842 410 856 300 926 420 C980 514 1044 364 1120 474 L1120 660 L-120 660 Z";
const AURORA_FLATTEN_TRANSFORM = "translate(1000 290) scale(-1 .5)";

function ScrambleTitle({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    const finalCharacters = Array.from(text);
    const characterPositions = finalCharacters
      .map((character, index) => ({ character, index }))
      .filter(({ character }) => character.trim())
      .map(({ index }) => index);

    for (let index = characterPositions.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [characterPositions[index], characterPositions[randomIndex]] = [characterPositions[randomIndex], characterPositions[index]];
    }

    let frame = 0;
    const totalFrames = 10;
    const updateText = () => {
      frame += 1;
      const settledCount = Math.floor((frame / totalFrames) * characterPositions.length);
      const settledPositions = new Set(characterPositions.slice(0, settledCount));
      setDisplayText(finalCharacters.map((character, index) => {
        if (!character.trim() || settledPositions.has(index)) return character;
        return SCRAMBLE_CHARACTERS[Math.floor(Math.random() * SCRAMBLE_CHARACTERS.length)];
      }).join(""));

      if (frame >= totalFrames) {
        window.clearInterval(timer);
        setDisplayText(text);
      }
    };

    updateText();
    const timer = window.setInterval(updateText, 28);
    return () => window.clearInterval(timer);
  }, [text]);

  return <h3 aria-label={text}><span aria-hidden="true">{displayText}</span></h3>;
}

export default function Home() {
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);
  const historyMotionUntil = useRef(0);
  const revealCompany = (id: string) => {
    if (performance.now() < historyMotionUntil.current || expandedCompany === id) return;
    historyMotionUntil.current = performance.now() + 460;
    setExpandedCompany(id);
  };
  const [activePreview, setActivePreview] = useState<null | {
    image: string;
    title: string;
    kicker: string;
  }>(null);
  const [activePackageIndex, setActivePackageIndex] = useState(0);
  const [previousPackageIndex, setPreviousPackageIndex] = useState<number | null>(null);
  const [packageDirection, setPackageDirection] = useState<1 | -1>(1);
  const [isPackageAnimating, setIsPackageAnimating] = useState(false);
  const packageWheelLocked = useRef(false);
  const packageWheelReleaseTimer = useRef<number | null>(null);
  const packagingMediaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!activePreview) return;
    const previous = document.activeElement as HTMLElement | null;
    document.querySelector<HTMLButtonElement>(".detail-lightbox button")?.focus({ preventScroll: true });
    return () => previous?.focus({ preventScroll: true });
  }, [activePreview]);

  useEffect(() => {
    const packagingMedia = packagingMediaRef.current;
    const keepPageStill = (event: WheelEvent) => event.preventDefault();
    packagingMedia?.addEventListener("wheel", keepPageStill, { passive: false });

    return () => {
      packagingMedia?.removeEventListener("wheel", keepPageStill);
      if (packageWheelReleaseTimer.current !== null) {
        window.clearTimeout(packageWheelReleaseTimer.current);
      }
    };
  }, []);

  const strengths = [
    {
      number: "01",
      title: "视觉转译",
      en: "VISUAL TRANSLATION",
      text: "把模糊的业务目标转化为清晰、有记忆点的视觉系统，并保持跨场景的一致表达。",
    },
    {
      number: "02",
      title: "系统思维",
      en: "SYSTEM THINKING",
      text: "从单张画面走向可复用的规则，兼顾品牌气质、信息效率与后续落地成本。",
    },
    {
      number: "03",
      title: "持续迭代",
      en: "RAPID ITERATION",
      text: "快速响应反馈，在节奏紧凑的项目中持续优化细节，让方案稳步接近最优解。",
    },
    {
      number: "04",
      title: "协作沟通",
      en: "COLLABORATION",
      text: "理解不同角色的诉求，用结构化表达对齐目标，让设计决策更透明、更容易推进。",
    },
  ];

  const softwareTools = [
    { name: "QODER", image: "/software-qoder.png" },
    { name: "MAYA", image: "/software-maya.png" },
    { name: "PHOTOSHOP", image: "/software-photoshop.png" },
    { name: "CAPCUT", image: "/software-capcut.png" },
    { name: "ILLUSTRATOR", image: "/software-illustrator.png" },
    { name: "CHATGPT", image: "/software-chatgpt.png" },
    { name: "BLENDER", image: "/software-blender.png?v=2" },
  ];

  const detailPages = [
    { title: "NER0X G1 PRO 手摇磨豆机", tag: "ECOMMERCE DETAIL", tone: "detail-real", image: "/detail-grinder-full.png" },
    { title: "SONICWRAP 运动耳机", tag: "SPORT AUDIO", tone: "detail-real", image: "/detail-sport-headset.jpg" },
    { title: "彩漂粉去渍详情页", tag: "LAUNDRY CARE", tone: "detail-real", image: "/detail-color-bleach.jpg" },
    { title: "袋装洗衣机清洁剂", tag: "HOUSEHOLD CLEAN", tone: "detail-real", image: "/detail-washer-cleaner-bag.png" },
    { title: "浓缩型活氧魔力泡", tag: "OXYGEN CLEANER", tone: "detail-real", image: "/detail-oxygen-bubble.png" },
    { title: "洗衣机爆氧粉白瓶 01", tag: "WASHER CLEANER", tone: "detail-real", image: "/detail-oxygen-powder-white-1.png" },
    { title: "洗衣机爆氧粉白瓶 02", tag: "WASHER CLEANER", tone: "detail-real", image: "/detail-oxygen-powder-white-2.jpg" },
    { title: "DNA 钠锁住抗皱眼油", tag: "SKINCARE EYE OIL", tone: "detail-real", image: "/detail-dna-eye-oil.jpg" },
    { title: "玻尿酸补水舒缓面膜", tag: "SKINCARE MASK", tone: "detail-real", image: "/detail-hyaluronic-mask.jpg" },
  ];

  const sceneWorks = [
    { title: "榨汁机", tag: "HOME APPLIANCE", image: "/scene-blender.png" },
    { title: "便携吹风机", tag: "PRODUCT CLOSE-UP", image: "/scene-hair-dryer.png" },
    { title: "无线耳机", tag: "CONCEPT SCENE", image: "/scene-earbuds.png" },
    { title: "精华乳", tag: "BEAUTY VISUAL", image: "/scene-essence.png" },
    { title: "空气净化器", tag: "LIFESTYLE SCENE", image: "/scene-air-purifier.png" },
    { title: "保湿面霜", tag: "BEAUTY VISUAL", image: "/scene-face-cream.png" },
    { title: "洗发水", tag: "PRODUCT VISUAL", image: "/scene-shampoo.png" },
    { title: "户外充电宝", tag: "CONCEPT SCENE", image: "/scene-power-bank.png" },
  ];

  const packagingWorks = [
    {
      title: "洗衣机清洗剂袋装",
      en: "HOUSEHOLD CLEANING",
      text: "围绕家庭洗护场景重新梳理信息层级，以蓝白水流建立洁净感，并用橙色功效标题形成第一视觉焦点。人物与洗衣机画面帮助用户快速理解使用对象，同时保留净含量和核心卖点，兼顾货架陈列与电商缩略图识别。",
      image: "/package-washer-cleaner.png",
    },
    {
      title: "氢化环氧彩砂",
      en: "EPOXY COLOR SAND",
      text: "根据双组份管装结构进行左右分区，以米白为底降低材料类产品的视觉负担，并用金色斜线串联品牌与品类信息。主标题采用较高的字重和竖向编排，使产品名称在窄幅包装上依然清晰，同时为规格、认证与辅助卖点预留稳定位置。",
      image: "/package-hydrogenated-epoxy.png",
    },
    {
      title: "氢化晶瓷王",
      en: "CRYSTAL PORCELAIN",
      text: "以高饱和蓝色建立鲜明的技术感，并通过深浅色块区分品牌、品类名称与功能信息。双管中轴被纳入整体版式，让左右画面保持连续；人物、认证标识与二维码集中在下半区，避免与核心标题争夺视线。",
      image: "/package-crystal-king.png",
    },
    {
      title: "千色定制系列",
      en: "CUSTOM COLOR SERIES",
      text: "采用红金配色强化系列的定制感和陈列辨识度，背景纹样控制在较低对比度，避免影响文字阅读。左右两侧分别承载系列名称与核心概念，再以统一的金色边框、图标和底部信息带建立完整秩序，便于后续扩展不同色号。",
      image: "/package-thousand-colors.png",
    },
    {
      title: "有机硅桶装彩砂",
      en: "SILICONE GROUT",
      text: "针对桶装容器正面面积较大的特点，将品牌、品类名称与耐黄变信息组成中央识别区，并用红色横向信息带稳定画面重心。白色底面保留材料产品所需的专业感，金色作为辅助强调色，帮助不同层级在较远距离下仍能被分辨。",
      image: "/package-silicone-bucket.png",
    },
    {
      title: "双组份有机硅彩砂",
      en: "SILICONE COLOR SAND",
      text: "以绿色作为双组份包装的主识别色，配合银白材质感表现清洁、专业的产品印象。大字品类名称集中在左侧形成记忆点，右侧按品牌、耐黄变信息和功能图标逐级排列，并在底部统一收纳认证内容，保证窄幅版面依然易读。",
      image: "/package-organic-silicone-sand.png",
    },
    {
      title: "双组份有机硅美缝剂",
      en: "SILICONE SEALANT",
      text: "延续双组份系列的结构规则，以红白配色与上一款形成明确的品类区分，同时保持品牌识别的一致性。左侧用大字建立产品属性，右侧集中展示品牌和辅助卖点，底部规格、图标与认证采用统一网格，方便消费者快速比较系列差异。",
      image: "/package-silicone-sealant.png",
    },
    {
      title: "有机硅真瓷",
      en: "SILICONE PORCELAIN",
      text: "以绿色和大面积留白塑造洁净、耐用的视觉印象，并利用左右分区回应双管包装结构。品牌与耐黄变信息置于上半区，人物和功能卖点向下展开，底部图标及认证保持固定位置，使室内外通用等关键信息能按顺序被阅读。",
      image: "/package-true-porcelain.png",
    },
  ];

  const activePackage = packagingWorks[activePackageIndex];
  const previousPackage = previousPackageIndex === null ? null : packagingWorks[previousPackageIndex];
  const changePackage = (direction: 1 | -1) => {
    if (isPackageAnimating) return;
    setPreviousPackageIndex(activePackageIndex);
    setPackageDirection(direction);
    setActivePackageIndex(
      (activePackageIndex + direction + packagingWorks.length) % packagingWorks.length
    );
    setIsPackageAnimating(true);
    window.setTimeout(() => {
      setIsPackageAnimating(false);
      setPreviousPackageIndex(null);
    }, 620);
  };

  const handlePackageWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (Math.abs(event.deltaY) < 5) return;

    if (!packageWheelLocked.current && !isPackageAnimating) {
      packageWheelLocked.current = true;
      changePackage(event.deltaY > 0 ? 1 : -1);
    }

    if (packageWheelReleaseTimer.current !== null) {
      window.clearTimeout(packageWheelReleaseTimer.current);
    }
    packageWheelReleaseTimer.current = window.setTimeout(() => {
      packageWheelLocked.current = false;
      packageWheelReleaseTimer.current = null;
    }, 680);
  };

  return (
    <SiteEntrance>
    <main>
      <section className="about-showcase" id="about" aria-label="关于我">
        <div className="about-scene-panel">
          <AboutSceneVideo />
          <img className="about-scene-logo" src="/seksek-logo-frameless.png" alt="SEKSEK DESIGN STUDIO" />
          <div className="about-scene-headlines">
            <h2><span>DO DESIGN WITH CARE.</span>认真做设计</h2>
            <i aria-hidden="true" />
            <h2><span>ALSO MAINTAIN A BIT OF CURIOSITY.</span>也保持一点好奇</h2>
          </div>
          <p className="about-scene-intro">我是一名视觉设计师，具备新媒体、电商与品牌视觉经验，创作涵盖包装、详情页、3D 场景及 IP 形象。从需求出发，探索视觉表达，打磨细节，让作品兼具个性与实用价值。</p>
          <div className="history about-scene-history" role="region" aria-label="工作经历" tabIndex={0}
            onPointerLeave={(event) => {
              if (event.pointerType === "mouse" || event.pointerType === "pen") setExpandedCompany(null);
            }}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setExpandedCompany(null);
            }}
          >
              {[
                { id: "licaijia", date: "2025.04 — 2026.07", name: "立彩佳文化传媒有限公司", role: "视觉设计师 / 设计组负责人" },
                { id: "shuotai", date: "2024.03 — 2025.01", name: "苏州硕泰纺织有限公司", role: "电商视觉 / 产品拍摄与平台运营支持" },
                { id: "qiyi", date: "2023.04 — 2024.03", name: "苏州琪逸新媒体有限公司", role: "视觉设计师 / 电商视觉设计" },
              ].map((company) => (
                <div className={`history-entry${expandedCompany === company.id ? " is-open" : ""}`} key={company.id}
                  onPointerEnter={(event) => {
                    if (event.pointerType === "mouse" || event.pointerType === "pen") revealCompany(company.id);
                  }}
                  onPointerMove={(event) => {
                    if (event.pointerType === "mouse" || event.pointerType === "pen") revealCompany(company.id);
                  }}
                >
                  <button className="history-trigger" type="button" id={`history-trigger-${company.id}`}
                    onFocus={(event) => {
                      if (event.currentTarget.matches(":focus-visible")) {
                        historyMotionUntil.current = performance.now() + 460;
                        setExpandedCompany(company.id);
                      }
                    }}
                    onClick={(event) => {
                      event.preventDefault();
                      if (event.detail > 0 && window.matchMedia("(hover: hover)").matches) {
                        historyMotionUntil.current = performance.now() + 460;
                        setExpandedCompany(company.id);
                      } else {
                        setExpandedCompany((current) => current === company.id ? null : company.id);
                      }
                    }}
                    aria-controls={`history-${company.id}`}
                    aria-expanded={expandedCompany === company.id}
                  >
                    <span className="history-date">{company.date}</span>
                    <span className="history-company">{company.name}</span>
                    <span className="history-toggle" aria-hidden="true" />
                  </button>
                  <div className="history-collapse" id={`history-${company.id}`} role="region" aria-labelledby={`history-trigger-${company.id}`} aria-hidden={expandedCompany !== company.id} inert={expandedCompany !== company.id}>
                    <div className="history-clip">
                  <div className="history-body">
                    <p className="about-history-date">{company.date}</p>
                    <p className="history-role">{company.role}</p>
                    {company.id === "licaijia" && (
                      <>
                        <p className="history-overview">负责电商平台、线下宣传及产品包装等场景的视觉设计，主导核心设计方案，协调另外两名设计人员完成延展与执行，把控整体视觉质量。</p>
                        <h4>主要工作内容</h4>
                        <dl className="history-duties">
                          <div><dt>电商平台视觉设计</dt><dd>根据产品特点与平台展示需求，完成产品主图、详情页、店铺海报等视觉设计，梳理产品卖点与信息层级，并根据反馈调整画面。</dd></div>
                          <div><dt>线下宣传与展台设计</dt><dd>参与线下海报、展台及展示物料的视觉设计，结合实际展示尺寸与使用场景安排版式，保持品牌和产品信息的一致性。</dd></div>
                          <div><dt>产品与包装设计</dt><dd>参与产品视觉及包装设计，完成包装版式、配色和信息编排，兼顾系列产品的统一识别与不同品类的区分，并配合后续修改与制作。</dd></div>
                          <div><dt>跨场景视觉支持</dt><dd>根据电商上新、线下推广等需求，延展和调整设计素材，支持同一产品在不同渠道中的展示。</dd></div>
                          <div><dt>设计协作与质量把控</dt><dd>承担核心设计工作，协调另外两名设计人员完成配套物料与版本延展，沟通修改方向，并审核画面的风格一致性与信息准确性。</dd></div>
                        </dl>
                      </>
                    )}
                    {company.id === "shuotai" && (
                      <>
                        <p className="history-overview">公司通过线上与线下渠道开发客户，深入沟通面料需求，为客户提供符合个性化需求的面料定制服务。</p>
                        <h4>主要工作内容</h4>
                        <dl className="history-duties">
                          <div><dt>产品拍摄与图片处理</dt><dd>完成日常面料产品拍摄，并对产品图片进行后期处理，为店铺产品展示与上新提供图片素材。</dd></div>
                          <div><dt>店铺装修</dt><dd>负责阿里巴巴国际站与 1688 的店铺装修，结合店铺产品品类，定期更新与优化海报及展示图片。</dd></div>
                          <div><dt>平台运营</dt><dd>开展店铺日常维护，包括橱窗产品更换、新品发布、关键词查找与产品上传；针对无效果产品和老产品进行优化，调整相关关键词。定期分析平台数据，结合数据变化判断后续趋势并进行汇报。</dd></div>
                        </dl>
                      </>
                    )}
                    {company.id === "qiyi" && (
                      <>
                        <p className="history-overview">公司为不同行业的客户提供阿里巴巴国际站运营支持，涵盖店铺基础建设、详情页与海报制作，协助客户完善店铺整体视觉，并结合平台数据优化运营方向。</p>
                        <h4>主要工作内容</h4>
                        <dl className="history-duties">
                          <div><dt>独立承担电商视觉设计</dt><dd>作为公司唯一的设计人员，独立承担客户的阿里巴巴国际站视觉设计，包括店铺装修、详情页、海报及产品图片处理。根据客户的行业特点与产品信息梳理展示内容，保持店铺整体视觉的一致性与产品表达的清晰度。</dd></div>
                          <div><dt>产品数据分析</dt><dd>针对不同行业的产品开展对比分析，结合产品数据与市场动态，向客户提出有针对性的展示与运营建议，为产品表现优化提供参考。</dd></div>
                          <div><dt>客户对接</dt><dd>直接对接客户，确认设计需求与修改意见，及时反馈设计与修改进度，并提供相关操作与技术支持，推动需求落实。</dd></div>
                        </dl>
                      </>
                    )}
                  </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        </div>
        <AboutTools />
        <aside className="about-contact" aria-label="联系方式">
          <dl className="about-contact-list">
            <div className="about-contact-item">
              <dt>邮箱</dt>
              <dd><a href="mailto:2636799416@qq.com">2636799416@qq.com</a></dd>
            </div>
            <div className="about-contact-item">
              <dt>微信</dt>
              <dd>loccaili</dd>
            </div>
            <div className="about-contact-item">
              <dt>站酷</dt>
              <dd>4ndras</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="ability section shell" id="ability">
        <div className="section-label">
          <span>04</span>
          <p>STRENGTH / VALUE</p>
        </div>
        <div className="section-heading ability-heading">
          <h2>我能带来的价值</h2>
          <p>THINK CLEARLY<br />DESIGN PRECISELY</p>
        </div>
        <div className="software-showcase">
          <div className="software-intro">
            <span>SOFTWARE / WORKFLOW</span>
            <p>常用创作工具</p>
          </div>
          <ul className="software-list" aria-label="常用设计与创作软件">
            {softwareTools.map((tool) => (
              <li className="software-tool" key={tool.name}>
                <img src={tool.image} alt={`${tool.name} 软件图标`} />
                <span>{tool.name}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="ability-grid">
          {strengths.map((item) => (
            <article className="ability-card" key={item.number}>
              <span className="ability-number">{item.number}</span>
              <div className="ability-orbit" aria-hidden="true"><i /></div>
              <div>
                <span className="ability-en">{item.en}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <SceneShowcase works={sceneWorks} onPreview={work => setActivePreview({ image: work.image, title: work.title, kicker: "SCENE PREVIEW" })} />

      <DetailsShowcase works={detailPages} onPreview={work => setActivePreview({ image: work.image, title: work.title, kicker: "DETAIL PREVIEW" })} />

      <section className="packaging packaging-showcase section shell" id="packaging" aria-labelledby="packaging-showcase-heading">
        <div className="packaging-frame">
          <header className="packaging-showcase-hero">
            <img className="packaging-showcase-ribbon" src="/ribbon-packaging.png" alt="" aria-hidden="true" />
            <img className="packaging-showcase-logo" src="/seksek-logo-frameless.png" alt="SEKSEK DESIGN STUDIO" />
            <h2 id="packaging-showcase-heading">让产品的第一眼<br />就有自己的表达</h2>
            <span className="image-masked-label">REGARDING PACKAGING DESIGN</span>
          </header>

          <div className="packaging-carousel" aria-label="包装设计作品轮播">
            <article className="packaging-card">
              <svg
                className="packaging-aurora"
                viewBox="0 0 1000 600"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="aurora-ribbon-color" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#4d0903" stopOpacity="0" />
                    <stop offset="0.42" stopColor="#a92107" stopOpacity="0.5" />
                    <stop offset="0.76" stopColor="#ff4e14" stopOpacity="0.86" />
                    <stop offset="1" stopColor="#ff9e5e" stopOpacity="1" />
                  </linearGradient>
                  <radialGradient id="aurora-mist-core">
                    <stop offset="0" stopColor="#ffc39a" stopOpacity="1" />
                    <stop offset="0.2" stopColor="#ff7a36" stopOpacity="0.9" />
                    <stop offset="0.52" stopColor="#e6380d" stopOpacity="0.46" />
                    <stop offset="1" stopColor="#861706" stopOpacity="0" />
                  </radialGradient>
                  <pattern id="aurora-dot-pattern" width="12" height="12" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1.05" fill="#ffd8bf" />
                  </pattern>
                  <filter id="aurora-mist-flow" x="-24%" y="-46%" width="148%" height="192%" colorInterpolationFilters="sRGB">
                    <feTurbulence type="fractalNoise" baseFrequency="0.005 0.016" numOctaves="2" seed="11" result="mistNoise">
                      <animate attributeName="baseFrequency" dur="9s" repeatCount="indefinite" values="0.005 0.016;0.009 0.024;0.006 0.013;0.005 0.016" />
                    </feTurbulence>
                    <feDisplacementMap in="SourceGraphic" in2="mistNoise" scale="46" xChannelSelector="R" yChannelSelector="B">
                      <animate attributeName="scale" dur="7s" repeatCount="indefinite" values="34;66;42;34" />
                    </feDisplacementMap>
                    <feGaussianBlur stdDeviation="24 18">
                      <animate attributeName="stdDeviation" dur="8s" repeatCount="indefinite" values="20 14;30 22;22 16;20 14" />
                    </feGaussianBlur>
                  </filter>
                  <filter id="aurora-core-soft" x="-24%" y="-42%" width="148%" height="184%">
                    <feGaussianBlur stdDeviation="18 12" />
                  </filter>
                  <mask id="aurora-dot-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="600">
                    <g fill="#fff" filter="url(#aurora-mist-flow)" transform={AURORA_FLATTEN_TRANSFORM}>
                      <path d={AURORA_RIBBON_A}>
                        <animate attributeName="d" dur="7.4s" repeatCount="indefinite" values={`${AURORA_RIBBON_A};${AURORA_RIBBON_B};${AURORA_RIBBON_A}`} />
                      </path>
                      <ellipse cx="830" cy="520" rx="220" ry="190">
                        <animate attributeName="cx" dur="8.2s" repeatCount="indefinite" values="760;870;810;760" />
                        <animate attributeName="ry" dur="6.8s" repeatCount="indefinite" values="155;250;190;155" />
                      </ellipse>
                    </g>
                  </mask>
                </defs>
                <g className="packaging-aurora-cloud" filter="url(#aurora-mist-flow)" transform={AURORA_FLATTEN_TRANSFORM}>
                  <path d={AURORA_RIBBON_A} fill="url(#aurora-ribbon-color)">
                    <animate attributeName="d" dur="7.4s" repeatCount="indefinite" values={`${AURORA_RIBBON_A};${AURORA_RIBBON_B};${AURORA_RIBBON_A}`} />
                  </path>
                  <ellipse cx="760" cy="570" rx="310" ry="145" fill="url(#aurora-mist-core)">
                    <animate attributeName="cx" dur="9s" repeatCount="indefinite" values="660;790;710;660" />
                    <animate attributeName="rx" dur="7.6s" repeatCount="indefinite" values="250;350;285;250" />
                    <animate attributeName="ry" dur="6.4s" repeatCount="indefinite" values="110;180;135;110" />
                  </ellipse>
                  <ellipse cx="860" cy="505" rx="165" ry="240" fill="url(#aurora-mist-core)">
                    <animate attributeName="cx" dur="8.4s" repeatCount="indefinite" values="790;900;838;790" />
                    <animate attributeName="cy" dur="7.2s" repeatCount="indefinite" values="540;455;510;540" />
                    <animate attributeName="ry" dur="6.8s" repeatCount="indefinite" values="170;280;215;170" />
                  </ellipse>
                  <ellipse cx="955" cy="470" rx="92" ry="285" fill="url(#aurora-mist-core)">
                    <animate attributeName="cx" dur="7.8s" repeatCount="indefinite" values="930;974;945;930" />
                    <animate attributeName="cy" dur="6.6s" repeatCount="indefinite" values="520;410;480;520" />
                    <animate attributeName="ry" dur="7s" repeatCount="indefinite" values="190;320;240;190" />
                  </ellipse>
                </g>
                <path className="packaging-aurora-core" d={AURORA_RIBBON_A} fill="url(#aurora-ribbon-color)" filter="url(#aurora-core-soft)" transform={AURORA_FLATTEN_TRANSFORM}>
                  <animate attributeName="d" dur="7.4s" repeatCount="indefinite" values={`${AURORA_RIBBON_A};${AURORA_RIBBON_B};${AURORA_RIBBON_A}`} />
                </path>
                <rect className="packaging-aurora-dot-field" width="1000" height="600" fill="url(#aurora-dot-pattern)" mask="url(#aurora-dot-mask)" />
              </svg>
              <div className="packaging-copy-stage">
                <div
                  key={`copy-${activePackageIndex}`}
                  className="packaging-copy"
                >
                  <div>
                    <span className="packaging-number packaging-fade packaging-fade-1">{String(activePackageIndex + 1).padStart(2, "0")} / 08</span>
                    <p className="packaging-en packaging-fade packaging-fade-2">{activePackage.en}</p>
                    <ScrambleTitle text={activePackage.title} />
                  </div>
                  <p className="packaging-text packaging-fade packaging-fade-3">
                    <strong>设计说明：</strong>{activePackage.text}
                  </p>
                </div>
              </div>
              <div
                ref={packagingMediaRef}
                className="packaging-media"
                onWheel={handlePackageWheel}
                tabIndex={0}
                role="region"
                aria-label="包装作品，滚轮或上下方向键切换"
                onKeyDown={event => {
                  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                    event.preventDefault();
                    changePackage(event.key === "ArrowDown" ? 1 : -1);
                  }
                }}
              >
                <span className="packaging-product-stage">
                  {isPackageAnimating && previousPackage ? (
                    <span
                      className={`packaging-product-layer ${packageDirection === 1 ? "packaging-product-exit-up" : "packaging-product-exit-down"}`}
                      aria-hidden="true"
                    >
                      <img
                        className={previousPackage.title === "有机硅桶装彩砂" ? "packaging-product-small" : undefined}
                        src={previousPackage.image}
                        alt=""
                      />
                    </span>
                  ) : null}
                  <span
                    key={`${activePackageIndex}-${packageDirection}`}
                    className={`packaging-product-layer ${packageDirection === 1 ? "packaging-product-enter-up" : "packaging-product-enter-down"}`}
                  >
                    <img
                      className={activePackage.title === "有机硅桶装彩砂" ? "packaging-product-small" : undefined}
                      src={activePackage.image}
                      alt={`${activePackage.title}产品包装`}
                    />
                  </span>
                </span>
              </div>
            </article>
          </div>
          <footer className="packaging-showcase-footer">
            <button type="button" aria-label="收起包装设计板块" onClick={event => event.currentTarget.closest("dialog")?.requestClose()}>
              <svg viewBox="0 0 817 817" aria-hidden="true"><circle cx="408.5" cy="408.5" r="408.5" fill="#e1e1e1" /><path d="M233 457 408.5 282 584 457" fill="none" stroke="#d74d20" strokeWidth="87" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <p><span>PACKAGING DESIGN</span><span>从产品定位到视觉落地，建立完整的包装表达体系</span></p>
          </footer>
        </div>
      </section>

      {activePreview ? (
        <div
          className="detail-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${activePreview.title}大图预览`}
          onClick={() => setActivePreview(null)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
              setActivePreview(null);
            }
          }}
          tabIndex={-1}
        >
          <div className="lightbox-top">
            <div>
              <span>{activePreview.kicker}</span>
              <strong>{activePreview.title}</strong>
            </div>
            <button type="button" onClick={() => setActivePreview(null)} aria-label="关闭大图预览">
              关闭
            </button>
          </div>
          <div className="lightbox-scroll" onClick={(event) => event.stopPropagation()}>
            <img src={activePreview.image} alt={`${activePreview.title}完整作品`} />
          </div>
        </div>
      ) : null}

      <IPGallery />
      <OrbitGallery works={sceneWorks} />
    </main>
    </SiteEntrance>
  );
}
