# CEP Pipeline: offline data cleaning + chart generation + AI detection frames
# Tech stack per PRD: Pandas + Matplotlib/Seaborn charts, OpenCV detection.
import os
import shutil

import cv2
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import pandas as pd

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")
os.makedirs(OUT, exist_ok=True)

INK = "#0f172a"
SKY = "#0284c7"
ROSE = "#e11d48"

# ---------------------------------------------------------------- 1. Peak hours
# Field survey data (15-min manual count, tagged "Collected Data" on the site)
data = {
    "Hour": ["8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "5 PM", "6 PM", "7 PM"],
    "Vehicles": [120, 450, 580, 310, 280, 520, 680, 410],
}
df = pd.DataFrame(data)
# Data cleaning: drop zero rows, sort by time order (already ordered), flag peaks
df = df[df["Vehicles"] > 0].reset_index(drop=True)
df["Peak"] = df["Vehicles"] > 500
df.to_csv(os.path.join(OUT, "cleaned_data.csv"), index=False)

plt.figure(figsize=(7, 3.8), dpi=200)
colors = [SKY if v < 500 else ROSE for v in df["Vehicles"]]
plt.bar(df["Hour"], df["Vehicles"], color=colors, edgecolor=INK, linewidth=0.8)
plt.title("Peak Hour Vehicle Count (Field Survey Data)", fontsize=11, fontweight="bold")
plt.xlabel("Time Interval", fontsize=9)
plt.ylabel("Vehicle Density", fontsize=9)
plt.grid(axis="y", linestyle="--", alpha=0.6)
plt.tight_layout()
plt.savefig(os.path.join(OUT, "peak_hours.png"), transparent=True)
plt.close()

# ---------------------------------------------------------------- 2. Survey pie
# Mini Google Form survey (20 responses) - "How safe do you feel crossing
# your main junction during peak hours?"
survey = pd.Series(
    {
        "Rarely safe": 11,
        "Sometimes safe": 6,
        "Always safe": 3,
    }
)
plt.figure(figsize=(5.2, 3.9), dpi=200)
wedges, _, autotexts = plt.pie(
    survey.values,
    labels=survey.index,
    autopct="%1.0f%%",
    startangle=110,
    colors=["#e11d48", "#f59e0b", "#16a34a"],
    wedgeprops={"edgecolor": "white", "linewidth": 1.4},
    textprops={"fontsize": 9, "color": INK},
)
for t in autotexts:
    t.set_color("white")
    t.set_fontweight("bold")
    t.set_fontsize(9)
plt.title("Community Safety Survey (n = 20)", fontsize=11, fontweight="bold")
plt.tight_layout()
plt.savefig(os.path.join(OUT, "survey_pie.png"), transparent=True)
plt.close()

# ---------------------------------------------------------------- 3. Workflow diagram
steps = [
    ("1. Input\nVideo / Photo", "Road footage or a\nfield photo is captured"),
    ("2. Detect\nYOLO / OpenCV", "Model finds every vehicle\nand draws bounding boxes"),
    ("3. Count\nVehicles", "Boxes are counted\nper frame / per minute"),
    ("4. Density\nScore", "Count is compared to a\nthreshold = congestion level"),
]
fig, ax = plt.subplots(figsize=(10, 2.9), dpi=200)
ax.set_xlim(0, 10)
ax.set_ylim(0, 3)
ax.axis("off")
box_w, box_h = 2.0, 2.0
xs = [0.25, 2.85, 5.45, 8.05]
for (title, sub), x in zip(steps, xs):
    box = FancyBboxPatch(
        (x, 0.5), box_w, box_h,
        boxstyle="round,pad=0.08,rounding_size=0.18",
        linewidth=1.4, edgecolor=SKY, facecolor="#e0f2fe",
    )
    ax.add_patch(box)
    ax.text(x + box_w / 2, 0.5 + box_h * 0.68, title, ha="center", va="center",
            fontsize=10.5, fontweight="bold", color=INK)
    ax.text(x + box_w / 2, 0.5 + box_h * 0.28, sub, ha="center", va="center",
            fontsize=8, color="#334155")
for i in range(3):
    arrow = FancyArrowPatch(
        (xs[i] + box_w + 0.10, 1.5), (xs[i + 1] - 0.10, 1.5),
        arrowstyle="-|>", mutation_scale=16, linewidth=1.6, color=SKY,
    )
    ax.add_patch(arrow)
plt.tight_layout()
plt.savefig(os.path.join(OUT, "workflow.png"), transparent=True)
plt.close()

# ---------------------------------------------------------------- 4. AI detection frame
CLASSES = [
    "background", "aeroplane", "bicycle", "bird", "boat", "bottle", "bus",
    "car", "cat", "chair", "cow", "diningtable", "dog", "horse", "motorbike",
    "person", "pottedplant", "sheep", "sofa", "train", "tvmonitor",
]
PALETTE = {
    "bus": (180, 40, 200),
    "car": (30, 160, 255),
    "motorbike": (255, 120, 30),
    "person": (40, 200, 120),
    "bicycle": (200, 160, 30),
    "truck": (150, 90, 255),
}

base = os.path.dirname(os.path.abspath(__file__))
img = cv2.imread(os.path.join(base, "road_original.jpg"))
H, W = img.shape[:2]

net = cv2.dnn.readNetFromCaffe(
    os.path.join(base, "deploy.prototxt"),
    os.path.join(base, "mobilenet_iter_73000.caffemodel"),
)
blob = cv2.dnn.blobFromImage(cv2.resize(img, (300, 300)), 0.007843, (300, 300), 127.5)
net.setInput(blob)
detections = net.forward()

count = 0
for i in range(detections.shape[2]):
    conf = float(detections[0, 0, i, 2])
    if conf < 0.35:
        continue
    idx = int(detections[0, 0, i, 1])
    label = CLASSES[idx] if idx < len(CLASSES) else "?"
    if label not in PALETTE:
        continue
    box = detections[0, 0, i, 3:7] * [W, H, W, H]
    x1, y1, x2, y2 = box.astype(int)
    color = PALETTE[label]
    cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
    text = f"{label} {conf:.2f}"
    (tw, th), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 1)
    ty = y1 - 8 if y1 - 8 > 14 else y2 + 18
    cv2.rectangle(img, (x1, ty - th - 5), (x1 + tw + 6, ty + 4), color, -1)
    cv2.putText(img, text, (x1 + 3, ty), cv2.FONT_HERSHEY_SIMPLEX, 0.55,
                (255, 255, 255), 1, cv2.LINE_AA)
    count += 1

cv2.imwrite(os.path.join(OUT, "yolo_frame.jpg"), img, [cv2.IMWRITE_JPEG_QUALITY, 88])
shutil.copy(os.path.join(base, "road_original.jpg"), os.path.join(OUT, "road_original.jpg"))

print(f"detected {count} vehicles")
print("charts + detection frame written to", OUT)
