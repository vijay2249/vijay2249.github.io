// Year in footer
document.getElementById("year").textContent = new Date().getFullYear();

// Nav shadow on scroll
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 12);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// Reveal-on-scroll
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // small stagger for grouped elements
          setTimeout(() => entry.target.classList.add("in"), (i % 6) * 60);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("in"));
}

// Theme toggle (persisted)
const themeToggle = document.getElementById("themeToggle");
const root = document.documentElement;
const stored = localStorage.getItem("vn-theme");
if (stored) root.setAttribute("data-theme", stored);
themeToggle.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
  if (next === "dark") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", "light");
  localStorage.setItem("vn-theme", next);
});

// Animated count-up for numeric metrics
const counters = document.querySelectorAll(".metric__num[data-count]");
const animate = (el) => {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.textContent.replace(/[0-9]/g, "").trim();
  let current = 0;
  const step = Math.max(1, Math.ceil(target / 28));
  const tick = () => {
    current = Math.min(target, current + step);
    el.textContent = current + suffix;
    if (current < target) requestAnimationFrame(tick);
  };
  tick();
};
if ("IntersectionObserver" in window) {
  const cio = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          cio.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((el) => cio.observe(el));
}
