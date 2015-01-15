/*global _ */
'use strict';

angular.module('mean.system').controller('MapController', ['$scope', '$interval', '$timeout', '$log', 
  '$stateParams', '$location', '$rootScope', 'Global', 'Sponsors', 'Networks', 'TopTen', '$modal', 'SponsorById',
  function ($scope, $interval, $timeout, $log, $stateParams, $location, $rootScope, Global, Sponsors, Networks, TopTen, $modal, SponsorById) {
  
  $scope.global = Global;

  // how far down a network user has navigated.
  $scope.navDepth = 0;

  var map_style_options = [
  {
    featureType: 'administrative',
    stylers: [
      {visibility: 'off'}
    ]
  },
  {
    featureType: 'transit',
    stylers: [
      {visibility: 'off'}
    ]
  },
  {
    featureType: 'road',
    stylers: [
      {visibility: 'on'}
    ]
  },
  {
    featureType: 'poi',
    stylers: [
      {visibility: 'off'}
    ]
  },
  {
    elementType: 'labels',
    stylers: [
      {visibility: 'off'}
    ]
  },
  {
    featureType: 'landscape.natural',
    stylers: [
      {visibility: 'off'}
    ]
  },
  {
    featureType: 'landscape',
    elementType: 'geometry.fill',
    stylers: [
      {visibility: 'on' },
      { color: '#ffffff'}
    ]
  },
  {
    featureType: 'water',
    stylers: [
      { color: '#00adef' }
    ]
  },
  {
    featureType: 'administrative.country',
    elementType: 'geometry',
    stylers: [
      { visibility: 'on' },
      { color: '#00adef' },
      { weight: 1 },
      { gamma: 0.96 }
    ]
  }];

  $scope.map = {
    control: {},
    center: {
      latitude: 30,
      longitude: 24
    },
    lastValidCenter: {
      latitude: 30,
      longitude: 24
    },
    options: {
    streetViewControl: false,
    panControl: false,
    zoomControl: false,
    minZoom: 3,
    maxZoom: 15,
    mapTypeControl:false,
    styles: map_style_options,
    },
    zoom: 3,
    polylines: [],
    members: [],
    ancestors: [],
    activeSponsorIcon: {
      coords: {
        latitude: 0,
        longitude: 0
      },
      name: '',
      options: {
        boxClass: 'rootIconClass',
        pixelOffset: {
          width: -20,
          height: -20
        },
        zIndex: 2,
        closeBoxURL: ''
      },
      templateUrl: 'public/system/views/activeSponsor.html',
      imgUrl: '',
      nSize: 0,
      messenger: true,
      show: false,
    },
    recruitIcon: {
      options: {
        boxClass: 'rootIconClass',
        disableAutoPan: true,
        pixelOffset: {
          width: -20,
          height: -20
        },
      zIndex: 1,
      closeBoxURL: ''
      },
      show: true,
    },
    ancestorIcon: {
      options: {
        boxClass: 'ancestor-icon',
        disableAutoPan: true,
        pixelOffset: {
          width: -22,
          height: -22
        },
      zIndex: 1,
      closeBoxURL: ''
      },
      show: true,
    },
    events: { 
      center_changed: function( map, eventName, originalEventArgs) {
        var currentCenter = $scope.map.control.getGMap().getCenter();
        if(currentCenter.lat() < 70 && currentCenter.lat() > -70) {
          $scope.map.lastValidCenter = $scope.map.control.getGMap().getCenter();
            return;
          }
        $scope.map.control.getGMap().panTo($scope.map.lastValidCenter);
        },
        zoom_changed: function(map, eventName, originalEventArgs) {
          if(!$scope.$parent.sponsor) { return; }
          findHidingRecruits($scope.$parent.sponsor, $scope.map.members);
        }
    }
  };

  $scope.hidingRecruits = [];
   
  var findHidingRecruits = function(sponsor, members) {
    
    _.each($scope.hidingRecruits, function(recruit) {
      recruit.coords.latitude = recruit.originlatitude;
      recruit.coords.longitude = recruit.originlongitude;
    });
    $scope.hidingRecruits = [];
    var numTiles = 1 << $scope.map.control.getGMap().getZoom();
    var searchDistance = 32 / numTiles;
    var searchPointLng = $scope.$parent.sponsor.coords.longitude;
    var searchPointLat = $scope.$parent.sponsor.coords.latitude;

    _.each(members, function(sponsor) {
      if(sponsor.coords.longitude > searchPointLng-searchDistance && sponsor.coords.longitude < searchPointLng+searchDistance){
          if(sponsor.coords.latitude > searchPointLat-searchDistance && sponsor.coords.latitude < searchPointLat+searchDistance){
            $scope.hidingRecruits.push(sponsor);
        }
      }
    });
    _.each($scope.map.ancestors, function(sponsor) {
      if(sponsor.coords.longitude > searchPointLng-searchDistance && sponsor.coords.longitude < searchPointLng+searchDistance){
          if(sponsor.coords.latitude > searchPointLat-searchDistance && sponsor.coords.latitude < searchPointLat+searchDistance){
            $scope.hidingRecruits.push(sponsor);
        }
      }
    });
    var counter = searchDistance;
    _.each($scope.hidingRecruits, function (recruit) {
      recruit.originlatitude = recruit.coords.latitude;
      recruit.originlongitude = recruit.coords.longitude;
      recruit.coords.latitude = searchPointLat;
      recruit.coords.longitude = (searchPointLng+searchDistance)+counter;
      counter+=searchDistance;
    });
     $scope.map.members = members;
  };

  var kmlUrl = 'http://sos.ware.fi/public/system/assets/KML/villagelayer.kml';
  $scope.kmlLayerOptions = {
    url: kmlUrl,
    preserveViewport: true
  };

    $scope.focusOnFounder = function() {
      if($scope.$parent.founder) {
        $scope.safeApply(function() {
          $scope.map.activeSponsorIcon.coords = $scope.$parent.founder.coords;
          $scope.map.activeSponsorIcon.messenger = $scope.$parent.founder.messenger;
          $scope.map.activeSponsorIcon.name = $scope.$parent.founder.name;
          $scope.map.activeSponsorIcon.show = true;
          $scope.map.activeSponsorIcon.imgUrl = $scope.$parent.founder.imgUrl;
          $scope.map.activeSponsorIcon.nSize = $scope.$parent.founder.nSize;
          $scope.map.center.longitude = $scope.$parent.founder.coords.longitude;
          $scope.map.center.latitude = $scope.$parent.founder.coords.latitude;
          $scope.map.zoom = 15;
          $scope.findNetwork($scope.$parent.founder);
      });
      }
    };

    $scope.sponsorClicked = function(model) {
      $scope.navDepth += 1;

      $scope.map.ancestors.forEach(function (ancestor, index) {
        if(model._id === ancestor._id) {
          // ancestors are organized in oldest first: 0 = oldest.
          $scope.navDepth = index;
        }
      }); 
      $scope.findNetwork(model);
    };

    $scope.toFounderClicked = function() {
      updateSponsorView($scope.$parent.founder);
    };

    function updateSponsorView(currentSponsor) {
     $scope.safeApply(function() {
        $scope.$parent.sponsor = currentSponsor;
        if(currentSponsor.parentId) {
          SponsorById.get({
            sponsorId: currentSponsor.parentId
            }, function (recruiter) {
              $scope.$parent.recruiter = recruiter;
          });
        } else {
          if($scope.$parent.recruiter) {
            $scope.$parent.recruiter.name = '';
          }
        }
        $scope.map.activeSponsorIcon.coords = currentSponsor.coords;
        $scope.map.activeSponsorIcon.messenger = currentSponsor.messenger;
        $scope.map.activeSponsorIcon.name = currentSponsor.name;
        $scope.map.activeSponsorIcon.show = true;
        $scope.map.activeSponsorIcon.nSize = currentSponsor.nSize;
        $scope.map.activeSponsorIcon.imgUrl = currentSponsor.imgUrl;
        $scope.map.center.longitude = currentSponsor.coords.longitude;
        $scope.map.center.latitude = currentSponsor.coords.latitude;
      });
    }

    $scope.lineWipe = function() {
      $scope.safeApply(function() {
        _.each($scope.map.polylines, function(line) {
          line.stroke.opacity = 0; 
        });
        _.each($scope.map.members, function(member) {
          member.show = false; 
        });
        $scope.map.polylines = [];
        $scope.map.members = [];
        $scope.map.ancestors = [];
      });
    };

  function network_search(sponsor) {
      Networks.get( { networkFounder: sponsor.name, navDepth: $scope.navDepth }, function(network) 
      {
        $scope.map.ancestors = network.ancestors;
        _.each(network.arrows, function(arrow) {
            $scope.map.polylines.push(arrow);
        });
        _.delay(function(){ findHidingRecruits(sponsor, network.children); }, 200);
      });
    updateSponsorView(sponsor);
  }

  var debounced_network_search = _.debounce(network_search, 700, true);

  $scope.findNetwork =  function(sponsor)
  {
    $scope.lineWipe();
    debounced_network_search(sponsor);
  };

$scope.staticvalue=true;
  $scope.topSponsorClicked = function () {
    if($scope.sponsor === undefined ||
        $scope.sponsor.name !== this.topsponsor.name) {
      Sponsors.get({
        sponsorName: this.topsponsor.name
          }, function(sponsor) {
            $scope.navDepth = 0;
            $scope.findNetwork(sponsor);
      });
    }
  };

  $scope.dbError = false;
  $scope.searchDB = function (member) {
    if($scope.sponsor === undefined ||
        $scope.sponsor.name !== member) {

      Sponsors.get({
        sponsorName: member
          }, function(sponsor) {
            if(!sponsor.name) {$scope.dbError = true;return;}
            $scope.navDepth = 0;
            $scope.findNetwork(sponsor);
          });
    }
  };

  $scope.inputChange = function() {
    $scope.dbError = false;
  };

  TopTen.query({}, function (topsponsors) {
    $scope.topTenSponsors = topsponsors;
  });

  $scope.toFounderView = function() {
    $scope.navDepth = 0;
    $scope.findNetwork($scope.$parent.founder);
  };

  $scope.$watch('founder', function(currentFounder) {
    $scope.navDepth = 0;
    if(currentFounder !== undefined) {
      $scope.focusOnFounder();
    }
  });
}]);
