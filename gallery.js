/*
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
(function () {
    'use strict';

    var gallery = angular.module('gallery', ['ngRoute']);

    gallery.config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider
                .when('/show/:dir?/:img?/:index?', {
                    templateUrl: 'process.html',
                    controller: 'mainctrl',
                    controllerAs: 'vm',
                    reloadOnSearch: false
                })
                .otherwise({
                    redirectTo: '/show',
                    templateUrl: 'process.html',
                    controller: 'mainctrl',
                    controllerAs: 'vm',
                });
        }]);

    gallery.controller('mainctrl', ['$scope', 'imgService', 'dirListService', '$routeParams', '$location', '$timeout',
        function ($scope, imgService, dirListService, $routeParams, $location, $timeout) {

            var vm = this;
            var dirNameFromRoute;
            var imgNameFromRoute;
            var indexFromRoute;
            var allImages;

            var setDirnameToDisplayFromRoute = function () {
                if ($routeParams.dir) {
                    dirNameFromRoute = $routeParams.dir;
                }

                vm.dirnameToDisplay = dirNameFromRoute;
            };

            var setImgToDisplayFromRoute = function () {
                if ($routeParams.img) {
                    imgNameFromRoute = $routeParams.img;
                } else {
                    imgNameFromRoute = null;
                }

                vm.imgToDisplay = imgNameFromRoute;
            };

            var setIndexToDisplayFromRoute = function () {
                if ($routeParams.index) {
                    indexFromRoute = parseInt($routeParams.index);
                } else {
                    indexFromRoute = 0;
                }

                vm.currentImgIndex = indexFromRoute;
            };

            var setLocationSearch = function () {
                $location.search({dir: dirNameFromRoute, img: vm.imgToDisplay, index: vm.currentImgIndex});
            };

            var displayPrevAndNextBtn = function () {
                vm.showPrevButton = vm.currentImgIndex > 0;
                vm.showNextButton = vm.currentImgIndex < vm.howManyImgInDir - 1;
            };

            var processImgRendering = function () {
                $timeout(function () {
                    imgService.async(dirNameFromRoute).then(function (data) {
                        allImages = data;
                        vm.howManyImgInDir = data[dirNameFromRoute].length;

                        if (0 === vm.howManyImgInDir) {
                            vm.alertNoImg = true;
                        } else {
                            displayPrevAndNextBtn();
                            vm.imgToDisplay = data[dirNameFromRoute][vm.currentImgIndex];
                            setLocationSearch();
                        }

                        vm.spinner = false;
                    });
                });
            };

            dirListService.async().then(function (data) {
                vm.dirlist = data;
            });

            angular.element(document).ready(function () {
                if (dirNameFromRoute) {
                    vm.resetScope();
                    processImgRendering()
                }
            });

            angular.forEach(['$routeChangeSuccess', '$routeUpdate'], function (value) {
                $scope.$on(value, function () {
                    setDirnameToDisplayFromRoute();
                    setIndexToDisplayFromRoute();
                    setImgToDisplayFromRoute();
                });
            });

            vm.resetScope = function () {
                setDirnameToDisplayFromRoute();
                vm.howManyImgInDir = 0;
                setIndexToDisplayFromRoute();
                setImgToDisplayFromRoute();
                vm.alertNoImg = false;
            };

            vm.showNextImg = function () {
                vm.spinner = true;
                vm.currentImgIndex += 1;
                vm.imgToDisplay = allImages[dirNameFromRoute][vm.currentImgIndex];
                setLocationSearch();
                displayPrevAndNextBtn();
            };

            vm.showPrevImg = function () {
                vm.spinner = true;
                vm.currentImgIndex -= 1;
                vm.imgToDisplay = allImages[dirNameFromRoute][vm.currentImgIndex];
                setLocationSearch();
                displayPrevAndNextBtn();
            };

            vm.showSpinner = function (value) {
                vm.spinner = value;
            };

            vm.displayGallery = function () {
                vm.resetScope();
                vm.spinner = true;
                processImgRendering();
            };

        }]);

    gallery.directive('imageonload', function () {
        return {
            restrict: 'A',
            link: function (scope, element) {
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

})();
