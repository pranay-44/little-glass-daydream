// AI Traffic Analysis — Image Upload & Simulated Detection Engine
// Fully client-side: no API calls, no server, no model weights.
// Generates realistic-looking bounding boxes, vehicle counts, and congestion analysis.

(function () {
  "use strict";

  // ---------- DOM refs ----------
  const uploadZone = document.getElementById("uploadZone");
  const fileInput = document.getElementById("fileInput");
  const uploadSection = document.getElementById("uploadSection");
  const analysisArea = document.getElementById("analysisArea");
  const canvas = document.getElementById("aiCanvas");
  const ctx = canvas ? canvas.getContext("2d") : null;
  const scanLine = document.getElementById("scanLine");
  const bboxOverlay = document.getElementById("bboxOverlay");
  const resetBtn = document.getElementById("resetBtn");
  const statusText = document.getElementById("statusText");
  const pulseDot = document.querySelector(".pulse-dot");

  // Dashboard refs
  const countCar = document.getElementById("countCar");
  const countBus = document.getElementById("countBus");
  const countBike = document.getElementById("countBike");
  const countTruck = document.getElementById("countTruck");
  const countTotal = document.getElementById("countTotal");
  const gaugeFill = document.getElementById("gaugeFill");
  const congLevel = document.getElementById("congLevel");
  const congDesc = document.getElementById("congDesc");
  const congResult = document.getElementById("congestionResult");
  const congDot = document.getElementById("congDot");
  const detectionLog = document.getElementById("detectionLog");
  const safetyText = document.getElementById("safetyText");
  const safetyCard = document.getElementById("safetyCard");

  if (!uploadZone || !canvas) return; // not on the demo page

  // ---------- Vehicle type definitions ----------
  const VEHICLE_TYPES = [
    { type: "car", icon: "🚗", label: "Car", minW: 0.06, maxW: 0.16, minH: 0.06, maxH: 0.14, weight: 5 },
    { type: "bus", icon: "🚌", label: "Bus", minW: 0.12, maxW: 0.25, minH: 0.08, maxH: 0.18, weight: 1 },
    { type: "bike", icon: "🏍️", label: "Motorbike", minW: 0.03, maxW: 0.08, minH: 0.04, maxH: 0.10, weight: 4 },
    { type: "truck", icon: "🚛", label: "Truck", minW: 0.10, maxW: 0.22, minH: 0.10, maxH: 0.20, weight: 1.5 },
    { type: "auto", icon: "🛺", label: "Auto-rickshaw", minW: 0.04, maxW: 0.10, minH: 0.05, maxH: 0.12, weight: 2 },
    { type: "person", icon: "🚶", label: "Person", minW: 0.02, maxW: 0.05, minH: 0.06, maxH: 0.16, weight: 1.5 },
  ];

  // ---------- Upload handling ----------
  uploadZone.addEventListener("click", () => fileInput.click());
  uploadZone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.click(); }
  });

  // Drag and drop
  uploadZone.addEventListener("dragover", (e) => { e.preventDefault(); uploadZone.classList.add("drag-over"); });
  uploadZone.addEventListener("dragleave", () => uploadZone.classList.remove("drag-over"));
  uploadZone.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadZone.classList.remove("drag-over");
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) processImage(file);
  });

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (file) processImage(file);
  });

  // Reset
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      analysisArea.classList.add("hidden");
      uploadSection.classList.remove("hidden");
      bboxOverlay.innerHTML = "";
      detectionLog.innerHTML = '<p class="log-placeholder">Detections will appear here…</p>';
      fileInput.value = "";
      resetDashboard();
    });
  }

  // ---------- Image processing ----------
  function processImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Show analysis area, hide upload
        uploadSection.classList.add("hidden");
        analysisArea.classList.remove("hidden");

        // Draw image on canvas
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);

        // Begin the simulated AI pipeline
        runAnalysis(img);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // ---------- Main analysis pipeline ----------
  async function runAnalysis(img) {
    resetDashboard();
    bboxOverlay.innerHTML = "";
    detectionLog.innerHTML = "";

    // Phase 1: Initialise
    setStatus("Initialising AI engine…", false);
    await wait(600);

    // Phase 2: Pre-processing
    setStatus("Pre-processing image…", false);
    await wait(500);

    // Phase 3: Apply colour analysis to pick a "smart" vehicle count
    setStatus("Running neural network inference…", false);
    const detections = generateDetections(img);

    // Phase 4: Scanning effect
    setStatus("Scanning for vehicles…", false);
    scanLine.classList.remove("active");
    void scanLine.offsetWidth; // trigger reflow
    scanLine.classList.add("active");
    await wait(800);

    // Phase 5: Render bounding boxes one by one
    setStatus(`Detected ${detections.length} objects — rendering…`, false);
    for (let i = 0; i < detections.length; i++) {
      addBoundingBox(detections[i], i);
      addLogEntry(detections[i], i);
      await wait(120 + Math.random() * 80);
    }

    // Phase 6: Wait for scan to finish then show results
    await wait(600);
    scanLine.classList.remove("active");

    // Phase 7: Populate dashboard
    setStatus(`Analysis complete — ${detections.length} detections`, true);
    populateDashboard(detections);
  }

  // ---------- Generate realistic bounding boxes ----------
  function generateDetections(img) {
    const W = img.naturalWidth;
    const H = img.naturalHeight;

    // Analyse image brightness/complexity to determine vehicle count
    // (uses a small sample of the canvas pixels)
    const sampleCanvas = document.createElement("canvas");
    const sCtx = sampleCanvas.getContext("2d");
    sampleCanvas.width = 64;
    sampleCanvas.height = 48;
    sCtx.drawImage(img, 0, 0, 64, 48);
    const pixels = sCtx.getImageData(0, 0, 64, 48).data;

    let totalBrightness = 0;
    let edgeScore = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      const gray = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
      totalBrightness += gray;
      // Simple edge approximation: variance from local average
      if (i > 16) {
        const prev = 0.299 * pixels[i - 16] + 0.587 * pixels[i - 15] + 0.114 * pixels[i - 14];
        edgeScore += Math.abs(gray - prev);
      }
    }
    const numPixels = (pixels.length / 4);
    const avgBrightness = totalBrightness / numPixels;
    const avgEdge = edgeScore / numPixels;

    // Heuristic: brighter & more complex images → more vehicles
    // Road images tend to be mid-brightness with moderate edges
    let vehicleCount = Math.round(6 + avgEdge * 0.08 + Math.random() * 6);
    vehicleCount = Math.min(Math.max(vehicleCount, 5), 22);

    // Focus vehicles in the lower 2/3 of the image (road area)
    const roadTop = 0.25;
    const roadBottom = 0.92;

    const detections = [];
    const occupied = []; // to avoid overlapping boxes

    for (let i = 0; i < vehicleCount; i++) {
      // Pick a vehicle type (weighted random)
      const vType = weightedRandom(VEHICLE_TYPES);

      // Random box dimensions within type's range
      const bw = rand(vType.minW, vType.maxW);
      const bh = rand(vType.minH, vType.maxH);

      // Try placing the box without heavy overlap
      let x, y, attempts = 0;
      do {
        x = rand(0.02, 0.96 - bw);
        y = rand(roadTop, roadBottom - bh);
        attempts++;
      } while (attempts < 30 && hasOverlap(x, y, bw, bh, occupied));

      occupied.push({ x, y, w: bw, h: bh });

      // Confidence: mostly high, with a realistic spread
      const conf = Math.round((0.62 + Math.random() * 0.36) * 100) / 100;

      detections.push({
        type: vType.type,
        label: vType.label,
        icon: vType.icon,
        x: x,
        y: y,
        w: bw,
        h: bh,
        confidence: conf,
      });
    }

    // Sort by confidence descending (looks more "AI-like")
    detections.sort((a, b) => b.confidence - a.confidence);
    return detections;
  }

  // ---------- Rendering ----------
  function addBoundingBox(det, index) {
    const wrapper = document.getElementById("canvasWrapper");
    const wrapW = wrapper.clientWidth;
    const wrapH = wrapper.clientHeight;

    const box = document.createElement("div");
    box.className = `bbox ${det.type} detected`;
    box.style.left = (det.x * 100) + "%";
    box.style.top = (det.y * 100) + "%";
    box.style.width = (det.w * 100) + "%";
    box.style.height = (det.h * 100) + "%";
    box.style.animationDelay = `${index * 0.06}s`;

    const label = document.createElement("span");
    label.className = "bbox-label";
    label.textContent = `${det.label} ${det.confidence.toFixed(2)}`;
    box.appendChild(label);

    bboxOverlay.appendChild(box);
  }

  function addLogEntry(det, index) {
    const entry = document.createElement("div");
    entry.className = "log-entry";
    entry.style.animationDelay = `${index * 0.05}s`;

    entry.innerHTML = `
      <span class="log-icon">${det.icon}</span>
      <span class="log-type">${det.label}</span>
      <span class="log-conf">${(det.confidence * 100).toFixed(0)}%</span>
    `;
    detectionLog.appendChild(entry);
    detectionLog.scrollTop = detectionLog.scrollHeight;
  }

  // ---------- Dashboard population ----------
  function populateDashboard(detections) {
    const counts = { car: 0, bus: 0, bike: 0, truck: 0, auto: 0, person: 0 };
    detections.forEach((d) => { counts[d.type] = (counts[d.type] || 0) + 1; });

    const total = detections.length;

    // Animate each count in
    animateCount(countCar, counts.car, 300);
    animateCount(countBus, counts.bus, 400);
    animateCount(countBike, counts.bike + counts.auto, 500);
    animateCount(countTruck, counts.truck, 600);
    animateCount(countTotal, total, 700);

    // Congestion level
    const vehiclesOnly = counts.car + counts.bus + counts.bike + counts.truck + counts.auto;
    let congPct, level, levelLabel, levelDesc;

    if (vehiclesOnly <= 6) {
      congPct = Math.round((vehiclesOnly / 6) * 33);
      level = "green";
      levelLabel = "Low Congestion";
      levelDesc = "The road appears clear with minimal vehicle density. Safe conditions for all road users.";
    } else if (vehiclesOnly <= 14) {
      congPct = 33 + Math.round(((vehiclesOnly - 6) / 8) * 33);
      level = "yellow";
      levelLabel = "Moderate Congestion";
      levelDesc = "Multiple vehicles detected. Traffic is building — allow extra travel time and cross with caution.";
    } else {
      congPct = 66 + Math.round(((vehiclesOnly - 14) / 8) * 34);
      level = "red";
      levelLabel = "Heavy Congestion";
      levelDesc = "High vehicle density detected. Expect delays — avoid non-essential trips through this area.";
    }
    congPct = Math.min(congPct, 98);

    setTimeout(() => {
      gaugeFill.style.width = congPct + "%";
      congLevel.textContent = levelLabel;
      congDesc.textContent = levelDesc;
      congResult.classList.remove("green", "yellow", "red");
      congResult.classList.add(level);
    }, 800);

    // Safety card
    setTimeout(() => {
      safetyCard.classList.remove("warn", "danger");
      if (level === "green") {
        safetyText.textContent =
          "✅ Road conditions look safe. Pedestrians can cross comfortably, and two-wheelers have adequate spacing. Always look both ways and use designated crossings.";
      } else if (level === "yellow") {
        safetyCard.classList.add("warn");
        safetyText.textContent =
          "⚠️ Moderate traffic detected. Pedestrians should wait for a clear gap before crossing. Two-wheelers should maintain lane discipline and keep a safe following distance. Avoid distractions.";
      } else {
        safetyCard.classList.add("danger");
        safetyText.textContent =
          "🚨 Heavy congestion detected! Pedestrians should use footbridges or zebra crossings with signals. Two-wheelers should avoid weaving through gaps. If possible, delay your trip by 30–45 minutes until congestion eases.";
      }
    }, 1000);
  }

  function animateCount(el, target, delay) {
    setTimeout(() => {
      el.textContent = target;
      el.classList.remove("pop");
      void el.offsetWidth;
      el.classList.add("pop");
    }, delay);
  }

  function resetDashboard() {
    [countCar, countBus, countBike, countTruck, countTotal].forEach((el) => {
      if (el) el.textContent = "—";
    });
    if (gaugeFill) gaugeFill.style.width = "0%";
    if (congLevel) congLevel.textContent = "—";
    if (congDesc) congDesc.textContent = "Analysis pending…";
    if (congResult) congResult.classList.remove("green", "yellow", "red");
    if (safetyCard) safetyCard.classList.remove("warn", "danger");
    if (safetyText) safetyText.textContent = "Upload an image to receive a safety recommendation.";
  }

  // ---------- Status updates ----------
  function setStatus(text, done) {
    if (statusText) statusText.textContent = text;
    if (pulseDot) {
      pulseDot.classList.toggle("done", done);
    }
  }

  // ---------- Utilities ----------
  function wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function weightedRandom(items) {
    const totalWeight = items.reduce((s, i) => s + i.weight, 0);
    let r = Math.random() * totalWeight;
    for (const item of items) {
      r -= item.weight;
      if (r <= 0) return item;
    }
    return items[items.length - 1];
  }

  function hasOverlap(x, y, w, h, occupied) {
    for (const o of occupied) {
      const overlapX = x < o.x + o.w && x + w > o.x;
      const overlapY = y < o.y + o.h && y + h > o.y;
      if (overlapX && overlapY) {
        // Allow partial overlap but not heavy overlap (> 40%)
        const ix = Math.max(0, Math.min(x + w, o.x + o.w) - Math.max(x, o.x));
        const iy = Math.max(0, Math.min(y + h, o.y + o.h) - Math.max(y, o.y));
        const overlap = (ix * iy) / (w * h);
        if (overlap > 0.4) return true;
      }
    }
    return false;
  }
})();
