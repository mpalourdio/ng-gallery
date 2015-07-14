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
                reloadOnSearch: false
            }).
            otherwise({
                redirectTo:  '/show',
                templateUrl: 'process.html',
                controller:  'mainctrl'
            });
    }]);

gallery.controller('mainctrl', function ($scope, imgService, dirListService, $routeParams, $location) {

    var allImages;

    $scope.dirnameToDisplay = $routeParams.dir;
    $scope.imgToDisplay = $routeParams.img;
    $scope.currentImgIndex = parseInt($routeParams.index) || 0;


    var setLocationSearch = function () {
        $location.search({dir: $routeParams.dir, img: $scope.imgToDisplay, index: $scope.currentImgIndex});
    };

    var displayPrevAndNextBtn = function () {
        $scope.showPrevButton = $scope.currentImgIndex > 0;
        $scope.showNextButton = $scope.currentImgIndex < $scope.howManyImgInDir - 1;
    };

    var processImgRendering = function () {
        imgService.async($scope.dirnameToDisplay).then(function (data) {
            allImages = data;
            $scope.howManyImgInDir = data[$scope.dirnameToDisplay].length;
            if (0 === $scope.howManyImgInDir) {
                $scope.alertNoImg = true;
            } else {
                displayPrevAndNextBtn();
                $scope.imgToDisplay = data[$scope.dirnameToDisplay][$scope.currentImgIndex];
            }

        });
        $scope.spinner = false;
    };

    dirListService.async().then(function (data) {
        $scope.dirlist = data;
    });

    angular.forEach(['$routeChangeSuccess', '$routeUpdate'], function (value) {

        $scope.$on(value, function () {
            if ($routeParams.dir) {
                //if we click back on the folder we are fetching, we reload
                if ($scope.dirnameToDisplay != $routeParams.dir ||
                    $scope.imgToDisplay != $routeParams.img ||
                    $scope.currentImgIndex != $routeParams.index) {
                    $scope.resetScope()
                }
                //if we come from bookmark or change folder
                if ('$routeChangeSuccess' === value || $scope.dirnameToDisplay != $routeParams.dir) {
                    $scope.dirnameToDisplay = $routeParams.dir;
                    $scope.displayGallery();
                }
            }
        });
    });

    $scope.resetScope = function () {
        $scope.dirnameToDisplay = null;
        $scope.imgToDisplay = null;
        $scope.currentImgIndex = 0;
        $scope.howManyImgInDir = 0;
        $scope.alertNoImg = false;

    };

    $scope.showNextImg = function () {
        $scope.spinner = true;
        $scope.currentImgIndex += 1;
        $scope.imgToDisplay = allImages[$routeParams.dir][$scope.currentImgIndex];
        setLocationSearch();
        displayPrevAndNextBtn();
    };

    $scope.showPrevImg = function () {
        $scope.spinner = true;
        $scope.currentImgIndex -= 1;
        $scope.imgToDisplay = allImages[$routeParams.dir][$scope.currentImgIndex];
        setLocationSearch();
        displayPrevAndNextBtn();
    };

    $scope.showSpinner = function (value) {
        $scope.spinner = value;
    };

    $scope.displayGallery = function () {
        $scope.spinner = true;
        processImgRendering();
    };

});

gallery.directive('imageonload', function () {

    return {
        restrict: 'A',
        link:     function (scope, element, attrs) {
            element.bind('load', function () {
                scope.showSpinner(false);
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
