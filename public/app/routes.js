angular.module("appRoutes", ["ngRoute"])

.config(function($routeProvider, $locationProvider){

    $routeProvider
    

    .when('/hotel/:id', {
        templateUrl: 'app/views/hoteldetails.html',
        controller: 'hotelCtrl',
        controllerAs: 'hotel'

    })

    .when('/book/:id', {
        templateUrl: 'app/views/bookHotel.html',
        controller: 'bookCtrl',
        controllerAs: 'book'

    })

    .when('/dashboard', {
        templateUrl: 'app/views/dashboard.html',
        controller: 'dashboardCtrl',
        controllerAs: 'dashboard'

    })

    .when('/register', {
        templateUrl: 'app/views/reg.html',
        controller: 'regCtrl',
        controllerAs: 'register'
    })

    .when('/login', {
        templateUrl: 'app/views/login.html'
    })

    .when('/logout', {
        templateUrl: 'app/views/logout.html'
    })
    
    .when('/resetpassword', {
        templateUrl: 'app/views/resetPassword.html',
        controller: 'resetCtrl',
        controllerAs: 'reset'
    })


    .when('/reset/:token', {
        templateUrl: 'app/views/newPassword.html',
        controller: 'resetTokenCheckCtrl',
        controllerAs: 'reset'
    })

    .when('/:pg', {
        templateUrl: 'app/views/home.html',
        controller: 'hotelListCtrl',
        controllerAs: 'hotels'

    })

    .when('/', {
        templateUrl: 'app/views/home.html',
        controller: 'hotelListCtrl',
        controllerAs: 'hotels'

    })
        
    .otherwise({
        templateUrl: 'app/views/404.html'
    });

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
});