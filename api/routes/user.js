const router = require('express').Router();
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Url = require('../models/url');

const config = require('../config');
const checkJWT = require('../middlewares/check-jwtuser');
const cheerio = require('cheerio');
function RemoveEmptyString(array){
  let reducedArray = array.filter((a)=>(a.trim() !== '' && a.trim() !== ' '))
  return reducedArray
}
const scrapeMetatags = async(url) => {
        const res = await fetch(url);
        const html = await res.text();
        const $ = cheerio.load(html);
        const getMetatag = (name) =>  
            $(`meta[name=${name}]`).attr('content') ||  
            $(`meta[property="og:${name}"]`).attr('content') ||  
            $(`meta[property="twitter:${name}"]`).attr('content');
        return { 
            url,
            title: $('title').first().text(),
            favicon: $('link[rel="shortcut icon"]').attr('href'),
            description: getMetatag('description'),
            image: getMetatag('image'),
            author: getMetatag('icon'),
        }
}

router.post('/signup', (req, res, next) => {
 let user = new User();
 user.name = req.body.name;
 user.email = req.body.email;
 user.password = req.body.password;
 user.mobile = req.body.mobile;
 user.picture = user.gravatar();

 User.findOne({ email: req.body.email },{password:0}, (err, existingUser) => {
  if (existingUser) {
    res.json({
      success: false,
      message: 'Account with that email is already exist'
    });

  } else {
    user.save();

    var token = jwt.sign({
      user: user,
      islawyer:false
    }, config.secret, {
      expiresIn: '7d'
    });

    res.json({
      success: true,
      message: 'Enjoy your token',
      token: token,
      name:user.name
    });
  }

 });
});

router.post('/login', (req, res, next) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) throw err;

    if (!user) {
      res.json({
        success: false,
        message: 'Authenticated failed, User not found'
      });
    } else if (user) {

      var validPassword = user.comparePassword(req.body.password);
      if (!validPassword) {
        res.json({
          success: false,
          message: 'Authentication failed. Wrong password'
        });
      } else {
        delete user['password']
        var token = jwt.sign({
          user: user,
          islawyer:false
        }, config.secret, {
          expiresIn: '7d'
        });

        res.json({
          success: true,
          mesage: "Enjoy your token",
          token: token,
          name:user.name
        });
      }
    }

  });
});

router.route('/profile')
  .get(checkJWT, (req, res, next) => {
    User.findOne({ _id: req.decoded.user._id },{password:0}, (err, user) => {
      res.json({
        success: true,
        user: user,
        message: "Successful"
      });
    });
  })
  .post(checkJWT, (req, res, next) => {
    User.findOne({ _id: req.decoded.user._id },{password:0}, (err, user) => {
      if (err) return next(err);

      if (req.body.name) user.name = req.body.name;
      if (req.body.email) user.email = req.body.email;
      if (req.body.mobile) user.mobile = req.body.mobile;
      if (req.body.country) user.country = req.body.country;
      if (req.body.city) user.city = req.body.city;

      if (req.body.addr1) user.address.addr1 = req.body.addr1;
      if (req.body.addr2) user.address.addr2 = req.body.addr2;
      if (req.body.state)  user.address.state = req.body.state;
      if (req.body.postalCode) user.address.postalCode = req.body.postalCode;
      user.save();
      res.json({
        success: true,
        message: 'Successfully edited your profile',
        profile:user
      });
    });
  });

router.route('/url')
  .get(checkJWT, (req, res, next) => {
    Url.find({ user: req.decoded.user._id }, (err, urls) => {
      res.json({
        success: true,
        urls: urls,
        message: "Successful"
      });
    });
  })
  .post(checkJWT, (req, res, next) => {
    Url.findOne({ user: req.decoded.user._id,url:req.body.url }, (err, url) => {
      if (err){
        res.json({
            success: false,
            message: 'Something went wrong !'
        });    
      }else if(!url){
        let newurl = new Url();
        newurl.user=req.decoded.user._id;
        newurl.url = req.body.url;
        newurl.name = req.body.name;
        newurl.maxResponseTime = req.body.maxResponseTime
        newurl.up = true;
        try{

        }catch(e){

        }
        newurl.save()

        User.findOne({_id:req.decoded.user._id},(err,user)=>{
            if(err){
                res.json({
                    success: false,
                    message: 'Something went wrong !'
                });  
            }else if(user){
                user.urls = user.urls.concat(newurl._id)
                user.save()
                res.json({
                    success: true,
                    message: 'Successfully added your website !',
                    url:newurl
                });
            }
        })
      }else{
        res.json({
            success: false,
            message: 'Website already exists !'
        });        
      }
    });
  })
  .delete(checkJWT,(req, res, next) => {
    if(req.body.id){
        Url.findOneAndDelete({user:req.decoded.user._id,_id:req.body.id},(err,web)=>{
            if(err){
              res.json({
                  success: false,
                  message: 'Website doesnt exists !'
              }); 
            }else if(web){
                User.findOne({_id:req.decoded.user._id},(err,use)=>{
                  if(err){
                    res.json({
                        success: false,
                        message: 'User doesnt exists !'
                    });
                  }
                  else if(use){
                    use.urls = use.urls.filter((d)=>d!==req.body.id)
                    use.save()
                    res.json({
                        success: true,
                        message: 'Website removed successfully !'
                    }); 
                  }
                })
            }else{
              res.json({
                  success: false,
                  message: 'Website doesnt exists !'
              });          
            }
        })
    }else{
        res.json({
            success: false,
            message: 'Website doesnt exists !'
        }); 
    }
  }) 

module.exports = router;