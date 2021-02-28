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
  {useNewUrlParser: true,useUnifiedTopology: true,useCreateIndex: true,useFindAndModify: false},
  (err) => {
    if (err) {console.log(err);} else {console.log("Connected to the db");}
  }
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(cors());
const userRoutes = require("./routes/user");
const chromeLauncher = require('chrome-launcher');
const opts = {
  chromeFlags: ['--headless'],
  logLevel: 'info',
  output: 'json'
};
(async() => {
const chrome = await chromeLauncher.launch(opts);
opts.port = chrome.port;
//WEBWORKERS
const {Worker, isMainThread, parentPort, workerData}=require('worker_threads')
if (isMainThread) {
  const worker = new Worker('./api/Webworkers/ww.js');
  worker.postMessage('Hello world!');
  const workerLh = new Worker('./api/Webworkers/wwforlighthouse.js');
  workerLh.postMessage(opts);
}
})();

app.use("/api/useraccounts", userRoutes);
const port = process.env.PORT || 3030;
app.listen(port, (err) => {
  console.log("Listening at port" + port);
});