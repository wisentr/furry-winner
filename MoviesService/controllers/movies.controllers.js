const axios = require("axios");
const { getDatabase, ref, update, get } = require("../src/firebase");
const dayjs = require("dayjs");
const isBetween = require("dayjs/plugin/isBetween");
dayjs.extend(isBetween);

const timestampFirstDayOfCurrentMonth = dayjs().startOf("month").unix();
const timestampLastDayOfCurrentMonth = dayjs().endOf("month").unix();

const { JWT_SECRET, IMDB_API_KEY } = process.env;

if (!JWT_SECRET || !IMDB_API_KEY) {
  throw new Error(
    "No JWT_SECRET or IMDB_API_KEY env vars found. Please provide it and restart the server."
  );
}
const IMDB_URL = `http://www.omdbapi.com/?apikey=${IMDB_API_KEY}&`;
const db = getDatabase();

const getMovies = async (req, res, next) => {
  const userObj = res.locals.authData;
  const snapshot = await get(ref(db, `users/${userObj.userId}/movies`));
  let obj = {};
  if (snapshot.exists) {
    obj = snapshot.val();
  }
  res.json(Object.values(obj));
};

const postMovies = async (req, res, next) => {
  const title = req.query.t;
  const userObj = res.locals.authData;

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
      }
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
};

module.exports = { getMovies, postMovies };
