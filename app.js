/**
 * ============================================================
 *  app.js — Music Player Logic
 *  Untuk Mitha 🎵
 *
 *  Depends on:
 *    • data.js   → MUSIC_DATA, getCategoryById, getSongByIndex
 *    • index.html (all id/class references documented inline)
 *
 *  Sections:
 *    1.  DOM References
 *    2.  Player State
 *    3.  Initialisation
 *    4.  Category Tabs — render & switch
 *    5.  Song List — render
 *    6.  Load Song — update UI for a selected track
 *    7.  Play / Pause
 *    8.  Previous / Next Track
 *    9.  Progress Bar — sync & seek
 *   10.  Volume
 *   11.  Shuffle & Repeat
 *   12.  Slideshow — cover art control
 *   13.  Slideshow — dot navigation
 *   14.  Time Formatting Utility
 *   15.  Event Listeners — wire everything together
 * ============================================================
 */

"use strict";

/* ============================================================
   1. DOM REFERENCES
   Every element we touch, gathered in one place so the rest
   of the code stays clean and easy to update.
============================================================ */

const DOM = {
  /* Player card — receives .is-playing class to drive CSS */
  playerCard:     document.querySelector(".player-card"),

  /* Now Playing */
  songTitle:      document.getElementById("songTitle"),
  songArtist:     document.getElementById("songArtist"),

  /* Hidden <audio> element */
  audio:          document.getElementById("audioPlayer"),

  /* Progress bar */
  progressBar:    document.getElementById("progressBar"),
  progressFill:   document.getElementById("progressFill"),
  timeCurrent:    document.getElementById("timeCurrent"),
  timeTotal:      document.getElementById("timeTotal"),

  /* Control buttons */
  btnPlay:        document.getElementById("btnPlay"),
  btnPrev:        document.getElementById("btnPrev"),
  btnNext:        document.getElementById("btnNext"),
  btnShuffle:     document.getElementById("btnShuffle"),
  btnRepeat:      document.getElementById("btnRepeat"),

  /* Volume */
  volumeBar:      document.getElementById("volumeBar"),

  /* Playlist */
  categoryNav:    document.getElementById("categoryNav"),
  songList:       document.getElementById("songList"),
  playlistEmpty:  document.getElementById("playlistEmpty"),

  /* Cover art slideshow */
  sliderTrack:    document.getElementById("coverSliderTrack"),
  coverDots:      document.getElementById("coverDots"),

  /* All 10 cover <img> elements (built from HTML ids) */
  get coverImgs() {
    return Array.from({ length: 10 }, (_, i) =>
      document.getElementById(`coverImg${i}`)
    );
  },

  /* All dot buttons inside #coverDots */
  get dots() {
    return Array.from(document.querySelectorAll(".dot"));
  },
};


/* ============================================================
   2. PLAYER STATE
   A single object that tracks everything happening right now.
   Never mutate these directly outside of the functions below
   — always go through the provided helpers so the UI stays
   in sync with the data.
============================================================ */

const STATE = {
  /** ID of the currently active category (matches MUSIC_DATA[i].id) */
  activeCategoryId: null,

  /** Index of the currently loaded song within its category's songs[] */
  currentSongIndex: 0,

  /** Whether audio is currently playing */
  isPlaying: false,

  /** Whether shuffle mode is on */
  shuffleOn: false,

  /**
   * Repeat mode:
   *   "none"  — stop after last track
   *   "all"   — loop the whole playlist
   *   "one"   — repeat the current track
   */
  repeatMode: "none",

  /** Index of the slide currently centred in the cover viewer */
  currentDotIndex: 0,

  /**
   * Whether the user is actively dragging the progress bar.
   * While true we stop updating the bar from timeupdate so
   * the thumb doesn't jump while scrubbing.
   */
  isSeeking: false,
};


/* ============================================================
   3. INITIALISATION
   Called once the script loads. Sets up the tabs, loads the
   first category, and applies saved volume.
============================================================ */

