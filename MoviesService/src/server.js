require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { getDatabase, ref, update, get } = require("./firebase");
const dayjs = require("dayjs");
const isBetween = require("dayjs/plugin/isBetween");
dayjs.extend(isBetween);

const timestampFirstDayOfCurrentMonth = dayjs().startOf("month").unix();
const timestampLastDayOfCurrentMonth = dayjs().endOf("month").unix();

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
  // console.log(`Reached POST /movies. query -> ${title}`);
  const userObj = res.locals.authData;
  // console.log(userObj);

  if (title) {
    try {
      const { data } = await axios.get(`${IMDB_URL}t=${title}`);
      const { Title, Released, Genre, Director } = data;
      const now = dayjs().unix();
      const movieObj = {};
      movieObj.title = Title;
      movieObj.released = Released;
      movieObj.genre = Genre;
      movieObj.director = Director;
      movieObj.timestamp = now;
      // console.log(movieObj);
      const snapshot = await get(ref(db, `users/${userObj.userId}/movies`));
      let quotaUsedThisMonth = 0;
      if (snapshot.exists) {
        const snap = snapshot.val();
        quotaUsedThisMonth = Object.values(snap)
          .map((movie) => movie?.timestamp)
          .filter((ts) =>
            dayjs
              .unix(ts)
              .isBetween(
                dayjs.unix(timestampFirstDayOfCurrentMonth),
                dayjs.unix(timestampLastDayOfCurrentMonth),
                null,
                []
              )
          ).length;
      } else {
        console.log("snapshot doesn't exist!");
      }
      console.log(quotaUsedThisMonth);
      if (userObj.role === "basic" && quotaUsedThisMonth >= 5) {
        throw new Error("End of quota for basic user. Try again next month!");
      }
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
      next(error);
    }
  }
});

app.listen(PORT, () => {
  console.log(`MoviesService is running at port ${PORT}`);
});
