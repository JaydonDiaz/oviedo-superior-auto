gsap.registerPlugin(ScrollTrigger);

// Fonts and late-loading layout can shift measurements after
// ScrollTrigger's initial pass, which would leave the pinned
// Vehicles section's spacer sized against stale layout.
window.addEventListener("load", () => ScrollTrigger.refresh());
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}

/* ============================================================
   REAL SERVICES — pulled from the shop's actual service list
   (used in the ticker and the work-order ticket demo)
   ============================================================ */
const SERVICES = [
  "Oil & Fluid Service",
  "Brake Repair",
  "Transmission Service",
  "Tune-Ups & Diagnostics",
  "Commercial Repairs",
  "Factory Maintenance",
  "Foreign & Domestic",
  "Multi-Point Inspection"
];

/* ============================================================
   NAV: scroll state, mobile menu, smooth anchors, active link
   ============================================================ */
const nav = document.getElementById("nav");
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobile-menu");

ScrollTrigger.create({
  start: 40,
  end: 99999,
  onUpdate: (self) => nav.classList.toggle("scrolled", self.scroll() > 40)
});

function closeMobileMenu() {
  hamburger.classList.remove("open");
  mobileMenu.classList.remove("open");
  hamburger.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}

hamburger.addEventListener("click", () => {
  const isOpen = mobileMenu.classList.toggle("open");
  hamburger.classList.toggle("open", isOpen);
  hamburger.setAttribute("aria-expanded", String(isOpen));
  document.body.style.overflow = isOpen ? "hidden" : "";
});
document.querySelectorAll(".mobile-link").forEach((link) => link.addEventListener("click", closeMobileMenu));

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const id = link.getAttribute("href");
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const offset = 76;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  });
});

