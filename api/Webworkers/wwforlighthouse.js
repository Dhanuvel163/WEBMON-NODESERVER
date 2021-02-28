const {parentPort}=require('worker_threads')
const Url = require('../models/url');
const User = require('../models/user');
const mongoose = require("mongoose");
const config = require("../config");

const lighthouse = require('lighthouse');
const puppeteer = require('puppeteer');
const request = require('request');
const util = require('util');
parentPort.on('message',async(opts)=>{
    await mongoose.connect(config.database,
    {useNewUrlParser: true,useUnifiedTopology: true,
    useCreateIndex: true,useFindAndModify: false});
    const resp = await util.promisify(request)(`http://localhost:${opts.port}/json/version`);
    const {webSocketDebuggerUrl} = JSON.parse(resp.body);
    const browser = await puppeteer.connect({browserWSEndpoint: webSocketDebuggerUrl});

    test(opts)
    setInterval(() => {
        test(opts)
    }, (86400000));
})

async function test(opts){
    try{
       var data = await Url.find()
    }catch(e){
        console.log(e.message)
    }
    l=0
    while (l<data.length){
        try{
            let d = data[l]
            console.error(d.url)
            const {lhr} = await lighthouse(d.url, opts, null);
            await Object.values(lhr.categories).forEach(c =>{
                if(c.title === 'Best Practices'){
                d.score['Best_Practices'] = c.score
                }else if(c.title === 'Progressive Web App'){
                d.score['Progressive_Web_App'] = c.score
                }else{
                d.score[c.title] = c.score
                }
            })
            await Url.findByIdAndUpdate(d._id,d)
            console.log(`Lighthouse scores: ${Object.values(lhr.categories).map(c => `${c.title} ${c.score}`).join(', ')}`);
        }catch(e){

        }
        l=l+1
    }

    // data.forEach(async(d)=>{
    //     console.error(d.url)
    //     const {lhr} = await lighthouse(d.url, opts, null);
    //     await Object.values(lhr.categories).forEach(c =>{
    //         if(c.title === 'Best Practices'){
    //         d.score['Best_Practices'] = c.score
    //         }else if(c.title === 'Progressive Web App'){
    //         d.score['Progressive_Web_App'] = c.score
    //         }else{
    //         d.score[c.title] = c.score
    //         }
    //     })
    //     await Url.findByIdAndUpdate(d._id,d)
    //     console.log(`Lighthouse scores: ${Object.values(lhr.categories).map(c => `${c.title} ${c.score}`).join(', ')}`);
    // })
}