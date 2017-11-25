
angular.module('hotelController', [])

.controller("hotelListCtrl", function($http, $routeParams, $window){
    
    let app = this;
    app.loaded = false;
    app.hotels = [];
    app.pg = 1;
    let savedHotels = JSON.parse($window.localStorage.getItem('hotels'));
    if(savedHotels){
        if($routeParams.pg && $routeParams.pg != 0 && Number($routeParams.pg)){
            app.pg = Number($routeParams.pg);
        }
        if((app.pg-1)*10 >= savedHotels.length){
            app.pg = 1;
        }
        for(let i = (app.pg-1)*10; i < app.pg*10 && i < savedHotels.length; i++){
            app.hotels.push(savedHotels[i]);
        }
        app.loaded = true;
    }
    else{
        $http.get('/hotels').then(function(data){
            if(data.data.success){
                $window.localStorage.setItem("hotels", JSON.stringify(data.data.hotels));
                if($routeParams.pg && $routeParams.pg != 0 && Number($routeParams.pg)){
                    app.pg = Number($routeParams.pg);
                }
                if((app.pg-1)*10 >= data.data.hotels.length){
                    app.pg = 1;
                }
                for(let i = (app.pg-1)*10; i < app.pg*10 && i < data.data.hotels.length; i++){
                    app.hotels.push(data.data.hotels[i]);
                }
            }
            app.loaded = true;
        });
    }

})
.controller("hotelCtrl", function($http, $timeout, $location, $routeParams){
    
    let app = this;
    app.loaded = false;

    $http.get('/hoteldetails/'+$routeParams.id).then(function(data){
        console.log(data.data);
        if(data.data.success){
            app.hotel = data.data.hotel;
        }
        else{
            $location.path('/page/404');
        }
        app.loaded = true;
    });

})

.controller("bookCtrl", function($http, $location, $routeParams, $timeout){
    
    let app = this;
    app.loaded = false;
    app.totalAmount = 0;
    app.user = {"email":"-1"};
    app.successMsg = "";
    app.errorMsg = "";
    app.saved = false;
    $http.post('/me').then(data => {
        app.user = data.data;
        
        $http.get('/hoteldetails/'+$routeParams.id).then(data => {
            console.log(data.data);
            if(data.data.success){
                app.hotel = data.data.hotel;
                

                $http.post('/getincomplete/'+$routeParams.id + "/" + app.user.email).then(data => {
                    if(data.data.success){
                        app.rooms = data.data.incomplete.rooms;
                        if(data.data.incomplete.checkin)
                            app.checkin = new Date(data.data.incomplete.checkin);
                        if(data.data.incomplete.checkout)
                            app.checkout = new Date(data.data.incomplete.checkout);
                    }
                    app.calcPrice();
                    app.loaded = true;
                });
            }
            else{
                $location.path('/page/404');
            }
        });
    });

    app.calcPrice = function(){
        let rooms = 0;
        if(app.rooms){
            rooms = Number(app.rooms[0]) * Number(app.rooms[1]);
        }
        if(app.checkin && app.checkout){
            if((app.checkout - app.checkin) > 0)
                app.totalAmount = (app.checkout - app.checkin) * rooms * app.hotel.price / 86400000;
            else{
                app.totalAmount = 0;
            }
        }
        app.save();
    }

    

    app.tryBookHotel = function(){
        app.successMsg = "";
        app.errorMsg = "";
        
        if(!app.rooms){
            app.errorMsg = "Please select the rooms.";
            return;
        }
        if(!app.checkin || !app.checkout){
            app.errorMsg = "Please fill both check in and check out.";
            return;
        }
        if((app.checkout - app.checkin) <= 0){
            app.errorMsg = "Check out shoud be after check in.";
            return;
        }

        app.bookHotel(); 
        
    }

    app.save = function(){
        app.saved = false;
        $http.post('/incompletebookhotel/'+$routeParams.id+"/"+app.user.email, {"rooms": app.rooms, "checkin":app.checkin, "checkout":app.checkout}).then(function(data){
            if(data.data.success){
                app.saved = true;
            }
        });
        
    }
    

    app.bookHotel = function(){
        $http.post('/bookhotel/'+$routeParams.id+"/"+app.user.email, {"rooms": app.rooms, "checkin":app.checkin, "checkout":app.checkout}).then(function(data){
            
            if(data.data.success){
                app.successMsg = data.data.message + " Redirecting to your dashboard...."; 
                $timeout(function(){
                    $location.path('/dashboard');
                }, 2000);
            }
            else{
                app.errorMsg = data.data.message;
            }
            //app.loaded = true;
        });
    }
})



.controller("dashboardCtrl", function($http, $location, $routeParams){
    
    let app = this;
    app.loaded = false;
    app.booked = [];
    app.incomplete = [];
    app.related = [];
    app.user = {"email":"-1"};
    $http.post('/me').then(data => {
        app.user = data.data;
        console.log(app.user);
        $http.get('/allbooked/'+(app.user.email || "xx")).then(data => {
            console.log(data.data);
            if(data.data.success){
                app.booked = data.data.booked;
                for(let i = 0; i < app.booked.length; i++){
                    app.booked[i].checkin = new Date(app.booked[i].checkin).toDateString();
                    app.booked[i].checkout = new Date(app.booked[i].checkout).toDateString();
                }
            }
            else{
                $location.path('/page/404');
            }
        });
        $http.get('/allincomplete/'+(app.user.email || "xx")).then(data => {
            console.log(data.data);
            if(data.data.success){
                app.incomplete = data.data.incomplete;
                for(let i = 0; i < app.incomplete.length; i++){
                    if(app.incomplete[i].checkin)
                        app.incomplete[i].checkin = new Date(app.incomplete[i].checkin).toDateString();
                    if(app.incomplete[i].checkout)
                        app.incomplete[i].checkout = new Date(app.incomplete[i].checkout).toDateString();
                }
            }
            else{
                $location.path('/page/404');
            }
        });

        $http.get('/related/'+(app.user.email || "xx")).then(data => {
            if(data.data.success){
                app.related = data.data.related;
                console.log(app.related);
            }
        });

        app.loaded = true;
    });




})
