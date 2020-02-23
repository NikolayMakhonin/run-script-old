"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

exports.__esModule = true;
exports.Node = exports.NodeType = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs3/regenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/classCallCheck"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/getPrototypeOf"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/inherits"));

var _index = require("webrain/src/main/common/index.ts");

var _common = require("./common");

var _nodeStyles;

var NodeType;
exports.NodeType = NodeType;

(function (NodeType) {
  NodeType["Unknown"] = "Unknown";
  NodeType["Object"] = "Object";
  NodeType["ObservableClass"] = "ObservableClass";
  NodeType["Connector"] = "Connector";
  NodeType["CalcProperty"] = "CalcProperty";
})(NodeType || (exports.NodeType = NodeType = {}));

var nodeStyles = (_nodeStyles = {
  common: function common(_ref) {
    var opacity = _ref.opacity;
    return {
      borderWidth: 1,
      borderWidthSelected: 2,
      shape: 'box',
      color: {},
      font: {
        color: (0, _common.colorOpacity)('#000000', opacity)
      },
      value: 1,
      scaling: {
        min: 10,
        max: 10,
        label: {
          enabled: true,
          min: 10,
          max: 10,
          maxVisible: 80,
          drawThreshold: 5
        }
      },
      error: {
        scale: 5,
        borderWidth: 1,
        borderWidthSelected: 2,
        color: {
          background: '#ff5555',
          border: '#ff0000',
          text: '#ffffff'
        },
        scaling: {
          max: 30,
          label: {
            max: 30
          }
        }
      }
    };
  }
}, _nodeStyles[NodeType.Unknown] = function (_ref2) {
  var opacity = _ref2.opacity;
  return {
    color: {
      background: (0, _common.colorOpacity)('#cccccc', opacity),
      border: (0, _common.colorOpacity)('#777777', opacity),
      highlight: {
        background: (0, _common.colorOpacity)('#cccccc', opacity),
        border: (0, _common.colorOpacity)('#777777', opacity)
      }
    },
    font: {
      color: (0, _common.colorOpacity)('#555555', opacity)
    }
  };
}, _nodeStyles[NodeType.Object] = function (_ref3) {
  var opacity = _ref3.opacity;
  return {
    color: {
      background: (0, _common.colorOpacity)('#ffffff', opacity),
      border: (0, _common.colorOpacity)('#000000', opacity),
      highlight: {
        background: (0, _common.colorOpacity)('#ffffff', opacity),
        border: (0, _common.colorOpacity)('#000000', opacity)
      }
    },
    font: {
      color: (0, _common.colorOpacity)('#000000', opacity)
    }
  };
}, _nodeStyles[NodeType.ObservableClass] = function (_ref4) {
  var opacity = _ref4.opacity;
  return {
    color: {
      background: (0, _common.colorOpacity)('#ccccff', opacity),
      border: (0, _common.colorOpacity)('#0000ff', opacity),
      highlight: {
        background: (0, _common.colorOpacity)('#ccccff', opacity),
        border: (0, _common.colorOpacity)('#0000ff', opacity)
      }
    },
    font: {
      color: (0, _common.colorOpacity)('#000000', opacity)
    }
  };
}, _nodeStyles[NodeType.Connector] = function (_ref5) {
  var opacity = _ref5.opacity;
  return {
    color: {
      background: (0, _common.colorOpacity)('#7777ff', opacity),
      border: (0, _common.colorOpacity)('#0000ff', opacity),
      highlight: {
        background: (0, _common.colorOpacity)('#7777ff', opacity),
        border: (0, _common.colorOpacity)('#0000ff', opacity)
      }
    },
    font: {
      color: (0, _common.colorOpacity)('#ffffff', opacity)
    }
  };
}, _nodeStyles[NodeType.CalcProperty] = function (_ref6) {
  var opacity = _ref6.opacity;
  return {
    color: {
      background: (0, _common.colorOpacity)('#ffff00', opacity),
      border: (0, _common.colorOpacity)('#000000', opacity),
      highlight: {
        background: (0, _common.colorOpacity)('#ffff00', opacity),
        border: (0, _common.colorOpacity)('#000000', opacity)
      }
    },
    font: {
      color: (0, _common.colorOpacity)('#000000', opacity)
    }
  };
}, _nodeStyles);