function init() {
  /* Render one tab button per category from data.js */
  renderCategoryTabs();

  /* Auto-select the first category so the page isn't empty */
  if (MUSIC_DATA.length > 0) {
    selectCategory(MUSIC_DATA[0].id);
  }

  /* Apply default volume to the audio element */
  DOM.audio.volume = parseFloat(DOM.volumeBar.value);

  /* Sync the CSS gradient on the volume bar to its default value */
  syncVolumeBarStyle();

  /* Wire all event listeners */
  attachEventListeners();
}


/* ============================================================
   4. CATEGORY TABS — render & switch
============================================================ */

/**
 * renderCategoryTabs()
 * Clears the default placeholder tab and builds one <button>
 * per entry in MUSIC_DATA.
 */
function renderCategoryTabs() {
  DOM.categoryNav.innerHTML = "";

  MUSIC_DATA.forEach((category) => {
    const btn = document.createElement("button");
    btn.className   = "tab-btn";
    btn.role        = "tab";
    btn.dataset.category = category.id;
    btn.textContent = category.label;
    btn.setAttribute("aria-selected", "false");

    /* Each tab click switches the active category */
    btn.addEventListener("click", () => selectCategory(category.id));

    DOM.categoryNav.appendChild(btn);
  });
}

/**
 * selectCategory(categoryId)
 * Switches the active playlist to the chosen category.
 * Loads the cover images for that category's slideshow,
 * renders the song list, and resets playback to the first song.
 *
 * @param {string} categoryId — matches a MUSIC_DATA[i].id value
 */
function selectCategory(categoryId) {
  const category = getCategoryById(categoryId);
  if (!category) return;

  STATE.activeCategoryId = categoryId;
  STATE.currentSongIndex = 0;

  /* Highlight the correct tab */
  DOM.categoryNav.querySelectorAll(".tab-btn").forEach((btn) => {
    const isActive = btn.dataset.category === categoryId;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-selected", String(isActive));
  });

  /* Push the category's 10 cover images into the slideshow */
  loadCoverImages(category.covers);

  /* Fill the song list */
  renderSongList(category);

  /* Load (but don't auto-play) the first song's metadata */
  loadSong(categoryId, 0, /* autoPlay = */ false);
}


/* ============================================================
   5. SONG LIST — render
============================================================ */

/**
 * renderSongList(category)
 * Clears and repopulates the #songList <ul> with one <li>
 * per song in the given category object.
 *
 * @param {object} category — one entry from MUSIC_DATA
 */
function renderSongList(category) {
  DOM.songList.innerHTML = "";

  if (!category.songs || category.songs.length === 0) {
    DOM.playlistEmpty.style.display = "block";
    return;
  }

  DOM.playlistEmpty.style.display = "none";

  category.songs.forEach((song, index) => {
    const li = document.createElement("li");
    li.className = "song-item";
    li.setAttribute("role", "listitem");
    li.dataset.songIndex = index;

    li.innerHTML = `
      <div class="song-item__num" aria-hidden="true">
        <!-- Shown when song is NOT active -->
        <span class="song-item__num-text">${index + 1}</span>
        <!-- Shown when song IS active and playing -->
        <span class="eq-bars" aria-hidden="true">
          <span></span><span></span><span></span>
        </span>
      </div>
      <div class="song-item__info">
        <span class="song-item__title">${escapeHTML(song.title)}</span>
        <span class="song-item__artist">${escapeHTML(song.artist)}</span>
      </div>
      <div class="song-item__duration" data-index="${index}">
        ${song.duration || "--:--"}
      </div>
    `;

    /* Clicking a song loads and plays it */
    li.addEventListener("click", () => {
      loadSong(category.id, index, /* autoPlay = */ true);
    });

    DOM.songList.appendChild(li);
  });
}

/**
 * highlightActiveSongItem(index, isPlaying)
 * Adds .active (and .playing when music runs) to the correct
 * <li> and removes them from all others.
 *
 * @param {number}  index     — song index within current category
 * @param {boolean} isPlaying — whether audio is currently running
 */
function highlightActiveSongItem(index, isPlaying) {
  DOM.songList.querySelectorAll(".song-item").forEach((li) => {
    const liIndex = parseInt(li.dataset.songIndex, 10);
    li.classList.toggle("active",   liIndex === index);
    li.classList.toggle("playing",  liIndex === index && isPlaying);
  });
}


