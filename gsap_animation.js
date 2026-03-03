function initAppAnimations() {
  initNavBlendModeOnScroll();
  initCustomCursor();
  initTextAnimations();
  initTextPluginAnimation();
  initHeroGradientMotion();
  initFeatureShowcaseBorderAnimation();
  initFeatureShowcaseScrollStory();
  initMenuToggleAnimation();
}

function getCustomMotionEase() {
  if (typeof gsap === "undefined") return "power3.out";
  if (typeof CustomEase !== "undefined") {
    if (!window.__customEaseRegistered) {
      gsap.registerPlugin(CustomEase);
      window.__customEaseRegistered = true;
    }
    if (!window.__customEaseReady) {
      CustomEase.create("custom", "M0,0 C0.9,0.2 0.1,1 1,1 ");
      window.__customEaseReady = true;
    }
    return "custom";
  }
  return "power3.out";
}

function scheduleScrollTriggerRefresh() {
  if (typeof ScrollTrigger === "undefined") return;
  if (window.__stRefreshQueued) return;
  window.__stRefreshQueued = true;
  requestAnimationFrame(() => {
    window.__stRefreshQueued = false;
    ScrollTrigger.refresh();
  });
}

function initNavBlendModeOnScroll() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  if (typeof window.__navBlendCleanup === "function") {
    window.__navBlendCleanup();
    window.__navBlendCleanup = null;
  }

  const nav = getLatest(".hero-nav");
  if (!nav) return;

  gsap.registerPlugin(ScrollTrigger);

  const blendThreshold = 0.5;
  const applyBlendMode = (progress) => {
    nav.style.mixBlendMode = progress >= blendThreshold ? "exclusion" : "normal";
  };

  gsap.set(nav, { color: "var(--black)" });
  applyBlendMode(0);

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: document.documentElement,
      start: "top top",
      end: "+=160",
      scrub: true,
      onUpdate: (self) => applyBlendMode(self.progress),
      onRefresh: (self) => applyBlendMode(self.progress),
    },
  });

  tl.to(nav, { color: "var(--white)", duration: 1 }, 0);

  window.__navBlendCleanup = () => {
    if (tl.scrollTrigger) tl.scrollTrigger.kill();
    tl.kill();
    nav.style.mixBlendMode = "normal";
    nav.style.color = "var(--black)";
  };
}

function initTextPluginAnimation() {
  if (typeof gsap === "undefined" || typeof TextPlugin === "undefined") return;

  if (typeof window.__textPluginCleanup === "function") {
    window.__textPluginCleanup();
    window.__textPluginCleanup = null;
  }

  const targets = Array.from(document.querySelectorAll(".textplugin-word"));
  if (!targets.length) return;

  gsap.registerPlugin(TextPlugin);
  const motionEase = getCustomMotionEase();
  const words = ["GSAP", "Framer", "Figma", "Vibe coding"];
  const timelines = [];

  targets.forEach((target) => {
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.4 });

    words.forEach((word) => {
      tl.to(target, {
        duration: 0.55,
        text: word,
        ease: motionEase,
      }).to({}, { duration: 1.1 });
    });

    timelines.push(tl);
  });

  window.__textPluginCleanup = () => {
    timelines.forEach((tl) => tl.kill());
  };
}

