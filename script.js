function siteBase() {
  if (location.hostname.endsWith("github.io")) {
    const segment = location.pathname.split("/").filter(Boolean)[0];
    return segment ? `/${segment}/` : "/";
  }

  return "/";
}

function initLogos() {
  const base = siteBase();
  const logoUrl = `${base}assets/logo.png?v=3`;

  ["site-logo", "footer-logo"].forEach((id) => {
    const img = document.getElementById(id);
    if (!img) return;
    img.src = logoUrl;
    img.addEventListener("error", () => {
      img.src = `${base}assets/logo.png`;
    });
  });
}

function getTheme() {
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("whisk-theme", theme);

  const isDark = theme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  const toggle = document.getElementById("theme-toggle");
  if (toggle) toggle.setAttribute("aria-label", label);

  const mobileToggle = document.getElementById("mobile-theme-toggle");
  if (mobileToggle) mobileToggle.textContent = label;
}

function initTheme() {
  const toggle = () => setTheme(getTheme() === "dark" ? "light" : "dark");

  document.getElementById("theme-toggle")?.addEventListener("click", toggle);
  document.getElementById("mobile-theme-toggle")?.addEventListener("click", toggle);

  setTheme(getTheme());
}

const CONTACT_URL = "https://calendly.com/msathvika24/30min";

const PRODUCTS = {
  managers: [
    {
      title: "Labor Scheduling",
      body: "Staff to the forecast, not the calendar. Whisk recommends shift coverage by role based on predicted covers and rush windows.",
    },
    {
      title: "Demand Forecasting",
      body: "See hourly cover predictions and item-level demand so you can plan the day before service starts.",
    },
  ],
  kitchen: [
    {
      title: "Production Planning",
      body: "Prep the right amount at the right time. Whisk turns forecasts into daily prep lists your kitchen can act on.",
    },
    {
      title: "Inventory Ordering",
      body: "Order based on what you'll actually sell, not last week's gut feel. Reduce spoilage and last-minute 86s.",
    },
  ],
  owners: [
    {
      title: "Operations Overview",
      body: "One view across forecasting, inventory, labor, and prep, built for owners who need margin visibility without living in spreadsheets.",
    },
    {
      title: "Multi-Location Insights",
      body: "Compare performance across locations and spot where waste, labor variance, or demand misses are costing you.",
    },
  ],
  hq: [
    {
      title: "Chain-Wide Forecasting",
      body: "Roll up demand forecasts across every location with local variables baked in: weather, events, and seasonality per market.",
    },
    {
      title: "Standardized Ordering",
      body: "Give each unit ordering recommendations that respect local demand while keeping procurement consistent at HQ.",
    },
  ],
};

const PHONE_PREVIEWS = {
  managers: [
    ["Sat dinner staff", "12 people"],
    ["Line cooks", "4 needed"],
    ["Servers", "6 needed"],
    ["Rush window", "7-8:30pm"],
  ],
  kitchen: [
    ["Chicken breast", "18 lbs"],
    ["Romaine", "12 heads"],
    ["House sauce", "3 qt"],
    ["Burger buns", "85 units"],
  ],
  owners: [
    ["Food cost", "↓ 2.1%"],
    ["Labor variance", "↓ 12%"],
    ["Waste this week", "↓ 18%"],
    ["Forecast accuracy", "91%"],
  ],
  hq: [
    ["Boston, Back Bay", "+14% covers"],
    ["Cambridge", "+8% covers"],
    ["Brookline", "−3% covers"],
    ["Reorder alerts", "2 locations"],
  ],
};

const BASE_FORECAST = [42, 58, 78, 92, 85, 62];
const BASE_ACTUAL = [40, 55, 72, 88, 80, 58];

const VAR_EFFECTS = {
  weather: [0, 4, 8, 6, 2, 0],
  events: [0, 0, 12, 18, 10, 4],
  sports: [0, 6, 10, 14, 8, 2],
  holidays: [0, 0, 0, 20, 15, 8],
  seasonality: [2, 4, 6, 4, 2, 0],
  history: [3, 5, 7, 5, 3, 2],
};

function initYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = String(new Date().getFullYear());
}

function initMobileNav() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("mobile-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
    nav.hidden = open;
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      nav.hidden = true;
    });
  });
}

