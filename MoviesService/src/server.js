const express = require("express");
const jwt = require("jsonwebtoken");

const PORT = 3001;
const { JWT_SECRET } = process.env;

if (!JWT_SECRET) {
  throw new Error(
    "No JWT_SECRET env var found. Please provide it and restart the server."
  );
}
const app = express();
app.use(express.json());

app.all("/movies", (req, res, next) => {
  const { token } = req.body;
  console.log(`jwtToken -> ${token}`);
  next();
});

app.get("/movies", (req, res, next) => {
  res.send("Reached GET /movies");
});

app.post("/movies", (req, res, next) => {
  res.send("Reached POST /movies");
});

app.listen(PORT, () => {
  console.log(`MoviesService is running at port ${PORT}`);
});
