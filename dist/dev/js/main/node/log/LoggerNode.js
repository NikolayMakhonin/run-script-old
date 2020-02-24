"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

exports.__esModule = true;
exports.logger = exports.LoggerNode = void 0;

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/map"));

var _concat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/concat"));

var _construct2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/construct"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/filter"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/getPrototypeOf"));

var _get2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/get"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/inherits"));

var _CombineLogHandlers = require("../../common/log/CombineLogHandlers");

var _contracts = require("../../common/log/contracts");

var _EmitEventHandler = require("../../common/log/EmitEventHandler");

var _Logger2 = require("../../common/log/Logger");

var _WriteToConsoleHandler = require("../../common/log/WriteToConsoleHandler");

var _SendLogHandlerNode = require("./SendLogHandlerNode");

var _WriteToFileHandler = require("./WriteToFileHandler");

var LoggerNode =
/*#__PURE__*/
function (_Logger) {
  (0, _inherits2.default)(LoggerNode, _Logger);

  function LoggerNode() {
    (0, _classCallCheck2.default)(this, LoggerNode);
    return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(LoggerNode).apply(this, arguments));
  }

  (0, _createClass2.default)(LoggerNode, [{
    key: "init",
    value: function init(_ref) {
      var _context,
          _this = this;

      var appName = _ref.appName,
          appVersion = _ref.appVersion,
          logDir = _ref.logDir,
          logFileName = _ref.logFileName,
          logUrls = _ref.logUrls,
          _ref$writeToConsoleLe = _ref.writeToConsoleLevels,
          writeToConsoleLevels = _ref$writeToConsoleLe === void 0 ? _contracts.LogLevel.Any : _ref$writeToConsoleLe,
          _ref$writeToFileLevel = _ref.writeToFileLevels,
          writeToFileLevels = _ref$writeToFileLevel === void 0 ? _contracts.LogLevel.Fatal | _contracts.LogLevel.Error | _contracts.LogLevel.Warning | _contracts.LogLevel.UserError | _contracts.LogLevel.UserWarning : _ref$writeToFileLevel,
          _ref$sendLogLevels = _ref.sendLogLevels,
          sendLogLevels = _ref$sendLogLevels === void 0 ? _contracts.LogLevel.Fatal | _contracts.LogLevel.Error | _contracts.LogLevel.Warning | _contracts.LogLevel.UserError | _contracts.LogLevel.UserWarning : _ref$sendLogLevels,
          _ref$emitEventLevels = _ref.emitEventLevels,
          emitEventLevels = _ref$emitEventLevels === void 0 ? _contracts.LogLevel.Any : _ref$emitEventLevels,
          filter = (0, _filter.default)(_ref),
          appState = _ref.appState;
      this.logUnhandledErrors();
      (0, _get2.default)((0, _getPrototypeOf2.default)(LoggerNode.prototype), "_init", this).call(this, {
        appName: appName,
        appVersion: appVersion,
        handlers: [new _WriteToConsoleHandler.WriteToConsoleHandler(this, writeToConsoleLevels), new _WriteToFileHandler.WriteToFileHandler(this, writeToFileLevels, _WriteToFileHandler.path.resolve(logDir), logFileName), logUrls && logUrls.length && (0, _construct2.default)(_CombineLogHandlers.CombineLogHandlers, (0, _concat.default)(_context = [this]).call(_context, (0, _map.default)(logUrls).call(logUrls, function (logUrl) {
          return new _SendLogHandlerNode.SendLogHandlerNode(_this, sendLogLevels, logUrl);
        }))), new _EmitEventHandler.EmitEventHandler(this, emitEventLevels)],
        filter: filter,
        appState: appState
      });
    }
  }, {
    key: "logUnhandledErrors",
    value: function logUnhandledErrors() {
      var _this2 = this;

      process.on('unhandledRejection', function () {
        var _context2;

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        _this2.error.apply(_this2, (0, _concat.default)(_context2 = ['process.unhandledRejection']).call(_context2, args));
      }).on('uncaughtException', function () {
        var _context3;

        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        _this2.error.apply(_this2, (0, _concat.default)(_context3 = ['process.uncaughtException']).call(_context3, args));
      });
    }
  }]);
  return LoggerNode;
}(_Logger2.Logger);

exports.LoggerNode = LoggerNode;
var logger = new LoggerNode();
exports.logger = logger;