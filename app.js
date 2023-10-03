const express = require("express");
var cors = require("cors");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const routes = require("./routes/routes");
// const dotenv = require("dotenv");
// dotenv.config(); 

const app = express();

app.use(cors({ origin: process.env.REMOTE_CLIENT_APP, credentials: true }));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

// 1) GLOBAL MIDDLEWARES

//Set security HTTP headers
app.use(helmet());

//Limit request from the same API
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});

app.use(limiter);

//Body parser, reading data from body into req.body
app.use(express.json());

//Data sanitization agains NoSQL query injection
app.use(mongoSanitize());

//Data sanitization agains XSS
app.use(xss());

//Prevent parameter pollution
// app.use(hpp());

app.use(bodyParser.json());

//Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers)
  next();
});

// 3) ROUTES
app.use(routes);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
