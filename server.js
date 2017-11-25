var express = require("express");
var app = express();
var mongoose = require("mongoose");
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var router = express.Router();
var path = require("path");
var userRoutes = require("./app/routes/user")(router);
var hotelRoutes = require("./app/routes/hotel")(router);

var secret = "Shall we begin?";

var port = process.env.PORT || 8080;


var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');


var options = {
    service: 'SendGrid',
    auth: {
        api_user: 'saurabhg22',
        api_key: 'grow1234'
    }
}

var client = nodemailer.createTransport(sgTransport(options));
function emptyEx(){
    var cond = false;
    for (var i = 0; i < arguments.length; i++){
        cond = cond || (arguments[i] == null || arguments[i] == '');
    }
    return cond;
}

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.use(express.static(__dirname + "/public"));
app.use(userRoutes);

mongoose.connect("mongodb://localhost:27017/mithyalabs", function(err){
    if(err){
        console.log("Not connected to the database!!!");
    }
    else{
        console.log("Successfully connected to the database.");
    }
});


app.get('*', function(req,res){
    let filePath = path.resolve(__dirname, 'public/app/index.html');
    res.sendFile(filePath);
});

app.use(function(req, res, next){
    console.log("PARSING TOKEN");
    var token = req.body.token || req.body.query || req.headers['x-access-token'];
    if(emptyEx(token)){
        res.json({
            success:false, 
            message:"No token provided."
        });
    }
    else{
        jwt.verify(token, secret, function(err, decoded){
            if(err){
                res.json({
                    success:false, 
                    message:"Invalid Token!!!"
                });
            }
            else{
                req.decoded = decoded;
                next();
            }
        });
    }
});

app.post('/me', function (req, res) {
    res.send(req.decoded);
});

app.use(hotelRoutes);


app.listen(port, function(){
    console.log("Running the server on port:", port);
});
