'use strict';

angular.module('mean.stories').config(['$stateProvider',
    function($stateProvider) {
        $stateProvider
        .state('stories', {
            url: '/stories',
            templateUrl: 'stories/views/index.html'
        })
        .state('new story', {
            url: '/stories/create',
            templateUrl: 'stories/views/create.html'
        })
        .state('edit story', {
            url: '/stories/edit/:storyId',
            templateUrl: 'stories/views/edit.html'
        });
    }
]);
