/**
 * ============================================================
 *  data.js — Playlist Database
 *  Untuk Mitha 🎵
 *
 *  HOW TO USE:
 *  1. Add or rename categories inside the `categories` array.
 *  2. For each category, fill in its `songs` array.
 *  3. Replace the dummy `src` paths with the real .mp3 paths
 *     relative to index.html, e.g. "./songs/tulus/gajah.mp3"
 *  4. Replace `cover` paths with real image files
 *     (JPG/PNG/WEBP), e.g. "./covers/tulus/gajah.jpg"
 *     — these will be shown in the cover-art slideshow.
 *
 *  FILE STRUCTURE RECOMMENDATION:
 *  /
 *  ├── index.html
 *  ├── style.css
 *  ├── data.js
 *  ├── app.js
 *  ├── songs/
 *  │   ├── penyanyi-a/
 *  │   │   ├── song1.mp3
 *  │   │   └── song2.mp3
 *  │   └── penyanyi-b/
 *  │       └── song1.mp3
 *  └── covers/
 *      ├── penyanyi-a/
 *      │   ├── song1.jpg
 *      │   └── song2.jpg
 *      └── penyanyi-b/
 *          └── song1.jpg
 * ============================================================
 */

const MUSIC_DATA = [

  /* ──────────────────────────────────────────────────────────
     CATEGORY 1 — George Benson
  ────────────────────────────────────────────────────────── */
  {
    id: "george-benson",
    label: "George Benson",
    /** * MASUKKAN 10 FOTO UNTUK SLIDESHOW DI SINI.
     * Pastikan nama file fotonya sesuai (misal: foto1.jpg, foto2.jpg)
     */
    covers: [
      "./covers/foto1.jpg",
      "./covers/foto2.jpg",
      "./covers/foto3.jpg",
      "./covers/foto4.jpg",
      "./covers/foto5.jpg",
      "./covers/foto6.jpg",
      "./covers/foto7.jpg",
      "./covers/foto8.jpg",
      "./covers/foto9.jpg",
      "./covers/foto10.jpg",
    ],
    songs: [
      {
        id: 0,
        title: "Nothing's Gonna Change My Love For You",
        artist: "George Benson",
        src: "./George Benson/Nothing's Gonna Change My Love For You.m4a",
        cover: "./covers/foto1.jpg", // Bisa dikosongkan ("") jika tidak ada cover khusus lagu ini
        duration: "0:00", // Akan otomatis terisi saat lagu diputar
      },
      {
        id: 1,
        title: "You Are the Love of My Life",
        artist: "George Benson",
        src: "./George Benson/You Are the Love of My Life.m4a",
        cover: "./covers/foto2.jpg",
        duration: "0:00",
      }
    ],
  },

  /* ──────────────────────────────────────────────────────────
     CATEGORY 2 — Backstreet Boys
  ────────────────────────────────────────────────────────── */
  {
    id: "backstreet-boys",
    label: "Backstreet Boys",
    /** * MASUKKAN 10 FOTO UNTUK SLIDESHOW DI SINI.
     * Kamu bisa pakai 10 foto yang sama dengan folder George Benson di atas,
     * atau pakai 10 foto yang berbeda.
     */
    covers: [
      "./covers/foto1.jpg",
      "./covers/foto2.jpg",
      "./covers/foto3.jpg",
      "./covers/foto4.jpg",
      "./covers/foto5.jpg",
      "./covers/foto6.jpg",
      "./covers/foto7.jpg",
      "./covers/foto8.jpg",
      "./covers/foto9.jpg",
      "./covers/foto10.jpg",
    ],
    songs: [
      {
        id: 0,
        title: "I Want It That Way",
        artist: "Backstreet Boys",
        src: "./Backstreet Boys/I Want It That Way.m4a",
        cover: "./covers/foto3.jpg",
        duration: "0:00",
      },
      {
        id: 1,
        title: "Shape of My Heart",
        artist: "Backstreet Boys",
        src: "./Backstreet Boys/Shape of My Heart.m4a",
        cover: "./covers/foto4.jpg",
        duration: "0:00",
      }
    ],
  }

];



/* ============================================================
   HELPER — quick lookup by category id
   Usage: getCategoryById("penyanyi-a")
   Returns the full category object or undefined.
============================================================ */
function getCategoryById(id) {
  return MUSIC_DATA.find(cat => cat.id === id);
}


/* ============================================================
   HELPER — get a flat song object with its parent category id
   Usage: getSongByIndex("penyanyi-a", 1)
   Returns { ...songObject, categoryId } or undefined.
============================================================ */
function getSongByIndex(categoryId, songIndex) {
  const category = getCategoryById(categoryId);
  if (!category) return undefined;
  const song = category.songs[songIndex];
  if (!song) return undefined;
  return { ...song, categoryId };
}
