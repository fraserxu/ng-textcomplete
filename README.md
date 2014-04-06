## ng-textcomplete

Github like autocompleter in any textarea for angularjs. This module is build on top of [jquery-textcomplete](https://github.com/yuku-t/jquery-textcomplete), build for angularjs app. For demo you may check the [example folder](https://github.com/fraserxu/ng-textcomplete/tree/master/example).

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

```javascript
angular.module('myApp', ['ngTextcomplete'])

.directive('textcomplete', ['Textcomplete', function(Textcomplete) {
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
            var textcomplete = new Textcomplete(ta, [
              {
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
            ]);

            $(textcomplete).on({
              'textComplete:select': function (e, value) {
                scope.$apply(function() {
                  scope.message = value
                })
              },
              'textComplete:show': function (e) {
                $(this).data('autocompleting', true);
              },
              'textComplete:hide': function (e) {
                $(this).data('autocompleting', false);
              }
            });
        }
    }
}]);
```

And in your template, use it like this:
```
<textcomplete members='members' message='message'></textcomplete>
```

You can also use it in any element with a `contenteditable` attribute set to `true`
```
<div textcomplete members='members' message='message' contenteditable='true'></div>
```


### Install with Bower

Note that the ng-textcomplete bower package contains no AngularJS dependency.

`$ bower install ng-textcomplete`

This module is still way far from being perfect, but is ready for production.
You can use it in your project. And anytime you think it's not good and want to
improve it, a **pull request** is more than welcome.

### Build
```
$ npm install uglify-js -g
$ uglifyjs ng-textcomplete.js > ng-textcomplete.min.js
```

### Contributor
* [lpsBetty](https://github.com/lpsBetty)
