const express = require("express");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const PORT = 3001;
const { JWT_SECRET, IMDB_API_KEY } = process.env;

if (!JWT_SECRET || !IMDB_API_KEY) {
  throw new Error(
    "No JWT_SECRET or IMDB_API_KEY env vars found. Please provide it and restart the server."
  );
}
const IMDB_URL = `http://www.omdbapi.com/?apikey=${IMDB_API_KEY}&`;

const app = express();
app.use(express.json());

// On each request, verify the authorization header, if it fails, do not go any further
app.all("/movies", (req, res, next) => {
  const bearerHeader = req.headers["authorization"];
  if (bearerHeader) {
    const token = bearerHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (error, authData) => {
      // ! remove the ignored TokenExpiredError
      if (!error || error.name === "TokenExpiredError") {
        next();
      } else {
        console.error(error);
        res.status(403).json(error);
      }
    });
  }
  res.status(400);
});

app.get("/movies", (req, res, next) => {
  console.log("Reached GET /movies");
  console.log(req.query.t);
  const title = req.query.t;
  if (title) {
    axios.get(`${IMDB_URL}t=${title}`).then((data) => console.log(data));
  }
  res.sendStatus(200);
});

app.post("/movies", (req, res, next) => {
  console.log("Reached POST /movies");
});

app.listen(PORT, () => {
  console.log(`MoviesService is running at port ${PORT}`);
});
