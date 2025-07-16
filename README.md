# MoodMirror + SoundSync 🎭🎶

<p align="center">
  <img src="https://user-images.githubusercontent.com/placeholder/banner.png" alt="MoodMirror + SoundSync Banner" width="600"/>
</p>

---

## Welcome to MoodMirror + SoundSync!

> **“Ever wondered what your face sounds like?”**
>
> MoodMirror + SoundSync is your AI-powered musical mirror. Smile, frown, or make a silly face—your webcam detects your emotion and instantly syncs the perfect playlist to your mood. Whether you need a pick-me-up, a chill-out, or just want to see tech magic, this app is your new favorite companion!

---

## 🌟 Features
- 🎥 **Live Webcam Emotion Detection** (face-api.js & TensorFlow.js)
- 🎵 **Dynamic Music Playback** (Howler.js)
- 🧠 **Compliments & Quotes** for every emotion
- 🎚️ **Music Controls** (play, pause, volume)
- 🎨 **Mood-Based Playlists** (clickable, animated cards)
- 🌈 **Modern Responsive UI** (TailwindCSS, glassmorphism, animated backgrounds)
- 📱 **Mobile-First Design** (fits all screens, touch-friendly)
- 🖼️ **Webcam Filters** (Brighten, Grayscale, Sepia)
- ⚡ **Fast, Client-Side Only** (no backend required)
- 🦄 **Fun, Interactive, and Creative!**

---

## 🚀 Live Demo
> _[Add your live deployment link here, e.g. Vercel/Netlify]_  
Example: [Live Demo on Vercel](https://your-app-url.vercel.app)

---

## 📸 Example Screenshots
| Home (Desktop) | Home (Mobile) |
|:---:|:---:|
| ![Desktop Screenshot](https://user-images.githubusercontent.com/placeholder/desktop.png) | ![Mobile Screenshot](https://user-images.githubusercontent.com/placeholder/mobile.png) |

---

## 🎯 Example Use Cases
- **Study Sessions:** Get focus music when you look serious, and a break playlist when you smile!
- **Mood Booster:** Feeling down? Let the app play uplifting tunes and send you a compliment.
- **Party Trick:** Show friends how your face controls the music—fun at gatherings!
- **Mindfulness:** Notice your emotions and let music help you regulate your mood.

---

## 🛠️ Tech Stack
- **React** (frontend framework)
- **TailwindCSS** (styling & layout)
- **face-api.js** (face & emotion detection)
- **TensorFlow.js** (ML backend)
- **Howler.js** (audio playback)
- **Vite** (build tool)

---

## 🏁 Getting Started

### 1. Clone the Repo
```bash
git clone https://github.com/your-username/facial-emotion-player.git
cd facial-emotion-player
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the App
```bash
npm run dev
```
Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🎮 Usage
- Allow webcam access when prompted.
- Your face will be detected and your emotion shown in real time.
- The app will play music matching your mood.
- Use the filter buttons to change webcam appearance.
- Click playlist cards to try different mood-based playlists.
- Use the music controls to play/pause or adjust volume.

---

## 📁 Folder Structure
```
facial-emotion-player/
├── public/
│   ├── models/           # face-api.js models (required for detection)
│   ├── songs/            # Local MP3 files for mood-based music
│   └── cues/             # Local MP3 files for emotion cues
├── src/
│   ├── App.jsx           # Main React component
│   ├── index.css         # Global styles
│   └── ...
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## 🧑‍💻 Customization
- **Add your own music:** Place your MP3 files in `public/songs/` and update the `moodSongs` and `moodTracks` objects in `App.jsx` to use your file names.
- **Add your own emotion cues:** Place short MP3 files in `public/cues/` and update the `emotionCues` object in `App.jsx`.
- **Change compliments/quotes:** Edit the `emotionMessages` object in `App.jsx`.
- **Tweak UI:** Modify Tailwind classes in `App.jsx` or add your own styles.
- **Deploy:** Easily deploy to Vercel, Netlify, or any static host.

---

## 🌍 Deployment
### Deploy to Vercel
1. Push your code to GitHub.
2. Go to [Vercel](https://vercel.com/), import your repo, and deploy.
3. Set the build command to `npm run build` and output directory to `dist`.

### Deploy to Netlify
1. Push your code to GitHub.
2. Go to [Netlify](https://netlify.com/), import your repo, and deploy.
3. Set the build command to `npm run build` and output directory to `dist`.

---

## 🤔 FAQ
**Q: Why isn’t my face detected?**  
A: Make sure your webcam is enabled, your face is well-lit, and you’re facing the camera.

**Q: Can I use my own music?**  
A: Yes! Edit the `moodSongs` and `moodTracks` in `App.jsx`.

**Q: Is my data private?**  
A: 100%—all processing is done in your browser. No video or emotion data is sent anywhere.

**Q: Does it work on mobile?**  
A: Yes! The UI is fully responsive and touch-friendly.

---

## 🛠️ Troubleshooting
- If the webcam doesn’t work, check browser permissions.
- If models don’t load, make sure the `/public/models` folder is present.
- **If music or cues don’t play, ensure your MP3 files are present in `public/songs/` and `public/cues/` and the file names match those in `App.jsx`.**
- For best results, use Chrome or Firefox.

---

## 🤝 Contributing
1. Fork this repo
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to your fork and open a Pull Request
5. Let’s make MoodMirror + SoundSync even cooler!

---

## 🙋 Contact
- [Your Name](mailto:your.email@example.com)
- [GitHub Issues](https://github.com/your-username/facial-emotion-player/issues)

---

## 🏅 Credits
- [face-api.js](https://github.com/justadudewhohacks/face-api.js)
- [TensorFlow.js](https://www.tensorflow.org/js)
- [Howler.js](https://howlerjs.com/)
- [TailwindCSS](https://tailwindcss.com/)

---

## 📄 License
[MIT](LICENSE)
