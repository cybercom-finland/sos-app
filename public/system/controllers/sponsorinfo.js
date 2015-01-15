'use strict';

angular.module('mean.system').controller('UserInfoController', ['$scope','$stateParams', 
    '$rootScope', 'Global', 'Sponsors', function ($scope, $stateParams, $rootScope, Global, Sponsors) {
    $scope.global = Global;
    $scope.package = {
    	name: 'sponsors'
    };
     
}]);