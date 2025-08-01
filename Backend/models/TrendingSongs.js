const mongoose = require("mongoose");

const EmbeddedSongSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    track: {
      type: String,
      required: true,
    },
    artist: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    artistName: {
      type: String,
    },
  },
  { _id: false }
);

const TrendingSongsSchema = new mongoose.Schema({
  songs: [EmbeddedSongSchema],
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TrendingSongs", TrendingSongsSchema);
