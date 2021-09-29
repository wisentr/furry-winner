const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

module.exports = function (req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (bearerHeader) {
    const token = bearerHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (error, authData) => {
      if (!error) {
        // Put the authData into the res.locals to access it later in the lifecycle of this request
        res.locals.authData = authData;
        return next();
      } else {
        console.error("expired token!", error);
        return res.status(403).json(error);
      }
    });
  } else {
    res.status(400).send();
  }
};
