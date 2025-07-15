import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import { Howl } from "howler";
import * as tf from "@tensorflow/tfjs";


// ✅ Set TensorFlow backend early
await tf.setBackend("webgl");
await tf.ready();
console.log("✅ TensorFlow WebGL backend ready");

export default function App() {
  const webcamRef = useRef(null);
  const [emotion, setEmotion] = useState("Neutral 😐");
  const [currentEmotion, setCurrentEmotion] = useState("neutral");
  const [player, setPlayer] = useState(null);
  const [filter, setFilter] = useState('none');
  const [noFace, setNoFace] = useState(false);

  const moodTracks = {
    happy: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    sad: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    angry: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    neutral: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  };

  // Compliments/quotes for each emotion
  const emotionMessages = {
    happy: [
      "Your smile is contagious! 😄",
      "Happiness looks great on you!",
      "Keep spreading those good vibes!"
    ],
    sad: [
      "It's okay to feel down, brighter days are ahead.",
      "Every storm runs out of rain. 🌦️",
      "Sending you a virtual hug! 🤗"
    ],
    angry: [
      "Take a deep breath, you're stronger than you think!",
      "Channel that energy into something positive!",
      "It's okay to feel angry, just let it go."
    ],
    surprised: [
      "Surprise! Life is full of wonders.",
      "Expect the unexpected!",
      "You look amazed! Keep exploring."
    ],
    fearful: [
      "Courage starts with showing up.",
      "You are braver than you believe.",
      "Face your fears, you're not alone."
    ],
    disgusted: [
      "Not everything is pleasant, but you handle it well!",
      "Stay positive, even when things get icky!",
      "You rise above the unpleasant."
    ],
    neutral: [
      "You're calm and collected, keep it up!",
      "Balance is beautiful.",
      "Steady as you go!"
    ]
  };
  const [emotionMsg, setEmotionMsg] = useState("");

  // Unique short audio cues for each emotion (demo URLs)
  const emotionCues = {
    happy: "https://cdn.pixabay.com/audio/2022/10/16/audio_12b6b1b6e2.mp3",
    sad: "https://cdn.pixabay.com/audio/2022/10/16/audio_12b6b1b6e2.mp3",
    angry: "https://cdn.pixabay.com/audio/2022/10/16/audio_12b6b1b6e2.mp3",
    surprised: "https://cdn.pixabay.com/audio/2022/10/16/audio_12b6b1b6e2.mp3",
    fearful: "https://cdn.pixabay.com/audio/2022/10/16/audio_12b6b1b6e2.mp3",
    disgusted: "https://cdn.pixabay.com/audio/2022/10/16/audio_12b6b1b6e2.mp3",
    neutral: "https://cdn.pixabay.com/audio/2022/10/16/audio_12b6b1b6e2.mp3",
  };
  // Track currently playing cue and song
  const [cuePlayer, setCuePlayer] = useState(null);
  const [cueTimeout, setCueTimeout] = useState(null);
  const [audioPlayer, setAudioPlayer] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [audioError, setAudioError] = useState("");
  const [lastCueEmotion, setLastCueEmotion] = useState(null);

  // Royalty-free demo songs for each emotion (public MP3s)
  const moodSongs = {
    happy: [
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
    ],
    sad: [
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
    ],
    angry: [
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"
    ],
    neutral: [
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
    ]
  };
  const [showTrySongs, setShowTrySongs] = useState(false);
  const [showPlaylists, setShowPlaylists] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        console.log("✅ All face-api models loaded");
      } catch (error) {
        console.error("❌ Error loading models:", error);
      }
    };
    loadModels();
  }, []);

  // Play emotion cue (stops after 5s, only one at a time)
  const playEmotionCue = (emotion) => {
    if (cuePlayer) cuePlayer.stop();
    if (cueTimeout) clearTimeout(cueTimeout);
    if (audioPlayer) audioPlayer.stop(); // stop music if cue starts
    if (emotionCues[emotion]) {
      const cue = new Howl({ src: [emotionCues[emotion]], volume: 1.0 });
      cue.play();
      setCuePlayer(cue);
      const timeout = setTimeout(() => {
        cue.stop();
        setCuePlayer(null);
      }, 5000);
      setCueTimeout(timeout);
      setLastCueEmotion(emotion);
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      if (
        webcamRef.current &&
        webcamRef.current.video.readyState === 4
      ) {
        const video = webcamRef.current.video;

        const detection = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions();

        if (detection?.expressions) {
          if (noFace) setNoFace(false);
          const expressions = detection.expressions;
          const maxEmotion = Object.keys(expressions).reduce((a, b) =>
            expressions[a] > expressions[b] ? a : b
          );

          const emojiMap = {
            happy: "😄",
            sad: "😢",
            angry: "😡",
            surprised: "😲",
            fearful: "😨",
            disgusted: "🤢",
            neutral: "😐",
          };

          const displayEmotion = maxEmotion.charAt(0).toUpperCase() + maxEmotion.slice(1);
          const emoji = emojiMap[maxEmotion] || "😐";

          setEmotion(`${displayEmotion} ${emoji}`);
          // Pick a random message for the detected emotion
          const msgs = emotionMessages[maxEmotion] || ["You're awesome!"];
          let newMsg = msgs[Math.floor(Math.random() * msgs.length)];
          setEmotionMsg(prev => (prev === newMsg && msgs.length > 1)
            ? msgs.filter(m => m !== newMsg)[Math.floor(Math.random() * (msgs.length - 1))]
            : newMsg);

          console.log(`🎯 Detected Emotion: ${maxEmotion.toUpperCase()}`);

          if (maxEmotion !== currentEmotion && moodTracks[maxEmotion]) {
            playEmotionCue(maxEmotion);
            setCurrentEmotion(maxEmotion);
            if (player) player.stop();
          }
        } else {
          setNoFace(true);
          setEmotion("No face detected 👀");
          setEmotionMsg("Please ensure your face is visible and well-lit.");
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentEmotion, player]);

  // Handle 'Wanna try songs?' button click
  const handleTrySongs = () => {
    if (cuePlayer) cuePlayer.stop();
    if (cueTimeout) clearTimeout(cueTimeout);
    if (audioPlayer) audioPlayer.stop();
    setShowTrySongs(false);
    setShowPlaylists(true);
  };

  // Play selected song for current emotion (only one at a time)
  const handlePlaySong = (songUrl) => {
    if (audioPlayer) audioPlayer.stop();
    if (cuePlayer) cuePlayer.stop(); // stop cue if song starts
    setAudioError("");
    const newPlayer = new Howl({
      src: [songUrl],
      html5: true,
      volume,
      onplayerror: () => setAudioError("Failed to play song. Try another!"),
      onloaderror: () => setAudioError("Failed to load song. Try another!")
    });
    newPlayer.play();
    setAudioPlayer(newPlayer);
    setCurrentSong(songUrl);
    setIsPlaying(true);
  };
  // Music controls
  const handlePause = () => {
    if (audioPlayer) audioPlayer.pause();
    setIsPlaying(false);
  };
  const handleResume = () => {
    if (audioPlayer) audioPlayer.play();
    setIsPlaying(true);
  };
  const handleVolume = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioPlayer) audioPlayer.volume(v);
  };
  // Stop music and cue on unmount
  useEffect(() => () => {
    if (audioPlayer) audioPlayer.stop();
    if (cuePlayer) cuePlayer.stop();
    if (cueTimeout) clearTimeout(cueTimeout);
  }, []);

  // Playlist card definitions (static, colored, always visible)
  const playlistCards = [
    { title: "Chill Vibes", desc: "Lo-Fi Beats", color: "from-purple-500 to-indigo-600", mood: "happy" },
    { title: "Feel Good", desc: "Happy Pop", color: "from-pink-500 to-red-500", mood: "happy" },
    { title: "Focus Mode", desc: "Instrumentals", color: "from-yellow-400 to-orange-500", mood: "neutral" },
    { title: "Rainy Feels", desc: "Sad + Chill", color: "from-teal-400 to-cyan-500", mood: "sad" },
    { title: "Anger Release", desc: "Pump Up", color: "from-red-500 to-yellow-500", mood: "angry" },
  ];

  // Play random song for the card's mood, or current emotion if matches
  const handlePlayCard = (cardMood) => {
    const mood = cardMood || currentEmotion?.toLowerCase() || "neutral";
    const songs = moodSongs[mood] || moodSongs.neutral;
    const songUrl = songs[Math.floor(Math.random() * songs.length)];
    handlePlaySong(songUrl);
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white font-['Poppins','Montserrat','Inter',sans-serif] overflow-auto px-[15px] md:px-0">
      <header className="text-center mb-8 pt-6 md:pt-12">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-2 tracking-tight leading-tight drop-shadow-lg">MoodMirror <span role='img' aria-label='mask'>🎭</span> + SoundSync <span role='img' aria-label='music'>🎶</span></h1>
        <p className="text-gray-400 text-xs md:text-base">Real-time Emotion Detection with Dynamic Music</p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 items-start w-full max-w-full">
        <div className="relative w-full max-w-3xl mx-auto mb-6 lg:mb-0">
          <div className="w-full aspect-[4/5] md:aspect-video rounded-2xl overflow-hidden">
            <Webcam
              ref={webcamRef}
              audio={false}
              mirrored
              className={`rounded-2xl shadow-2xl w-full h-full object-cover border border-gray-600 ${
                filter === 'none' ? '' :
                filter === 'brighten' ? 'filter brightness-125' :
                filter === 'grayscale' ? 'filter grayscale' :
                filter === 'sepia' ? 'filter sepia' :
                ''
              }`}
              videoConstraints={{ facingMode: "user", width: 640, height: 800 }}
            />
            {/* Overlay controls remain absolutely positioned relative to this container */}
            <div className="absolute top-3 left-3 bg-black/60 px-3 py-1 rounded-md text-xs md:text-md">
              Emotion: <span className="text-pink-400 font-semibold">{emotion}</span>
            </div>
            <div className="absolute bottom-3 right-3 flex flex-wrap gap-1 md:gap-3">
              <button onClick={() => setFilter('none')} className={`bg-white/80 text-black px-2 py-1 md:px-3 md:py-1 rounded shadow hover:bg-white text-xs md:text-base ${filter==='none' ? 'ring-2 ring-pink-400' : ''}`}>No Filter</button>
              <button onClick={() => setFilter('brighten')} className={`bg-white/80 text-black px-2 py-1 md:px-3 md:py-1 rounded shadow hover:bg-white text-xs md:text-base ${filter==='brighten' ? 'ring-2 ring-pink-400' : ''}`}>Brighten</button>
              <button onClick={() => setFilter('grayscale')} className={`bg-white/80 text-black px-2 py-1 md:px-3 md:py-1 rounded shadow hover:bg-white text-xs md:text-base ${filter==='grayscale' ? 'ring-2 ring-pink-400' : ''}`}>Grayscale</button>
              <button onClick={() => setFilter('sepia')} className={`bg-white/80 text-black px-2 py-1 md:px-3 md:py-1 rounded shadow hover:bg-white text-xs md:text-base ${filter==='sepia' ? 'ring-2 ring-pink-400' : ''}`}>Sepia</button>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-3 md:p-6 shadow-xl space-y-3 md:space-y-4 w-full max-w-xl mx-auto">
          <h2 className="text-lg md:text-2xl font-bold">Emotion Console</h2>
          <p className="text-gray-300 text-sm md:text-lg">{emotionMsg}</p>
          <p className="text-xs md:text-sm text-gray-400">{noFace ? "(Face not detected)" : "(New compliment/quote for every emotion!)"}</p>
          {/* Music Controls - below console */}
          {currentSong && (
            <div className="mt-2 flex flex-col md:flex-row items-center gap-2 md:gap-4 bg-gray-800 rounded-xl p-3 md:p-4 shadow-lg w-full">
              <span className="text-white text-xs md:text-base truncate flex-1">Now Playing: {currentSong.split('/').pop()}</span>
              <div className="flex items-center gap-1 md:gap-2 w-full md:w-auto">
                {isPlaying ? (
                  <button onClick={handlePause} className="bg-pink-500 hover:bg-pink-600 text-white rounded px-2 md:px-3 py-1 text-xs md:text-base">Pause</button>
                ) : (
                  <button onClick={handleResume} className="bg-pink-500 hover:bg-pink-600 text-white rounded px-2 md:px-3 py-1 text-xs md:text-base">Play</button>
                )}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolume}
                  className="w-16 md:w-32 accent-pink-500"
                  aria-label="Volume"
                />
              </div>
              {audioError && <span className="text-red-400 text-xs md:text-sm">{audioError}</span>}
            </div>
          )}
        </div>
      </main>
      {/* Mood-Based Playlists - previous design, always visible */}
      <section className="mt-6 md:mt-12 w-full">
        <h2 className="text-lg md:text-2xl font-bold mb-3 md:mb-4 flex items-center gap-2">
          <span role="img" aria-label="headphones">🎧</span> Mood-Based Playlists
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6 w-full">
          {playlistCards.map((card, i) => (
            <div
              key={i}
              className={`p-3 md:p-5 rounded-2xl shadow-md bg-gradient-to-br ${card.color} hover:scale-105 transition-transform cursor-pointer w-full min-h-[80px] md:min-h-[110px] flex flex-col justify-center`}
              onClick={() => handlePlayCard(card.mood)}
            >
              <h3 className="text-sm md:text-lg font-semibold">{card.title}</h3>
              <p className="text-[11px] md:text-sm text-white/90">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center mt-10 md:mt-16 text-[11px] md:text-xs text-gray-500 pb-2">
        Built with ❤️ using React, TailwindCSS, face-api.js, TensorFlow.js & Howler.js
      </footer>
    </div>
  );
}
