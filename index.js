'use strict';
require('dotenv').config()
const express = require("express");
const morgan = require("morgan");
const axios = require("axios");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const config = require("./config");
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

app.use("/api/useraccounts", userRoutes);
const port = process.env.PORT || 3030;
app.listen(port, (err) => {
  console.log("Listening at port" + port);
});



























// const URL_TO_CHECK = "http://yourwebsite.com/"

// // const mailgun = require("mailgun-js");
// // const DOMAIN = "sandboxXXX.mailgun.org";
// // const mg = mailgun({ apiKey: "YOUR_API_KEY", domain: DOMAIN });


// const insertVisit = (visit) => {

// };

// const getVisits = () => {

// };

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





// app.get('/', async (req, res, next) => {
//   try {
//     const [entities] = await getVisits();
//     const visits = entities.map(
//       (entity) => `Time: ${entity.timestamp}, Response Time: ${entity.responseDuration}ms, Successful: ${entity.successful}`
//     );
//     res
//       .status(200)
//       .set('Content-Type', 'text/plain')
//       .send(`Last 100 checks:\n${visits.join('\n')}`)
//       .end();
//   } catch (error) {
//     next(error);
//   }
// });

// function test(){
//   axios.interceptors.request.use(function (config) {
//     config.metadata = { startTime: new Date() }
//     return config;
//   }, function (error) {
//     return Promise.reject(error);
//   });

//   axios.interceptors.response.use(function (response) {
//     response.config.metadata.endTime = new Date()
//     response.duration = response.config.metadata.endTime - response.config.metadata.startTime
//     return response;
//   }, function (error) {
//     return Promise.reject(error);
//   });

//   let visit = {}
//   axios.get(URL_TO_CHECK)
//     .then((response) => {
//       visit = {
//         timestamp: new Date(),
//         responseDuration: response.duration,
//         successful: true
//       };
//     })
//     .catch((error) => {
//       visit = {
//         timestamp: new Date(),
//         successful: false
//       };
//       console.log(error);
//       reportError(error);
//     })
//     .then(async function () {
//       // always executed
//       try {
//         await insertVisit(visit);
//       } catch (error) {
//         next(error);
//       }

//       response.status(200).send(visit).end();
//     });
// }