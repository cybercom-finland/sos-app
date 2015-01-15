/*global google */
/*global FB */
/*global _ */
'use strict';

angular.module('mean.system').controller('IndexController', ['$scope', '$stateParams', '$cookies', '$state', '$rootScope', 'Global', 'Sponsors', 'SponsorById', 'FormData', 'SponsorEmail', 'Networks', '$window', '$modal', '$location', function ($scope, $stateParams, $cookies, $state, $rootScope, Global, Sponsors, SponsorById, FormData, SponsorEmail, Networks, $window, $modal, $location) {
    $scope.global = Global;

    // default values for which accordion elements are shown.
    $scope.showStories = true;
    $scope.showNetworkInfo = true;
    $scope.showTopTen = false;
    $scope.showTwitter = false;
    $scope.accordionShow = true;
    $scope.recruiter = {};
    $scope.recruiter.name = '';
    $scope.members = [];
    $scope.tempImage = 'public/system/assets/img/kummi_info_placeholder.jpg';
    $scope.$window = $window;
    $scope.safeApply = function (fn) {
        var phase = this.$root.$$phase;
        if (phase === '$apply' || phase === '$digest') {
            if (fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };
    $scope.shareCurrent = '';

    // save founder to scope
    if ($stateParams.sponsorName !== undefined) {
        Sponsors.get({
            sponsorName: $stateParams.sponsorName
        }, function (founder) {
            $scope.founder = founder;
            $scope.sponsor = founder;
            $scope.shareCurrent = '%2F%23!%2Fsponsors%2F' + $scope.founder.name;
            Networks.get({ networkFounder: $scope.founder.name, navDepth: 0 }, function (network) {
                $scope.members = network.children;
            });
            if (founder.parentId) {
                SponsorById.get({
                    sponsorId: founder.parentId
                }, function (recruiter) {
                    $scope.recruiter = recruiter;
                });
            }
        });
    }
    $scope.newSponsorData = {
        nickname: '',
        imageUrl: ''
    };

    $scope.facebookInit = function () {
        window.fbAsyncInit = function () {
            FB.init({
                appId: '436836956454387',
                xfbml: true,
                cookie: true,
                version: 'v2.0'
            });
        };

        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {
                return;
            }
            js = d.createElement(s);
            js.id = id;
            js.src = '//connect.facebook.net/en_US/sdk.js';
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));

        if (screen.width < 600) {
            $scope.accordionShow = false;
        }
    };

    $scope.twitterShareClick = function () {
        var width = 575;
        var height = 450;
        var left = $window.width - width / 2;
        var top = $window.height - height / 2;
        var url = 'http://twitter.com/intent/tweet?text=http%3A%2F%2F' + $location.host() + $scope.shareCurrent + ' Liity verkostooni ja aloita hyvän tekeminen tänään! %23Hyväntekeväisyys %23SOSLapsikylät';
        var opts = 'status=1' + ',width=' + width + ',height=' + height + ',top=' + top + ',left=' + left;
        $window.open(url, 'twitter', opts);
    };

    $scope.faboshare = function () {
        var sponsorname = '';
        if ($scope.founder) {
            sponsorname = $scope.founder.name;
        }
        FB.ui({
            method: 'share',
            href: 'http://' + $location.host() + '/#!/sponsors/' + sponsorname
        }, function (response) {
        });
    };

    $scope.joinOptions = ['Sponsor', 'Messenger', 'OldSponsor'];

    var joinNetworkModalCrtl = function ($scope, $modalInstance, joinOptions) {
        $scope.joinOptions = joinOptions;
        $scope.selected = {
            JoinNetworkOption: $scope.joinOptions[0]
        };
        $scope.ok = function () {
            $modalInstance.close($scope.selected.JoinNetworkOption);
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };

    $scope.joinThisNetwork = function () {
        $scope.modalInstance = $modal.open({
            templateUrl: 'public/system/views/joinNetworkModal.html',
            controller: joinNetworkModalCrtl,
            size: 'lg',
            resolve: {
                joinOptions: function () {
                    return $scope.joinOptions;
                }
            },
            windowClass: 'modal-window'
        });

        $scope.modalInstance.result.then(function (selectedJoinNetworkOption) {
            $scope.selected = selectedJoinNetworkOption;
            $scope.openjoinNetworkOptions();
        }, function () {
        });
    };

    var userInformationCrtl = function ($scope, $modalInstance, chosenJoinNetworkOption) {

        $scope.chosenJoinNetworkOption = chosenJoinNetworkOption;
        $scope.userInput = {
            nickname: '',
            address: '',
            imageUrl: '',
            code: ''
        };
        $scope.showUserIcon = false;
        $scope.getFacebookProfileImage = function () {
            FB.getLoginStatus(function (response) {
                if (response.status !== 'connected') {
                    FB.login(function (response) {
                        if (response.authResponse) {
                            console.log('käyttäjä kirjautui sisään.');
                            FB.api('/me', function (response) {
                                $scope.userInput.imageUrl = 'http://graph.facebook.com/' + response.id + '/picture/';
                                $scope.showUserIcon = true;
                            });
                        } else {
                            console.log('Käyttäjä peruutti kirjautumisen');
                            return;
                        }
                    });
                } else {
                    FB.api('/me', function (response) {
                        $scope.userInput.imageUrl = 'http://graph.facebook.com/' + response.id + '/picture/';
                        $scope.showUserIcon = true;
                    });
                }
            });
        };

        $scope.forwardJoinNetwork = function () {
            if ($scope.userInput.nickname) {
                $scope.userInput.nickname = this.userInput.nickname;
            }
            if ($scope.userInput.lng) {
                $scope.userInput.lng = this.userInput.lng;
            }
            if ($scope.userInput.lat) {
                $scope.userInput.lat = this.userInput.lat;
            }
            if ($scope.userInput.code) {
                $scope.userInput.code = this.userInput.code;
            }
            $rootScope.newSponsorData = $scope.userInput;
            saveSponsorToDatabase();
        };

        $scope.cancelJoinNetwork = function () {
            $modalInstance.dissmiss('cancel');
        };

        $scope.getLocation = function () {
            $scope.geolocationNotAllowed = false;
            $scope.geolocationNotSupported = false;
            $scope.geolocationFailed = false;
            $scope.geocodeNoResults = false;

            var canClose = false;
            var timeoutCount = 0;
            var waitInterval = setInterval(function () {
                if (canClose) {
                    $scope.waitingModal.close();
                    window.clearInterval(waitInterval);
                } else if (timeoutCount > 10) {
                    $scope.geolocationNotAllowed = true;
                    $scope.waitingModal.close();
                    window.clearInterval(waitInterval);
                }
                timeoutCount += 1;
            }, 1000);

            if (!navigator.geolocation) {
                $scope.geolocationNotSupported = true;
                canClose = true;
                return;
            }
            function success(position) {
                var geocoder = new google.maps.Geocoder();
                var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                geocoder.geocode({'latLng': latlng}, function (results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                        $scope.userInput.address = results[0].formatted_address;
                        $scope.userInput.geolocatedaddress = results[0].formatted_address;
                        $scope.userInput.lng = results[0].geometry.location.lng();
                        $scope.userInput.lat = results[0].geometry.location.lat();
                        $scope.geolocationNotAllowed = false;
                        canClose = true;
                    } else {
                        $scope.reverseGeocodeFailed = true;
                        $scope.reverseGeocodeFailedReason = status;
                        canClose = true;
                    }
                });
            }

            function error() {
                $scope.geolocationNotAllowed = true;
                canClose = true;
            }

            navigator.geolocation.getCurrentPosition(success, error);
            $scope.waitingModal = $modal.open({
                templateUrl: 'public/system/views/waitGeoPermissionModal.html',
                windowClass: 'geo-permission-modal',
                backdrop: 'static',
                keyboard: false
            });
        };

        $scope.submitForm = function (isValid) {
            $rootScope.codeInvalid = false;
            $rootScope.codeUsed = false;
            $scope.submitted = true;
            $scope.geocodeNoResults = false;
            $scope.nameNotFound = false;
            $scope.emailInUse = false;

            var oldNickname = this.userInput.oldNickname;
            if (oldNickname !== undefined && oldNickname !== '') {
                Sponsors.get({
                    sponsorName: oldNickname
                }, function (sponsor) {
                    if (sponsor.name === undefined) {
                        $scope.nameNotFound = true;
                    } else {
                        sponsor.$upgrade({ sponsorName: sponsor.name }, function (response) {
                            $state.go('sponsor by name', {sponsorName: oldNickname}, {reload: true});
                            closeModal();
                        });
                    }
                });
                return;
            }

            var submittedName = this.userInput.nickname;

            var email = this.userInput.email;
            if (email === undefined || email === '') {
                email = $rootScope.email;
                this.userInput.email = $rootScope.email;
            }

            if (email !== undefined && email !== '') {
                SponsorEmail.get({
                    email: email
                }, function (response) {
                    if (response.mailFound) {
                        $scope.emailInUse = true;
                    } else {

                        if (submittedName !== '' && submittedName !== undefined) {
                            Sponsors.get({
                                sponsorName: submittedName
                            }, function (sponsor) {
                                if (sponsor.name === undefined) {
                                    $scope.nametaken = false;
                                    if (isValid) {
                                        if ($scope.userInput.address === $scope.userInput.geolocatedaddress) {
                                            $scope.forwardJoinNetwork();
                                        } else {
                                            var geocoder = new google.maps.Geocoder();
                                            geocoder.geocode({'address': $scope.userInput.address}, function (results, status) {
                                                if (status === google.maps.GeocoderStatus.OK) {
                                                    $scope.userInput.lng = results[0].geometry.location.lng();
                                                    $scope.userInput.lat = results[0].geometry.location.lat();
                                                    $scope.forwardJoinNetwork();
                                                } else {
                                                    $scope.geocodeNoResults = true;
                                                    $scope.$digest();
                                                }
                                            });
                                        }
                                    }
                                } else {
                                    $scope.submittedName = submittedName;
                                    $scope.nametaken = true;
                                }
                            });
                        }
                    }
                });
            }
        };
    };

    $scope.openjoinNetworkOptions = function () {

        var redirectFormUrl;
        var scontrol;
        var modalWindowClass = 'modal-window';

        if ($scope.selected === 'Sponsor') {
            redirectFormUrl = 'public/system/views/joinAsSponsor.html';
            scontrol = joinAsSponsorCtrl;
            modalWindowClass = 'sponsor-window';
        } else if ($scope.selected === 'Messenger') {
            redirectFormUrl = 'public/system/views/joinAsMessenger.html';
            scontrol = joinAsMessengerCtrl;
        } else if ($scope.selected === 'OldSponsor') {
            redirectFormUrl = 'public/system/views/userInformation.html';
            scontrol = userInformationCrtl;
        }

        $scope.modalInstance = $modal.open({
            templateUrl: redirectFormUrl,
            controller: scontrol,
            windowClass: modalWindowClass,
            resolve: {
                chosenJoinNetworkOption: function () {
                    return $scope.selected;
                }
            }
        });

        $scope.modalInstance.result.then(function (userInput) {
            if ($scope.selected === 'Sponsor' || $scope.selected === 'Messenger') {
                $scope.openGetNetworkInfo($scope.selected);
            }

        }, function () {
        });
    };

    $scope.openGetNetworkInfo = function (chosenJoinNetworkOption) {
        $scope.chosenJoinNetworkOption = chosenJoinNetworkOption;

        $scope.modalInstance = $modal.open({
            templateUrl: 'public/system/views/userInformation.html',
            controller: userInformationCrtl,
            windowClass: 'modal-window',
            resolve: {
                chosenJoinNetworkOption: function () {
                    return $scope.chosenJoinNetworkOption;
                }
            }
        });
        $scope.modalInstance.result.then(function () {

        }, function () {

        });
    };

    var joinAsMessengerCtrl = function ($scope, $modalInstance, chosenJoinNetworkOption) {
        $scope.chosenJoinNetworkOption = chosenJoinNetworkOption;

        $scope.spInfo = {
            firstName: '',
            lastName: '',
            postNumber: '',
            postOffice: '',
            phoneNumber: '',
            email: '',
        };

        $scope.submitMessenger = function (messengerInformationForm) {
            $scope.submitted = true;

            if (messengerInformationForm.$valid) {
                $scope.spInfo.firstName = this.firstName;
                $scope.spInfo.lastName = this.lastName;
                $scope.spInfo.postNumber = this.postNumber;
                $scope.spInfo.postOffice = this.postOffice;
                $scope.spInfo.phoneNumber = this.phoneNumber;
                $scope.spInfo.email = this.email;

                $rootScope.email = this.email;
                SponsorEmail.get({
                    email: this.email
                }, function (response) {
                    if (response.mailFound) {
                        $scope.emailInUse = true;
                    } else {
                        $scope.emailInUse = false;
                        $modalInstance.close();
                    }
                });
            }
        };

    };

    var joinAsSponsorCtrl = function ($scope, $modalInstance, chosenJoinNetworkOption) {
        $scope.chosenJoinNetworkOption = chosenJoinNetworkOption;

        $scope.spInfo = {
            firstName: '',
            lastName: '',
            postNumber: '',
            postOffice: '',
            phoneNumber: '',
            email: '',
            donationAmount: '',
            gender: '',
            joinAsGroup: false,
            newsLetter: false
        };

        $scope.donationAmount = 5;
        $scope.decreaseDonationAmount = function() {
            if ($scope.donationAmount > 5) {
                $scope.donationAmount -= 5;
            }
        };
        $scope.increaseDonationAmount = function() {
            if ($scope.donationAmount < 100) {
                $scope.donationAmount += 5;
            }
        };

        $scope.submitSponsor = function (sponsorInformationForm) {
            $scope.submitted = true;

            if (sponsorInformationForm.$valid) {

                sponsorInformationForm.email = 'test@mail.net';

                $scope.spInfo.firstName = this.firstName;
                $scope.spInfo.lastName = this.lastName;
                $scope.spInfo.postNumber = this.postNumber;
                $scope.spInfo.postOffice = this.postOffice;
                $scope.spInfo.phoneNumber = this.phoneNumber;
                $scope.spInfo.email = this.email;
                // $scope.spInfo.donationAmount = this.donationAmount;
                $scope.spInfo.gender = this.gender;
                $scope.spInfo.joinAsGroup = this.joinAsGroup;
                $scope.spInfo.newsLetter = this.newsLetter;

                $rootScope.email = this.email;
                SponsorEmail.get({
                    email: this.email
                }, function (response) {
                    if (response.mailFound) {
                        $scope.emailInUse = true;
                    } else {
                        $scope.emailInUse = false;
                        var newFormData = new FormData({
                            data: $scope.spInfo
                        });
                        newFormData.$save(function (response) {
                            $modalInstance.close();
                        });
                    }
                });
            }
        };

    };

    var shareUrlCrtl = function ($scope, $modalInstance, nickname) {
        $scope.myUniqueUrl = 'http://' + $location.host() + '/#!/sponsors/' + nickname;
        $scope.ok = function () {
            $modalInstance.close('ok');
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };

    $scope.openShareThisUrlModal = function () {
        $scope.modalInstance = $modal.open({
            templateUrl: 'public/system/views/shareUrl.html',
            controller: shareUrlCrtl,
            windowClass: 'modal-window',
            resolve: {
                nickname: function () {
                    return $scope.newSponsorData.nickname;
                }
            }
        });
    };

    var helpWindowCrtl = function ($scope, $modalInstance, createOwnNetwork, founderName) {
        $scope.createOwnNetwork = createOwnNetwork;
        $scope.founderName = founderName;
        $scope.ok = function () {
            $modalInstance.close('ok');
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };

    $scope.openHelpWindow = function () {
        $scope.modalInstance = $modal.open({
            templateUrl: 'public/system/views/helpWindow.html',
            controller: helpWindowCrtl,
            windowClass: 'modal-window',
            size: 'lg',
            resolve: {
                createOwnNetwork: function () {
                    if ($scope.founder) {
                        return false;
                    } else {
                        return true;
                    }
                },
                founderName: function () {
                    if ($scope.founder) {
                        return $scope.founder.name;
                    } else {
                        return '';
                    }
                }
            }
        });
    };

    var closeModal = function () {
        $scope.modalInstance.close();
    };

    var saveSponsorToDatabase = function (longitude, latitude) {
        $scope.newSponsorData = $rootScope.newSponsorData;
        var sponsor = new Sponsors({
            code: $scope.newSponsorData.code,
            name: $scope.newSponsorData.nickname,
            hashedEmail: $scope.newSponsorData.email,
            coords: {
                latitude: $scope.newSponsorData.lat,
                longitude: $scope.newSponsorData.lng
            },
        });
        if ($scope.newSponsorData.imageUrl !== '') {
            sponsor.imgUrl = $scope.newSponsorData.imageUrl;
        }
        if ($scope.founder) {
            sponsor.parentId = $scope.founder._id;
            if (sponsor.coords.longitude > $scope.founder.coords.longitude - 0.0020 && sponsor.coords.longitude < $scope.founder.coords.longitude + 0.0020) {
                if (sponsor.coords.latitude > $scope.founder.coords.latitude - 0.0020 && sponsor.coords.latitude < $scope.founder.coords.latitude + 0.0020) {
                    //add +- 0.001-0.002 to latitude and longitude values
                    sponsor.coords.latitude += (((Math.random() * 0.002) + 0.001) * (Math.floor(Math.random() * 2) === 1 ? 1 : -1));
                    sponsor.coords.longitude += (((Math.random() * 0.002) + 0.001) * (Math.floor(Math.random() * 2) === 1 ? 1 : -1));
                }
            }
            _.each($scope.members, function (member) {
                if (sponsor.coords.longitude > member.coords.longitude - 0.0020 && sponsor.coords.longitude < member.coords.longitude + 0.0020) {
                    if (sponsor.coords.latitude > member.coords.latitude - 0.0020 && sponsor.coords.latitude < member.coords.latitude + 0.0020) {
                        //add +- 0.001-0.002 to latitude and longitude values
                        sponsor.coords.latitude += (((Math.random() * 0.002) + 0.001) * (Math.floor(Math.random() * 2) === 1 ? 1 : -1));
                        sponsor.coords.longitude += (((Math.random() * 0.002) + 0.001) * (Math.floor(Math.random() * 2) === 1 ? 1 : -1));
                    }
                }
            });
        }
        sponsor.$save(function (resource) {
            if (resource.error) {
                if (resource.error === 'code-invalid') {
                    $rootScope.codeInvalid = true;
                    console.log('invalid code');
                }
                if (resource.error === 'code-used') {
                    $rootScope.codeUsed = true;
                    console.log('code already in use');
                }
            } else {
                $state.go('sponsor by name', {sponsorName: resource.name});
                $rootScope.savedSponsor = resource;
                $scope.modalInstance.close();
                $scope.openShareThisUrlModal();
                $scope.members = [];
            }
        });
    };
}]);
