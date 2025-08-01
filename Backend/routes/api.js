const express = require('express')
require('dotenv').config();
const TrendingSongs = require("../models/TrendingSongs");
const cron = require("node-cron");
const passport = require("passport");
const Playlist = require("../models/Playlist");
const Song = require("../models/Song");
const puppeteer = require("puppeteer");
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
      track: song.downloadUrl?.[4]?.url.replace("http://", "https://") || '',
      artist: undefined ,
      artistName : song.artists?.primary?.[0].name
    }));

    res.json(formattedSongs);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to fetch songs' });
  }
});


router.get("/tsongs", async (req, res) => {
  try {
    const trendingDoc = await TrendingSongs.findOne();

    if (trendingDoc && Array.isArray(trendingDoc.songs) && trendingDoc.songs.length > 0) {
      return res.json({ trendingSongs: trendingDoc.songs });
    }

    // Optional: Fallback response if no trending data is available
    return res.json({ trendingSongs: [] });
  } catch (err) {
    console.error("Trending fetch failed:", err.message);
    res.status(500).json({ error: "Trending fetch failed" });
  }
});

async function updateTrendingSongs() {
  try {
    const trending = await scrapeSpotifyPlaylist("https://open.spotify.com/playlist/37i9dQZF1DX0XUfTFmNBRM");
    const results = await Promise.all(
      trending.map(async (songTitle) => {
        if (!songTitle) return null;
        try {
          const searchRes = await axios.get(
            `${SAAVN_BASE_URL}/search/songs`,
            { params: { query: songTitle } }
          );
          const match = searchRes.data?.data?.results?.[0];
          if (!match) return null;
          return {
            _id: match.id,
            name: match.name,
            thumbnail: match.image?.[2]?.url || "",
            artistName: match.artists?.primary?.[0].name,
            track: match.downloadUrl?.[4]?.url.replace("http://", "https://") || "",
            artist : undefined
          };
        } catch (e) {
          return null;
        }
      })
    );
    const uniqueSongs = Array.from(new Map(results.filter(Boolean).map(song => [song._id, song])).values());

    // Clear old trending songs and save new ones
    await TrendingSongs.updateOne(
      {},
      { songs: uniqueSongs, updatedAt: new Date() },
      { upsert: true }
    );

    console.log("Trending songs updated!");
  } catch (err) {
    console.error("Failed to update trending songs:", err.message);
  }
}

// Schedule to run once a week (Sunday)
cron.schedule("0 0 * * 0", updateTrendingSongs);
updateTrendingSongs()

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

router.post(
  "/playlist/add/songs",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const currentUser = req.user;
      const { playlistId } = req.body;
      const playlist = await Playlist.findById(playlistId);
      

      const isOwner = playlist.owner.equals(currentUser._id);
      const isCollaborator = playlist.collebrators.includes(currentUser._id);
      if (!isOwner && !isCollaborator) {
        throw new Error("Not allowed to modify playlist");
      }
      const songTitles = await scrapeSpotifyPlaylist(req.body.playlistUrl);
      if (!Array.isArray(songTitles) || songTitles.length === 0) {
        return res.status(400).json({ error: "No song titles provided" });
      }

      if (!playlist) {
        return res.status(404).json({ error: "Playlist does not exist" });
      }

      const addedSongs = [];

      for (const title of songTitles) {
        try {
          const searchRes = await axios.get(`${SAAVN_BASE_URL}/search/songs`, {
            params: { query: title },
          });

          const match = searchRes.data?.data?.results?.[0];
          if (!match) continue;

          // Check if song already exists in DB
          let song = await Song.findOne({ track: match.downloadUrl?.[4]?.url });
          if (!song) {
            const newSong = await Song.create({
              name: match.name,
              thumbnail: match.image?.[2]?.url || "",
              track: match.downloadUrl?.[4]?.url?.replace("http://", "https://") || "",
              artist: undefined, // Fill artist ObjectId if needed
            });
            song = newSong;
          }

          // Add song to playlist only if not already present
          if (!playlist.songs.includes(song._id)) {
            playlist.songs.push(song._id);
            addedSongs.push(song.name);
          }
        } catch (e) {
          console.warn(`Search failed for title "${title}":`, e.message);
          continue;
        }
      }

      await playlist.save();
      await playlist.populate("songs")

      return res.status(200).json({
        message: `${addedSongs.length} song(s) added`,
        addedSongs,
        playlist,
      });
    } catch (err) {
      console.error("Add songs by name failed:", err.message);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

async function scrapeSpotifyPlaylist(playlistUrl) {
  if (!playlistUrl?.includes("open.spotify.com/playlist/")) {
    throw new Error("Invalid Spotify playlist URL");
  }

  const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox']
});
  const page = await browser.newPage();
  await page.goto(playlistUrl, { waitUntil: "networkidle2" });

  await page.waitForSelector('[data-testid="tracklist-row"]', { timeout: 10000 });
  await autoScroll(page);

  const songs = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('[data-testid="tracklist-row"]')).map(row => {
    const titleEl = row.querySelector(
      'a[data-testid="internal-track-link"] div.e-91000-text.encore-text-body-medium'
    );
    const title = titleEl?.textContent.trim() ?? null;

    const artistEls = row.querySelectorAll(
      'span.e-91000-text.encore-text-body-small a[href*="/artist/"]'
    );
    const artists = artistEls.length
      ? Array.from(artistEls).map(el => el.textContent.trim()).join(', ')
      : null;

    return title && artists
      ? `${title}`
      : null;
  }).filter(Boolean);
});


  await browser.close();
  return songs;
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let previousHeight = 0;
      let retries = 0;
      const interval = setInterval(() => {
        const scrollHeight = document.documentElement.scrollHeight;
        window.scrollBy(0, 500);

        if (scrollHeight !== previousHeight) {
          previousHeight = scrollHeight;
          retries = 0;
        } else {
          retries++;
        }

        // If nothing new loads after several tries, stop
        if (retries > 5) {
          clearInterval(interval);
          resolve();
        }
      }, 500);
    });
  });
}




module.exports = router;