/* ============================================================
   6. LOAD SONG
   Central function that wires everything to a new track.
============================================================ */

/**
 * loadSong(categoryId, songIndex, autoPlay)
 * Loads a specific song: updates the <audio> src, the Now
 * Playing display, the cover images, and optionally starts
 * playback.
 *
 * @param {string}  categoryId — which folder/category
 * @param {number}  songIndex  — position in category.songs[]
 * @param {boolean} autoPlay   — start playing immediately?
 */
function loadSong(categoryId, songIndex, autoPlay = false) {
  const category = getCategoryById(categoryId);
  if (!category) return;

  const song = category.songs[songIndex];
  if (!song) return;

  /* Update state */
  STATE.activeCategoryId = categoryId;
  STATE.currentSongIndex = songIndex;

  /* ── Audio source ── */
  DOM.audio.src = song.src;
  DOM.audio.load();           /* reset the element for the new source */

  /* ── Now Playing text ── */
  DOM.songTitle.textContent  = song.title;
  DOM.songArtist.textContent = song.artist;

  /* ── Progress bar reset ── */
  DOM.progressBar.value    = 0;
  DOM.timeCurrent.textContent = "0:00";
  DOM.timeTotal.textContent   = song.duration || "0:00";
  setProgressFill(0);

  /* ── Song list highlight ── */
  highlightActiveSongItem(songIndex, autoPlay);

  /* ── Cover art: if this song has its own cover, swap slide 0 ── */
  if (song.cover) {
    const firstImg = DOM.coverImgs[0];
    if (firstImg) firstImg.src = song.cover;
  }

  /* ── Playback ── */
  if (autoPlay) {
    playAudio();
  } else {
    /* Ensure UI reflects a paused state without touching audio */
    setPlayingState(false);
  }
}


/* ============================================================
   7. PLAY / PAUSE
============================================================ */

/**
 * playAudio()
 * Starts playback and updates all UI to "playing" state.
 */
function playAudio() {
  DOM.audio.play()
    .then(() => {
      setPlayingState(true);
    })
    .catch((err) => {
      /* Browser may block autoplay — log but don't crash */
      console.warn("Playback prevented:", err);
      setPlayingState(false);
    });
}

/**
 * pauseAudio()
 * Pauses playback and updates all UI to "paused" state.
 */
function pauseAudio() {
  DOM.audio.pause();
  setPlayingState(false);
}

/**
 * togglePlayPause()
 * Called when the user clicks the play/pause button.
 */
function togglePlayPause() {
  if (STATE.isPlaying) {
    pauseAudio();
  } else {
    /* If no src yet, load and play the first song of the first category */
    if (!DOM.audio.src || DOM.audio.src === window.location.href) {
      if (MUSIC_DATA.length > 0 && MUSIC_DATA[0].songs.length > 0) {
        loadSong(MUSIC_DATA[0].id, 0, true);
      }
      return;
    }
    playAudio();
  }
}

/**
 * setPlayingState(playing)
 * Single source of truth for reflecting the playing/paused
 * state across every piece of the UI:
 *   • .is-playing on .player-card   → CSS drives slideshow & pulse
 *   • aria-pressed on play button   → CSS swaps play/pause icons
 *   • .playing on active song item  → CSS shows EQ bars
 *
 * @param {boolean} playing
 */
function setPlayingState(playing) {
  STATE.isPlaying = playing;

  /* Player card class drives the CSS slideshow and heartbeat */
  DOM.playerCard.classList.toggle("is-playing", playing);

  /* aria-pressed drives the CSS icon swap (play ↔ pause SVGs) */
  DOM.btnPlay.setAttribute("aria-pressed", String(playing));
  DOM.btnPlay.setAttribute("aria-label", playing ? "Pause" : "Play");

  /* Highlight active song row with eq-bars when playing */
  highlightActiveSongItem(STATE.currentSongIndex, playing);
}


/* ============================================================
   8. PREVIOUS / NEXT TRACK
============================================================ */

