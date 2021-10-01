require("dotenv").config({ path: __dirname + "/../../.env" });
const express = require("express");
const checkAuth = require("../middleware/checkAuth.middleware");
const moviesController = require("../controllers/movies.controllers");

const app = express();
app.use(express.json());

// On each request, verify the authorization header, if it fails, do not go any further
app.all("/movies", checkAuth);

app.get("/movies", moviesController.getMovies);

app.post("/movies", moviesController.postMovies);

module.exports = app;
