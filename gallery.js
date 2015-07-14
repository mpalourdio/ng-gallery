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

gallery.controller('mainctrl', ['$scope', 'imgService', 'dirListService', '$routeParams', '$location', '$timeout',
    function ($scope, imgService, dirListService, $routeParams, $location, $timeout) {

        var dirNameFromRoute;
        var imgNameFromRoute;
        var indexFromRoute;
        var allImages;

        var setDirnameToDisplayFromRoute = function () {
            console.log('1', $routeParams.dir);
            if ($routeParams.dir) {
                dirNameFromRoute = $routeParams.dir;
            }

            $scope.dirnameToDisplay = dirNameFromRoute;
        };

        var setImgToDisplayFromRoute = function () {
            console.log('2', $scope.dirnameToDisplay);
            if ($routeParams.img) {
                imgNameFromRoute = $routeParams.img;
            } else {
                imgNameFromRoute = null;
            }

            $scope.imgToDisplay = imgNameFromRoute;
        };

        var setIndexToDisplayFromRoute = function () {
            console.log('3', $scope.dirnameToDisplay);
            if ($routeParams.index) {
                indexFromRoute = parseInt($routeParams.index);
            } else {
                indexFromRoute = 0;
            }

            $scope.currentImgIndex = indexFromRoute;
        };

        var setLocationSearch = function () {
            console.log('4');
            $location.search({dir: dirNameFromRoute, img: $scope.imgToDisplay, index: $scope.currentImgIndex});
        };

        var displayPrevAndNextBtn = function () {
            console.log('5');
            $scope.showPrevButton = $scope.currentImgIndex > 0;
            $scope.showNextButton = $scope.currentImgIndex < $scope.howManyImgInDir - 1;
        };

        var processImgRendering = function () {
            console.log('6', $scope.dirnameToDisplay);
            //$timeout(function () {
            imgService.async($scope.dirnameToDisplay).then(function (data) {
                allImages = data;
                $scope.howManyImgInDir = data[dirNameFromRoute].length;

                if (0 === $scope.howManyImgInDir) {
                    $scope.alertNoImg = true;
                } else {
                    displayPrevAndNextBtn();
                    $scope.imgToDisplay = data[dirNameFromRoute][$scope.currentImgIndex];
                    //setLocationSearch();
                }

                $scope.spinner = false;
            });
            //});
        };

        dirListService.async().then(function (data) {
            console.log('7');
            $scope.dirlist = data;
        });

        angular.element(document).ready(function () {
            console.log('8');
            if (dirNameFromRoute) {
                $scope.resetScope();
                processImgRendering()
            }
        });

        angular.forEach(['$routeChangeSuccess', '$routeUpdate'], function (value) {

            $scope.$on(value, function () {
                console.log(value);
                console.log('9');

                setDirnameToDisplayFromRoute();
                setIndexToDisplayFromRoute();
                setImgToDisplayFromRoute();
                if ($routeParams.dir) {
                    processImgRendering();
                }
            });
        });

        $scope.resetScope = function () {
            console.log('10', $scope.dirnameToDisplay);
            //setDirnameToDisplayFromRoute();
            $scope.howManyImgInDir = 0;
            //setIndexToDisplayFromRoute();
            //setImgToDisplayFromRoute();
            $scope.alertNoImg = false;
        };

        $scope.showNextImg = function () {
            console.log('11');
            $scope.spinner = true;
            $scope.currentImgIndex += 1;
            $scope.imgToDisplay = allImages[dirNameFromRoute][$scope.currentImgIndex];
            setLocationSearch();
            displayPrevAndNextBtn();
        };

        $scope.showPrevImg = function () {
            console.log('12');
            $scope.spinner = true;
            $scope.currentImgIndex -= 1;
            $scope.imgToDisplay = allImages[dirNameFromRoute][$scope.currentImgIndex];
            setLocationSearch();
            displayPrevAndNextBtn();
        };

        $scope.showSpinner = function (value) {
            console.log('13');
            $scope.spinner = value;
        };

        $scope.displayGallery = function () {
            console.log('14', $scope.dirnameToDisplay);
            $scope.resetScope();
            $scope.spinner = true;
            //processImgRendering();
        };

    }]);

gallery.directive('imageonload', function () {

    return {
        restrict: 'A',
        link:     function (scope, element, attrs) {
            console.log('15');
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
                    console.log('16');
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
                    console.log('17');
                    return response.data;
                });
            }
        };
    }
);
