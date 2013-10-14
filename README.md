A wrapper on top of [jquery-textcomplete](https://github.com/yuku-t/jquery-textcomplete), build for angularjs app

### Dependencies

* [jQuery](http://jquery.com) (>= 1.7.0) OR Zepto (>= 1.0)
* [AngularJS](http://angularjs.org) v1.0.1+


### Gettting started

jQuery MUST be loaded ahead.

```javascript
<script src="path/to/jquery.js"></script>
```

Include ng-textcomplete module script with AngularJS script on your page.

```javascript
<script src="//ajax.googleapis.com/ajax/libs/angularjs/1.1.5/angular.min.js"></script>
<script src="https://raw.github.com/fraserxu/ng-textcomplete/master/ng-textcomplete.js"></script>
```

Add textcomplete to your app module's dependency.

```
angular.module('myApp', ['ngTextcomplete'])

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
}]);
```

And in your template, use it like this:
```
<textcomplete ng-model='members'></textcomplete>
```

### Install with Bower

Note that the ng-textcomplete bower package contains no AngularJS dependency.

```
# install AngularJS (stable)
bower install angular
# or (unstable)
bower install PatternConsulting/bower-angular

# install ng-textcomplete
bower install ng-textcomplete
```