/**
 * playNext()
 * Advances to the next track, respecting shuffle and repeat modes.
 */
function playNext() {
  const category = getCategoryById(STATE.activeCategoryId);
  if (!category) return;

  const total = category.songs.length;
  let nextIndex;

  if (STATE.repeatMode === "one") {
    /* Repeat the same song */
    nextIndex = STATE.currentSongIndex;
  } else if (STATE.shuffleOn) {
    /* Pick a random index that isn't the current one */
    nextIndex = randomIndexExcluding(total, STATE.currentSongIndex);
  } else {
    nextIndex = STATE.currentSongIndex + 1;

    if (nextIndex >= total) {
      if (STATE.repeatMode === "all") {
        nextIndex = 0;      /* loop back to start */
      } else {
        /* End of playlist — stop and reset UI */
        setPlayingState(false);
        DOM.progressBar.value = 0;
        setProgressFill(0);
        return;
      }
    }
  }

  loadSong(STATE.activeCategoryId, nextIndex, /* autoPlay = */ true);
}

/**
 * playPrev()
 * Goes to the previous track, or restarts the current one if
 * more than 3 seconds have elapsed (standard music-player UX).
 */
function playPrev() {
  /* If we're more than 3 s in, restart the current track */
  if (DOM.audio.currentTime > 3) {
    DOM.audio.currentTime = 0;
    return;
  }

  const category = getCategoryById(STATE.activeCategoryId);
  if (!category) return;

  const total = category.songs.length;
  let prevIndex;

  if (STATE.shuffleOn) {
    prevIndex = randomIndexExcluding(total, STATE.currentSongIndex);
  } else {
    prevIndex = STATE.currentSongIndex - 1;
    if (prevIndex < 0) {
      prevIndex = STATE.repeatMode === "all" ? total - 1 : 0;
    }
  }

  loadSong(STATE.activeCategoryId, prevIndex, /* autoPlay = */ true);
}

/**
 * randomIndexExcluding(total, exclude)
 * Returns a random integer in [0, total) that is not `exclude`.
 *
 * @param {number} total   — length of the songs array
 * @param {number} exclude — index to avoid
 * @returns {number}
 */
function randomIndexExcluding(total, exclude) {
  if (total <= 1) return 0;
  let idx;
  do { idx = Math.floor(Math.random() * total); } while (idx === exclude);
  return idx;
}


/* ============================================================
   9. PROGRESS BAR — sync & seek
============================================================ */

/**
 * onTimeUpdate()
 * Fires ~4× per second via the audio "timeupdate" event.
 * Updates the filled track and the time display.
 * Skipped while the user is dragging (STATE.isSeeking).
 */
function onTimeUpdate() {
  if (STATE.isSeeking) return;

  const current  = DOM.audio.currentTime;
  const duration = DOM.audio.duration || 0;

  /* Guard against NaN when audio hasn't loaded yet */
  if (!isFinite(duration) || duration === 0) return;

  const pct = (current / duration) * 100;

  DOM.progressBar.value    = pct;
  DOM.timeCurrent.textContent = formatTime(current);
  setProgressFill(pct);
}

/**
 * onDurationChange()
 * Fires when the audio element knows the total length.
 * Updates the total-time display and the progress bar max.
 */
function onDurationChange() {
  const duration = DOM.audio.duration;
  if (!isFinite(duration)) return;
  DOM.timeTotal.textContent = formatTime(duration);
  DOM.progressBar.max = 100;    /* we always work in percentage */
}

/**
 * setProgressFill(pct)
 * Updates the CSS custom property that drives the filled
 * portion of the progress track (see style.css .progress-fill).
 *
 * @param {number} pct — 0–100
 */
function setProgressFill(pct) {
  DOM.progressFill.style.setProperty("--progress", `${pct}%`);
  /* Also expose it on the wrapper so the thumb pseudo-element works */
  DOM.progressFill.parentElement.style.setProperty("--progress", `${pct}%`);
}

/**
 * onSeekStart()
 * Called on "mousedown"/"touchstart" on the progress bar.
 * Pauses the timeupdate sync so scrubbing feels smooth.
 */