var Node =
/*#__PURE__*/
function (_ObservableClass) {
  (0, _inherits2.default)(Node, _ObservableClass);
  (0, _createClass2.default)(Node, [{
    key: "edgesCount",
    get: function get() {
      return this.edgesCountIn + this.edgesCountOut;
    }
  }]);

  function Node(_ref7) {
    var _this;

    var id = _ref7.id,
        object = _ref7.object,
        key = _ref7.key,
        keyType = _ref7.keyType;
    (0, _classCallCheck2.default)(this, Node);
    _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(Node).call(this));
    _this.valueHistory = [];
    _this.edgesCountIn = 0;
    _this.edgesCountOut = 0;
    _this.id = id;
    _this.object = object;
    _this.key = key;
    _this.keyType = keyType;

    if (object instanceof _index.PropertyChangedObject) {
      _this.type = NodeType.ObservableClass;
    } else if (object && object.constructor === Object) {
      _this.type = NodeType.Object;
    } else {
      _this.type = NodeType.Unknown;
    }

    return _this;
  }

  (0, _createClass2.default)(Node, [{
    key: "getVisData",
    value: function getVisData(_ref8) {
      var opacity = _ref8.opacity,
          age = _ref8.age;
      var value = this._visData;

      if (!value) {
        this._visData = value = new _common.WebrainObject();
        value.name = 'Node.WebrainObject' + _common.WebrainGraphObjectsId;
        value.id = this.id;
        value.title = this.id;
      }

      var label = this.name;

      if (this.key != null) {
        label += '.' + this.key;
      }

      value.label = label + '\r\n' + age;

      if (this.type != null) {
        var common = nodeStyles.common({
          opacity: opacity
        });
        var specific = nodeStyles[this.type]({
          opacity: opacity
        });
        var style = (0, _common.deepMerge)({
          fill: true
        }, {}, common, specific, this.error ? common.error : void 0, this.error ? specific.error : void 0);

        for (var key in style) {
          if (Object.prototype.hasOwnProperty.call(style, key)) {
            value[key] = (0, _common.deepMerge)({
              fill: false
            }, value[key], style[key]);
          }
        }
      }

      return value;
    }
  }]);
  return Node;
}(_index.ObservableClass);

exports.Node = Node;
new _index.CalcObjectBuilder(Node.prototype).writable('name').writable('type').writable('value', {
  setOptions: {
    equalsFunc: function equalsFunc() {
      return false;
    },
    afterChange: function afterChange(value) {
      this.valueHistory.push(value);

      if (this.valueHistory.length > _common.VALUE_HISTORY_MAX_SIZE) {
        delete this.valueHistory[this.valueHistory.length - _common.VALUE_HISTORY_MAX_SIZE - 1];
      }
    }
  }
}).writable('error').calc('updateId', function (o) {
  return o;
}, // connect to self
(0, _index.calcPropertyFactory)({
  name: 'Node.updateId' + _common.WebrainGraphObjectsId,
  dependencies: function dependencies(d) {
    return d.invalidateOn(function (b) {
      return b.noAutoRules().propertyPredicate(function (p) {
        return p !== 'visData' && p !== 'updateId';
      }, '!visData && !updateId');
    });
  },
  calcFunc:
  /*#__PURE__*/
  _regenerator.default.mark(function calcFunc(state) {
    return _regenerator.default.wrap(function calcFunc$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            state.value = _common.updateId[0]++;

          case 1:
          case "end":
            return _context.stop();
        }
      }
    }, calcFunc);
  })
}));