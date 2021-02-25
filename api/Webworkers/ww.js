const {parentPort}=require('worker_threads')
const Url = require('../models/url');
const User = require('../models/user');
const mongoose = require("mongoose");
const config = require("../config");
const axios = require("axios");
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.email,
    pass: config.pass
  }
});
parentPort.on('message',()=>{
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
    test()
    setInterval(() => {
        test()
    }, (300000));
})

async function test(){

    try{
       var data = await Url.find()
    }catch(e){
        console.log(e.message)
    }
    data.forEach((d)=>{
        axios.interceptors.request.use(function (config) {
            config.metadata = { startTime: new Date() }
            return config;
        }, function (error) {
            return Promise.reject(error);
        });

        axios.interceptors.response.use(function (response) {
            response.config.metadata.endTime = new Date()
            response.duration = response.config.metadata.endTime - response.config.metadata.startTime
            return response;
        }, function (error) {
            return Promise.reject(error);  
        });

        let visit = {}
        axios.get(d.url)
            .then(async(response) => {
                if(d.up){
                    if(response.duration>d.maxResponseTime){
                        let data = await User.findById(d.user)
                        await transporter.sendMail({
                            from: config.email,
                            to: data.email,
                            subject: `Your website ${d.name} (${d.url}) is slow!`,
                            text: `Your website ${d.name} (${d.url}) response time (${response.duration} ms) is greater than provided maximum response time (${d.maxResponseTime} ms) !`
                        }, 
                        function(error, info){
                            if (error) {console.log(error);} else {console.log('Email sent: ' + info.response)}
                        });
                        try {
                            d.up=false
                            await Url.findByIdAndUpdate(d._id,d)
                        } catch (error) {
                            console.log(error);
                        }                        
                    }
                }else{
                    if(response.duration<=d.maxResponseTime){
                        try {
                            d.up=true
                            await Url.findByIdAndUpdate(d._id,d)
                        } catch (error) {
                            console.log(error);
                        } 
                    }
                }
                visit = {timestamp: new Date(),responseDuration: response.duration,successful: true};
            })
            .catch(async(error) => {
                visit = {timestamp: new Date(),successful: false};
                if(d.up){
                    let data = await User.findById(d.user)
                    await transporter.sendMail({
                        from: 'dhanuram99com@gmail.com',
                        to: data.email,
                        subject: `Your website ${d.name} (${d.url}) is down!`,
                        text: `Please check what's wrong with your server \n${error.message}`
                    }, 
                    function(error, info){
                        if (error) {console.log(error);} else {console.log('Email sent: ' + info.response)}
                    });
                    try {
                        d.up=false
                        await Url.findByIdAndUpdate(d._id,d)
                    } catch (error) {
                        console.log(error);
                    }
                }
            })
            .then(async()=>{
                try {
                    d.logs.push(visit)
                    await Url.findByIdAndUpdate(d._id,d)
                } catch (error) {
                    console.log(error);
                }
            });        
    })
}