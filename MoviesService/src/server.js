require("dotenv").config();
const express = require("express");
const checkAuth = require("../middleware/checkAuth.middleware");
const moviesController = require("../controllers/movies.controllers");
const PORT = 3001;

const app = express();
app.use(express.json());

// On each request, verify the authorization header, if it fails, do not go any further
app.all("/movies", checkAuth);

app.get("/movies", moviesController.getMovies);

app.post("/movies", moviesController.postMovies);

app.listen(PORT, () => {
  console.log(`MoviesService is running at port ${PORT}`);
});
