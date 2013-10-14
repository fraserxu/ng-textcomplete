angular.module('textcompleteApp', ['ngTextcomplete'])

.controller('textcompleteCtrl', ['$scope', function($scope) {
  $scope.members = ['fraserxu', 'github', 'ng-textcomplete', 'jquery', 'wiredcraft', 'devops'];
}])

.directive('textcomplete', ['Textcomplete', '$log', '$rootScope', function(Textcomplete, $log, $rootScope) {
    return {
        restrict: 'EA',
        scope: {
            members: '='
        },
        template: '<textarea ng-model=\'message\' type=\'text\'></textarea>',
        link: function(scope, iElement, iAttrs) {

            var mentions = scope.members;
            var ta = iElement.find('textarea');
            var textcomplete = new Textcomplete(ta, {
                html: {
                    match: /\B@(\w*)$/,
                    search: function(term, callback) {
                        callback($.map(mentions, function(mention) {
                            return mention.indexOf(term) === 0 ? mention : null;
                        }));
                    },
                    index: 1,
                    replace: function(mention) {
                        return '@' + mention + ' ';
                    }
                }
            });

            scope.$watch('message', function(aft, bef) {
                if(aft != bef) $rootScope.message = aft;
            })
        }
    }
}])

;