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
        /*var imgNameFromRoute;
        var indexFromRoute;*/
        var allImages;

        var setDirnameToDisplayFromRoute = function () {
            if ($routeParams.dir) {
                dirNameFromRoute = $routeParams.dir;
                $scope.showGoButton = true;
            }

            $scope.dirnameToDisplay = dirNameFromRoute;
        };

        /*var setImgToDisplayFromRoute = function () {
            console.log('setImgToDisplayFromRoute');
            if ($routeParams.img) {
                imgNameFromRoute = $routeParams.img;
            }

            $scope.imgToDisplay = imgNameFromRoute;
        };

        var setIndexToDisplayFromRoute = function () {
            console.log('setIndexToDisplayFromRoute');
            if ($routeParams.index) {
                indexFromRoute = $routeParams.index;
            }

            $scope.currentImgIndex = parseInt(indexFromRoute);
        };*/

        var setLocationSearch = function () {
            $location.search({dir: dirNameFromRoute, img: $scope.imgToDisplay, index: $scope.currentImgIndex});
        };

        $scope.resetScope = function () {
            setDirnameToDisplayFromRoute();
            $scope.howManyImgInDir = 0;
            $scope.currentImgIndex = 0;
            $scope.imgToDisplay = null;
            $scope.alertNoImg = false;
        };

        var displayPrevAndNextBtn = function () {
            $scope.showPrevButton = $scope.currentImgIndex > 0;
            $scope.showNextButton = $scope.currentImgIndex < $scope.howManyImgInDir - 1;
        };


        /*angular.element(document).ready(function () {
            console.log('ready');
            $scope.resetScope();
            if ($routeParams.dir) {
                setDirnameToDisplayFromRoute();
            }
            if ($routeParams.img && $routeParams.index) {
                setImgToDisplayFromRoute();
                setIndexToDisplayFromRoute();
            }
        });*/

        $scope.$on('$routeChangeSuccess', function () {
            setDirnameToDisplayFromRoute();
        });

        $scope.$on('$routeUpdate', function () {
            setDirnameToDisplayFromRoute();
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
            $scope.spinner = true;
            imgService.returnByDirname(
                function (data) {
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


                }, dirNameFromRoute
            );
        }

        $scope.displayGallery = function () {
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
                scope.$apply('showSpinner(false)');
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

gallery.factory("imgService",
    function ($http) {
        return {
            returnByDirname: function (callback, dirname) {
                $http.get("listfiles.php?dirname=" + dirname).success(callback).error(callback);
            }
        }
    }
);

// needs to be a promise as the data is fetch async.
gallery.service("dirListService",
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
