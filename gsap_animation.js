function initAppAnimations() {
  initTextAnimations();
  initTextPluginAnimation();
  initHeroGradientMotion();
  initFeatureShowcaseBorderAnimation();
  initMenuHoverAnimations();
  initMenuToggleAnimation();
}

function getCustomMotionEase() {
  if (typeof gsap === "undefined") return "power3.out";
  if (typeof CustomEase !== "undefined") {
    gsap.registerPlugin(CustomEase);
    if (!window.__customEaseReady) {
      CustomEase.create("custom", "M0,0 C0.9,0.2 0.1,1 1,1 ");
      window.__customEaseReady = true;
    }
    return "custom";
  }
  return "power3.out";
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

function initMenuHoverAnimations() {
  if (typeof gsap === "undefined") return;

  const menu = getLatest(".site-menu");
  const links = menu ? Array.from(menu.querySelectorAll("a.menu-link")) : [];
  if (!links.length) return;

  links.forEach((link) => {
    if (!link.dataset.splitReady) {
      splitLinkChars(link);
      link.dataset.splitReady = "true";
    }
    if (link.dataset.hoverBound) return;
    link.dataset.hoverBound = "true";

    link.addEventListener("mouseenter", () => animateMenuLinkCharsIn(link));
    link.addEventListener("mouseleave", () => animateMenuLinkCharsOut(link));
    link.addEventListener("focus", () => animateMenuLinkCharsIn(link));
    link.addEventListener("blur", () => animateMenuLinkCharsOut(link));
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

  const leftBorder = getLatest("#borderLeft");
  const wrapper = leftBorder ? leftBorder.closest(".work-svg-wrapper, .work-svg-wrapperFLIP") : null;
  const rightBorder = wrapper ? wrapper.querySelector("#borderRight") : null;
  if (!leftBorder || !rightBorder || !wrapper) return;

  const motionEase = getCustomMotionEase();
  let flipped = false;
  wrapper.classList.add("work-svg-wrapper");
  wrapper.classList.remove("work-svg-wrapperFLIP");

  const flipToSides = () => {
    if (flipped) return;
    flipped = true;
    const state = Flip.getState([leftBorder, rightBorder]);
    wrapper.classList.remove("work-svg-wrapper");
    wrapper.classList.add("work-svg-wrapperFLIP");
    Flip.from(state, {
      duration: 0.6,
      ease: motionEase,
      absolute: true,
    });
  };

  const st = ScrollTrigger.create({
    trigger: leftBorder,
    start: "top 50%",
    once: true,
    onEnter: flipToSides,
  });
  requestAnimationFrame(() => ScrollTrigger.refresh());

  window.__featureShowcaseBorderCleanup = () => {
    st.kill();
    flipped = false;
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
  const bars = toggle ? Array.from(toggle.querySelectorAll("span")) : [];
  const links = menu ? Array.from(menu.querySelectorAll("a.menu-link")) : [];
  const layerA = menu ? menu.querySelector(".menu-layer-a") : null;
  const layerB = menu ? menu.querySelector(".menu-layer-b") : null;
  const layerC = menu ? menu.querySelector(".menu-layer-c") : null;
  const layers = [layerA, layerB, layerC].filter(Boolean);
  const backdrop = getOrCreateMenuBackdrop();
  if (!menu || !toggle || !bars.length) return;
  const motionEase = getCustomMotionEase();

  const getMenuWidth = () => (window.matchMedia("(max-width: 900px)").matches ? "100vw" : "30vw");

  gsap.set(menu, { width: 0, pointerEvents: "none" });
  gsap.set(backdrop, { autoAlpha: 0, pointerEvents: "none" });
  gsap.set(bars, { transformOrigin: "50% 50%" });
  gsap.set(links, { xPercent: 40, yPercent: 80, autoAlpha: 0 });
  gsap.set(layers, { xPercent: 24 });

  const tl = gsap.timeline({
    paused: true,
    defaults: { ease: motionEase },
    onStart: () => {
      menu.style.pointerEvents = "auto";
      backdrop.style.pointerEvents = "auto";
      menu.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("menu-open");
    },
    onReverseComplete: () => {
      menu.style.pointerEvents = "none";
      backdrop.style.pointerEvents = "none";
      menu.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
    },
  });

  tl.to(
    backdrop,
    {
      autoAlpha: 0.3,
      duration: 0.3,
      ease: motionEase,
    },
    0
  );

  tl.to(
    menu,
    {
      width: () => getMenuWidth(),
      duration: 0.5,
      ease: motionEase,
    },
    0
  );

  tl.to(
    layers,
    {
      xPercent: 0,
      duration: 0.42,
      stagger: 0.05,
      ease: motionEase,
    },
    0.04
  );

  tl.to(
    links,
    {
      xPercent: 0,
      yPercent: 0,
      autoAlpha: 1,
      duration: 0.45,
      stagger: 0.05,
    },
    0.16
  )
    .to(
      bars[0],
      {
        y: 7,
        duration: 0.22,
      },
      0
    )
    .to(
      bars[1],
      {
        autoAlpha: 0,
        duration: 0.16,
      },
      0
    )
    .to(
      bars[2],
      {
        y: -7,
        duration: 0.22,
      },
      0
    );

  function openMenu() {
    tl.timeScale(1).invalidate().play();
  }

  function closeMenu() {
    tl.timeScale(2).reverse();
  }

  function closeMenuImmediately() {
    tl.pause(0);
    gsap.set(menu, { width: 0, pointerEvents: "none" });
    gsap.set(backdrop, { autoAlpha: 0, pointerEvents: "none" });
    gsap.set(links, { xPercent: 40, yPercent: 80, autoAlpha: 0 });
    gsap.set(layers, { xPercent: 24 });
    gsap.set(bars[0], { y: 0 });
    gsap.set(bars[1], { autoAlpha: 1 });
    gsap.set(bars[2], { y: 0 });
    menu.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  }

  const onToggleClick = () => {
    if (tl.progress() > 0 && !tl.reversed()) {
      closeMenu();
      return;
    }
    openMenu();
  };
  toggle.addEventListener("click", onToggleClick);

  const linkHandlers = [];
  links.forEach((link) => {
    const onLinkClick = () => closeMenu();
    link.addEventListener("click", onLinkClick);
    linkHandlers.push([link, onLinkClick]);
  });

  const onDocClick = (event) => {
    if (tl.progress() === 0 || tl.reversed()) return;
    if (menu.contains(event.target) || toggle.contains(event.target)) return;
    closeMenu();
  };
  document.addEventListener("click", onDocClick);

  const onDocKeydown = (event) => {
    if (event.key === "Escape" && tl.progress() > 0 && !tl.reversed()) {
      closeMenu();
    }
  };
  document.addEventListener("keydown", onDocKeydown);

  const onBackdropClick = () => closeMenu();
  backdrop.addEventListener("click", onBackdropClick);

  window.__closeMenuImmediately = closeMenuImmediately;

  window.__menuToggleCleanup = () => {
    closeMenuImmediately();
    toggle.removeEventListener("click", onToggleClick);
    linkHandlers.forEach(([link, handler]) => {
      link.removeEventListener("click", handler);
    });
    document.removeEventListener("click", onDocClick);
    document.removeEventListener("keydown", onDocKeydown);
    backdrop.removeEventListener("click", onBackdropClick);
    if (window.__closeMenuImmediately === closeMenuImmediately) {
      window.__closeMenuImmediately = null;
    }
  };
}

function getLatest(selector) {
  const nodes = document.querySelectorAll(selector);
  return nodes.length ? nodes[nodes.length - 1] : null;
}

function getOrCreateMenuBackdrop() {
  let el = document.querySelector(".menu-backdrop");
  if (!el) {
    el = document.createElement("div");
    el.className = "menu-backdrop";
    document.body.appendChild(el);
  }
  return el;
}

function splitLinkChars(link) {
  const source = (link.textContent || "").toUpperCase();
  link.textContent = "";
  const frag = document.createDocumentFragment();

  [...source].forEach((char) => {
    const mask = document.createElement("span");
    mask.className = "menu-char-mask";

    const span = document.createElement("span");
    span.className = "menu-char";
    span.textContent = char === " " ? "\u00A0" : char;
    mask.appendChild(span);
    frag.appendChild(mask);
  });

  link.appendChild(frag);
}

function animateMenuLinkCharsIn(link) {
  const chars = Array.from(link.querySelectorAll(".menu-char"));
  if (!chars.length) return;
  const motionEase = getCustomMotionEase();

  gsap.to(shuffleChars(chars), {
    yPercent: -100,
    duration: 0.32,
    ease: motionEase,
    stagger: 0.02,
    overwrite: true,
  });
}

function animateMenuLinkCharsOut(link) {
  const chars = Array.from(link.querySelectorAll(".menu-char"));
  if (!chars.length) return;
  const motionEase = getCustomMotionEase();

  gsap.to(shuffleChars(chars), {
    yPercent: 0,
    duration: 0.26,
    ease: motionEase,
    stagger: 0.018,
    overwrite: true,
  });
}

function shuffleChars(chars) {
  const copy = chars.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