function onSeekStart() {
  STATE.isSeeking = true;
}

/**
 * onSeekInput()
 * Called on "input" (while the thumb is dragged).
 * Updates the fill in real time so the user sees feedback.
 */
function onSeekInput() {
  const pct      = parseFloat(DOM.progressBar.value);
  const duration = DOM.audio.duration || 0;

  setProgressFill(pct);

  /* Update the current-time display while scrubbing */
  if (isFinite(duration) && duration > 0) {
    DOM.timeCurrent.textContent = formatTime((pct / 100) * duration);
  }
}

/**
 * onSeekEnd()
 * Called on "mouseup"/"touchend"/"change" on the progress bar.
 * Commits the seek position to the audio element and resumes sync.
 */
function onSeekEnd() {
  const pct      = parseFloat(DOM.progressBar.value);
  const duration = DOM.audio.duration || 0;

  if (isFinite(duration) && duration > 0) {
    DOM.audio.currentTime = (pct / 100) * duration;
  }

  STATE.isSeeking = false;
}


/* ============================================================
   10. VOLUME
============================================================ */

/**
 * onVolumeChange()
 * Syncs the <audio> volume with the slider and updates the
 * CSS gradient on the track so the filled portion is visible.
 */
function onVolumeChange() {
  DOM.audio.volume = parseFloat(DOM.volumeBar.value);
  syncVolumeBarStyle();
}

/**
 * syncVolumeBarStyle()
 * Updates the CSS custom property --volume-pct so the volume
 * slider's filled portion matches the current value.
 */
function syncVolumeBarStyle() {
  const pct = parseFloat(DOM.volumeBar.value) * 100;
  DOM.volumeBar.style.setProperty("--volume-pct", `${pct}%`);
}


/* ============================================================
   11. SHUFFLE & REPEAT
============================================================ */

/**
 * toggleShuffle()
 * Flips shuffle on/off and reflects the state visually.
 */
function toggleShuffle() {
  STATE.shuffleOn = !STATE.shuffleOn;
  DOM.btnShuffle.classList.toggle("active", STATE.shuffleOn);
  DOM.btnShuffle.setAttribute("aria-pressed", String(STATE.shuffleOn));
  DOM.btnShuffle.title = STATE.shuffleOn ? "Shuffle: On" : "Shuffle: Off";
}

/**
 * cycleRepeat()
 * Cycles through: none → all → one → none
 * and updates the button's visual indicator.
 */
function cycleRepeat() {
  const modes = ["none", "all", "one"];
  const next  = modes[(modes.indexOf(STATE.repeatMode) + 1) % modes.length];
  STATE.repeatMode = next;

  /* Visual feedback on the button */
  DOM.btnRepeat.classList.toggle("active", next !== "none");
  DOM.btnRepeat.title = {
    none: "Repeat: Off",
    all:  "Repeat: All",
    one:  "Repeat: One",
  }[next];

  /*
   * For "repeat one": the "ended" event handler calls playNext(),
   * which checks STATE.repeatMode === "one" and reloads the same
   * song, so no special audio.loop flag is needed.
   */
}


/* ============================================================
   12. SLIDESHOW — cover art control
   The CSS does all the animation; app.js only needs to:
     a) Push the correct image URLs into the <img> tags.
     b) Toggle .is-playing on .player-card (already done in
        setPlayingState) so the CSS keyframe runs/pauses.
     c) Mark which slide is "active" for the dot indicator.
============================================================ */

/**
 * loadCoverImages(coversArray)
 * Writes the src attributes for all 10 cover <img> elements.
 * If the array has fewer than 10 items, the remaining slides
 * loop back through the array (wrap-around).
 *
 * @param {string[]} coversArray — up to 10 image path strings
 */
function loadCoverImages(coversArray) {
  const imgs  = DOM.coverImgs;
  const total = coversArray.length;

  imgs.forEach((img, i) => {
    if (!img) return;
    /* Wrap index so we never leave a slide with an empty src */
    img.src = coversArray[i % total] || "";
    img.alt = `Cover art slide ${i + 1}`;
  });

  /* Reset dot to the first position */
  setActiveDot(0);
}

