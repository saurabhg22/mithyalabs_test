var mongoose = require("mongoose");
var Schema = mongoose.Schema;


var HotelSchema =new Schema({
    name: {
        type:String,
        required:false
    },
    title: {
        type:String,
        required:false
    },
    address: {
        type:String,
        required:false
    },
    phone: {
        type:String,
        required:false
    },
    content: {
        type:String,
        required:false
    },
    price:{
        type:Number,
        required:false
    },
    geo: {
        type:Object,
        required:false
    }
});


module.exports = mongoose.model('Hotel', HotelSchema);