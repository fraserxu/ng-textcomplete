angular.module( 'ngTextcomplete', [

])

.controller('textcompleteCtrl', ['$scope', function($scope) {

}])

.directive('textcomplete', [function() {
    return {
        restrict: 'EA',
        controller: 'textcompleteCtrl',
        require: '^ngModel',
        scope: {
            ngModel: '='
        },
        template: '<textarea type='text'></textarea>',
        link: function(scope, iElement, iAttrs) {
            var mentions = [];
            var ta = iElement.find('textarea');
            ta.on('click', function() {
                angular.forEach(scope.roommebers, function(value, index) {
                    mentions.push(value.nick);
                })
            })
            ta.textcomplete({
                html: {
                    match: /\B@(\w*)$/,
                    search: function (term, callback) {
                        callback($.map(mentions, function (mention) {
                            return mention.indexOf(term) === 0 ? mention : null;
                        }));
                    },
                    index: 1,
                    replace: function (mention) {
                        return '@' + mention + ' ';
                    }
                }
            });
        }
    }
}])

;