function initTextAnimations() {
  if (typeof gsap === "undefined" || typeof SplitText === "undefined" || typeof ScrollTrigger === "undefined") return;

  if (typeof window.__textSplitCleanup === "function") {
    window.__textSplitCleanup();
    window.__textSplitCleanup = null;
  }

  const targets = Array.from(document.querySelectorAll(".textanimation"));
  if (!targets.length) return;

  gsap.registerPlugin(ScrollTrigger, SplitText);
  const motionEase = getCustomMotionEase();
  gsap.set(targets, { perspective: 300 });

  const splits = [];
  const tweens = [];
  targets.forEach((target, index) => {
    const split = new SplitText(target, { type: "chars, lines" });
    splits.push(split);
    const tween = gsap.from(split.chars, {
      opacity: 0,
      rotateY: 15,
      rotateX: 80,
      rotateZ: 20,
      transformOrigin: "bottom bottom 10px",
      stagger: 0.01,
      duration: 0.4,
      delay: index * 0.08,
      ease: motionEase,
      clearProps: "transform,opacity",
      scrollTrigger: {
        trigger: target,
        start: "top 50%",
        toggleActions: "play none none none",
        once: true,
      },
    });
    tweens.push(tween);
  });

  window.__textSplitCleanup = () => {
    tweens.forEach((tween) => tween.kill());
    splits.forEach((split) => split.revert());
  };
}

function initLoaderAnimation(onComplete) {
  if (typeof gsap === "undefined") {
    if (typeof onComplete === "function") onComplete();
    return;
  }

  const loader = document.querySelector("[data-loader]");
  if (!loader) {
    if (typeof onComplete === "function") onComplete();
    return;
  }
  if (loader.dataset.state === "hidden") {
    if (typeof onComplete === "function") onComplete();
    return;
  }

  const longLeft = loader.querySelectorAll(".longleft");
  const longRight = loader.querySelectorAll(".longright");
  const jShorts = loader.querySelectorAll(".j-short");
  const lShorts = loader.querySelectorAll(".l-short, .l_short");
  const logo = loader.querySelector(".loader-logo");
  const hero = document.querySelector('[data-barba="container"][data-barba-namespace="main"] .hero');
  const motionEase = getCustomMotionEase();

  gsap.set(loader, { yPercent: 0, autoAlpha: 1 });
  if (logo) gsap.set(logo, { autoAlpha: 0, scale: 1, transformOrigin: "50% 50%" });
  gsap.set(longLeft, { yPercent: -140 });
  gsap.set(longRight, { yPercent: 140 });
  gsap.set(jShorts, { clipPath: "inset(0% 0% 0% 100%)" });
  gsap.set(lShorts, { clipPath: "inset(0% 100% 0% 0%)" });
  if (hero) gsap.set(hero, { y: 300 });

  const tl = gsap.timeline({ defaults: { ease: motionEase } });
  if (logo) tl.set(logo, { autoAlpha: 1 }, 0);
  tl
    .to(longLeft, { yPercent: 0, duration: 0.75 })
    .to(longRight, { yPercent: 0, duration: 0.75 }, "<+0.08")
    .to(jShorts, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.4, stagger: 0.06 }, "-=0.18")
    .to(lShorts, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.45, stagger: 0.08 }, "<+0.12");

  if (logo) {
    tl.to(logo, {
      scale: 0.92,
      duration: 0.28,
      delay: 0.18,
      ease: motionEase,
    });
  }

  tl.to(loader, {
    autoAlpha: 0,
    yPercent: -3,
    duration: 0.42,
    ease: motionEase,
    delay: 0.08,
  });

  if (hero) {
    tl.to(
      hero,
      {
        y: 0,
        duration: 0.42,
        ease: motionEase,
        delay: 0.08,
        clearProps: "transform",
      },
      "<"
    );
  }

  tl.call(() => {
    if (typeof window.removeLoader === "function") {
      window.removeLoader({ immediate: true });
    } else {
      loader.style.display = "none";
    }
    if (typeof onComplete === "function") onComplete();
  });
}