/**
 * setActiveDot(index)
 * Marks one dot button as selected and updates aria-selected
 * on all others. Also marks the corresponding .cover-slide.
 *
 * @param {number} index — 0–9
 */
function setActiveDot(index) {
  STATE.currentDotIndex = index;

  /* Update dot classes */
  DOM.dots.forEach((dot, i) => {
    const active = i === index;
    dot.classList.toggle("active", active);
    dot.setAttribute("aria-selected", String(active));
  });

  /* Mark the matching slide as active (used by CSS pulse) */
  DOM.sliderTrack.querySelectorAll(".cover-slide").forEach((slide, i) => {
    slide.classList.toggle("active", i === index);
  });
}

/**
 * autoAdvanceDots()
 * Advances the active dot in sync with the CSS animation.
 * The CSS loop takes --slider-duration (default 40s) to scroll
 * through all 10 slides, so each slide shows for
 * (slider-duration / slide-count) seconds.
 *
 * We read the actual computed duration from the CSS variable
 * so changing it in one place (style.css) automatically keeps
 * the dots in sync here.
 */
(function setupDotSync() {
  /* Read --slider-duration from the root, strip "s", parse float */
  const rootStyles   = getComputedStyle(document.documentElement);
  const rawDuration  = rootStyles.getPropertyValue("--slider-duration").trim();
  const totalSecs    = parseFloat(rawDuration) || 40;   /* fallback 40s */
  const slideCount   = parseInt(
    rootStyles.getPropertyValue("--slide-count").trim(), 10
  ) || 10;
  const perSlideSecs = totalSecs / slideCount;           /* e.g. 4s each */

  let dotTimer = null;

  /**
   * startDotTimer()
   * Starts advancing the active dot every `perSlideSecs` seconds.
   * Called whenever playback begins.
   */
  window.startDotTimer = function startDotTimer() {
    stopDotTimer();
    dotTimer = setInterval(() => {
      const next = (STATE.currentDotIndex + 1) % slideCount;
      setActiveDot(next);
    }, perSlideSecs * 1000);
  };

  /**
   * stopDotTimer()
   * Clears the interval so dots freeze while paused.
   */
  window.stopDotTimer = function stopDotTimer() {
    if (dotTimer !== null) {
      clearInterval(dotTimer);
      dotTimer = null;
    }
  };
})();


/* ============================================================
   13. SLIDESHOW — dot button navigation (manual seek)
   When a user taps a dot, we jump the slider track to that
   slide instantly by temporarily overriding the animation
   with a translateX, then letting CSS re-take control.
============================================================ */

/**
 * onDotClick(index)
 * Manually jumps the slideshow to the chosen slide.
 *
 * @param {number} index — 0–9
 */
function onDotClick(index) {
  setActiveDot(index);

  /*
   * To jump the CSS animation to a specific slide we use the
   * animation-delay trick: a negative delay equal to
   * -(index × perSlideDuration) restarts the animation from
   * that point in time.
   */
  const rootStyles   = getComputedStyle(document.documentElement);
  const rawDuration  = rootStyles.getPropertyValue("--slider-duration").trim();
  const totalSecs    = parseFloat(rawDuration) || 40;
  const slideCount   = parseInt(
    rootStyles.getPropertyValue("--slide-count").trim(), 10
  ) || 10;
  const perSlideSecs = totalSecs / slideCount;
  const offset       = -(index * perSlideSecs);

  /* Apply the delay offset to re-sync the running animation */
  DOM.sliderTrack.style.animationDelay = `${offset}s`;
}


/* ============================================================
   14. TIME FORMATTING UTILITY
============================================================ */

/**
 * formatTime(seconds)
 * Converts a float number of seconds into a "m:ss" string.
 *
 * @param  {number} seconds
 * @returns {string} e.g. "3:07"
 */
function formatTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * escapeHTML(str)
 * Prevents XSS if song titles ever contain < > & characters.
 *
 * @param  {string} str
 * @returns {string}
 */
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}


