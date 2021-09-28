require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { getDatabase, ref, update } = require("./firebase");

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

const db = getDatabase();

// On each request, verify the authorization header, if it fails, do not go any further
app.all("/movies", (req, res, next) => {
  const bearerHeader = req.headers["authorization"];

  if (bearerHeader) {
    const token = bearerHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (error, authData) => {
      if (!error) {
        // Put the authData into the res.locals to access it later in the lifecycle of this request
        res.locals.authData = authData;
        return next();
      } else {
        console.error(error);
        res.status(403).json(error);
      }
    });
  }
  res.status(400);
});

app.get("/movies", async (req, res, next) => {
  console.log("Reached GET /movies");
  res.sendStatus(200);
});

app.post("/movies", async (req, res, next) => {
  const title = req.query.t;
  console.log(`Reached POST /movies. query -> ${title}`);
  const userObj = res.locals.authData;
  console.log(userObj);

  if (title) {
    try {
      const { data } = await axios.get(`${IMDB_URL}t=${title}`);
      const { Title, Released, Genre, Director } = data;
      const movieObj = {};
      movieObj.title = Title;
      movieObj.released = Released;
      movieObj.genre = Genre;
      movieObj.director = Director;
      console.log(movieObj);

      await Promise.all([
        await update(ref(db, `users/${userObj.userId}`), userObj),
        await update(
          ref(db, `users/${userObj.userId}/movies/${movieObj.title}`),
          movieObj
        ),
      ]);
      res.json(movieObj);
    } catch (error) {
      console.error(error);
      res.json(error);
    }
  }
});

app.listen(PORT, () => {
  console.log(`MoviesService is running at port ${PORT}`);
});
