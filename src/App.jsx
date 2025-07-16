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

  // Local audio cues for each emotion (public/cues/)
  const emotionCues = {
    happy: "/cues/happy-cue.mp3",
    sad: "/cues/sad-cue.mp3",
    angry: "/cues/angry-cue.mp3",
    surprised: "/cues/surprised-cue.mp3",
    fearful: "/cues/fearful-cue.mp3",
    disgusted: "/cues/disgusted-cue.mp3",
    neutral: "/cues/neutral-cue.mp3",
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

  // Royalty-free demo songs for each emotion (local MP3s in public/songs/)
  const moodSongs = {
    happy: [
      "/cues/happy1.mp3",
      "/cues/happy2.mp3",
      "/cues/happy3.mp3",
      "/cues/happy4.mp3",
      "/cues/happy5.mp3",
    
    ],
    sad: [
      "/cues/sad1.mp3",
      "/cues/sad2.mp3",
      "/cues/sad3.mp3",
      "/cues/sad4.mp3",
      "/cues/sad5.mp3",
     
    ],
    angry: [
      "/cues/angry1.mp3",
      "/cues/angry2.mp3",
      "/cues/angry3.mp3",
      "/cues/angry4.mp3",
     
    ],
    neutral: [
      "/cues/neutral1.mp3",
      "/cues/neutral2.mp3",
      "/cues/neutral3.mp3",
      "/cues/neutral4.mp3",
      "/cues/neutral5.mp3",
      
    ],
    surprised: [
      "/cues/surprised1.mp3",
      "/cues/surprised2.mp3",
      "/cues/surprised3.mp3",
      "/cues/surprised4.mp3",
      "/cues/surprised5.mp3",
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
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white font-['Poppins','Montserrat','Inter',sans-serif] overflow-x-hidden">
      {/* Header */}
      <header className="w-full text-center py-4 sm:py-6 md:py-8 bg-gradient-to-r from-indigo-900/80 via-black/80 to-pink-900/80 shadow-lg mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-6xl font-extrabold tracking-tight drop-shadow-xl flex flex-wrap justify-center items-center gap-1 sm:gap-2 md:gap-3">
          <span>MoodMirror</span> <span role='img' aria-label='mask'>🎭</span>
          <span className="text-pink-400">+</span>
          <span>SoundSync</span> <span role='img' aria-label='music'>🎶</span>
        </h1>
        <p className="text-gray-300 text-xs sm:text-sm md:text-lg mt-1 md:mt-2 font-medium">Real-time Emotion Detection with Dynamic Music</p>
      </header>

      {/* Main Content */}
      <main className="flex flex-col lg:flex-row gap-2 sm:gap-4 md:gap-8 justify-center items-stretch w-full max-w-7xl mx-auto px-1 xs:px-2 md:px-8 overflow-hidden">
        {/* Webcam Card */}
        <section className="w-full max-w-full flex-1 bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl md:rounded-3xl shadow-2xl p-2 xs:p-3 sm:p-4 md:p-8 mb-2 sm:mb-4 lg:mb-0 flex flex-col items-center min-w-0">
          <div className="relative w-full aspect-[4/3] rounded-lg md:rounded-2xl overflow-hidden shadow-xl border border-gray-700">
            <Webcam
              ref={webcamRef}
              audio={false}
              mirrored
              className={`rounded-lg md:rounded-2xl w-full h-full object-cover ${filter === 'none' ? '' : filter === 'brighten' ? 'filter brightness-125' : filter === 'grayscale' ? 'filter grayscale' : filter === 'sepia' ? 'filter sepia' : ''}`}
              videoConstraints={{ facingMode: "user", width: 320, height: 240 }}
            />
            {/* Overlay Controls */}
            <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 md:px-4 md:py-2 rounded-md md:rounded-lg text-xs md:text-md font-semibold flex items-center gap-1 md:gap-2 shadow">
              <span className="text-pink-400">{emotion}</span>
            </div>
            <div className="absolute bottom-2 right-2 flex gap-1 md:gap-2">
              <button onClick={() => setFilter('none')} className={`bg-white/90 text-black px-2 md:px-3 py-1 rounded-md md:rounded-lg shadow hover:bg-pink-100 font-bold text-xs md:text-base ${filter==='none' ? 'ring-2 ring-pink-400' : ''}`}>No Filter</button>
              <button onClick={() => setFilter('brighten')} className={`bg-white/90 text-black px-2 md:px-3 py-1 rounded-md md:rounded-lg shadow hover:bg-pink-100 font-bold text-xs md:text-base ${filter==='brighten' ? 'ring-2 ring-pink-400' : ''}`}>Brighten</button>
              <button onClick={() => setFilter('grayscale')} className={`bg-white/90 text-black px-2 md:px-3 py-1 rounded-md md:rounded-lg shadow hover:bg-pink-100 font-bold text-xs md:text-base ${filter==='grayscale' ? 'ring-2 ring-pink-400' : ''}`}>Grayscale</button>
              <button onClick={() => setFilter('sepia')} className={`bg-white/90 text-black px-2 md:px-3 py-1 rounded-md md:rounded-lg shadow hover:bg-pink-100 font-bold text-xs md:text-base ${filter==='sepia' ? 'ring-2 ring-pink-400' : ''}`}>Sepia</button>
            </div>
          </div>
        </section>

        {/* Emotion Console Card */}
        <section className="w-full max-w-full flex-1 bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl md:rounded-3xl shadow-2xl p-2 xs:p-3 sm:p-6 md:p-10 flex flex-col items-center min-h-[100px] sm:min-h-[120px] md:min-h-[180px] min-w-0">
          <h2 className="text-base xs:text-lg md:text-3xl font-bold mb-1 md:mb-2 flex items-center gap-1 md:gap-2"><span role="img" aria-label="console">🧠</span> Emotion Console</h2>
          <p className="text-pink-300 text-xs xs:text-base md:text-2xl font-semibold mb-1 md:mb-2 text-center">{emotionMsg}</p>
          <p className="text-xs md:text-sm text-gray-400 mb-2 md:mb-4 text-center">{noFace ? "(Face not detected)" : "(New compliment/quote for every emotion!)"}</p>
          {/* Music Controls */}
          {currentSong && (
            <div className="mt-1 md:mt-2 flex flex-col md:flex-row items-center gap-1 md:gap-3 bg-gray-800/80 rounded-lg md:rounded-2xl p-2 md:p-4 shadow-lg w-full">
              <span className="text-white text-xs md:text-base flex-1 truncate flex items-center gap-1 md:gap-2"><span role="img" aria-label="music">🎵</span> Now Playing: <span className="font-bold">{currentSong.split('/').pop()}</span></span>
              <div className="flex items-center gap-1 md:gap-2">
                {isPlaying ? (
                  <button onClick={handlePause} className="bg-pink-500 hover:bg-pink-600 text-white rounded-md md:rounded-lg px-2 md:px-4 py-1 font-bold text-xs md:text-base">Pause</button>
                ) : (
                  <button onClick={handleResume} className="bg-pink-500 hover:bg-pink-600 text-white rounded-md md:rounded-lg px-2 md:px-4 py-1 font-bold text-xs md:text-base">Play</button>
                )}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolume}
                  className="w-10 xs:w-14 md:w-20 accent-pink-500"
                  aria-label="Volume"
                />
              </div>
              {audioError && <span className="text-red-400 text-xs md:text-sm">{audioError}</span>}
            </div>
          )}
        </section>
      </main>

      {/* Mood-Based Playlists */}
      <section className="mt-4 sm:mt-8 md:mt-12 w-full max-w-7xl mx-auto px-1 xs:px-2 md:px-8">
        <h2 className="text-base xs:text-lg md:text-3xl font-bold mb-2 md:mb-6 flex items-center gap-1 md:gap-3"><span role="img" aria-label="headphones">🎧</span> Mood-Based Playlists</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-6">
          {playlistCards.map((card, i) => (
            <div
              key={i}
              className={`p-2 xs:p-3 md:p-6 rounded-lg md:rounded-3xl shadow-xl bg-gradient-to-br ${card.color} hover:scale-105 transition-transform cursor-pointer w-full min-h-[60px] xs:min-h-[80px] md:min-h-[120px] flex flex-col justify-center items-start border border-white/10`}
              onClick={() => handlePlayCard(card.mood)}
            >
              <h3 className="text-xs xs:text-base md:text-2xl font-bold mb-0.5 md:mb-1 drop-shadow-lg">{card.title}</h3>
              <p className="text-[10px] xs:text-xs md:text-base text-white/90">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center mt-4 sm:mt-8 md:mt-16 text-xs md:text-sm text-gray-400 pb-2 md:pb-4">
        Built with <span className="text-pink-400">❤️</span> using <span className="font-bold">React</span>, <span className="font-bold">TailwindCSS</span>, <span className="font-bold">face-api.js</span>, <span className="font-bold">TensorFlow.js</span> & <span className="font-bold">Howler.js</span>
      </footer>
    </div>
  );
}
