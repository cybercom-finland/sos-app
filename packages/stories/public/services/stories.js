'use strict';

angular.module('mean.stories').factory('Stories', [
    function() {
        return {
            name: 'stories'
        };
    }
]);
angular.module('mean.stories').factory('Stories', [ '$resource',
    function($resource) {
        return $resource('stories', {
			sponsorId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);