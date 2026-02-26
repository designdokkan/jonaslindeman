function getMotionEase() {
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

function initBarbaTransitions(options = {}) {
  if (typeof barba === "undefined" || typeof gsap === "undefined") return;
  if (window.__barbaInitialized) return;
  window.__barbaInitialized = true;
  const { onViewEnter } = options;

  setManualScrollRestoration();
  registerGlobalBarbaHooks();

  barba.init({
    preventRunning: true,
    timeout: 7000,
    requestError(trigger, action, url) {
      if (!url) {
        window.location.reload();
        return false;
      }
      window.location.href = url;
      return false;
    },
    views: createViews(onViewEnter),
    transitions: [
      {
        name: "split-rows",
        // Sequential flow:
        // 1) cover current page fully
        // 2) wait for next container in `enter`
        // 3) reveal next page
        sync: false,
        leave(data) {
          closeOpenMenuImmediately();
          const { overlay, leftPanels, rightPanels } = getSplitTransitionOverlay();
          gsap.set(overlay, { autoAlpha: 1, display: "grid" });
          gsap.set(leftPanels, { xPercent: -101 });
          gsap.set(rightPanels, { xPercent: 101 });

          return gsap
            .timeline({ defaults: { duration: 0.42, ease: getMotionEase() } })
            .to(leftPanels, { xPercent: 0, stagger: 0.04 }, 0)
            .to(rightPanels, { xPercent: 0, stagger: 0.04 }, 0);
        },
        afterLeave(data) {
          // According to Barba lifecycle, next container is DOM-ready here.
          // Force next container out of Barba staging styles so reveal shows real content.
          hideGlobalLoader();
          prepareNextContainer(data.current.container, data.next.container);
          if (data.current && data.current.container) {
            gsap.set(data.current.container, { autoAlpha: 0, visibility: "hidden" });
          }
          return waitForContainerReady(data.next.container);
        },

        enter(data) {
          const { overlay, leftPanels, rightPanels } = getSplitTransitionOverlay();
          return gsap
            .timeline({
              defaults: { duration: 0.42, ease: getMotionEase() },
              onComplete: () => {
                gsap.set(overlay, { autoAlpha: 0, display: "none" });
                cleanupContainerStyles(data.next.container);
              },
            })
            .to(leftPanels, { xPercent: -101, stagger: { each: 0.035, from: "end" } }, 0)
            .to(rightPanels, { xPercent: 101, stagger: { each: 0.035, from: "end" } }, 0);
        },
      },
    ],
  });
}

function getSplitTransitionOverlay() {
  let overlay = document.querySelector(".split-transition");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "split-transition";
    document.body.appendChild(overlay);
  }
  syncSplitRows(overlay);
  const leftPanels = Array.from(overlay.querySelectorAll(".split-panel-left"));
  const rightPanels = Array.from(overlay.querySelectorAll(".split-panel-right"));
  return { overlay, leftPanels, rightPanels };
}

function syncSplitRows(overlay) {
  if (!overlay) return;

  const meets = [40, 50, 20, 65, 35, 55, 28];
  const currentRows = overlay.querySelectorAll(".split-row");

  if (currentRows.length !== meets.length) {
    overlay.innerHTML = "";
    meets.forEach((meet) => {
      const row = document.createElement("div");
      row.className = "split-row";

      const left = document.createElement("span");
      left.className = "split-panel split-panel-left";
      left.style.width = `${meet}vw`;

      const right = document.createElement("span");
      right.className = "split-panel split-panel-right";
      right.style.width = `${100 - meet}vw`;

      row.appendChild(left);
      row.appendChild(right);
      overlay.appendChild(row);
    });
  }
}

function waitForContainerReady(container) {
  if (!container) return Promise.resolve();

  return Promise.all([
    waitForCriticalHeroImage(container),
    waitForNextPaint(8),
  ]);
}

function prepareNextContainer(currentContainer, nextContainer) {
  if (currentContainer) {
    currentContainer.style.visibility = "hidden";
    currentContainer.style.opacity = "0";
  }
  if (!nextContainer) return;
  nextContainer.style.visibility = "visible";
  nextContainer.style.opacity = "1";
  nextContainer.style.position = "fixed";
  nextContainer.style.inset = "0";
  nextContainer.style.width = "100%";
  nextContainer.style.height = "100%";
  nextContainer.style.zIndex = "1";
  nextContainer.style.transform = "none";
}

function cleanupContainerStyles(container) {
  if (!container) return;
  container.style.visibility = "";
  container.style.opacity = "";
  container.style.position = "";
  container.style.inset = "";
  container.style.width = "";
  container.style.height = "";
  container.style.zIndex = "";
  container.style.transform = "";
}

function waitForNextPaint(frames = 1) {
  return new Promise((resolve) => {
    const step = (remaining) => {
      if (remaining <= 0) {
        resolve();
        return;
      }
      requestAnimationFrame(() => step(remaining - 1));
    };
    step(frames);
  });
}

function waitForCriticalHeroImage(container) {
  if (!container) return Promise.resolve();

  const hero = container.querySelector(".hero .media-cover");
  if (!hero) return Promise.resolve();

  hero.loading = "eager";
  hero.decoding = "async";
  return waitForImageElement(hero).then(() => waitForNextPaint(2));
}

function waitForImageElement(img) {
  if (img.complete && img.naturalWidth > 0) {
    if (typeof img.decode === "function") {
      return img.decode().catch(() => Promise.resolve());
    }
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const timeoutId = window.setTimeout(() => {
      resolve();
    }, 2000);

    const done = () => {
      window.clearTimeout(timeoutId);
      img.removeEventListener("load", done);
      img.removeEventListener("error", done);
      if (typeof img.decode === "function") {
        img.decode().catch(() => Promise.resolve()).finally(resolve);
        return;
      }
      resolve();
    };
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
  });
}

function hideGlobalLoader() {
  if (typeof window.removeLoader === "function") {
    window.removeLoader({ immediate: true });
    return;
  }
  const loader = document.querySelector("[data-loader]");
  if (!loader) return;
  loader.style.display = "none";
}

function closeOpenMenuImmediately() {
  if (typeof window.__closeMenuImmediately === "function") {
    window.__closeMenuImmediately();
    return;
  }

  const menu = document.querySelector(".site-menu");
  const toggle = document.querySelector(".menu-toggle");
  const backdrop = document.querySelector(".menu-backdrop");

  if (menu) {
    menu.style.width = "0";
    menu.style.pointerEvents = "none";
    menu.setAttribute("aria-hidden", "true");
  }
  if (toggle) {
    toggle.setAttribute("aria-expanded", "false");
  }
  if (backdrop) {
    backdrop.style.opacity = "0";
    backdrop.style.pointerEvents = "none";
  }
  document.body.classList.remove("menu-open");
}

function setManualScrollRestoration() {
  if (!("scrollRestoration" in window.history)) return;
  window.history.scrollRestoration = "manual";
}

function forceScrollToTop() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function registerGlobalBarbaHooks() {
  barba.hooks.beforeEnter(() => {
    forceScrollToTop();
  });
}

function createViews(onViewEnter) {
  const namespaces = ["main", "about", "work"];

  return namespaces.map((namespace) => ({
    namespace,
    afterEnter(data) {
      if (typeof onViewEnter === "function") onViewEnter(data);
    },
  }));
}
