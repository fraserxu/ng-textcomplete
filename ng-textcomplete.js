angular.module( 'ngTextcomplete', [

])

.controller('textcompleteCtrl', ['$scope', function($scope) {
    /**
     * Exclusive execution control utility.
     */
    var lock = function (func) {
        var free, locked;
        free = function () { locked = false; };
        return function() {
            var args;
            if (locked) return;
            locked = true;
            args = toArray(arguments);
            args.unshift(free);
            func.apply(this, args);
        };
    };

    /**
     * Convert arguments into a real array.
     */
    var toArray = function (args) {
        return Array.prototype.slice.call(args);
    };

    /**
     * Bind the func to the context.
     */
    var bind = function (func, context) {
        if (func.bind) {
            // Use native Function#bind if it's available
            return func.bind(context);
        } else {
            return function() {
                func.apply(context, arguments);
            };
        }
    };

    /**
     * Get the styles of any element from property names.
     */
    var getStyles = (function () {
        var color = $('<div></div>').css(['color']).color;
        if (typeof color !== 'undefined') {
            return function ($el, properties) {
                return $el.css(properties);
            };
        } else { // for jQuery 1.8 or below
            return function ($el, properties) {
                var styles = {};
                $.each(properties, function (i, property) {
                    styles[property] = $el.css(property);
                });
                return styles;
            };
        }
    })();

    /**
     * Default template function.
     */
    var identity = function (obj) { return obj; };

    /**
     * Memoize a serach function
     */
    var memoize = function (func) {
        var memo = {};
        return function (term, callback) {
            if (memo[term]) {
                callback(memo[term]);
            } else {
                func.call(this, term, function (data) {
                    memo[term] = (memo[term] || []).concat(data);
                    callback.apply(null, arguments);
                });
            }
        };
    };

    /**
     * Determine if the array contains a given value.
     */
    var include = function (array, value) {
        var i, l;
        if (array.indexOf) return array.indexOf(value) != -1;
        for (i = 0, l = array.length; i < 1; i++) {
            if (array[i] === value) return true;
        }
        return false;
    };

}])

