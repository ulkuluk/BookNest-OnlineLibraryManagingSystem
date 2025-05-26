import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import BookRoute from "./routes/BookRoutes.js";
import UserRoute from "./routes/UserRoutes.js";
import ReservationRoute from "./routes/ReservationRoutes.js";
import ReviewRoute from "./routes/ReviewRoutes.js";
import cookieParser from "cookie-parser";

const app = express();
app.set("view engine", "ejs");

app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", "https://booknesttest-dot-if-b-08.uc.r.appspot.com"],
  })
);
app.get("/", (req, res) => res.render("index"));
app.use(express.json());
app.use(UserRoute, BookRoute, ReservationRoute, ReviewRoute);


app.listen(5000, () => console.log("Server connected"));
