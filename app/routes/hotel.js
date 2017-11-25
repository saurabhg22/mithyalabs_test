var Hotel = require("../models/hotel");
var User = require("../models/user");
var path = require("path");

function emptyEx(){
    var cond = false;
    for (var i = 0; i < arguments.length; i++){
        cond = cond || (arguments[i] == null || arguments[i] == '');
    }
    return cond;
}


module.exports = function(router){



    router.get('/hotels', function (req, res) {
        Hotel.find().select("name address content id").exec(function(err, hotels){
            if (err){
                res.json({
                    success:false, 
                    message:"Could not find any hotel."
                });
                throw err;
            }
            else{
                if(!hotels){
                    res.json({
                        success:false, 
                        message:"Could not find any hotel."
                    });
                }
                else if(hotels){
                    res.json({
                        success:true,
                        hotels: hotels
                    });
                }
            }
        });
    });
    
    router.get('/hoteldetails/:id', function (req, res) {
        Hotel.findOne({id:Number(req.params.id)}).select('name address phone content id price').exec(function(err, hotel){
            if(err) throw err;
            if(!hotel){
                res.json({
                    success:false, 
                    message:"Wrong ID."
                });
            }
            else{
                if(!Number(hotel.price)){
                    hotel.price = Math.floor(Math.random(.3, 1)*10)*200;
                    hotel.save();
                }

                res.json({
                    success:true, 
                    hotel:hotel
                });
            }
        });
    });


    router.get('/allbooked/:email', function (req, res) {
        var email = req.params.email;
        if( emptyEx(email)){
            res.json({
                success:false, 
                message:"Please loggin to continue."
            });
        }
        User.findOne({email:email}).select("booked").exec(function(err, user){
            if (err){
                res.json({
                    success:false, 
                    message:"Could not authenticate user."
                });
            }
            else if (!user){
                res.json({
                    success:false, 
                    message:"Could not authenticate user."
                });
            }
            else{
                res.json({
                    success:true, 
                    booked:user.booked
                });
            }
        });
    });




    router.get('/allincomplete/:email', function (req, res) {
        var email = req.params.email;
        if( emptyEx(email)){
            res.json({
                success:false, 
                message:"Please loggin to continue."
            });
        }
        User.findOne({email:email}).select("incomplete").exec(function(err, user){
            if (err){
                res.json({
                    success:false, 
                    message:"Could not authenticate user."
                });
            }
            else if (!user){
                res.json({
                    success:false, 
                    message:"Could not authenticate user."
                });
            }
            else{
                res.json({
                    success:true, 
                    incomplete:user.incomplete
                });
            }
        });
    });






    router.post('/bookhotel/:id/:email', function (req, res) {
        var email = req.params.email;
        if( emptyEx(email)){
            res.json({
                success:false, 
                message:"Please loggin to continue."
            });
        }
        Hotel.findOne({id:Number(req.params.id)}).select('name address phone content id price geo').exec(function(err, hotel){
            if(err) throw err;
            if(!hotel){
                res.json({
                    success:false, 
                    message:"Wrong ID."
                });
            }
            else{    
                User.findOne({email:email}).select("name email booked incomplete activities").exec(function(err, user){
                    if (err){
                        res.json({
                            success:false, 
                            message:"Could not authenticate user."
                        });
                    }
                    else if (!user){
                        res.json({
                            success:false, 
                            message:"Could not authenticate user."
                        });
                    }
                    else{
                        let book = {
                            "id":req.params.id,
                            "name":hotel.name,
                            "rooms":req.body.rooms,
                            "checkin":req.body.checkin,
                            "checkout":req.body.checkout,
                        };
                        user.booked.push(book);
                        user.activities.push({"type": "booking", "id": book.id, "lat": hotel.geo.lat, "lon": hotel.geo.lon});
                        for(let i = 0; i < user.incomplete.length; i++){
                            if(user.incomplete[i].id == req.params.id){
                                user.incomplete.splice(i, 1);
                                user.markModified("incomplete");
                                break;
                            }
                        }

                        user.save(err => {
                            if(err){
                                res.json({
                                    success:false, 
                                    message:"Something went wrong."
                                });
                            }
                            else{
                                res.json({
                                    success:true, 
                                    message:"Successfully booked."
                                });
                            }
                        })
                    }
                });
            }
        });
    });
    
    router.post('/incompletebookhotel/:id/:email', function (req, res) {
        var email = req.params.email;
        if( emptyEx(email)){
            res.json({
                success:false, 
                message:"Please loggin to continue."
            });
        }
        Hotel.findOne({id:Number(req.params.id)}).select('name address phone content id price geo').exec(function(err, hotel){
            if(err) throw err;
            if(!hotel){
                res.json({
                    success:false, 
                    message:"Wrong ID."
                });
            }
            else{    
                User.findOne({email:email}).select("name email incomplete activities").exec(function(err, user){
                    if (err){
                        res.json({
                            success:false, 
                            message:"Could not authenticate user."
                        });
                    }
                    else if (!user){
                        res.json({
                            success:false, 
                            message:"Could not authenticate user."
                        });
                    }
                    else{
                        let incomplete = {
                            "id":req.params.id,
                            "name":hotel.name,
                            "rooms":req.body.rooms,
                            "checkin":req.body.checkin,
                            "checkout":req.body.checkout,
                        };
                        let found = false;
                        for(let i = 0; i < user.incomplete.length; i++){
                            if(user.incomplete[i].id == incomplete.id){
                                user.incomplete[i].rooms = incomplete.rooms;
                                user.incomplete[i].checkin = incomplete.checkin;
                                user.incomplete[i].checkout = incomplete.checkout;
                                found = true;
                                user.markModified('incomplete');
                                break;
                            }
                        }
                        if(!found){
                            user.incomplete.push(incomplete);
                            user.activities.push({"type": "incomplete", "id": incomplete.id, "lat": hotel.geo.lat, "lon": hotel.geo.lon});
                        }
                        
                        user.save(err => {
                            if(err){
                                res.json({
                                    success:false, 
                                    message:"Something went wrong."
                                });
                            }
                            else{
                                res.json({
                                    success:true, 
                                    message:"Successfully saved."
                                });
                            }
                        })
                    }
                });
            }
        });
    });


    
    router.get('/related/:email', function (req, res) {
        var email = req.params.email;
        if( emptyEx(email)){
            res.json({
                success:false, 
                message:"Please loggin to continue."
            });
        }

        User.findOne({email:email}).select("activities").exec(function(err, user){
            if (err){
                res.json({
                    success:false, 
                    message:"Could not authenticate user."
                });
            }
            else if (!user){
                res.json({
                    success:false, 
                    message:"Could not authenticate user."
                });
            }
            else{
                let latmean = 0;
                let lonmean = 0;
                let i;
                for(i = user.activities.length-1; i >= 0 && i > user.activities.length-6; i--){
                    latmean += user.activities[i].lat;
                    lonmean += user.activities[i].lon;
                }
                latmean /= (user.activities.length-i);
                lonmean /= (user.activities.length-i);

                Hotel.find().where('geo.lat').gt(latmean-5).lt(latmean+5).where('geo.lon').gt(lonmean-5).lt(lonmean+5).limit(10).select("name address content id").exec(function(err, hotels){
                    if (err){
                        res.json({
                            success:false, 
                            message:"Could not find any hotel."
                        });
                        throw err;
                    }
                    else{
                        if(!hotels){
                            res.json({
                                success:false, 
                                message:"Could not find any hotel."
                            });
                        }
                        else if(hotels){
                            res.json({
                                success:true,
                                related: hotels
                            });
                        }
                    }
                });


            }
        });
    });

    router.post('/getincomplete/:id/:email', function (req, res) {
        var email = req.params.email;
        if( emptyEx(email)){
            res.json({
                success:false, 
                message:"Please loggin to continue."
            });
        }
        User.findOne({email:email}).select("incomplete").exec(function(err, user){
            if (err){
                res.json({
                    success:false, 
                    message:"Could not authenticate user."
                });
            }
            else if (!user){
                res.json({
                    success:false, 
                    message:"Could not authenticate user."
                });
            }
            else{
                let found = false;
                for(let i = 0; i < user.incomplete.length; i++){
                    if(user.incomplete[i].id == req.params.id){
                        res.json({
                            success:true, 
                            incomplete:user.incomplete[i]
                        });
                        found = true;
                        break;
                    }
                }
                if(!found){
                    res.json({
                        success:false, 
                        message:"Not found"
                    });
                }
            }
        });
    });

    return router;
}