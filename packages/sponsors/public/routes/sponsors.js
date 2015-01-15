'use strict';

//Setting up route
angular.module('mean').config(['$stateProvider',
    function($stateProvider) {
        // Check if the user is connected
        var checkLoggedin = function($q, $timeout, $http, $location) {
            // Initialize a new promise
            var deferred = $q.defer();

            // Make an AJAX call to check if the user is logged in
            $http.get('/loggedin').success(function(user) {
                // Authenticated
                if (user !== '0') $timeout(deferred.resolve);

                // Not Authenticated
                else {
                    $timeout(deferred.reject);
                    $location.url('/login');
                }
            });

            return deferred.promise;
        };

        // states for my app
        $stateProvider
            .state('sponsor by name',
            {
                url: '/sponsors/:sponsorName',
                templateUrl: '../../public/system/views/index.html'
            })
            .state('sponsors', 
            {
                url: '/sponsors',
                templateUrl: 'sponsors/views/list.html',
                               resolve: {
                    loggedin: checkLoggedin
                }
            })
            .state('upgrade sponsor', 
            {
                url: '/sponsors/:sponsorName/upgrade',
                templateUrl: 'sponsors/views/upgrade.html'
            })

            .state('create_keys',
            {
                url: '/keys',
                templateUrl: 'sponsors/views/keys.html' ,
                                resolve: {
                    loggedin: checkLoggedin
                }
            })

            // this view will be removed here for debug purposes
            .state('create_sponsor',
            {
                url: '/debug/sponsors/create',
                templateUrl: 'sponsors/views/create.html' ,
                                resolve: {
                    loggedin: checkLoggedin
                }
            })

            // this view will be removed here for debug purposes 
            .state('sponsor_network',
            {
                url: '/network/:networkFounder',
                templateUrl: 'sponsors/views/network.html',
                             resolve: {
                    loggedin: checkLoggedin
                }
            });
            
    }
]);

 