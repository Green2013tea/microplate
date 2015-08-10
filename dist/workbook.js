'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _xlsx = require('xlsx');

var _xlsx2 = _interopRequireDefault(_xlsx);

var _sheetJs = require('./sheet.js');

var Workbook = (function () {
    function Workbook() {
        var sheets = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, Workbook);

        if (sheets instanceof Array) {
            this.sheets = {};
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = sheets[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var sheet = _step.value;

                    sheets[sheet.name] = sheet;
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator['return']) {
                        _iterator['return']();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        } else {
            this.sheets = sheets;
        }
    }

    _createClass(Workbook, [{
        key: 'sheet',
        value: function sheet(name) {
            return this.sheets[name];
        }
    }, {
        key: 'sheetNames',
        value: function sheetNames() {
            return Object.keys(this.sheets);
        }
    }, {
        key: 'toBlob',
        value: function toBlob() {
            var workbook = {
                SheetNames: this.sheetNames(),
                Sheets: {}
            };

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = workbook.SheetNames[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var _name = _step2.value;

                    workbook.Sheets[_name] = this.sheets[_name].toXLSXSheet();
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                        _iterator2['return']();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            var s = _xlsx2['default'].write(workbook, {
                bookType: 'xlsx',
                bookSST: false,
                type: 'binary'
            });

            var buffer = new ArrayBuffer(s.length);
            var view = new Uint8Array(buffer);
            for (var i = 0; i != s.length; ++i) {
                view[i] = s.charCodeAt(i) & 0xFF;
            }

            return new Blob([buffer], { type: "application/octet-stream" });
        }
    }, {
        key: Symbol.iterator,
        value: regeneratorRuntime.mark(function value() {
            var _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, _name2;

            return regeneratorRuntime.wrap(function value$(context$2$0) {
                while (1) switch (context$2$0.prev = context$2$0.next) {
                    case 0:
                        _iteratorNormalCompletion3 = true;
                        _didIteratorError3 = false;
                        _iteratorError3 = undefined;
                        context$2$0.prev = 3;
                        _iterator3 = this.sheetNames()[Symbol.iterator]();

                    case 5:
                        if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                            context$2$0.next = 12;
                            break;
                        }

                        _name2 = _step3.value;
                        context$2$0.next = 9;
                        return this.sheets[_name2];

                    case 9:
                        _iteratorNormalCompletion3 = true;
                        context$2$0.next = 5;
                        break;

                    case 12:
                        context$2$0.next = 18;
                        break;

                    case 14:
                        context$2$0.prev = 14;
                        context$2$0.t0 = context$2$0['catch'](3);
                        _didIteratorError3 = true;
                        _iteratorError3 = context$2$0.t0;

                    case 18:
                        context$2$0.prev = 18;
                        context$2$0.prev = 19;

                        if (!_iteratorNormalCompletion3 && _iterator3['return']) {
                            _iterator3['return']();
                        }

                    case 21:
                        context$2$0.prev = 21;

                        if (!_didIteratorError3) {
                            context$2$0.next = 24;
                            break;
                        }

                        throw _iteratorError3;

                    case 24:
                        return context$2$0.finish(21);

                    case 25:
                        return context$2$0.finish(18);

                    case 26:
                    case 'end':
                        return context$2$0.stop();
                }
            }, value, this, [[3, 14, 18, 26], [19,, 21, 25]]);
        })
    }], [{
        key: 'fromFile',
        value: function fromFile(file) {
            var workbook = _xlsx2['default'].read(file, { type: 'binary' });
            var sheets = {};

            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = workbook.SheetNames[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var _name3 = _step4.value;

                    sheets[_name3] = new _sheetJs.Sheet(workbook.Sheets[_name3], _name3);
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4['return']) {
                        _iterator4['return']();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }

            return new Workbook(sheets);
        }
    }]);

    return Workbook;
})();

exports.Workbook = Workbook;