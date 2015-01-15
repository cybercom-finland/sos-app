'use strict';

angular.module('mean.system').controller('SNFeedController', ['$scope','$stateParams', 
	'Global', function ($scope, $stateParams, Global) {
    $scope.global = Global;

}]);

angular.module('mean.system').directive('twitterTimeline', function() {
  return {
    restrict: 'E',
    templateUrl: 'public/system/views/snfeed.html',
    link: function(scope, element, attrs) {

      // Function from Twitter to generate the Twitter timeline.
     	(function(d,s,id) {
     		var js;
     		var fjs = d.getElementsByTagName(s)[0];
     		var p = /^http:/.test(d.location)?'http':'https';
     		if(!d.getElementById(id)) {
     			js = d.createElement(s);
     			js.id = id;
     			js.src = p + '://platform.twitter.com/widgets.js';
     			fjs.parentNode.insertBefore(js,fjs);
     		}
     	}(document,'script','twitter-wjs'));

      // The widget needs to be reloaded after the state has changed 
      // otherwise it will not be loaded again when re-entering the state.
      /* global twttr */
      if(typeof twttr !== 'undefined') {
        twttr.widgets.load();  
      }
	  }
  };
});