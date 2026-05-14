const MUSIC_DATA = [

  /* ──────────────────────────────────────────────────────────
     CATEGORY 1 — George Benson
  ────────────────────────────────────────────────────────── */
  {
    id: "george-benson",
    label: "George Benson",
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
      "./covers/foto11.jpg",
      "./covers/foto12.jpg",
    ],
    songs: [
      {
        id: 0,
        title: "Nothing's Gonna Change My Love For You",
        artist: "George Benson",
        src: "./George Benson/Nothing's Gonna Change My Love For You.m4a",
        cover: "./covers/foto1.jpg",
        duration: "0:00",
      },
      {
        id: 1,
        title: "If Ever You're in My Arms Again",
        artist: "George Benson", 
        src: "./George Benson/If Ever You're in My Arms Again.m4a",
        cover: "./covers/foto2.jpg",
        duration: "0:00",
      }
    ],
  },

  /* ──────────────────────────────────────────────────────────
     CATEGORY 2 — Westlife
  ────────────────────────────────────────────────────────── */
  {
    id: "westlife",
    label: "Westlife",
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
      "./covers/foto11.jpg",
      "./covers/foto12.jpg",
    ],
    songs: [
      {
        id: 0,
        title: "If I Let You Go",
        artist: "Westlife",
        src: "./Westlife/If I Let You Go.m4a",
        cover: "./covers/foto3.jpg",
        duration: "0:00",
      },
      {
        id: 1,
        title: "My Love",
        artist: "Westlife",
        src: "./Westlife/My Love.m4a",
        cover: "./covers/foto4.jpg",
        duration: "0:00",
      },
      {
        id: 2,
        title: "Swear It Again",
        artist: "Westlife",
        src: "./Westlife/Swear It Again.m4a",
        cover: "./covers/foto5.jpg",
        duration: "0:00",
      }
    ],
  },

  /* ──────────────────────────────────────────────────────────
     CATEGORY 3 — Backstreet Boys
  ────────────────────────────────────────────────────────── */
  {
    id: "backstreet-boys",
    label: "Backstreet Boys",
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
      "./covers/foto11.jpg",
      "./covers/foto12.jpg",
    ],
    songs: [
      {
        id: 0,
        title: "I Want It That Way",
        artist: "Backstreet Boys",
        src: "./Backstreet Boys/I Want It That Way.m4a",
        cover: "./covers/foto6.jpg",
        duration: "0:00",
      },
      {
        id: 1,
        title: "Shape of My Heart",
        artist: "Backstreet Boys",
        src: "./Backstreet Boys/Shape of My Heart.m4a",
        cover: "./covers/foto7.jpg",
        duration: "0:00",
      }
    ],
  },

  /* ──────────────────────────────────────────────────────────
     CATEGORY 4 — NDX AKA
  ────────────────────────────────────────────────────────── */
  {
    id: "ndx-aka",
    label: "NDX AKA",
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
        title: "Ditinggal Rabi",
        artist: "NDX AKA",
        src: "./NDX AKA/Ditinggal Rabi.m4a",
        cover: "./covers/foto8.jpg",
        duration: "0:00",
      },
      {
        id: 1,
        title: "Nemen",
        artist: "NDX AKA",
        src: "./NDX AKA/Nemen.m4a",
        cover: "./covers/foto9.jpg",
        duration: "0:00",
      },
      {
        id: 2,
        title: "Tresno Tekan Mati",
        artist: "NDX AKA",
        src: "./NDX AKA/Tresno Tekan Mati.m4a",
        cover: "./covers/foto10.jpg",
        duration: "0:00",
      }
    ],
  }

];

/* ============================================================
   HELPER — quick lookup by category id
============================================================ */
function getCategoryById(id) {
  return MUSIC_DATA.find(cat => cat.id === id);
}

/* ============================================================
   HELPER — get a flat song object with its parent category id
============================================================ */
function getSongByIndex(categoryId, songIndex) {
  const category = getCategoryById(categoryId);
  if (!category) return undefined;
  const song = category.songs[songIndex];
  if (!song) return undefined;
  return { ...song, categoryId };
}