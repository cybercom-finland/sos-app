'use strict';

angular.module('mean.sponsors').config(['$httpProvider', function ($httpProvider) {
  $httpProvider.defaults.headers.common['Cache-Control'] = 'no-cache, no-store, must-revalidate';
  $httpProvider.defaults.headers.common.Pragma = 'no-cache';
  $httpProvider.defaults.headers.common.Expires = '0';
}]);

angular.module('mean.sponsors').factory('Sponsors', ['$resource',
	function($resource) {
		return $resource('sponsors/:sponsorName', {
		}, { 
			upgrade: {
				method: 'PUT'
			}
		});
	}
]);

angular.module('mean.sponsors').factory('SponsorById', ['$resource',
	function($resource) {
		return $resource('sponsors/id/:sponsorId', {
		}, {
			sponsorId: '@_id'
		});
	}
]);

angular.module('mean.sponsors').factory('SponsorEmail', ['$resource',
	function($resource) {
		return $resource('sponsors/email/:email', {
		}, {
		});
	}
]);

angular.module('mean.sponsors').factory('FormData', ['$resource',
	function($resource) {
		return $resource('formdata', {
		}, {
		});
	}
]);

angular.module('mean.sponsors').factory('Keys', ['$resource',
	function($resource) {
		return $resource('keys', {
		}, {
			create: {
				method: 'POST'
			}

		});
	}
]);

angular.module('mean.sponsors').factory('Networks', ['$resource',
	function($resource) {
		return $resource('network/:networkFounder', {
			networkFounder: '@_id'
		});
	}
]);
angular.module('mean.sponsors').factory('TopTen', ['$resource',
	function($resource) {
		return $resource('topten', {
			networkFounder: '@_id'
		});
	}
]);