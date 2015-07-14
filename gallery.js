/*
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

'use strict';

var gallery = angular.module('gallery', ['ngRoute']);

gallery.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
            when('/show/:dir?/:img?/:index?', {
                templateUrl:    'process.html',
                controller:     'mainctrl',
                controllerAs:   'vm',
                reloadOnSearch: false
            }).
            otherwise({
                redirectTo:   '/show',
                templateUrl:  'process.html',
                controller:   'mainctrl',
                controllerAs: 'vm'
            });
    }]);

gallery.controller('mainctrl', function ($scope, imgService, dirListService, $routeParams, $location) {

    var allImages;

    var vm = this;

    vm.dirnameToDisplay = $routeParams.dir;
    vm.imgToDisplay = $routeParams.img;
    vm.currentImgIndex = parseInt($routeParams.index) || 0;


    var setLocationSearch = function () {
        $location.search({dir: $routeParams.dir, img: vm.imgToDisplay, index: vm.currentImgIndex});
    };

    var displayPrevAndNextBtn = function () {
        vm.showPrevButton = vm.currentImgIndex > 0;
        vm.showNextButton = vm.currentImgIndex < vm.howManyImgInDir - 1;
    };

    var processImgRendering = function () {
        imgService.async(vm.dirnameToDisplay).then(function (data) {
            allImages = data;
            vm.howManyImgInDir = data[vm.dirnameToDisplay].length;
            if (0 === vm.howManyImgInDir) {
                vm.alertNoImg = true;
            } else {
                displayPrevAndNextBtn();
                vm.imgToDisplay = data[vm.dirnameToDisplay][vm.currentImgIndex];
            }

        });
        vm.spinner = false;
    };

    dirListService.async().then(function (data) {
        vm.dirlist = data;
    });

    angular.forEach(['$routeChangeSuccess', '$routeUpdate'], function (value) {
        $scope.$on(value, function () {
            if ($routeParams.dir) {
                //if we click back on the folder we are fetching, we reload
                if (vm.dirnameToDisplay != $routeParams.dir ||
                    vm.imgToDisplay != $routeParams.img ||
                    vm.currentImgIndex != $routeParams.index) {
                    vm.resetScope()
                }
                //if we come from bookmark or change folder
                if ('$routeChangeSuccess' === value || vm.dirnameToDisplay != $routeParams.dir) {
                    vm.dirnameToDisplay = $routeParams.dir;
                    vm.displayGallery();
                }
            }
        });
    });

    vm.resetScope = function () {
        vm.dirnameToDisplay = null;
        vm.imgToDisplay = null;
        vm.currentImgIndex = 0;
        vm.howManyImgInDir = 0;
        vm.alertNoImg = false;

    };

    vm.showNextImg = function () {
        vm.spinner = true;
        vm.currentImgIndex += 1;
        vm.imgToDisplay = allImages[$routeParams.dir][vm.currentImgIndex];
        setLocationSearch();
        displayPrevAndNextBtn();
    };

    vm.showPrevImg = function () {
        vm.spinner = true;
        vm.currentImgIndex -= 1;
        vm.imgToDisplay = allImages[$routeParams.dir][vm.currentImgIndex];
        setLocationSearch();
        displayPrevAndNextBtn();
    };

    vm.showSpinner = function (value) {
        vm.spinner = value;
    };

    vm.displayGallery = function () {
        vm.spinner = true;
        processImgRendering();
    };

});

gallery.directive('imageonload', function () {

    return {
        restrict: 'A',
        link:     function (scope, element, attrs) {
            element.bind('load', function () {
                scope.vm.showSpinner(false);
                scope.$apply();
            });
        }
    };
});

gallery.service('imgService', function ($http) {

        return {
            async: function (dirname) {
                return $http.get('listfiles.php?dirname=' + dirname).then(function (response) {
                    return response.data;
                });
            }
        };
    }
);

gallery.service('dirListService', function ($http) {

        return {
            async: function () {
                return $http.get('listdir.php').then(function (response) {
                    return response.data;
                });
            }
        };
    }
);
