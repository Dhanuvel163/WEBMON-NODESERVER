'use strict';
require('dotenv').config()
const express = require("express");
const morgan = require("morgan");
const axios = require("axios");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const config = require("./config");
const cors = require("cors");
const app = express();
mongoose.connect(
  config.database,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Connected to the database");
    }
  }
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(cors());
const userRoutes = require("./routes/user");

//WEBWORKERS
const {Worker, isMainThread, parentPort, workerData}=require('worker_threads')
if (isMainThread) {
  const worker = new Worker('./api/Webworkers/ww.js');
  worker.postMessage('Hello world!');
}
app.use("/api/useraccounts", userRoutes);
const port = process.env.PORT || 3030;
app.listen(port, (err) => {
  console.log("Listening at port" + port);
});


























// const reportError = (error) => {
//   const data = {
//     from: "Mailgun Sandbox <postmaster@sandboxXXX.mailgun.org>",
//     to: "your_email@gmail.com",
//     subject: `${URL_TO_CHECK} is down!`,
//     text: `Please check what's wrong with your server \n${error}`
//   };
//   mg.messages().send(data, function (error, body) {
//     console.log(body);
//   });
// }
