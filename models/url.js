const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UrlSchema = new Schema({
  user:{type:String,ref:'User'},
  url: { type: String},
  maxResponseTime:String,
  logs:Array,
  up:Boolean,
  created: { type: Date, default: Date.now }
},{
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true }
});
module.exports = mongoose.model('Url', UrlSchema);