/* ============================================================
   15. EVENT LISTENERS — wire everything together
   All addEventListener calls are here so it's easy to see
   the full picture without hunting through the file.
============================================================ */

function attachEventListeners() {

  /* ── Playback controls ── */
  DOM.btnPlay.addEventListener("click",  togglePlayPause);
  DOM.btnNext.addEventListener("click",  playNext);
  DOM.btnPrev.addEventListener("click",  playPrev);

  /* ── Shuffle & Repeat ── */
  DOM.btnShuffle.addEventListener("click", toggleShuffle);
  DOM.btnRepeat.addEventListener("click",  cycleRepeat);

  /* ── Audio events ── */

  /* timeupdate fires ~4× per second while audio plays */
  DOM.audio.addEventListener("timeupdate",     onTimeUpdate);

  /* durationchange fires once the browser knows the track length */
  DOM.audio.addEventListener("durationchange", onDurationChange);

  /* ended fires when the track finishes naturally */
  DOM.audio.addEventListener("ended", () => {
    playNext();
  });

  /* playing fires after a successful .play() call resolves */
  DOM.audio.addEventListener("playing", () => {
    setPlayingState(true);
    startDotTimer();          /* sync dots with the CSS scroll */
  });

  /* pause fires whenever audio is paused (including on src change) */
  DOM.audio.addEventListener("pause", () => {
    setPlayingState(false);
    stopDotTimer();
  });

  /* waiting fires when audio stalls (buffering) */
  DOM.audio.addEventListener("waiting", () => {
    /* Optional: could show a loading spinner here */
  });

  /* ── Progress bar — scrubbing ──
     We listen to three events to cover mouse AND touch:
     • mousedown / touchstart → onSeekStart (freeze sync)
     • input                  → onSeekInput (live fill update)
     • mouseup / touchend     → onSeekEnd   (commit + resume sync)
     We also listen to "change" as a fallback for some browsers.
  */
  DOM.progressBar.addEventListener("mousedown",  onSeekStart);
  DOM.progressBar.addEventListener("touchstart", onSeekStart, { passive: true });
  DOM.progressBar.addEventListener("input",      onSeekInput);
  DOM.progressBar.addEventListener("mouseup",    onSeekEnd);
  DOM.progressBar.addEventListener("touchend",   onSeekEnd);
  DOM.progressBar.addEventListener("change",     onSeekEnd);

  /* ── Volume bar ── */
  DOM.volumeBar.addEventListener("input", onVolumeChange);

  /* ── Cover art dot navigation ── */
  DOM.dots.forEach((dot, index) => {
    dot.addEventListener("click", () => onDotClick(index));
  });

  /* ── Keyboard shortcuts (accessibility + convenience) ──
     Space           → Play / Pause
     ArrowRight      → Next track
     ArrowLeft       → Previous track
     ArrowUp/Down    → Volume ± 10%
     M               → Mute / Unmute toggle
  */
  document.addEventListener("keydown", (e) => {
    /* Don't hijack shortcuts while typing in an input */
    if (e.target.tagName === "INPUT") return;

    switch (e.key) {
      case " ":
        e.preventDefault();           /* stop page scroll */
        togglePlayPause();
        break;
      case "ArrowRight":
        e.preventDefault();
        playNext();
        break;
      case "ArrowLeft":
        e.preventDefault();
        playPrev();
        break;
      case "ArrowUp":
        e.preventDefault();
        DOM.volumeBar.value = Math.min(1, parseFloat(DOM.volumeBar.value) + 0.1);
        onVolumeChange();
        break;
      case "ArrowDown":
        e.preventDefault();
        DOM.volumeBar.value = Math.max(0, parseFloat(DOM.volumeBar.value) - 0.1);
        onVolumeChange();
        break;
      case "m":
      case "M":
        DOM.audio.muted = !DOM.audio.muted;
        break;
    }
  });
}


/* ============================================================
   ENTRY POINT
   Wait for the DOM to be fully parsed before touching anything.
   (The script tag is at the bottom of <body>, so DOMContentLoaded
   has usually already fired — but this guard is belt-and-braces.)
============================================================ */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
