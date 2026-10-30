# AI Traffic Analysis: Community Website

A free, mobile-first website that explains in plain language how AI reads traffic, shows what we measured at a local junction, and gives practical road-safety tips for everyday commuters.

Built as the **Semester 5 Community Engagement Project (CEP)** for the BSc Information Technology course at **Satish Pradhan Dnyanasadhana (SP) College, Thane**, University of Mumbai.

**Live site:** [https://ai-traffic-analysis.onrender.com]

---

## Why this project

People plan their day around traffic, but most never see how it is measured or how AI could help manage it. This site turns that into something any resident can open on a phone and understand in a few minutes: what the technology does, what we actually counted, and what a commuter, parent or rider can do differently.

## What's on the site

| Page | What it does |
| --- | --- |
| **Home** | What the project is, the problem, our mission and credits |
| **How AI Works** | Four-step explainer: input, detect, count, density score, with an original photo next to its AI-detection frame |
| **Traffic Insights** | Peak-hour chart and community survey results |
| **AI Demo** | Upload a traffic photo and see a vehicle count and congestion analysis; plus a slider showing how a count becomes a congestion level |
| **Road Safety** | Tips for pedestrians and two-wheeler riders, what the community told us, and a Hindi and Marathi summary |

## Honest data labels

Every chart, image and number on the site carries one of three labels, so a visitor never mistakes a simulation for a measurement.

| Label | Meaning |
| --- | --- |
| **Collected Data** (green) | Counted or surveyed by us in the field |
| **AI Model Output** (blue) | Produced by running a detection model on an image |
| **Simulated Data** (amber) | Made up by a demo to teach the idea |

> **Current status of the demo:** the photo-upload demo is a **simulation**. It shows how an AI pipeline would present results, but it does not run a real detection model on the uploaded photo. The sample numbers in the charts are placeholders until our real field counts are added.

## Tech stack

- **Front end:** HTML5, CSS3 (glassmorphism, mobile-first) and vanilla JavaScript. No framework.
- **Data and charts (offline):** Python with Pandas and Matplotlib.
- **Detection frame (offline):** OpenCV with a pre-trained MobileNet-SSD model.
- **Hosting:** Render (static site).

## Project structure

```
public/site/
├── index.html          Home
├── how-ai-works.html   AI explainer
├── insights.html       Charts and survey results
├── demo.html           Interactive AI demo
├── safety.html         Safety tips and local-language summary
├── style.css           Main stylesheet
├── script.js           Navigation and slider logic
├── demo-ai.js / .css   Photo-upload demo
├── pipeline.py         Generates charts and the detection frame
└── assets/             Charts, images and cleaned data
render.yaml             Render deployment settings
```

## Run it locally

The website is plain static files, so no build step is needed.

```bash
git clone https://github.com/pranay-44/little-glass-daydream.git
cd little-glass-daydream/public/site
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Regenerate the charts (optional)

```bash
pip install pandas matplotlib opencv-python-headless
cd public/site
python pipeline.py
```

This rewrites the charts and detection frame in `assets/`. To use your own field counts, edit the data at the top of `pipeline.py` and run it again.

## Deploy on Render

1. Sign in at [render.com](https://render.com) with GitHub.
2. Click **New**, then **Blueprint**, and connect this repository.
3. Render reads `render.yaml` and creates a free static site that publishes `public/site`. There is no build command.
4. Click **Apply**. When the status shows **Live**, open the `.onrender.com` link.

Every push to `main` redeploys the site automatically.

## Privacy and ethics

- No logins, accounts or tracking.
- Photos are used only for the demo and are not stored.
- We never show or keep faces or number plates.
- Survey answers are anonymous.

## Team

- **Student:** Pranay Bhalerao, BSc IT, Semester 5, SP College, Thane
- **Mentor / guide:** *[add name]*
- **Academic year:** 2026-27
- **University:** University of Mumbai

## Acknowledgements

Thanks to our mentor, the faculty of the IT department, and the residents who took part in our field counts and survey.

## Licence

Created for academic purposes as part of the University of Mumbai CEP. 
