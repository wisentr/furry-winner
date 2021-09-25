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

// On each request, verify the authorization header, if it fails, do not go any further
app.all("/movies", (req, res, next) => {
  const bearerHeader = req.headers["authorization"].split(" ")[1];
  console.log(`bearerHeader->  ${bearerHeader}`);
  jwt.verify(bearerHeader, JWT_SECRET, (error, authData) => {
    if (error) {
      console.error(error);
      res.status(403).json(error);
    } else {
      res.json({
        message: "Welcome!",
        userData: authData,
      });
      next();
    }
  });
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
