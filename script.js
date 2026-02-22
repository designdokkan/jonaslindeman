const PENDING_INITIAL_REVEAL_KEY = "pendingInitialPixelReveal";
const HAS_SEEN_LOADER_KEY = "hasSeenLoader";

window.addEventListener("DOMContentLoaded", () => {
  const onIndexPage = isIndexPage();

  if (!onIndexPage && typeof initBarbaTransitions === "function") {
    initBarbaTransitions(() => {
      initPage();
    });
  }

  if (onIndexPage) {
    runIndexLoaderFlow();
    return;
  }

  runContentPageStartupFlow();
});

function isIndexPage() {
  const path = window.location.pathname || "";
  return path.endsWith("/") || path.endsWith("/index.html");
}

function runIndexLoaderFlow() {
  if (sessionStorage.getItem(HAS_SEEN_LOADER_KEY) === "1") {
    window.location.replace("./main.html");
    return;
  }

  const loaderDone = new Promise((resolve) => {
    initLoaderAnimation(resolve);
  });
  const mainReady = preloadMainPage("./main.html");

  Promise.all([loaderDone, mainReady])
    .then(() => {
      sessionStorage.setItem(HAS_SEEN_LOADER_KEY, "1");
      navigateToMainWithPixelCover("./main.html");
    })
    .catch(() => {
      window.location.href = "./main.html";
    });
}

function runContentPageStartupFlow() {
  const hasPendingReveal = sessionStorage.getItem(PENDING_INITIAL_REVEAL_KEY) === "1";
  if (!hasPendingReveal) {
    initPage();
    return;
  }

  sessionStorage.removeItem(PENDING_INITIAL_REVEAL_KEY);
  initPage();
  runPixelReveal();
}

function navigateToMainWithPixelCover(url) {
  if (
    typeof gsap === "undefined" ||
    typeof getPixelTransitionOverlay !== "function"
  ) {
    window.location.href = url;
    return;
  }

  const { overlay, cells } = getPixelTransitionOverlay();
  const order = typeof pixelShuffle === "function" ? pixelShuffle(cells) : cells.slice();
  let didNavigate = false;

  const navigate = () => {
    if (didNavigate) return;
    didNavigate = true;
    sessionStorage.setItem(PENDING_INITIAL_REVEAL_KEY, "1");
    window.location.href = url;
  };

  gsap.set(overlay, { autoAlpha: 1, display: "grid" });
  gsap.set(cells, { autoAlpha: 0 });
  gsap.to(order, {
    autoAlpha: 1,
    duration: 0.1,
    stagger: 0.004,
    ease: "none",
    onComplete: navigate,
  });

  setTimeout(navigate, 1200);
}

function runPixelReveal() {
  if (
    typeof gsap === "undefined" ||
    typeof getPixelTransitionOverlay !== "function"
  ) {
    return;
  }

  const { overlay, cells } = getPixelTransitionOverlay();
  const order = typeof pixelShuffle === "function" ? pixelShuffle(cells) : cells.slice();

  gsap.set(overlay, { autoAlpha: 1, display: "grid" });
  gsap.set(cells, { autoAlpha: 1 });
  gsap.to(order, {
    autoAlpha: 0,
    duration: 0.1,
    stagger: 0.004,
    ease: "none",
    onComplete: () => {
      gsap.set(overlay, { autoAlpha: 0, display: "none" });
    },
  });
}

function preloadMainPage(url) {
  return Promise.all([
    fetch(url, { credentials: "same-origin" }).then((response) => {
      if (!response.ok) {
        throw new Error("Failed to preload main page.");
      }
      return response.text();
    }),
    preloadImage("./Assets/Images/hero.avif"),
  ]);
}

function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.src = src;

    if (img.complete && img.naturalWidth > 0) {
      resolve();
      return;
    }

    const done = () => resolve();
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
  });
}

function initPage() {
  const loader = document.querySelector("[data-loader]");
  if (loader) {
    loader.style.display = "none";
  }
  document.body.classList.add("is-loaded");
  initAppAnimations();
}
