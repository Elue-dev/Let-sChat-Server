const express = require("express");
const chats = require("./data/devdata");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(
  cors({
    origin: ["http://127.0.0.1:5174"],
    credentials: true,
  })
);

app.get("/api/chats", (req, res) => {
  res.send(chats);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`server running on port ${PORT}`));
