const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UrlSchema = new Schema({
  url: { type: String},
  logs:Array,
  user:{type:String,ref:'User'},
  created: { type: Date, default: Date.now }
},{
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true }
});
module.exports = mongoose.model('Url', UrlSchema);
