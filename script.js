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

window.__restoredFromBFCache = false;
window.addEventListener("pageshow", (event) => {
  if (event.persisted) window.__restoredFromBFCache = true;
});

window.addEventListener("DOMContentLoaded", () => {
  const initialNamespace = getCurrentNamespace();
  const shouldRunInitialLoader = shouldPlayMainLoader(initialNamespace);
  let skipInitialMainViewEnter = shouldRunInitialLoader;

  if (typeof initBarbaTransitions === "function") {
    initBarbaTransitions({
      onViewEnter: (data) => {
        const namespace = data?.next?.namespace || getCurrentNamespace();
        if (skipInitialMainViewEnter && namespace === "main") {
          skipInitialMainViewEnter = false;
          return;
        }
        initPage(namespace);
      },
    });
  }

  if (shouldRunInitialLoader) {
    runIndexLoaderFlow();
    return;
  }

  initPage(initialNamespace);
});

function getCurrentNamespace() {
  const container = document.querySelector('[data-barba="container"]');
  return container?.dataset?.barbaNamespace || null;
}

function shouldPlayMainLoader(namespace) {
  if (namespace !== "main") return false;
  if (window.__restoredFromBFCache) return false;

  const navEntry = performance.getEntriesByType("navigation")[0];
  const navType = navEntry?.type || "navigate";
  if (navType === "back_forward") return false;

  try {
    if (sessionStorage.getItem("main_loader_played") === "1") return false;
    sessionStorage.setItem("main_loader_played", "1");
  } catch (error) {
    // Ignore storage failures and continue with current navigation checks.
  }

  return true;
}

function runIndexLoaderFlow() {
  initLoaderAnimation(() => {
    initPage("main");
  });
}

function initPage(namespace) {
  initStaticViewportHeight();
  removeLoader({ immediate: true });
  document.body.classList.add("is-loaded");
  initLogoLinkBehavior();
  initLucideIcons();
  initAppAnimations(namespace);
}

function initStaticViewportHeight() {
  const setVh = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--static-vh", `${vh}px`);
  };

  setVh();
  if (window.__staticVhBound) return;
  window.__staticVhBound = true;

  window.addEventListener("pageshow", setVh);
  window.addEventListener("orientationchange", () => {
    window.setTimeout(setVh, 120);
  });
}

function initLogoLinkBehavior() {
  const logoLinks = Array.from(document.querySelectorAll(".hero-logo-link"));
  if (!logoLinks.length) return;

  logoLinks.forEach((link) => {
    if (link.dataset.logoBound === "true") return;
    link.dataset.logoBound = "true";

    link.addEventListener("click", (event) => {
      const targetUrl = new URL(link.getAttribute("href"), window.location.href);
      const currentPath = window.location.pathname;
      const targetPath = targetUrl.pathname;
      const isSamePage =
        targetPath === currentPath ||
        (targetPath.endsWith("/index.html") && (currentPath === "/" || currentPath.endsWith("/index.html")));

      if (!isSamePage) return;

      event.preventDefault();
      const targetSection = document.querySelector("#hero-start");
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function removeLoader(options = {}) {
  const { immediate = false } = options;
  const loader = document.querySelector("[data-loader]");
  if (!loader) return;

  if (loader.dataset.state === "hidden") return;
  if (immediate || typeof gsap === "undefined") {
    finalizeLoaderState(loader);
    return;
  }

  if (loader.dataset.state === "hiding") return;
  loader.dataset.state = "hiding";
  gsap.killTweensOf(loader);
  gsap.to(loader, {
    autoAlpha: 0,
    duration: 0.32,
    ease: getMotionEase(),
    onComplete: () => finalizeLoaderState(loader),
  });
}

function finalizeLoaderState(loader) {
  loader.dataset.state = "hidden";
  loader.style.display = "none";
  loader.style.opacity = "0";
  loader.style.visibility = "hidden";
  loader.style.pointerEvents = "none";
  loader.setAttribute("aria-hidden", "true");
}

function initLucideIcons() {
  if (typeof window.lucide === "undefined" || typeof window.lucide.createIcons !== "function") return;
  window.lucide.createIcons();
}

window.removeLoader = removeLoader;
