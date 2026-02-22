function initBarbaTransitions(onAfterEnter) {
  if (typeof barba === "undefined" || typeof gsap === "undefined") return;
  if (window.__barbaInitialized) return;
  window.__barbaInitialized = true;

  barba.init({
    preventRunning: true,
    transitions: [
      {
        name: "pixel-grid",
        // Sequential flow:
        // 1) cover current page fully
        // 2) wait for next container in `enter`
        // 3) reveal next page
        sync: false,
        leave(data) {
          const { overlay, cells } = getPixelTransitionOverlay();
          const order = pixelShuffle(cells);
          gsap.set(overlay, { autoAlpha: 1, display: "grid" });
          gsap.set(cells, { autoAlpha: 0 });
          return gsap.to(order, {
            autoAlpha: 1,
            duration: 0.1,
            stagger: 0.004,
            ease: "none",
          });
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
          const { overlay, cells } = getPixelTransitionOverlay();
          const order = pixelShuffle(cells);
          return gsap.to(order, {
            autoAlpha: 0,
            duration: 0.1,
            stagger: 0.004,
            ease: "none",
            onComplete: () => {
              gsap.set(overlay, { autoAlpha: 0, display: "none" });
              cleanupContainerStyles(data.next.container);
              if (typeof onAfterEnter === "function") onAfterEnter(data);
            },
          });
        },
      },
    ],
  });
}

function getPixelTransitionOverlay() {
  let overlay = document.querySelector(".pixel-transition");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "pixel-transition";
    document.body.appendChild(overlay);
  }
  syncPixelCellCount(overlay);
  const cells = Array.from(overlay.querySelectorAll(".pixel-cell"));
  return { overlay, cells };
}

function syncPixelCellCount(overlay) {
  if (!overlay) return;
  const styles = getComputedStyle(overlay);
  const cols = Number.parseInt(styles.getPropertyValue("--transition-grid-cols"), 10) || 16;
  const rows = Number.parseInt(styles.getPropertyValue("--transition-grid-rows"), 10) || 9;
  const targetCount = cols * rows;
  const currentCells = overlay.querySelectorAll(".pixel-cell");

  if (currentCells.length < targetCount) {
    const missing = targetCount - currentCells.length;
    for (let i = 0; i < missing; i += 1) {
      const cell = document.createElement("span");
      cell.className = "pixel-cell";
      overlay.appendChild(cell);
    }
    return;
  }

  if (currentCells.length > targetCount) {
    for (let i = currentCells.length - 1; i >= targetCount; i -= 1) {
      currentCells[i].remove();
    }
  }
}

function pixelShuffle(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function waitForContainerReady(container) {
  return Promise.all([
    waitForCriticalHeroImage(container),
    waitForNextPaint(8),
    waitMs(120),
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

function waitMs(duration) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

function waitForCriticalHeroImage(container) {
  const hero = container.querySelector(".hero-media");
  if (!hero) return Promise.resolve();

  hero.loading = "eager";
  hero.decoding = "sync";
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
    const done = () => {
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
  const loader = document.querySelector("[data-loader]");
  if (!loader) return;
  loader.style.display = "none";
}
