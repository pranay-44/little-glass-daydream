# AI Traffic Analysis — Sem 5 CEP Static Website

Mobile-first static website for the Mumbai University Semester 5 Community Engagement
Project (CEP). Built exactly to the PRD tech stack: **HTML5 + CSS3 + Vanilla JavaScript
frontend**, with all charts and AI frames generated **offline by Python**
(Pandas, Matplotlib, OpenCV).

## Structure

```
site/
├── index.html            Home: mission, problem statement, CEP credits
├── how-ai-works.html     4-step explainer + original vs. AI bounding-box frame
├── insights.html         Python charts: peak-hour bar chart, survey pie chart
├── demo.html             Vanilla-JS congestion slider (Green / Yellow / Red)
├── safety.html           Safety tips, survey findings, Hindi & Marathi summary
├── style.css             Single stylesheet, glassmorphism, mobile-first
├── script.js             Nav toggle + congestion slider logic
├── pipeline.py           Python data/chart/detection pipeline
└── assets/               Generated PNG/JPG charts + detection frame
```

## Data provenance (PRD section 4)

Every chart, image and statistic carries one of three tags:

| Tag | Meaning |
| --- | --- |
| **Collected Data** (green) | Field counts & Google Form survey results |
| **AI Model Output** (blue) | Bounding-box frame produced by the detection script |
| **Simulated Data** (amber) | Client-side demo slider & illustrative diagrams |

## Regenerating the Python assets

```bash
pip install pandas matplotlib opencv-python-headless==4.10.*
python pipeline.py   # writes charts and yolo_frame.jpg into assets/
```

`pipeline.py` expects a working folder containing `road_original.jpg` and the
pre-trained model files (`deploy.prototxt`, `mobilenet_iter_73000.caffemodel`);
point `CEP_INPUT` at that folder when re-running.

## Deploying to GitHub Pages

1. Push this folder to a GitHub repository (e.g. `username/ai-traffic-cep`).
2. Repo Settings → Pages → Source: *Deploy from a branch* → branch `main`, folder `/ (root)`
   (or keep the folder at repo root so the site loads directly).
3. Your site will be live at `https://<username>.github.io/<repo>/`.

## Before submission — replace the placeholders

- `index.html`: college name, student names + roll numbers, guide name (search for
  `EDIT:` comments; the footer of every page repeats the college name).
- `insights.html` / `pipeline.py`: replace the sample field-count and survey numbers
  with your real measurements, then re-run the pipeline.