function initHeroGradientMotion() {
  if (typeof gsap === "undefined") return;

  if (typeof window.__heroGradientCleanup === "function") {
    window.__heroGradientCleanup();
    window.__heroGradientCleanup = null;
  }

  const scene = document.querySelector("[data-hero-gradient]");
  if (!scene) return;

  const layers = Array.from(scene.querySelectorAll(".hero-gradient-layer"));
  if (layers.length < 3) return;
  const target = scene.closest(".media-frame");
  if (!target) return;

  const [layerA, layerB, layerC, layerD] = layers;
  let observer = null;
  let ambientRunning = false;
  const motionEase = getCustomMotionEase();

  const resetMotion = () => {
    gsap.killTweensOf([scene, ...layers]);
    gsap.set([scene, ...layers], { x: 0, y: 0, xPercent: 0, yPercent: 0 });
  };

  const ambientConfigs = [
    [scene, 10, 8, 4.8, 7.2],
    [layerA, 14, 11, 5.6, 8.4],
    [layerB, 16, 12, 6.2, 9.2],
    [layerC, 9, 7, 6.8, 9.8],
  ];
  if (layerD) ambientConfigs.push([layerD, 18, 14, 4.2, 6.3]);

  const drift = (element, xRange, yRange, minDuration, maxDuration) => {
    const animate = () => {
      if (!ambientRunning) return;
      gsap.to(element, {
        xPercent: gsap.utils.random(-xRange, xRange),
        yPercent: gsap.utils.random(-yRange, yRange),
        duration: gsap.utils.random(minDuration, maxDuration),
        ease: motionEase,
        onComplete: animate,
      });
    };
    animate();
  };

  const startAmbientMotion = () => {
    if (ambientRunning) return;
    ambientRunning = true;
    ambientConfigs.forEach(([element, xRange, yRange, minDuration, maxDuration]) => {
      drift(element, xRange, yRange, minDuration, maxDuration);
    });
  };

  const stopAmbientMotion = () => {
    ambientRunning = false;
    resetMotion();
  };

  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) {
        startAmbientMotion();
        return;
      }
      stopAmbientMotion();
    },
    { threshold: 0.15 }
  );

  observer.observe(target);

  window.__heroGradientCleanup = () => {
    stopAmbientMotion();
    if (observer) observer.disconnect();
    observer = null;
  };
}

function initFeatureShowcaseBorderAnimation() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined" || typeof Flip === "undefined") return;

  if (typeof window.__featureShowcaseBorderCleanup === "function") {
    window.__featureShowcaseBorderCleanup();
    window.__featureShowcaseBorderCleanup = null;
  }

  gsap.registerPlugin(ScrollTrigger, Flip);

  const section = getLatest(".feature-showcase-section");
  const wrapper = section ? section.querySelector(".work-svg-wrapper, .work-svg-wrapperFLIP") : null;
  const leftBorder = wrapper ? wrapper.querySelector("#borderLeft") : null;
  const rightBorder = wrapper ? wrapper.querySelector("#borderRight") : null;
  const darken = section ? section.querySelector(".feature-showcase-darken") : null;
  if (!section || !leftBorder || !rightBorder || !wrapper) return;

  const motionEase = getCustomMotionEase();
  let currentMode = "center";
  let borderTween = null;
  let darkenTween = null;

  const applyModeClass = (mode) => {
    if (mode === "sides") {
      wrapper.classList.remove("work-svg-wrapper");
      wrapper.classList.add("work-svg-wrapperFLIP");
      return;
    }
    wrapper.classList.add("work-svg-wrapper");
    wrapper.classList.remove("work-svg-wrapperFLIP");
  };

  const animateMode = (mode, options = {}) => {
    const { immediate = false } = options;
    if (!immediate && mode === currentMode) return;
    const targetDarkenAlpha = mode === "sides" ? 1 : 0;

    if (borderTween) {
      borderTween.kill();
      borderTween = null;
    }
    if (darkenTween) {
      darkenTween.kill();
      darkenTween = null;
    }

    if (immediate) {
      applyModeClass(mode);
      if (darken) gsap.set(darken, { autoAlpha: targetDarkenAlpha });
      currentMode = mode;
      return;
    }

    const state = Flip.getState([leftBorder, rightBorder]);
    applyModeClass(mode);
    borderTween = Flip.from(state, {
      duration: 0.6,
      ease: motionEase,
      absolute: true,
      overwrite: true,
      onComplete: () => {
        borderTween = null;
      },
    });
    if (darken) {
      darkenTween = gsap.to(darken, {
        autoAlpha: targetDarkenAlpha,
        duration: 0.6,
        ease: motionEase,
        overwrite: true,
        onComplete: () => {
          darkenTween = null;
        },
      });
    }
    currentMode = mode;
  };

  animateMode("center", { immediate: true });

  const st = ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: () => `+=${window.innerHeight * 3}`,
    onEnter: () => animateMode("sides"),
    onEnterBack: () => animateMode("sides"),
    onLeave: () => animateMode("center"),
    onLeaveBack: () => animateMode("center"),
  });

  if (st.isActive) {
    animateMode("sides", { immediate: true });
  } else {
    animateMode("center", { immediate: true });
  }

  scheduleScrollTriggerRefresh();

  window.__featureShowcaseBorderCleanup = () => {
    st.kill();
    if (borderTween) borderTween.kill();
    if (darkenTween) darkenTween.kill();
    animateMode("center", { immediate: true });
  };
}

