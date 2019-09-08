import express from "express";
import cors from "cors";
import * as path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import ufoaRouter from "./ufoa/router"; 
import ufobRouter from "./ufob/router"; 
import * as secrets from "./secrets";

var app = express();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));
app.set("view engine", "ejs");

// Home = Models

app.get("/" + secrets.adminURL, (req, res: any) => {
  res.render("index", { admin: true, page: "model" });
});

app.get("/", (req, res: any) => {
  res.render("index", { admin: false, page: "model" });
});

app.get("/methodology", (req, res: any) => {
  res.render("index", { admin: false, page: "methodology" });
});

app.get("/about", (req, res: any) => {
  res.render("index", { admin: false, page: "about" });
});

app.use("/", ufoaRouter);
app.use("/", ufobRouter);

export default app;
