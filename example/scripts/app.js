angular.module('textcompleteApp', ['ngTextcomplete'])

.controller('textcompleteCtrl', ['$scope', function($scope) {
  $scope.members = ['fraserxu', 'github', 'ngTextcomplete', 'jquery', 'wiredcraft', 'devops'];
}])

.directive('textcomplete', ['$log', 'Textcomplete', function($log, Textcomplete) {
    return {
        restrict: 'EA',
        controller: 'textcompleteCtrl',
        require: '^ngModel',
        scope: {
            ngModel: '='
        },
        template: '<textarea type=\'text\'></textarea>',
        link: function(scope, iElement, iAttrs) {

            var mentions = scope.ngModel;
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
        }
    }
}])

;