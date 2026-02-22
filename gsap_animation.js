function initAppAnimations() {
  initMenuHoverAnimations();
  initMenuToggleAnimation();
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

  const longLeft = loader.querySelectorAll(".longleft");
  const longRight = loader.querySelectorAll(".longright");
  const jShorts = loader.querySelectorAll(".j-short");
  const lShorts = loader.querySelectorAll(".l-short, .l_short");
  const logo = loader.querySelector(".loader-logo");

  gsap.set(loader, { yPercent: 0, autoAlpha: 1 });
  if (logo) gsap.set(logo, { scale: 1, transformOrigin: "50% 50%" });
  gsap.set(longLeft, { yPercent: -140 });
  gsap.set(longRight, { yPercent: 140 });
  gsap.set(jShorts, { clipPath: "inset(0% 0% 0% 100%)" });
  gsap.set(lShorts, { clipPath: "inset(0% 100% 0% 0%)" });

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
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
      ease: "power2.inOut",
      onComplete: () => {
        if (typeof onComplete === "function") onComplete();
      },
    });
  } else {
    tl.call(() => {
      if (typeof onComplete === "function") onComplete();
    });
  }
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

  const getMenuWidth = () => (window.matchMedia("(max-width: 900px)").matches ? "100vw" : "30vw");

  gsap.set(menu, { width: 0, pointerEvents: "none" });
  gsap.set(backdrop, { autoAlpha: 0, pointerEvents: "none" });
  gsap.set(bars, { transformOrigin: "50% 50%" });
  gsap.set(links, { xPercent: 40, yPercent: 80, autoAlpha: 0 });
  gsap.set(layers, { xPercent: 24 });

  const tl = gsap.timeline({
    paused: true,
    defaults: { ease: "power3.out" },
    onStart: () => {
      menu.style.pointerEvents = "auto";
      backdrop.style.pointerEvents = "auto";
      menu.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
    },
    onReverseComplete: () => {
      menu.style.pointerEvents = "none";
      backdrop.style.pointerEvents = "none";
      menu.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");
    },
  });

  tl.to(
    backdrop,
    {
      autoAlpha: 0.3,
      duration: 0.3,
      ease: "power2.out",
    },
    0
  );

  tl.to(
    menu,
    {
      width: () => getMenuWidth(),
      duration: 0.5,
      ease: "power4.out",
    },
    0
  );

  tl.to(
    layers,
    {
      xPercent: 0,
      duration: 0.42,
      stagger: 0.05,
      ease: "none",
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

  window.__menuToggleCleanup = () => {
    toggle.removeEventListener("click", onToggleClick);
    linkHandlers.forEach(([link, handler]) => {
      link.removeEventListener("click", handler);
    });
    document.removeEventListener("click", onDocClick);
    document.removeEventListener("keydown", onDocKeydown);
    backdrop.removeEventListener("click", onBackdropClick);
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

  gsap.to(shuffleChars(chars), {
    yPercent: -100,
    duration: 0.32,
    ease: "power3.out",
    stagger: 0.02,
    overwrite: true,
  });
}

function animateMenuLinkCharsOut(link) {
  const chars = Array.from(link.querySelectorAll(".menu-char"));
  if (!chars.length) return;

  gsap.to(shuffleChars(chars), {
    yPercent: 0,
    duration: 0.26,
    ease: "power3.out",
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
