const router = require('express').Router();
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Url = require('../models/url');

const config = require('../config');
const checkJWT = require('../middlewares/check-jwtuser');
function RemoveEmptyString(array){
  let reducedArray = array.filter((a)=>(a.trim() !== '' && a.trim() !== ' '))
  return reducedArray
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
      if (req.body.state) user.address.state = req.body.state;
      if (req.body.postalCode) user.address.postalCode = req.body.postalCode;
      user.save();
      res.json({
        success: true,
        message: 'Successfully edited your profile',
        profile:user
      });
    });
  });

  
module.exports = router;