const express = require("express");
const passport = require("passport");
const router = express.Router();
const mongoose = require("mongoose");
const Playlist = require("../models/Playlist");
const User = require("../models/User");
const Song = require("../models/Song");

// create playlist
router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const currentuser = req.user;

    const { name, thumbnail, songs, description } = req.body;

    if (!name) return res.status(301).json({ error: "Insufficient data" });

    const playlistData = {
      name,
      thumbnail,
      songs,
      description,
      owner: currentuser._id,
      collebrators: [],
    };

    const playlist = await Playlist.create(playlistData);
    return res.status(200).json(playlist);
  }
);

router.delete(
  "/delete/:playlistId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const currentUser = req.user;
    const { playlistId } = req.params;

    const playlist = await Playlist.findOne({ _id: playlistId });

    //check playlist exists
    if (!playlist) {
      return res.status(304).json({ error: "Playlist does not exist" });
    }

    //check for owner or collaberator
    if (
      !playlist.owner.equals(currentUser._id) &&
      !playlist.collebrators.includes(currentUser._id)
    ) {
      return res.status(400).json({ error: "Not allowed" });
    }

    //now delete the playlist
    await Playlist.deleteOne({ _id: playlistId });

    return res.status(200).json({ message: "Playlist deleted successfully" });
  }
);

// get playlist by id
router.get(
  "/get/:playlistId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const playlistId = req.params.playlistId;

    const playlist = await Playlist.findOne({ _id: playlistId }).populate({
      path: "songs",
      populate: {
        path: "artist",
      },
    });

    if (!playlist) {
      return res.status(301).json({ error: "Invalid ID" });
    }

    return res.status(200).json(playlist);
  }
);

// get playlist by artist
router.get(
  "/me",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const artistId = req.user._id;

    const playlists = await Playlist.find({ owner: artistId }).populate([
      "owner" , "songs"
    ]);
    return res.status(200).json({ data: playlists });
  }
);

router.get(
  "/get/artist/:artistId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const artistId = req.params.artistId;

    //check if artist id exist
    const artist = await User.findOne({ _id: artistId });
    if (!artist) {
      return res.status(304).json({ error: "Invalid Artist ID" });
    }

    const playlists = await Playlist.find({ owner: artistId });
    return res.status(200).json({ data: playlists });
  }
);

//add songs to playlist
router.post(
  "/add/song",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const currentUser = req.user;
      const { playlistId, songId, currentSong } = req.body;

      const playlist = await Playlist.findById(playlistId);

      if (!playlist) {
        return res.status(404).json({ error: "Playlist does not exist" });
      }

      // Check permissions
      const isOwner = playlist.owner.equals(currentUser._id);
      const isCollaborator = playlist.collebrators.includes(currentUser._id);

      if (!isOwner && !isCollaborator) {
        return res.status(403).json({ error: "Not allowed" });
      }

      let song = null;

      // Only search by songId if it's a valid MongoDB ObjectId
      if (mongoose.Types.ObjectId.isValid(songId)) {
        song = await Song.findById(songId);
      }

      // If no existing song, create new one from currentSong
      if (!song) {
        song = await Song.findOne({ track: currentSong.track });

        if (!song) {
          if (
            currentSong._id &&
            !mongoose.Types.ObjectId.isValid(currentSong._id)
          ) {
            delete currentSong._id;
          }

          const newSong = await Song.create(currentSong);
          playlist.songs.push(newSong._id);
          await playlist.save();
          return res.status(200).json({ playlist });
        }
        // Prevent invalid _id from external sources (e.g., JioSaavn)
      }

      // If song exists, add if user says add anyway
       
      playlist.songs.push(song._id);
      await playlist.save();
      

      return res.status(200).json({ playlist });
    } catch (err) {
      console.error("Add song failed:", err.message);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

//delete song from playlist
router.delete(
  "/delete/song/:playlistId/:songId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const currentUser = req.user;
    const { playlistId, songId } = req.params;

    const playlist = await Playlist.findOne({ _id: playlistId });
    //check playlist exists
    if (!playlist) {
      return res.status(304).json({ error: "Playlist does not exist" });
    }

    //check for owner or collaberator
    if (
      !playlist.owner.equals(currentUser._id) &&
      !playlist.collebrators.includes(currentUser._id)
    ) {
      return res.status(400).json({ error: "Not allowed" });
    }

    //check for song exist
    if (!playlist.songs.includes(songId)) {
      return res.status(304).json({ error: "Song does not exist in playlist" });
    }

    //now delete the song from playlist

    playlist.songs = playlist.songs.filter((song) => !song.equals(songId));
    await playlist.save();

    return res.status(200).json({ playlist });
  }
);

router.post(
  "/update/:playlistId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const currentUser = req.user;
    const { playlistId } = req.params;
    const { name, thumbnail, description } = req.body;

    const playlist = await Playlist.findOne({ _id: playlistId });
    //check playlist exists
    if (!playlist) {
      return res.status(304).json({ error: "Playlist does not exist" });
    }

    //check for owner or collaberator
    if (
      !playlist.owner.equals(currentUser._id) &&
      !playlist.collebrators.includes(currentUser._id)
    ) {
      return res.status(400).json({ error: "Not allowed" });
    }

    //update the playlist
    if (name) playlist.name = name;
    if (thumbnail) playlist.thumbnail = thumbnail;
    if (description) playlist.description = description;

    await playlist.save();

    return res.status(200).json({ playlist });
  }
);

module.exports = router;
