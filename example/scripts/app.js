angular.module('textcompleteApp', ['ngTextcomplete'])

.controller('textcompleteCtrl', ['$scope', function($scope) {
  $scope.members = ['fraserxu/13', 'github/23', 'ngTextcomplete/23', 'github/32', 'github/12', 'github/45'];
}]);