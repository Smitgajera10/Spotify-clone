const express = require('express')
const axios = require("axios");
const router = express.Router();

const SAAVN_BASE_URL = process.env.SAAVAN_BASE_URL;

router.get('/search', async (req, res) => {
  const query = req.query.query;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  try {
    // 1. Fetch from API
    const response = await axios.get(`${SAAVN_BASE_URL}/search/songs?query=${query}`);
    const results = response.data?.data?.results || [];

    // 2. Map to your Song model format
    const formattedSongs = results.map(song => ({
      _id : song.id,
      name: song.name,
      thumbnail: song.image?.[2]?.url || '',
      track: song.downloadUrl?.[4]?.url || '',
      artist: undefined ,
      artistName : song.artists?.primary?.[0].name
    }));

    res.json(formattedSongs);
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ error: 'Failed to fetch songs' });
  }
});

router.get("/trending-songs", async (req, res) => {
  try {
    const limit = req.query.limit || "12";

    // 1. Fetch trending songs from Gaanapy
    const gaanaRes = await axios.get(
      `https://gaanaapi-skud.onrender.com/trending?language=Hindi&limit=${limit}`
    );
    const trending = gaanaRes.data || [];

    // 2. Parallel search in api
    const results = await Promise.all(
      trending.map(async (song) => {
        const songTitle = song?.title?.trim();
        if (!songTitle) return null;

        try {
          const searchRes = await axios.get(
            `${SAAVN_BASE_URL}/search/songs`,
            {
              params: { query: songTitle },
            }
          );

          const match = searchRes.data?.data?.results?.[0];
          if (!match) return null;

          return {
            _id: match.id,
            name: match.name,
            thumbnail: match.image?.[2]?.url || "",
            artistName: match.artists?.primary?.[0].name,
            track: match.downloadUrl?.[4]?.url || "",
            artist : undefined
          };
        } catch (e) {
          console.warn(`Search failed for "${songTitle}":`, e.message);
          return null;
        }
      })
    );
    
    const uniqueSongsMap = new Map();
    results.filter(Boolean).forEach((song) => {
      if (!uniqueSongsMap.has(song._id)) {
        uniqueSongsMap.set(song._id, song);
      }
    });

    const uniqueSongs = Array.from(uniqueSongsMap.values());
    // 3. Filter out nulls and send
    res.json({ trendingSongs: uniqueSongs});
  } catch (err) {
    console.error("Trending fetch failed:", err.message);
    res.status(500).json({ error: "Trending fetch failed" });
  }
});

// Popular Albums
router.get("/popular-albums", async (req, res) => {
  try {
    const keywords = ["popular albums", "trending albums", "latest albums"];
    const albums = new Map();

    for (const keyword of keywords) {
      const response = await axios.get(
        `${SAAVN_BASE_URL}/search/albums?query=${keyword}`
      );
      response.data.data.results?.forEach((album) => {
        if (!albums.has(album.id)) albums.set(album.id, album);
      });
    }

    res.json({ albums: Array.from(albums.values()) });
  } catch (error) {
    console.error("Error fetching albums:", error.message);
    res.status(500).json({ error: "Failed to fetch popular albums" });
  }
});


router.get("/popular-artists", async (req, res) => {
  try {
    const popularArtistNames = [
      "Arijit Singh",
      "Shreya Ghoshal",
      "Badshah",
      "Neha Kakkar",
      "KK",
      "Sonu Nigam",
      "Jubin Nautiyal",
      "Diljit Dosanjh",
      "Atif Aslam",
    ];
    const results = [];

    for (const artistName of popularArtistNames) {
      const searchRes = await axios.get(
        `${SAAVN_BASE_URL}/search/artists`,
        {
          params: { query: artistName },
        }
      );

      const artist = searchRes.data?.data?.results?.[0];
      if (artist) {
        results.push({
          id: artist.id,
          name: artist.name,
          image: artist.image?.[2]?.url || "",
          role: artist.role,
          type: artist.type,
        });
      }
    }

    res.json({ popularArtists: results });
  } catch (err) {
    console.error("Popular artists fetch failed:", err.message);
    res.status(500).json({ error: "Failed to fetch popular artists" });
  }
});

// Popular Radio (simulated via playlists containing 'radio')
router.get("/popular-radio", async (req, res) => {
  try {
    const response = await axios.get(
      `${SAAVN_BASE_URL}/search/playlists?query=radio`
    );
    res.json({ radio: response.data.data.results || [] });
  } catch (error) {
    console.error("Error fetching radio:", error.message);
    res.status(500).json({ error: "Failed to fetch radio" });
  }
});

// India's Best (top Indian playlists)
router.get("/indias-best", async (req, res) => {
  try {
    const queries = [
      "india top",
      "india best",
      "top 100 india",
      "indian music",
    ];
    const playlists = new Map();

    for (const keyword of queries) {
      const response = await axios.get(
        `${SAAVN_BASE_URL}/search/playlists?query=${keyword}`
      );
      response.data.data.results?.forEach((playlist) => {
        if (!playlists.has(playlist.id)) playlists.set(playlist.id, playlist);
      });
    }

    res.json({ playlists: Array.from(playlists.values()) });
  } catch (error) {
    console.error("Error fetching India's best:", error.message);
    res.status(500).json({ error: "Failed to fetch India's best" });
  }
});

module.exports = router;