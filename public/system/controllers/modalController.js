'use strict';

var ModalInstanceCtrl = function ($scope, $modalInstance, showMobileWarning) {
    $scope.showMobileWarning = showMobileWarning;
    $scope.ok = function () {
        $modalInstance.close('ok');
    };
};

angular.module('mean.system').controller('ModalCtrl', ['$scope', '$modal', '$timeout', function ($scope, $modal, $timeout) {

    $scope.checkCookie = function () {
        if (!readCookie('networkVisitor')) {
            createCookie('networkVisitor');
            $scope.open();
        }
    };

    function createCookie(name, value) {
        var date = new Date();
        date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));
        var expires = '; expires=' + date.toGMTString();
        document.cookie = name + '=' + value + expires + '; path=/';
    }

    function readCookie(name) {
        var nameEQ = name + '=';
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    $scope.open = function () {
        $timeout(function () {
            $scope.modalInstance = $modal.open({
                backdrop: 'static',
                templateUrl: 'public/system/views/guideModal.html',
                controller: ModalInstanceCtrl,
                windowClass: 'modal-window',
                size: 'lg',
                resolve: {
                    showMobileWarning: function () {
                        if (screen.width < 600) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                }
            });
        }, 1500);
    };
}]);