function buildPath(values) {
  const width = 400;
  const height = 180;
  const left = 40;
  const right = 12;
  const top = 24;
  const bottom = 40;
  const chartW = width - left - right;
  const chartH = height - top - bottom;
  const step = chartW / (values.length - 1);
  const max = Math.max(...values, 1);

  return values
    .map((v, i) => {
      const x = left + i * step;
      const y = top + chartH - (v / max) * chartH;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function getActiveForecast() {
  const active = [...document.querySelectorAll(".var-btn.is-active")].map(
    (btn) => btn.dataset.var
  );

  return BASE_FORECAST.map((base, i) => {
    let value = base;
    active.forEach((key) => {
      value += VAR_EFFECTS[key]?.[i] ?? 0;
    });
    return value;
  });
}

function updateChart() {
  const forecastPath = document.getElementById("chart-forecast");
  const actualPath = document.getElementById("chart-actual");
  if (!forecastPath || !actualPath) return;

  const forecast = getActiveForecast();
  forecastPath.setAttribute("d", buildPath(forecast));
  actualPath.setAttribute("d", buildPath(BASE_ACTUAL));
}

function initForecastToggles() {
  document.querySelectorAll(".var-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("is-active");
      updateChart();
    });
  });
  updateChart();
}

function renderAccordion(persona) {
  const container = document.getElementById("product-accordion");
  if (!container) return;

  const items = PRODUCTS[persona] || PRODUCTS.managers;

  container.innerHTML = items
    .map(
      (item, i) => `
    <div class="accordion-item${i === 0 ? " is-open" : ""}">
      <button type="button" class="accordion-trigger" aria-expanded="${i === 0}">
        ${item.title}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
      <div class="accordion-panel">
        <p>${item.body}</p>
        <a href="${CONTACT_URL}" class="accordion-link" target="_blank" rel="noopener noreferrer">Contact us →</a>
      </div>
    </div>
  `
    )
    .join("");

  container.querySelectorAll(".accordion-trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const item = trigger.closest(".accordion-item");
      const wasOpen = item.classList.contains("is-open");

      container.querySelectorAll(".accordion-item").forEach((el) => {
        el.classList.remove("is-open");
        el.querySelector(".accordion-trigger").setAttribute("aria-expanded", "false");
      });

      if (!wasOpen) {
        item.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  });
}

function updatePhonePreview(persona) {
  const list = document.getElementById("phone-preview");
  if (!list) return;

  const rows = PHONE_PREVIEWS[persona] || PHONE_PREVIEWS.kitchen;
  list.innerHTML = rows
    .map(
      ([label, value]) =>
        `<li><span>${label}</span><strong>${value}</strong></li>`
    )
    .join("");
}

function initPersonaTabs() {
  const tabs = document.querySelectorAll(".persona-tab");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");

      const persona = tab.dataset.persona;
      renderAccordion(persona);
      updatePhonePreview(persona);
    });
  });

  renderAccordion("managers");
  updatePhonePreview("managers");
}

const SEGMENT_HINTS = {
  qsr: "High-volume throughput with prep, labor, and ordering aligned to rush windows.",
  "fast-casual": "Daypart-driven demand with menu mix that shifts by hour and season.",
  "full-service": "Covers, courses, and prep timed to service flow and reservation patterns.",
  cafes: "Bakery batches and café rushes forecasted by item, not just day totals.",
  chains: "One forecast model rolled out across locations with local signal tuning.",
};

function initSegmentPills() {
  const hint = document.getElementById("segment-hint");

  document.querySelectorAll(".segment-pill").forEach((pill) => {
    pill.setAttribute("aria-pressed", pill.classList.contains("is-active") ? "true" : "false");
    pill.addEventListener("click", () => {
      document.querySelectorAll(".segment-pill").forEach((p) => {
        p.classList.remove("is-active");
        p.setAttribute("aria-pressed", "false");
      });
      pill.classList.add("is-active");
      pill.setAttribute("aria-pressed", "true");

      const key = pill.dataset.segment;
      if (hint && key && SEGMENT_HINTS[key]) {
        hint.textContent = SEGMENT_HINTS[key];
      }
    });
  });
}

function initPilotForm() {
  const form = document.getElementById("pilot-form");
  const success = document.getElementById("pilot-form-success");
  if (!form) return;

  const nextInput = form.querySelector('[name="_next"]');
  if (nextInput) {
    const base = siteBase();
    const path = base === "/" ? "" : base.replace(/\/$/, "");
    nextInput.value = `${location.origin}${path}/#pilot?submitted=1`;
  }

  const showSuccess = () => {
    form.hidden = true;
    const divider = form.previousElementSibling;
    if (divider?.classList.contains("cta-divider")) divider.hidden = true;
    if (success) success.hidden = false;
  };

  if (new URLSearchParams(location.search).get("submitted") === "1") {
    showSuccess();
    history.replaceState(null, "", `${location.pathname}${location.hash}`);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitBtn = form.querySelector(".pilot-form-submit");
    const defaultLabel = submitBtn?.textContent || "Send application";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
    }

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error("submit failed");

      form.reset();
      showSuccess();
    } catch {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = defaultLabel;
      }
      window.alert(
        "Something went wrong. Please try again or book a call on Calendly."
      );
    }
  });
}

initLogos();
initTheme();
initYear();
initMobileNav();
initForecastToggles();
initPersonaTabs();
initSegmentPills();
initPilotForm();
