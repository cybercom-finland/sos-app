'use strict';

angular.module('mean').controller('SponsorsController', ['$scope', '$stateParams', '$location', 'Global', 'Sponsors', 'Networks',
    function($scope, $stateParams, $location, Global, Sponsors, Networks) 
    {
        $scope.global = Global;
        $scope.package = {
            name: 'sponsors'
        };

        $scope.hasAuthorization = function(sponsor) {
            if (!sponsor || !sponsor.user) return false;
            return $scope.global.isAdmin || sponsor.user._id === $scope.global.user._id;
        };

        $scope.create = function()
        {
            var sponsor = new Sponsors(
            {
                name: this.name,
                coords: {longitude: this.longitude,
                latitude: this.latitude},
                parentId: this.parentId,
                imgUrl: this.imgUrl,
            });
            sponsor.$save(function(response)
            {

            });

            this.name = '';
            this.longitude = 0;
            this.latitude = 0;
            this.parentId = '';
            this.imgUrl = '';
        };
        $scope.upgrade = function() {
            Sponsors.get({ 
                sponsorName: $stateParams.sponsorName
            }, 
            function(sponsor) 
            {
                sponsor.$upgrade({ sponsorName: sponsor.name });
            });                   
        };

        $scope.remove = function(sponsor) {
            if (sponsor) {
                sponsor.$remove();

                for (var i in $scope.sponsors) {
                    if ($scope.sponsors[i] === sponsor) {
                        $scope.sponsors.splice(i, 1);
                    }
                }
            } else {
                $scope.sponsor.$remove(function(response) {
                    $location.path('sponsors');
                });
            }
        };

        $scope.update = function() {
            var sponsor = $scope.sponsor;
            if (!sponsor.updated) {
                sponsor.updated = [];
            }
            sponsor.updated.push(new Date().getTime());

            sponsor.$update(function() {
                $location.path('sponsors/' + sponsor._id);
            });
        };

        $scope.find = function() {
            Sponsors.query(function(sponsors) {
                $scope.sponsors = sponsors;
            });
        };

        $scope.findOne = function() 
        {
            Sponsors.get(
            {
                sponsorId: $stateParams.sponsorId
            }, 
            function(sponsor) 
            {
                $scope.sponsor = sponsor;
            });
        };

        $scope.findNetwork = function()
        {
            Networks.query( { networkFounder: $stateParams.networkFounder }, function(network)
            {
                $scope.network = network;
            });
        };
    }
 
]);