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
            when('/:dir/:img?', {
                templateUrl:    'process.html',
                controller:     'mainctrl',
                reloadOnSearch: false
            }).
            otherwise({
                redirectTo:  '/',
                templateUrl: 'process.html',
                controller:  'mainctrl'
            });
    }]);


gallery.controller('mainctrl', ['$scope', 'imgService', '$routeParams', '$location',
    function ($scope, imgService, $routeParams, $location) {

        $scope.$on('$routeChangeSuccess', function () {
            console.log($routeParams);
        });

        var allImages;

        $scope.dirnameToDisplay = $routeParams.dir;
        $scope.howManyImgInDir = 0;
        $scope.currentImgIndex = 0;


        function resetScope() {
            $scope.dirnameToDisplay = $routeParams.dir;
            $scope.howManyImgInDir = 0;
            $scope.currentImgIndex = 0;
            $scope.alertNoImg = false;
        }

        function displayPrevAndNextBtn() {
            $scope.showPrevButton = $scope.currentImgIndex > 0;
            $scope.showNextButton = $scope.currentImgIndex < $scope.howManyImgInDir - 1;
        }

        $scope.showNextImg = function () {
            $scope.spinner = true;
            $scope.currentImgIndex += 1;
            $scope.imgToDisplay = allImages[$scope.dirnameToDisplay][$scope.currentImgIndex];
            $location.search('img', $scope.imgToDisplay);
            displayPrevAndNextBtn();
        };

        $scope.showPrevImg = function () {
            $scope.spinner = true;
            $scope.currentImgIndex -= 1;
            $scope.imgToDisplay = allImages[$scope.dirnameToDisplay][$scope.currentImgIndex];
            $location.search('img', $scope.imgToDisplay);
            displayPrevAndNextBtn();
        };

        //useful for directices $apply
        $scope.showSpinner = function (value) {
            $scope.spinner = value;
        };

        function processImgRendering() {
            $scope.spinner = true;
            imgService.returnByDirname(
                function (data) {

                    resetScope();
                    allImages = data;

                    $scope.howManyImgInDir = data[$scope.dirnameToDisplay].length;

                    if (0 === $scope.howManyImgInDir) {
                        $scope.imgToDisplay = null;
                        $location.search({img: $scope.imgToDisplay});
                        $scope.alertNoImg = true;
                    } else {
                        displayPrevAndNextBtn();
                        $scope.imgToDisplay = data[$scope.dirnameToDisplay][$scope.currentImgIndex];
                        $location.search({img: $scope.imgToDisplay});
                    }


                }, $scope.dirnameToDisplay
            );
        }

        $scope.showimg = function () {
            processImgRendering();
        };
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
gallery.directive('bodyonload', function () {
    console.log('oui')
    ;
    return {
        restrict: 'A',
        link:     function (scope, element, attrs) {
            element.bind('load', function () {
                scope.$apply('showimg');
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
