angular.module("userApp", ["appRoutes", "userController", "mainController", "hotelController"])

.config(function($httpProvider){
    $httpProvider.interceptors.push("AuthInterceptors");
})