function initFeatureShowcaseScrollStory() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  if (typeof window.__featureShowcaseStoryCleanup === "function") {
    window.__featureShowcaseStoryCleanup();
    window.__featureShowcaseStoryCleanup = null;
  }

  const showcase = getLatest(".feature-showcase");
  const section = showcase ? showcase.closest(".feature-showcase-section") : null;
  if (!showcase || !section) return;

  const layer2 = showcase.querySelector(".feature-showcase-image-layer-2");
  const layer3 = showcase.querySelector(".feature-showcase-image-layer-3");
  const copies = Array.from(showcase.querySelectorAll(".feature-showcase-copy"));
  if (!copies.length) return;

  gsap.registerPlugin(ScrollTrigger);
  const motionEase = getCustomMotionEase();
  const copyLines = copies.map((copy) => getShowcaseCopyLines(copy));
  if (!copyLines.some((lines) => lines.length)) return;

  gsap.set(copies, { autoAlpha: 1 });
  copyLines.forEach((lines) => {
    gsap.set(lines, {
      autoAlpha: 0,
      yPercent: 100,
      rotation: 25,
      transformOrigin: "0% 100%",
    });
  });
  if (layer2) gsap.set(layer2, { clipPath: "inset(100% 0% 0% 0%)" });
  if (layer3) gsap.set(layer3, { clipPath: "inset(100% 0% 0% 0%)" });

  const storyTimeline = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: () => `+=${window.innerHeight * 3}`,
      scrub: true,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  const animateLinesIn = (lines, startAt) => {
    if (!lines.length) return;
    storyTimeline.to(
      lines,
      {
        autoAlpha: 1,
        yPercent: 0,
        rotation: 0,
        duration: 0.52,
        ease: motionEase,
        stagger: 0.06,
      },
      startAt
    );
  };

  const animateLinesOutUp = (lines, startAt) => {
    if (!lines.length) return;
    storyTimeline.to(
      lines,
      {
        autoAlpha: 0,
        yPercent: -100,
        rotation: -10,
        duration: 0.5,
        ease: motionEase,
        stagger: 0.05,
      },
      startAt
    );
  };

  animateLinesIn(copyLines[0] || [], 0.08);
  animateLinesOutUp(copyLines[0] || [], 0.66);

  if (layer2) {
    storyTimeline.to(layer2, { clipPath: "inset(0% 0% 0% 0%)", duration: 1 }, 1);
  }
  animateLinesIn(copyLines[1] || [], 1.08);
  animateLinesOutUp(copyLines[1] || [], 1.66);

  if (layer3) {
    storyTimeline.to(layer3, { clipPath: "inset(0% 0% 0% 0%)", duration: 1 }, 2);
  }
  animateLinesIn(copyLines[2] || [], 2.08);

  scheduleScrollTriggerRefresh();

  window.__featureShowcaseStoryCleanup = () => {
    if (storyTimeline.scrollTrigger) storyTimeline.scrollTrigger.kill();
    storyTimeline.kill();
  };
}

