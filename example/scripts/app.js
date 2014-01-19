angular.module('textcompleteApp', ['ngTextcomplete'])

.controller('textcompleteCtrl', ['$scope', function($scope) {
  $scope.members = ['fraserxu', 'Fraser', 'github', 'ng-textcomplete', 'jquery', 'wiredcraft', 'devops'];
}])

.directive('textcomplete', ['Textcomplete', '$log', '$rootScope', function(Textcomplete, $log, $rootScope) {
    return {
        restrict: 'EA',
        scope: {
            members: '=',
            message: '='
        },
        template: '<textarea ng-model=\'message\' type=\'text\'></textarea>',
        link: function(scope, iElement, iAttrs) {

            var mentions = scope.members;
            var ta = iElement.find('textarea');
            var textcomplete = new Textcomplete(ta, {
                mention: {
                    match: /(^|\s)@(\w*)$/,
                    search: function(term, callback) {
                        callback($.map(mentions, function(mention) {
                            return mention.toLowerCase().indexOf(term.toLowerCase()) === 0 ? mention : null;
                        }));
                    },
                    index: 2,
                    replace: function(mention) {
                        return '$1@' + mention + ' ';
                    }
                }
            });

            scope.$watch('message', function(aft, bef) {
                $log.log('watch message', scope.message);
            })

            $rootScope.$on('onSelect', function(event, data) {
                scope.message = data;
                $log.log('select message', scope.message)
            })
        }
    }
}])

;