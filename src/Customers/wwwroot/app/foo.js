System.register([], function(exports_1) {
    var Foo;
    return {
        setters:[],
        execute: function() {
            Foo = (function () {
                function Foo() {
                }
                Foo.prototype.bar = function () {
                    return 0;
                };
                return Foo;
            })();
            exports_1("Foo", Foo);
        }
    }
});
