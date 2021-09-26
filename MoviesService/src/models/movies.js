const mongoose = require("mongoose");

const moviesSchema = new mongoose.Schema(
  {
    UserId: Number,
    Timestamps: [Date],
    Title: String,
    Released: Date,
    Genre: String,
    Director: String,
    createdAt: Number,
    updatedAt: Number,
  },
  { timestamps: { currentTime: () => Math.floor(Date.now() / 1000) } }
);

module.exports = mongoose.model("Movies", moviesSchema);
