const strip = document.querySelector(".photo-strip");
const thumbs = Array.from(strip.querySelectorAll(".photo-thumb"));
const dots = document.querySelector(".photo-dots");
const viewer = document.querySelector(".photo-viewer");
const stage = viewer.querySelector(".photo-stage");
let current = 0;

function show(index) {
  current = (index + thumbs.length) % thumbs.length;
  stage.replaceChildren(thumbs[current].querySelector("picture").cloneNode(true));
}

function mark(index) {
  Array.from(dots.children).forEach((dot, i) => {
    dot.setAttribute("aria-current", String(i === index));
  });
}

thumbs.forEach((thumb, i) => {
  thumb.addEventListener("click", () => {
    show(i);
    viewer.showModal();
  });
  const dot = document.createElement("button");
  dot.type = "button";
  dot.setAttribute("aria-label", "Ver fotografía " + (i + 1));
  dot.addEventListener("click", () => strip.scrollTo({
    left: thumb.offsetLeft,
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"
  }));
  dots.append(dot);
});
mark(0);
strip.addEventListener("scroll", () => {
  const nearest = thumbs.reduce((a, b) =>
    Math.abs(a.offsetLeft - strip.scrollLeft) < Math.abs(b.offsetLeft - strip.scrollLeft) ? a : b
  );
  mark(thumbs.indexOf(nearest));
}, { passive: true });

viewer.querySelector(".photo-close").onclick = () => viewer.close();
const [previous, next] = viewer.querySelectorAll(".photo-nav button");
previous.onclick = () => show(current - 1);
next.onclick = () => show(current + 1);
viewer.addEventListener("click", event => {
  if (event.target === viewer || event.target === stage) viewer.close();
});
viewer.addEventListener("keydown", event => {
  if (event.key === "ArrowLeft") previous.click();
  if (event.key === "ArrowRight") next.click();
});
