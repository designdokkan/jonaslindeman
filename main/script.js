window.addEventListener("DOMContentLoaded", () => {
  if (typeof initBarbaTransitions === "function") {
    initBarbaTransitions(() => {
      initPage();
    });
  }

  if (isIndexPage()) {
    runIndexLoaderFlow();
    return;
  }

  initPage();
});

function isIndexPage() {
  const path = window.location.pathname;
  return path.endsWith("/index.html") || path === "/" || path === "";
}

function runIndexLoaderFlow() {
  const loaderDone = new Promise((resolve) => {
    initLoaderAnimation(resolve);
  });
  const mainReady = preloadMainPage("./main.html");

  Promise.all([loaderDone, mainReady])
    .then(() => {
      if (typeof barba !== "undefined") {
        barba.go("./main.html");
        return;
      }
      window.location.href = "./main.html";
    })
    .catch(() => {
      window.location.href = "./main.html";
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
