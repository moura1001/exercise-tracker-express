const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");

const users = new Map();
const exercises = new Map();

const HEX_STRING_DEFAULT_SIZE = 24;
const genRanHex = (size) =>
  [...Array(size)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app
  .route("/api/users")
  .post(function (req, res) {
    const username = req.body.username;
    const _id = genRanHex(HEX_STRING_DEFAULT_SIZE);
    users.set(_id, username);
    res.json({ username, _id });
  })
  .get(function (req, res) {
    const usersArray = Array.from(users.entries()).map(([id, username]) => ({
      _id: id,
      username,
    }));
    res.json(usersArray);
  });

app.post("/api/users/:_id/exercises", function (req, res) {
  if (!users.has(req.params._id)) {
    res.json({ error: "user does not exist" });
    return;
  }

  const _id = req.params._id;
  const description = req.body.description;
  const duration = parseInt(req.body.duration);

  const dateObj = new Date(req.body.date);
  if (req.body.date && isNaN(dateObj)) {
    res.json({ error: "invalid date" });
    return;
  }
  const date = req.body.date
    ? dateObj.toDateString()
    : new Date().toDateString();

  const username = users.get(_id);

  const arr = exercises.get(_id) || [];
  const exercise = {
    username,
    description,
    duration,
    date,
  };
  arr.push(exercise);

  exercises.set(_id, arr);

  res.json({ ...exercise, _id });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
