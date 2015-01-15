/*global _ */
'use strict';

angular.module('mean.stories').controller('StoriesController', ['$scope', 'Global', 'Stories',
     function($scope, Global, Stories) {
        $scope.global = Global;
        $scope.package = {
            name: 'stories'
        };

       	var stories = $scope.stories = [];
        Stories.query(function(stories) {
        	_.each(stories, function(story) {
        		story.active = false;
                if(story.image !== undefined) {
                    story.image = '/stories/' + story._id + '/img';
                }
        		$scope.stories.push(story);
        	});
      	});

		$scope.slideChangeInterval = 5000;

		$scope.updateStoryText = function() {
			stories.forEach(function(story) {
				if (story.active) {
					$scope.header = story.header;
					$scope.content = story.content;
					$scope.link = story.link;
				}
			});
		};
		$scope.$watch('stories', function() {
			$scope.updateStoryText();
        }, true); // watch for object equality

        $scope.create = function()
        {
            var story = new Stories(
            {
                header: this.header,
                content: this.content,
                link: this.link,
            });
            story.$save(function(response)
            {

            });

            this.header = '';
            this.content = '';
            this.link = '';
        };
    }
]);
