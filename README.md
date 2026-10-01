# 🦸 Marvel Omniverse Nexus: Interactive Archives & Q&A

An interactive, responsive web application designed for exploring Marvel movies, iconic comic storylines, reading orders, and character dossiers—equipped with an intelligent AI Query Console ("J.A.R.V.I.S. / Cerebro").

Live static web architecture: **100% client-side, zero build steps, completely free to host on GitHub Pages!**

---

## ⚡ Features

1. **J.A.R.V.I.S. / Cerebro AI Query Console**:
   - Ask any natural language question about Marvel movies, storylines, comics, or characters.
   - Dual-engine: Instant offline S.H.I.E.L.D. archive + optional live Google Gemini AI mode for answering *any* question across the entire Marvel multiverse.
2. **Cinematic MCU Catalog**:
   - Filter by Phase (Phases 1-5).
   - Toggle between **Release Order** and **Chronological In-Universe Viewing Timeline**.
   - Deep dossiers: Synopsis, Box Office, Villains, Post-Credit Scenes, and Comic Book Origins.
3. **Legendary Comic Storylines**:
   - *Secret Wars (1984 & 2015)*, *The Infinity Gauntlet*, *Civil War*, *House of M*, *Age of Apocalypse*, *Planet Hulk / World War Hulk*, *Spider-Verse*, *The Dark Phoenix Saga*, *Annihilation*, *Secret Invasion*.
   - Includes issue-by-issue reading orders and aftermath analysis.
4. **Superhuman Codex & Power Grids**:
   - Official 1-7 Marvel power scale ratings (Intelligence, Strength, Speed, Durability, Energy, Fighting Skills).
   - Side-by-side comparison of Comic Origins vs MCU Portrayals.
5. **Stark Industries HUD Aesthetic**:
   - Arc-reactor cyan, vibranium silver, and crimson red theme.
   - Built-in Web Audio API sound effects synthesizer (no external audio assets required).

---

## 🚀 How to Upload to GitHub & Host with GitHub Pages

### Step 1: Open Terminal in this Folder
Open PowerShell or your preferred terminal inside this project folder:
```bash
cd "C:\Users\Ujjwal tyagi\.gemini\antigravity\scratch\marvel-nexus"
```

### Step 2: Initialize Git & Commit
```bash
git init
git add .
git commit -m "Initial commit: Marvel Omniverse Nexus"
```

### Step 3: Create a GitHub Repository
1. Log in to [GitHub](https://github.com).
2. Click **New** (or "+" in the top right corner) to create a new repository.
3. Name it `marvel-nexus` (or `<your-username>.github.io` if you want it as your primary site).
4. Keep it **Public** so anyone can visit it.
5. Click **Create repository** (do not initialize with README since you already have this one).

### Step 4: Push Your Code to GitHub
Copy the commands shown on your GitHub repository page and run them:
```bash
git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/marvel-nexus.git
git push -u origin main
```

### Step 5: Enable GitHub Pages (Free Instant Website)
1. On your GitHub repository page, click **Settings** (gear icon near top right).
2. On the left sidebar, click **Pages**.
3. Under **Build and deployment** > **Branch**:
   - Select `main`
   - Folder: `/ (root)`
   - Click **Save**.
4. Within 1-2 minutes, your website will be live worldwide at:
   `https://<YOUR-USERNAME>.github.io/marvel-nexus/`

---

## 🛠️ Optional: Google Gemini AI Key
The app has full offline data for all major MCU films, storylines, and characters. If you want J.A.R.V.I.S. to answer questions about any obscure comic issue or universe, click **⚙️ AI Mode** on the website and paste a free API key from [Google AI Studio](https://aistudio.google.com/).
