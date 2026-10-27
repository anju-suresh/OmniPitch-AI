# ⚽ OmniPitch AI: Real-Time Sports Intelligence & Fan Experience Platform

> **Full-Stack MERN (Plain JavaScript ES6) + Google Gemini AI Solution**  
> An autonomous multi-agent platform designed to analyze live match events, generate tactical breakdowns, produce multimodal stories, expand datasets, and deliver personalized global experiences.

---

## 🌟 Executive Summary

**OmniPitch AI** is built on the **MERN stack (MongoDB, Express.js, React, Node.js)** entirely in **plain JavaScript (ES6+)** and powered by **Google Gemini AI** (Gemini 2.0 / 1.5 Flash and Pro). It addresses all key sports hackathon challenges:

1. **Analyze match events in real time**: Live WebSocket event stream, rolling xG, expected threat (xT), pressing intensity (PPDA), and match momentum curves.
2. **Generate stories, highlights, and recaps**: Automated multi-format journalism, viral 30-second reel scripts, and highlight cue manifests.
3. **Explain key moments and tactical patterns**: Deep tactical reasoner explaining *why* plays succeeded or failed, paired with an interactive 2D pitch chalkboard.
4. **Expand datasets for AI and analytics**: Generates physics-grounded synthetic play variations (counter-attacks, set-pieces) and enriches raw coordinate feeds with tactical semantic tags.
5. **Deliver insights for fans around the world in multiple languages**: Real-time contextual translation across 10+ languages with regional football dialect and slang adaptation.
6. **Deliver personalized experiences for studios, streaming platforms, and fans**: Three dedicated user interfaces:
   - **🎙️ Studio & Broadcaster Co-Pilot**: Real-time teleprompter, live stat cards, and trivia assistant.
   - **📺 OTT Streaming Companion**: Interactive timeline with clickable key moments and live audience predictions.
   - **📱 Multilingual Fan Hub**: Club-tailored feeds, audio recaps, and an interactive Gemini conversational assistant.

---

## 🏗️ Architecture

```
                          ┌─────────────────────────────────────┐
                          │     Real-Time Match Event Feed      │
                          │   (Passes, Shots, Coordinates, xG)  │
                          └──────────────────┬──────────────────┘
                                             │
                                             ▼
                          ┌─────────────────────────────────────┐
                          │      Node.js & Express.js Backend   │
                          │ • Socket.IO Real-Time Broadcaster   │
                          │ • Mathematical Metrics Engine (xG)  │
                          │ • MongoDB Persistence Layer         │
                          └──────────────────┬──────────────────┘
                                             │
                                             ▼
                          ┌─────────────────────────────────────┐
                          │    Google Gemini AI Agent Suite     │
                          │ • Stream Analyst Agent (Flash)      │
                          │ • Tactical Reasoner Agent (Pro)     │
                          │ • Story & Recap Agent (Pro)         │
                          │ • Synthetic Augmenter Agent (Pro)   │
                          │ • Multilingual Localizer (Flash)    │
                          └──────────────────┬──────────────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
      ┌─────────────────────────────────┐         ┌─────────────────────────────────┐
      │       MongoDB Database          │         │    React (ES6) Frontend Client   │
      │ • Match Events & Telemetry      │         │ • 🎙️ Broadcaster Studio Co-Pilot│
      │ • Synthetic Augmented Datasets  │         │ • 📺 OTT Interactive Companion  │
      │ • Fan Profiles & Saved Recaps   │         │ • 📱 Personalized Fan Hub       │
      └─────────────────────────────────┘         └─────────────────────────────────┘
```

---

## 📁 Repository Structure

```text
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                 # MongoDB connection (Mongoose)
│   │   │   └── gemini.js             # Google Gemini AI client
│   │   ├── models/
│   │   │   ├── MatchEvent.js         # Event & tracking coordinates schema
│   │   │   ├── MatchRecap.js         # Stories, recaps & highlight markers
│   │   │   └── SyntheticDataset.js   # Augmented plays & scenarios
│   │   ├── agents/
│   │   │   ├── streamAnalyst.js      # Sub-second anomaly & momentum detection
│   │   │   ├── tacticalReasoner.js   # In-depth tactical formation explainability
│   │   │   ├── storyGenerator.js     # Multi-format journalism & scripts
│   │   │   ├── dataAugmenter.js      # Synthetic play generator
│   │   │   └── localizer.js          # Multilingual cultural translation
│   │   ├── services/
│   │   │   ├── metricsEngine.js      # Rolling xG, xT, PPDA algorithms
│   │   │   └── matchSimulator.js     # High-fidelity live match event generator
│   │   ├── routes/
│   │   │   ├── matchRoutes.js        # Match telemetry & stats API
│   │   │   ├── agentRoutes.js        # Trigger AI agent workflows
│   │   │   └── datasetRoutes.js      # Export synthetic training datasets
│   │   └── server.js                 # Express app & Socket.IO server
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Persona switcher (Studio / OTT / Fan)
│   │   │   ├── PitchBoard.jsx        # Interactive 2D tactical pitch chalkboard
│   │   │   ├── MomentumChart.jsx     # Live momentum & xG trendline
│   │   │   ├── MatchTimeline.jsx     # Clickable key-moment timeline
│   │   │   └── LanguagePicker.jsx    # Language & dialect selector
│   │   ├── views/
│   │   │   ├── StudioView.jsx        # Broadcaster teleprompter & stat pack
│   │   │   ├── OTTView.jsx           # Streaming companion & interactive pitch
│   │   │   └── FanView.jsx           # Multilingual fan hub & Gemini chat
│   │   ├── services/
│   │   │   ├── socket.js             # Socket.IO client
│   │   │   └── api.js                # API helper
│   │   ├── App.jsx                   # Main layout
│   │   ├── main.jsx                  # React DOM mount
│   │   └── index.css                 # Clean modern dark-theme styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env   # Add your GEMINI_API_KEY and MONGODB_URI
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` to test live match events, tactical reasoning, and persona switching.
