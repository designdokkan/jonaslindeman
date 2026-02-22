window.addEventListener("DOMContentLoaded", () => {
  const onIndexPage = isIndexPage();

  if (typeof initBarbaTransitions === "function") {
    initBarbaTransitions(() => {
      initPage();
    });
  }

  if (onIndexPage) {
    runIndexLoaderFlow();
    return;
  }

  initPage();
});

function isIndexPage() {
  const path = window.location.pathname || "";
  return path.endsWith("/") || path.endsWith("/index.html");
}

function runIndexLoaderFlow() {
  initLoaderAnimation(() => {
    initPage();
  });
}

function initPage() {
  removeLoader({ immediate: true });
  document.body.classList.add("is-loaded");
  initLogoLinkBehavior();
  initAppAnimations();
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
    ease: "power2.out",
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

window.removeLoader = removeLoader;
