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

gallery.controller('mainctrl', ['$scope', 'imgService', 'dirListService', '$routeParams', '$location',
    function ($scope, imgService, dirListService, $routeParams, $location) {

        var dirNameFromRoute;
        var imgNameFromRoute;
        var indexFromRoute;
        var allImages;

        var setDirnameToDisplayFromRoute = function () {
            if ($routeParams.dir) {
                dirNameFromRoute = $routeParams.dir;
                $scope.showGoButton = true;
            }

            $scope.dirnameToDisplay = dirNameFromRoute;
        };

        var setImgToDisplayFromRoute = function () {
            if ($routeParams.img) {
                imgNameFromRoute = $routeParams.img;
            } else {
                imgNameFromRoute = null;
            }

            $scope.imgToDisplay = imgNameFromRoute;
        };

        var setIndexToDisplayFromRoute = function () {
            if ($routeParams.index) {
                indexFromRoute = parseInt($routeParams.index);
            } else {
                indexFromRoute = 0;
            }

            $scope.currentImgIndex = indexFromRoute;
        };

        var setLocationSearch = function () {
            $location.search({dir: dirNameFromRoute, img: $scope.imgToDisplay, index: $scope.currentImgIndex});
        };

        $scope.resetScope = function () {
            setDirnameToDisplayFromRoute();
            $scope.howManyImgInDir = 0;
            setIndexToDisplayFromRoute();
            setImgToDisplayFromRoute();
            $scope.alertNoImg = false;
        };

        var displayPrevAndNextBtn = function () {
            $scope.showPrevButton = $scope.currentImgIndex > 0;
            $scope.showNextButton = $scope.currentImgIndex < $scope.howManyImgInDir - 1;
        };

        angular.element(document).ready(function () {
            if (dirNameFromRoute) {
                $scope.resetScope();
                processImgRendering()
            }
        });

        /**
         * @todo Possible to have only one $on with multiple events ?
         */
        $scope.$on('$routeChangeSuccess', function () {
            setDirnameToDisplayFromRoute();
            setIndexToDisplayFromRoute();
            setImgToDisplayFromRoute();
        });

        $scope.$on('$routeUpdate', function () {
            setDirnameToDisplayFromRoute();
            setIndexToDisplayFromRoute();
            setImgToDisplayFromRoute();
        });

        $scope.showNextImg = function () {
            $scope.spinner = true;
            $scope.currentImgIndex += 1;
            $scope.imgToDisplay = allImages[dirNameFromRoute][$scope.currentImgIndex];
            setLocationSearch();
            displayPrevAndNextBtn();
        };

        $scope.showPrevImg = function () {
            $scope.spinner = true;
            $scope.currentImgIndex -= 1;
            $scope.imgToDisplay = allImages[dirNameFromRoute][$scope.currentImgIndex];
            setLocationSearch();
            displayPrevAndNextBtn();
        };

        $scope.showSpinner = function (value) {
            $scope.spinner = value;
        };

        function processImgRendering() {
            imgService.async(dirNameFromRoute).then(function (data) {
                allImages = data;
                $scope.howManyImgInDir = data[dirNameFromRoute].length;

                if (0 === $scope.howManyImgInDir) {
                    $scope.resetScope();
                    $scope.alertNoImg = true;
                } else {
                    displayPrevAndNextBtn();
                    $scope.imgToDisplay = data[dirNameFromRoute][$scope.currentImgIndex];
                    setLocationSearch();
                }

                $scope.spinner = false;
            });
        }

        $scope.displayGallery = function () {
            $scope.spinner = true;
            processImgRendering();
        };

        dirListService.async().then(function (data) {
            $scope.dirlist = data;
        });
    }]);

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

gallery.directive('onchangedirectory', function () {
    return {
        restrict: 'A',
        link:     function (scope, element, attrs) {
            element.bind('click', function () {
                scope.resetScope();
            });
        }
    };
});

//@todo use $q
gallery.service('imgService',
    function ($http) {
        return {
            async: function (dirname) {
                return $http.get('listfiles.php?dirname=' + dirname).then(function (response) {
                    return response.data;
                });
            }
        };
    }
);

// needs to be a promise as the data is fetch async.
// @todo use $q
gallery.service('dirListService',
    function ($http) {
        return {
            async: function () {
                return $http.get('listdir.php').then(function (response) {
                    return response.data;
                });
            }
        };
    }
);