function initMenuToggleAnimation() {
  if (typeof gsap === "undefined") return;

  if (typeof window.__menuToggleCleanup === "function") {
    window.__menuToggleCleanup();
    window.__menuToggleCleanup = null;
  }

  const menu = getLatest(".site-menu");
  const toggle = getLatest(".menu-toggle");
  const nav = toggle ? toggle.closest(".hero-nav") : null;
  const bars = toggle ? Array.from(toggle.querySelectorAll("span")) : [];
  const links = menu ? Array.from(menu.querySelectorAll("a.menu-link")) : [];
  if (!menu || !toggle || bars.length < 3) return;

  if (typeof window.__menuLinkSplitCleanup === "function") {
    window.__menuLinkSplitCleanup();
    window.__menuLinkSplitCleanup = null;
  }
  if (typeof window.__menuLinkHoverCleanup === "function") {
    window.__menuLinkHoverCleanup();
    window.__menuLinkHoverCleanup = null;
  }

  if (typeof SplitText !== "undefined" && links.length) {
    gsap.registerPlugin(SplitText);
    const splits = links.map((link) => new SplitText(link, { type: "chars", charsClass: "menu-char" }));
    links.forEach((link) => wrapMenuCharsWithMask(link));
    window.__menuLinkSplitCleanup = () => {
      splits.forEach((split) => split.revert());
    };

    const hoverHandlers = [];
    links.forEach((link) => {
      const chars = Array.from(link.querySelectorAll(".menu-char"));
      if (!chars.length) return;

      const onEnter = () => {
        gsap.to(shuffleChars(chars), {
          yPercent: -100,
          duration: 0.28,
          ease: "power2.out",
          stagger: 0.018,
          overwrite: true,
        });
      };

      const onLeave = () => {
        gsap.to(shuffleChars(chars), {
          yPercent: 0,
          duration: 0.24,
          ease: "power2.out",
          stagger: 0.016,
          overwrite: true,
        });
      };

      link.addEventListener("mouseenter", onEnter);
      link.addEventListener("mouseleave", onLeave);
      link.addEventListener("focus", onEnter);
      link.addEventListener("blur", onLeave);
      hoverHandlers.push([link, onEnter, onLeave]);
    });

    window.__menuLinkHoverCleanup = () => {
      hoverHandlers.forEach(([link, onEnter, onLeave]) => {
        link.removeEventListener("mouseenter", onEnter);
        link.removeEventListener("mouseleave", onLeave);
        link.removeEventListener("focus", onEnter);
        link.removeEventListener("blur", onLeave);
      });
    };
  }

  const getMenuWidth = () => (window.matchMedia("(max-width: 900px)").matches ? "100vw" : "30vw");
  const ease = "power2.out";
  const syncToggleContrastState = () => {
    const blendModeSource = nav || toggle;
    const currentBlendMode = window.getComputedStyle(blendModeSource).mixBlendMode;
    if (currentBlendMode === "exclusion") return;
    toggle.classList.add("menu-toggle-contrast");
  };
  const resetToggleContrastState = () => {
    toggle.classList.remove("menu-toggle-contrast");
  };

  function closeMenuImmediately() {
    tl.pause(0);
    gsap.set(menu, { width: 0, pointerEvents: "none" });
    gsap.set(bars[0], { y: 0 });
    gsap.set(bars[1], { autoAlpha: 1 });
    gsap.set(bars[2], { y: 0 });
    gsap.set(links, { xPercent: 75, yPercent: 50, autoAlpha: 0 });
    menu.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
    resetToggleContrastState();
  }

  gsap.set(menu, { width: 0, pointerEvents: "none" });
  gsap.set(bars, { transformOrigin: "50% 50%" });
  gsap.set(links, { xPercent: 75, yPercent: 50, autoAlpha: 0 });

  const tl = gsap.timeline({
    paused: true,
    defaults: { ease },
    onStart: () => {
      menu.style.pointerEvents = "auto";
      menu.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("menu-open");
      syncToggleContrastState();
    },
    onReverseComplete: () => {
      menu.style.pointerEvents = "none";
      menu.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
      resetToggleContrastState();
    },
  });

  tl.to(menu, { width: () => getMenuWidth(), duration: 0.35 }, 0)
    .to(bars[0], { y: 7, duration: 0.2 }, 0)
    .to(bars[2], { y: -7, duration: 0.2 }, 0)
    .to(bars[1], { autoAlpha: 0, duration: 0.12 }, 0)
    .to(links, { xPercent: 0, yPercent: 0, autoAlpha: 1, duration: 0.26, stagger: 0.04 }, 0.1);

  const onToggleClick = () => {
    if (tl.progress() > 0 && !tl.reversed()) {
      tl.reverse();
      return;
    }
    tl.play();
  };
  toggle.addEventListener("click", onToggleClick);

  const linkHandlers = [];
  links.forEach((link) => {
    const onLinkClick = () => tl.reverse();
    link.addEventListener("click", onLinkClick);
    linkHandlers.push([link, onLinkClick]);
  });

  const onDocClick = (event) => {
    if (tl.progress() === 0 || tl.reversed()) return;
    if (menu.contains(event.target) || toggle.contains(event.target)) return;
    tl.reverse();
  };
  document.addEventListener("click", onDocClick);

  const onDocKeydown = (event) => {
    if (event.key === "Escape" && tl.progress() > 0 && !tl.reversed()) {
      tl.reverse();
    }
  };
  document.addEventListener("keydown", onDocKeydown);

  window.__closeMenuImmediately = closeMenuImmediately;

  window.__menuToggleCleanup = () => {
    closeMenuImmediately();
    toggle.removeEventListener("click", onToggleClick);
    linkHandlers.forEach(([link, handler]) => {
      link.removeEventListener("click", handler);
    });
    document.removeEventListener("click", onDocClick);
    document.removeEventListener("keydown", onDocKeydown);
    if (window.__closeMenuImmediately === closeMenuImmediately) {
      window.__closeMenuImmediately = null;
    }
    if (typeof window.__menuLinkSplitCleanup === "function") {
      window.__menuLinkSplitCleanup();
      window.__menuLinkSplitCleanup = null;
    }
    if (typeof window.__menuLinkHoverCleanup === "function") {
      window.__menuLinkHoverCleanup();
      window.__menuLinkHoverCleanup = null;
    }
  };
}

