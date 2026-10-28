// AI Traffic Analysis — CEP static site (Vanilla JavaScript only)

// ---------- 1. Mobile navigation toggle ----------
const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");
if (toggle && links) {
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.textContent = open ? "✕" : "☰";
  });
  // Close the panel after tapping a link on mobile
  links.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "☰";
    }
  });
}

// ---------- 2. Interactive congestion demo (Simulated Data) ----------
const slider = document.getElementById("trafficSlider");
if (slider) {
  const countEl = document.getElementById("vehicleCount");
  const statusBox = document.getElementById("demoStatus");
  const dot = document.getElementById("statusDot");
  const label = document.getElementById("statusLabel");
  const detail = document.getElementById("statusDetail");
  const meter = document.getElementById("meterFill");

  const LEVELS = {
    green: {
      name: "Smooth Flow",
      detail: "Road is moving freely. Safe window to travel.",
    },
    yellow: {
      name: "Moderate Traffic",
      detail: "Traffic is building up. Allow extra travel time.",
    },
    red: {
      name: "Heavy Congestion",
      detail: "Avoid the junction now — expect long delays.",
    },
  };

  function updateDemo() {
    const count = Number(slider.value);
    countEl.textContent = count;

    let level;
    if (count > 500) {
      level = { key: "red", cls: "red", pct: 100 };
    } else if (count > 250) {
      level = { key: "yellow", cls: "yellow", pct: 66 };
    } else {
      level = { key: "green", cls: "", pct: Math.max(4, (count / 250) * 31) };
    }

    statusBox.classList.remove("yellow", "red");
    if (level.cls) statusBox.classList.add(level.cls);
    label.textContent = LEVELS[level.key].name;
    detail.textContent = LEVELS[level.key].detail;
    meter.style.width = level.pct + "%";
  }

  slider.addEventListener("input", updateDemo);
  updateDemo();
}

// ---------- 3. Footer year ----------
document.querySelectorAll(".site-footer p").forEach((p) => {
  if (p.textContent.includes("©")) {
    p.textContent = p.textContent.replace(/\d{4}/, String(new Date().getFullYear()));
  }
});