const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(".nav-link");
sections.forEach((section) => {
  ScrollTrigger.create({
    trigger: section,
    start: "top 30%",
    end: "bottom 30%",
    onToggle: (self) => {
      if (!self.isActive) return;
      navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${section.id}`));
    }
  });
});

/* ============================================================
   HERO ENTRANCE + GAUGE CLUSTER
   ============================================================ */
gsap.timeline({ defaults: { ease: "power3.out" } })
  .to(".hero-badges", { opacity: 1, y: 0, duration: 0.6 })
  .to(".hero-title", { opacity: 1, y: 0, duration: 0.8 }, "-=0.4")
  .to(".hero-sub", { opacity: 1, y: 0, duration: 0.7 }, "-=0.5")
  .to(".hero-actions", { opacity: 1, y: 0, duration: 0.6 }, "-=0.45")
  .to(".gauge", {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.6,
    stagger: 0.15,
    ease: "back.out(1.6)"
  }, "-=0.9");

document.querySelectorAll(".gauge-ring").forEach((ring) => {
  const valueEl = ring.querySelector(".gauge-value");
  const target = parseFloat(valueEl.getAttribute("data-gauge-count"));
  const decimals = parseInt(valueEl.getAttribute("data-gauge-decimal") || "0", 10);
  const maxForPct = decimals > 0 ? 5 : 100; // the rating gauge reads out of 5, not 100
  const counter = { pct: 0, val: 0 };
  gsap.to(counter, {
    pct: Math.min(100, (target / maxForPct) * 100),
    val: target,
    duration: 1.6,
    delay: 1.1,
    ease: "power2.out",
    onUpdate: () => {
      ring.style.setProperty("--pct", counter.pct.toFixed(2));
      valueEl.textContent = decimals > 0 ? counter.val.toFixed(decimals) : Math.round(counter.val);
    }
  });
});

/* ============================================================
   SCROLL REVEALS
   ============================================================ */
gsap.utils.toArray(".reveal-up").forEach((el) => {
  gsap.fromTo(el, { opacity: 0, y: 28 }, {
    opacity: 1, y: 0, duration: 0.7, ease: "power3.out",
    scrollTrigger: { trigger: el, start: "top 88%" }
  });
});

function staggerReveal(selector, container) {
  const items = (container || document).querySelectorAll(selector);
  if (!items.length) return;
  gsap.fromTo(items, { opacity: 0, y: 22 }, {
    opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.06,
    scrollTrigger: { trigger: items[0], start: "top 90%" }
  });
}
staggerReveal(".service-card");
staggerReveal(".why-card");
staggerReveal(".review-card");

/* ============================================================
   STAT COUNT-UP
   ============================================================ */
document.querySelectorAll(".stat-num[data-count]").forEach((el) => {
  const target = parseInt(el.getAttribute("data-count"), 10);
  const counter = { val: 0 };
  ScrollTrigger.create({
    trigger: el,
    start: "top 90%",
    once: true,
    onEnter: () => {
      gsap.to(counter, {
        val: target,
        duration: 1.4,
        ease: "power2.out",
        onUpdate: () => { el.textContent = Math.round(counter.val); }
      });
    }
  });
});

/* ============================================================
   SERVICES TICKER
   Driven by a GSAP tween (not CSS @keyframes) so hovering can
   smoothly change its timeScale without ever resetting position.
   ============================================================ */
const marqueeStrip = document.querySelector(".marquee-strip");
const marqueeTrack = document.getElementById("marquee-track");
if (marqueeTrack && marqueeStrip) {
  const items = SERVICES.concat(SERVICES).map((title) =>
    `<span class="marquee-item"><span class="marquee-dot"></span>${title}</span>`
  ).join("");
  marqueeTrack.innerHTML = items;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion) {
    const marqueeTween = gsap.to(marqueeTrack, {
      xPercent: -50,
      duration: 30,
      ease: "none",
      repeat: -1
    });
    marqueeStrip.addEventListener("mouseenter", () => {
      gsap.to(marqueeTween, { timeScale: 0.25, duration: 0.5, ease: "power2.out", overwrite: true });
    });
    marqueeStrip.addEventListener("mouseleave", () => {
      gsap.to(marqueeTween, { timeScale: 1, duration: 0.5, ease: "power2.out", overwrite: true });
    });
  }
}

/* ============================================================
   WORK ORDER TICKET DEMO
   ============================================================ */
const ticketList = document.getElementById("ticket-items");
if (ticketList) {
  const demoItems = ["Brakes & Rotors", "Fluid Levels", "Belts & Hoses", "Battery & Charging"];
  ticketList.innerHTML = demoItems.map((title) => `
    <li class="service-ticket-item">
      <span class="service-ticket-check"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg></span>
      <span class="service-ticket-title">${title}</span>
    </li>
  `).join("");

  const rows = ticketList.querySelectorAll(".service-ticket-item");
  let step = 0;
  function tickTicket() {
    rows.forEach((row, i) => row.classList.toggle("is-checked", i < step));
    step = step >= rows.length ? 0 : step + 1;
  }
  tickTicket();
  setInterval(tickTicket, 1100);
}

/* ============================================================
   WHAT WE SERVICE — bay board selector
   A shop bay-status-board: click a bay or let it auto-advance,
   and the stage crossfades to what's "in" that bay. The active
   tab's progress rail is the same GSAP tween driving the
   auto-advance timer, so they can never drift out of sync.
   ============================================================ */
const BAYS = [
  { icon: "icon-car", accent: "green", name: "Domestic Cars & Trucks", desc: "Ford, Chevy, Dodge, and more — serviced to the manufacturer's own spec sheet." },
  { icon: "icon-globe", accent: "steel", name: "Foreign & Import", desc: "Honda, Toyota, BMW, VW, and other imports — the same factory-level care, no dealer markup." },
  { icon: "icon-truck", accent: "green", name: "Commercial & Fleet", desc: "Work trucks and small fleets kept on the road with scheduled, documented maintenance." },
  { icon: "icon-disc", accent: "steel", name: "Brakes & Suspension", desc: "Pads, rotors, shocks, and struts — the parts that decide how a vehicle actually feels to drive." },
  { icon: "icon-gear", accent: "green", name: "Transmission & Drivetrain", desc: "Automatic and manual transmissions, clutches, and drivetrain components, diagnosed right." },
  { icon: "icon-clipboard", accent: "steel", name: "Factory Maintenance", desc: "Scheduled maintenance intervals done to spec, so your warranty stays intact." }
];

function initBayBoard() {
  const tabsEl = document.getElementById("bay-tabs");
  const panelEl = document.getElementById("bay-panel");
  if (!tabsEl || !panelEl) return;

  tabsEl.innerHTML = BAYS.map((bay, i) => `
    <button class="bay-tab${i === 0 ? " is-active" : ""}" data-bay="${i}" type="button" style="--bay-accent:var(--${bay.accent});">
      <span class="bay-tab-index">${String(i + 1).padStart(2, "0")}</span>
      <span class="bay-tab-name">${bay.name}</span>
      <span class="bay-tab-progress"></span>
    </button>
  `).join("");

  function renderPanel(i) {
    const bay = BAYS[i];
    panelEl.style.setProperty("--bay-accent", `var(--${bay.accent})`);
    panelEl.innerHTML = `
      <div class="bay-panel-icon"><svg width="26" height="26"><use href="#${bay.icon}"/></svg></div>
      <p class="bay-panel-index">Bay ${String(i + 1).padStart(2, "0")} / 06</p>
      <h3>${bay.name}</h3>
      <p>${bay.desc}</p>
      <div class="bay-panel-bars"><span></span><span></span><span></span><span></span><span></span></div>
    `;
  }
  renderPanel(0);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let active = 0;
  let cycle = null;

  function goToBay(i, userInitiated) {
    if (i === active && !userInitiated) return;
    active = i;
    tabsEl.querySelectorAll(".bay-tab").forEach((tab, idx) => {
      tab.classList.toggle("is-active", idx === i);
      if (idx !== i) gsap.set(tab.querySelector(".bay-tab-progress"), { scaleX: 0 });
    });

    if (reduceMotion) {
      renderPanel(i);
    } else {
      gsap.to(panelEl, {
        opacity: 0, y: 8, duration: 0.2, ease: "power2.in",
        onComplete: () => {
          renderPanel(i);
          gsap.fromTo(panelEl, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" });
        }
      });
    }
    startCycle();
  }

  function startCycle() {
    if (reduceMotion) return;
    if (cycle) cycle.kill();
    const progressBar = tabsEl.querySelectorAll(".bay-tab-progress")[active];
    gsap.set(progressBar, { scaleX: 0 });
    cycle = gsap.to(progressBar, {
      scaleX: 1,
      duration: 4.5,
      ease: "none",
      onComplete: () => goToBay((active + 1) % BAYS.length, false)
    });
  }

  tabsEl.addEventListener("click", (e) => {
    const tab = e.target.closest(".bay-tab");
    if (!tab) return;
    goToBay(Number(tab.getAttribute("data-bay")), true);
  });

  const board = tabsEl.closest(".bay-board");
  board.addEventListener("mouseenter", () => cycle && cycle.pause());
  board.addEventListener("mouseleave", () => cycle && cycle.resume());

  startCycle();
}
initBayBoard();

/* ============================================================
   VISIT: HOURS + "OPEN NOW" STATUS
   ============================================================ */
const HOURS = {
  0: null,
  6: null,
  1: [8 * 60, 18 * 60],
  2: [8 * 60, 18 * 60],
  3: [8 * 60, 18 * 60],
  4: [8 * 60, 18 * 60],
  5: [8 * 60, 18 * 60]
};

function updateVisitStatus() {
  const now = new Date();
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const range = HOURS[day];

  const dot = document.getElementById("status-dot");
  const text = document.getElementById("status-text");
  if (!dot || !text) return;

  let open = false;
  let label = "Closed today";
  if (range && minutes >= range[0] && minutes < range[1]) {
    open = true;
    label = "Open now";
  } else if (range && minutes < range[0]) {
    label = "Opens at 8:00 AM";
  }

  dot.classList.toggle("is-open", open);
  text.textContent = label;

  document.querySelectorAll("[data-day]").forEach((el) => {
    el.classList.toggle("is-today", Number(el.getAttribute("data-day")) === day);
  });
}
updateVisitStatus();

/* ============================================================
   APPOINTMENT REQUEST FORM
   ============================================================ */
function wireApptForm() {
  const form = document.getElementById("appt-signup-form");
  const success = document.getElementById("appt-success");
  if (!form) return;

  const nameField = document.getElementById("af-name");
  const contactField = document.getElementById("af-contact");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;

    if (!nameField.value.trim()) {
      document.getElementById("af-name-error").textContent = "Please enter your name.";
      valid = false;
    } else {
      document.getElementById("af-name-error").textContent = "";
    }

    if (!contactField.value.trim()) {
      document.getElementById("af-contact-error").textContent = "Let us know how to reach you.";
      valid = false;
    } else {
      document.getElementById("af-contact-error").textContent = "";
    }

    if (!valid) return;

    form.hidden = true;
    success.classList.remove("hidden");
    gsap.fromTo(success, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
    form.reset();
  });
}
wireApptForm();
