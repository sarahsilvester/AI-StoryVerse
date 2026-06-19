# AI StoryVerse 🌌 – From Idea to Story, Comic & Video

**AI StoryVerse** is an AI-powered storytelling platform that converts a simple text prompt into a complete multimedia creative experience. It generates a structured story, profiles characters, creates comic panels, generates voice narration, and renders them into an animated cinematic video.

---

## 🌟 Key Features

1. **AI Story Generator**: Accepts custom concepts (e.g. *"A robot discovers an ancient city underwater"*) and weaves a multi-scene narrative. Integrates with **Gemini API** and **OpenAI API**.
2. **Character Consistency**: Create and save character cards (appearance details like clothing, eyes, and hair) that are automatically injected into scene prompts for visual continuity.
3. **Zero-Setup Simulated Mode (Built-In)**: Works out-of-the-box with zero configurations:
   - **Visuals**: Uses **Pollinations.ai** to generate real, high-quality images dynamically for free.
   - **Voice**: Speaks narration via the browser's native **Web Speech API**.
   - **Database**: Auto-detects local MongoDB; falls back to writing to a local JSON file (`db.json`) if MongoDB is unavailable.
4. **HTML5 Cinema Player**: Compiles scenes into a movie using an HTML5 `<canvas>` rendering:
   - Plays a looping instrumental background track tailored to the story's genre (Fantasy, Sci-Fi, Adventure, Mystery, Education) generated procedurally via the browser's **Web Audio API**.
   - Applies the **Ken Burns effect** (slow pan and zoom) to panels for animated transitions.
   - Embeds large, readable subtitles.
   - Animates a neon audio equalizer dancing to the music.
5. **Video Export Engine**: Records canvas playback and audio streams directly in the browser via the `MediaRecorder` API, outputting a downloadable `.webm` video.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS v3, Lucide Icons
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (via Mongoose) with local JSON file fallback

---

## 🚀 How to Run the Application

Follow these steps to run the application locally on your machine:

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher is required)
- **MongoDB** (Optional. If not running, the application will automatically write to a local JSON file `backend/data/db.json`).

### 2. Install Dependencies
Open your terminal in the `ai-storyverse/` root directory and run:
```bash
npm run install:all
```
*This installs root dependencies (like concurrently), frontend dependencies (Vite, React, Tailwind, Lucide), and backend dependencies (Express, Mongoose).*

### 3. Start Frontend & Backend
Start both servers concurrently with a single command:
```bash
npm run dev
```
- **Backend API**: Starts at [http://localhost:5000](http://localhost:5000)
- **Frontend App**: Starts at [http://localhost:5173](http://localhost:5173)

Open [http://localhost:5173](http://localhost:5173) in your web browser to explore!

---

## ⚙️ Configuration (Adding API Keys)
To activate real LLM story generation:
1. Navigate to **API Settings** in the app sidebar.
2. Enter your **Gemini API Key** or **OpenAI API Key**.
3. Click **Save Credentials**. The app will immediately switch from simulated prompts to active LLM outputs.