function getLatest(selector) {
  const nodes = document.querySelectorAll(selector);
  return nodes.length ? nodes[nodes.length - 1] : null;
}

function shuffleChars(chars) {
  const copy = chars.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function wrapMenuCharsWithMask(link) {
  const chars = Array.from(link.querySelectorAll(".menu-char"));
  chars.forEach((char) => {
    if (char.parentElement && char.parentElement.classList.contains("menu-char-mask")) return;
    const mask = document.createElement("span");
    mask.className = "menu-char-mask";
    char.parentNode.insertBefore(mask, char);
    mask.appendChild(char);
  });
}

function getShowcaseCopyLines(copy) {
  if (!copy) return [];
  const indexNode = copy.querySelector(".feature-showcase-index");
  const listNodes = Array.from(copy.querySelectorAll(".feature-showcase-list li"));
  const rawLines = [indexNode, ...listNodes].filter(Boolean);
  return rawLines.map((line) => ensureShowcaseLineContent(line));
}

function ensureShowcaseLineContent(line) {
  if (!line) return null;
  const existing = line.querySelector(".feature-showcase-line-content");
  if (existing) return existing;

  const content = document.createElement("span");
  content.className = "feature-showcase-line-content";
  while (line.firstChild) {
    content.appendChild(line.firstChild);
  }
  line.appendChild(content);
  return content;
}

function initCustomCursor() {
  if (typeof window.__customCursorCleanup === "function") {
    window.__customCursorCleanup();
    window.__customCursorCleanup = null;
  }

  const body = document.body;
  if (!body) return;

  const canUseCustomCursor = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const cursor = getOrCreateCustomCursor();
  if (!canUseCustomCursor || !cursor) {
    body.classList.remove("has-custom-cursor");
    if (cursor) {
      cursor.classList.remove("is-visible", "has-label");
      const label = cursor.querySelector(".custom-cursor-label");
      if (label) label.textContent = "";
    }
    return;
  }

  const labelNode = cursor.querySelector(".custom-cursor-label");
  body.classList.add("has-custom-cursor");

  const setLabel = (text) => {
    const safeText = typeof text === "string" ? text : "";
    if (labelNode) labelNode.textContent = safeText;
    cursor.classList.toggle("has-label", safeText.length > 0);
  };

  const handlePointerMove = (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
    cursor.classList.add("is-visible");
    setLabel(resolveCustomCursorLabel(event.target));
  };

  const handlePointerOver = (event) => {
    setLabel(resolveCustomCursorLabel(event.target));
  };

  const handleClick = (event) => {
    const toggle = event.target instanceof Element ? event.target.closest(".menu-toggle") : null;
    if (!toggle) return;
    requestAnimationFrame(() => {
      setLabel(resolveCustomCursorLabel(toggle));
    });
  };

  const hideCursor = () => {
    cursor.classList.remove("is-visible");
    setLabel("");
  };

  document.addEventListener("pointermove", handlePointerMove);
  document.addEventListener("pointerover", handlePointerOver);
  document.addEventListener("click", handleClick);
  document.documentElement.addEventListener("mouseleave", hideCursor);
  window.addEventListener("blur", hideCursor);

  window.__customCursorCleanup = () => {
    document.removeEventListener("pointermove", handlePointerMove);
    document.removeEventListener("pointerover", handlePointerOver);
    document.removeEventListener("click", handleClick);
    document.documentElement.removeEventListener("mouseleave", hideCursor);
    window.removeEventListener("blur", hideCursor);
    body.classList.remove("has-custom-cursor");
    hideCursor();
  };
}

function getOrCreateCustomCursor() {
  let cursor = document.querySelector(".custom-cursor");
  if (cursor) return cursor;

  cursor = document.createElement("div");
  cursor.className = "custom-cursor";
  cursor.setAttribute("aria-hidden", "true");
  cursor.innerHTML = '<span class="custom-cursor-inner"><span class="custom-cursor-label"></span></span>';
  document.body.appendChild(cursor);
  return cursor;
}

function resolveCustomCursorLabel(target) {
  if (!(target instanceof Element)) return "";

  const explicitTarget = target.closest("[data-cursor-label]");
  if (explicitTarget) {
    return explicitTarget.getAttribute("data-cursor-label") || "";
  }

  const homeLink = target.closest(".hero-logo-link");
  if (homeLink) {
    return "[ go home ]";
  }

  const menuToggle = target.closest(".menu-toggle");
  if (menuToggle) {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    return expanded ? "[ close meny ]" : "[ open menu ]";
  }

  const showcaseTarget = target.closest(".feature-showcase, .feature-showcase-section");
  if (showcaseTarget) {
    return "[ see work ]";
  }

  const anchor = target.closest("a[href]");
  if (!anchor) return "";
  if (isExternalAnchor(anchor)) return "[ fly away ]";
  return "[ change page ]";
}

function isExternalAnchor(anchor) {
  if (!(anchor instanceof HTMLAnchorElement)) return false;
  const href = anchor.getAttribute("href");
  if (!href) return false;

  if (anchor.target === "_blank") return true;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return true;
  if (href.startsWith("#")) return false;

  try {
    const url = new URL(href, window.location.href);
    return url.origin !== window.location.origin;
  } catch (_error) {
    return false;
  }
}
