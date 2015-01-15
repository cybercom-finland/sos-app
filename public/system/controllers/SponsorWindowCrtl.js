'use strict';

angular.module('mean.system').controller('SponsorWindowCrtl', ['$scope','$stateParams', 
	'Global', function ($scope, $stateParams, Global) {
    $scope.global = Global;

}]);

angular.module('mean.system').directive('SponsorWindow', function() {
  return {
    restrict: 'E',
    templateUrl: 'public/system/views/SponsorIcon.html'
  };
});