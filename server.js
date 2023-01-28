const express = require("express");
const chats = require("./data/devdata");
const dotenv = require("dotenv");
const cors = require("cors");
const colors = require("colors");
const mongoose = require("mongoose");

const userRoutes = require("./routes/user_routes");
const authRoutes = require("./routes/auth_routes");
const chatRoutes = require("./routes/chat_routes");
const errorHandler = require("./middlewares/error_middleware");

dotenv.config();

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: ["http://127.0.0.1:5173"],
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

app.all("*", (req, res, next) => {
  res.status(404);
  throw new Error(`Can't find ${req.originalUrl} on this server`);

  next();
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.DATABASE_URI)
  .then(() => {
    console.log(`DATABASE CONNECTED SUCCESSFULLY!`.bgMagenta.bold);
    const server = app.listen(PORT, () => {
      console.log(`server running on port ${PORT}...`.cyan.bold);
    });

    process.on("unhandledRejection", (err) => {
      console.log(err);
      console.log("UNHANDLED REJECTION ⛔️, Shutting down...");
      server.close(() => {
        process.exit(1);
      });
    });
  })
  .catch((error) => {
    console.log("MONGODB CONNECTION ERROR", error);
    process.exit(1);
  });
