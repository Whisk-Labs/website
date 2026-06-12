function siteBase() {
  if (location.hostname.endsWith("github.io")) {
    const segment = location.pathname.split("/").filter(Boolean)[0];
    return segment ? `/${segment}/` : "/";
  }

  return "/";
}

function initLogos() {
  const base = siteBase();
  ["site-logo", "footer-logo"].forEach((id) => {
    const img = document.getElementById(id);
    if (img) img.src = `${base}assets/logo.png`;
  });
}

const PRODUCTS = {
  managers: [
    {
      title: "Labor Scheduling",
      body: "Staff to the forecast, not the calendar. Whisk recommends shift coverage by role based on predicted covers and rush windows.",
      link: "#forecasting",
    },
    {
      title: "Demand Forecasting",
      body: "See hourly cover predictions and item-level demand so you can plan the day before service starts.",
      link: "#forecasting",
    },
  ],
  kitchen: [
    {
      title: "Production Planning",
      body: "Prep the right amount at the right time. Whisk turns forecasts into daily prep lists your kitchen can act on.",
      link: "#products",
    },
    {
      title: "Inventory Ordering",
      body: "Order based on what you'll actually sell — not last week's gut feel. Reduce spoilage and last-minute 86s.",
      link: "#products",
    },
  ],
  owners: [
    {
      title: "Operations Overview",
      body: "One view across forecasting, inventory, labor, and prep — built for owners who need margin visibility without living in spreadsheets.",
      link: "#how-it-works",
    },
    {
      title: "Multi-Location Insights",
      body: "Compare performance across locations and spot where waste, labor variance, or demand misses are costing you.",
      link: "#about",
    },
  ],
  hq: [
    {
      title: "Chain-Wide Forecasting",
      body: "Roll up demand forecasts across every location with local variables baked in — weather, events, and seasonality per market.",
      link: "#forecasting",
    },
    {
      title: "Standardized Ordering",
      body: "Give each unit ordering recommendations that respect local demand while keeping procurement consistent at HQ.",
      link: "#products",
    },
  ],
};

const PHONE_PREVIEWS = {
  managers: [
    ["Sat dinner staff", "12 people"],
    ["Line cooks", "4 needed"],
    ["Servers", "6 needed"],
    ["Rush window", "7–8:30pm"],
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
    ["Boston — Back Bay", "+14% covers"],
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

function buildPath(values, width, height, padding) {
  const step = (width - padding * 2) / (values.length - 1);
  const max = Math.max(...values, 1);

  return values
    .map((v, i) => {
      const x = padding + i * step;
      const y = height - padding - (v / max) * (height - padding * 2);
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
  forecastPath.setAttribute("d", buildPath(forecast, 400, 160, 16));
  actualPath.setAttribute("d", buildPath(BASE_ACTUAL, 400, 160, 16));
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
        <a href="${item.link}" class="accordion-link">Learn more →</a>
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

initLogos();
initYear();
initMobileNav();
initForecastToggles();
initPersonaTabs();
