const HAS_SEEN_LOADER_KEY = "hasSeenLoader";

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
  if (sessionStorage.getItem(HAS_SEEN_LOADER_KEY) === "1") {
    initPage();
    return;
  }

  initLoaderAnimation(() => {
    sessionStorage.setItem(HAS_SEEN_LOADER_KEY, "1");
    initPage();
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