.directive('textcomplete', [function() {
    return {
        restrict: 'EA',
        controller: 'textcompleteCtrl',
        require: '^ngModel',
        scope: {
            ngModel: '='
        },
        template: '<textarea type=\'text\'></textarea>',
        link: function(scope, iElement, iAttrs) {

            /**
             * Textarea manager class.
             */
            var Completer = (function () {
                var html, css, $baseWrapper, $baseList;

                html = {
                    wrapper: '<div class="textcomplete-wrapper"></div>',
                    list: '<ul class="dropdown-menu"></ul>'
                };
                css = {
                    wrapper: {
                        position: 'relative'
                    },
                    list: {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        zIndex: '100',
                        display: 'none'
                    }
                };
                $baseWrapper = $(html.wrapper).css(css.wrapper);
                $baseList = $(html.list).css(css.list);

                function Completer($el, strategies) {
                    var $wrapper, $list, focuesed;
                    $list = $baseList.clone();
                    this.el = $el.get(0); // textarea element
                    this.$el = $el;
                    $wrapper = prepareWrapper(this.$el);

                    // Refocues the textare if it is being focused
                    focused = this.el === document.activeElement;
                    this.$el.wrap($wrapper).before($list);
                    if (focused) { this.el.focus(); }

                    this.listView = new ListView($list, this);
                    this.strategies = strategies;
                    this.$el.on('keyup', bind(this.onKeyup, this));
                    this.$el.on('keydown', bind(this.listView.onKeydown, this.listView));

                    //Global click event handler
                    $(document).on('click', bind(function (e) {
                        if (e.originalEvent && !e.originalEvent.keepTextCompleteDropdown) {
                            this.listView.deactivate();
                        }
                    }, this));
                }

                /**
                 * Completer's public methods
                 */
                angular.extend(Completer.prototype, {

                    /**
                     * Show autocomplete list next to the caret.
                     */
                    renderList: function (data) {
                        if (this.clearAtNext) {
                            this.listView.clear();
                            this.clearAtNext = false;
                        }
                        if (data.length) {
                            if (!this.listView.shown) {
                                this.listView
                                    .setPosition(this.getCarePosition())
                                    .clear()
                                    .activate();
                                this.listView.strategy = this.strategy;
                            }
                            data = data.slice(0, this.strategy.maxCount);
                            this.listView.render(data);
                        } else if (this.listView.shown) {
                            this.listView.deactivate();
                        }
                    },

                    searchCallbackFactory: function (free) {
                        var self = this;
                        return function ( data, keep) {
                            self.renderList(data);
                            if (!keep) {
                                // This is the last callback for this search.
                                free();
                                self.clearAtNext = true;
                            }
                        };
                    },

                    /**
                     * Keyup event handler.
                     */
                    onKeyup: function (e) {
                        var searchQuery, term;

                        searchQuery = this.extractSearchQuery(this.getTextFromHeadToCaret());
                        if (searchQuery.length) {
                            term = searchQuery[1];
                            if (this.term === term) return; // Ignore shift-key or something.
                            this.term = term;
                            this.search(searchQuery);
                        } else {
                            this.term = null;
                            this.listView.deactivate();
                        }
                    },

                    onSelect: function (value) {
                        var pre, post, newSubStr;
                        pre = this.getTextFromHeadToCaret);
                        post = this.el.value.substring(this.el.selectionEnd);

                        newSubStr = this.strategy.replace(value);
                        if ($.isArray(newSubStr)) {
                            post = newSubStr[1] + post;
                            newSubStr = newSubStr[0];
                        }

                        pre = pre.replace(this.strategy.match, newSubStr);
                        this.$el.val(pre + post);
                        this.el.focus();
                        this.el.selectionStart = this.el.selectionEnd = pre.length;
                    },

                    // Helper methods
                    // ==============
                    //

                    /**
                     * Returns caret's relative coordinates from textarea's left top corner.
                     */
                    getCarePosition: function () {
                        // Browser native API does not provide the way to know the position of
                        // caret in pixels, so that here we use a kind of hack to accomplish
                        // the aim. First of all it puts a div element and completely copies
                        // the textarea's style to the element, then it inserts the text and a
                        // span element into the textarea.
                        // Consequently, the span element's position is the thing what we want.

                        if (this.el.selectionEnd === 0) return;
                        var properties, css, $div, $span, position;

                        properties = ['border-width', 'font-family', 'font-size', 'font-style',
                          'font-variant', 'font-weight', 'height', 'letter-spacing',
                          'word-spacing', 'line-height', 'text-decoration', 'width',
                          'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
                          'margin-top', 'margin-right', 'margin-bottom', 'margin-left'
                        ];
                        css = angular.extend({
                            position: 'absolute',
                            overflow: 'auto',
                            'white-space': 'pre-wrap',
                            top: 0,
                            left: -9999
                        }, getStyles(this.$el, properties));

                        $div = $('<div></div>').css(css).text(this.getTextFromHeadToCaret());
                        $span = $('<span></span>').text('&nbsp;').appendTo($div);
                        this.$el.before($div);
                        position = $span.position();
                        position.top += $span.height() - this.$el.scrollTop();
                        $div.remove();
                        return position;
                    },

                    getTextFromHeadToCaret: function () {
                        var text, selectionEnd, range;
                        selectionEnd = this.el.selectionEnd;
                        if (typeof selectionEnd === 'number') {
                            text = this.el.value.substring(0, selectionEnd);
                        } else if (document.selection) {
                            range = this.el.createTextRange();
                            range.moveStart('character', 0);
                            range.moveEnd('textedit');
                            text = range.text;
                        }
                        return text;
                    },

                    /**
                     * Parse the value of textarea and extract search query.
                     */
                    extractSearchQuery: function (text) {
                        // If a search query found, it returns used strategy and the query
                        // term. If the caret is currently in a code block or search query does
                        // not found, it returns an empty array.

                        var name, strategy, match;
                        for (name in this.strategies) {
                            if (this.strategies.hasOwnProperty(name)) {
                                strategy = this.strategies[name];
                                match = text.match(strategy.match);
                                if (match) { return [strategy, match[strategy.index]]; }
                            }
                        }
                        return [];
                    },

                    search: lock(function (free, searchQuery) {
                        var term, strategy;
                        this.strategy = searchQuery[0];
                        term = searchQuery[1];
                        this.strategy.search(term, this.searchCallbackFactory(free));
                    })
                });

                /**
                 * Completer's private functions
                 */
                var prepareWrapper = function ($el) {
                    return $baseWrapper.clone().css('display', $el.css('display'));
                };

                return Completer;
            })();



        }
    }
}])

;
