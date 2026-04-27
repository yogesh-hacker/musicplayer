let playlist = [];
let currentIndex = 0;
let audio = new Audio();
let isPlaying = false;

// DOM Elements
const title = document.getElementById("title");
const artist = document.getElementById("artist");
const cover = document.getElementById("cover");
const progress = document.getElementById("progress");
const playBtn = document.getElementById("playBtn");
const playlistDiv = document.getElementById("playlist");
const currentTimeEl = document.getElementById("current-time");
const totalTimeEl = document.getElementById("total-time");

// SVG Icons
const playIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="play-icon"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
const pauseIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pause-icon"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;

// Helper: Auto cover generator (Using a sleeker image placeholder API)
function getCover(text) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(text)}&background=1e293b&color=a855f7&size=256&font-size=0.33`;
}

// Helper: Format Time (seconds to M:SS)
function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Load songs (with fallback data for testing)
const fallbackSongs = [
  { title: "Midnight City", artist: "Synthwave Nights", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { title: "Ocean Eyes", artist: "Indie Vibes", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { title: "Neon Skyline", artist: "Retro Boy", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
];

fetch("songs.json")
  .then(res => res.json())
  .then(data => {
    playlist = data;
    initPlayer();
  })
  .catch(err => {
    console.warn("songs.json not found, loading default tracks.");
    playlist = fallbackSongs;
    initPlayer();
  });

function initPlayer() {
  renderPlaylist();
  loadSong(0);
}

// Render playlist
function renderPlaylist() {
  playlistDiv.innerHTML = "";

  playlist.forEach((song, index) => {
    const div = document.createElement("div");
    div.classList.add("song");
    div.setAttribute("data-index", index);

    const img = song.cover || getCover(song.title);

    div.innerHTML = `
      <img src="${img}" alt="${song.title}">
      <div class="song-info">
        <h4>${song.title}</h4>
        <p>${song.artist}</p>
      </div>
    `;

    div.onclick = () => {
      loadSong(index);
      playSong();
    };

    playlistDiv.appendChild(div);
  });
}

// Update Active Class in Playlist
function updateActivePlaylist() {
  const songs = document.querySelectorAll(".song");
  songs.forEach((songDiv, index) => {
    // Remove existing active states and equalizer animations
    songDiv.classList.remove("active");
    const eq = songDiv.querySelector(".playing-animation");
    if (eq) eq.remove();

    // Add active state and equalizer to current track
    if (index === currentIndex) {
      songDiv.classList.add("active");
      songDiv.insertAdjacentHTML("beforeend", `
        <div class="playing-animation">
          <span class="bar"></span><span class="bar"></span><span class="bar"></span>
        </div>
      `);
    }
  });
}

// Load song
function loadSong(index) {
  currentIndex = index;
  const song = playlist[index];

  audio.src = song.url;
  title.innerText = song.title;
  artist.innerText = song.artist;
  cover.src = song.cover || getCover(song.title);
  
  updateActivePlaylist();
}

// Controls
function playSong() {
  audio.play();
  isPlaying = true;
  playBtn.innerHTML = pauseIcon; // Swap to SVG Pause icon
}

function pauseSong() {
  audio.pause();
  isPlaying = false;
  playBtn.innerHTML = playIcon; // Swap to SVG Play icon
}

function togglePlay() {
  isPlaying ? pauseSong() : playSong();
}

function nextSong() {
  currentIndex = (currentIndex + 1) % playlist.length;
  loadSong(currentIndex);
  playSong();
}

function prevSong() {
  currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
  loadSong(currentIndex);
  playSong();
}

// Auto-play next song when current finishes
audio.onended = nextSong;

// Audio metadata loaded (Get total duration)
audio.onloadedmetadata = () => {
  totalTimeEl.innerText = formatTime(audio.duration);
  progress.value = 0;
};

// Progress Update
audio.ontimeupdate = () => {
  if (audio.duration) {
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    progress.value = progressPercent;
    
    // Update the background size for the CSS gradient trick on Webkit browsers
    progress.style.backgroundSize = `${progressPercent}% 100%`;
    
    currentTimeEl.innerText = formatTime(audio.currentTime);
  }
};

// Seek within the track
progress.oninput = () => {
  audio.currentTime = (progress.value / 100) * audio.duration;
};
