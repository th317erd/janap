// (c) 2016 Wyatt Greenway
// This code is licensed under MIT license (see LICENSE.txt for details)

(function(factory) {
  module.exports = factory({});
})(function(root) {
  function ArgumentParserContinue(val) {
    this.value = val;
  }

  ArgumentParserContinue.prototype = {
    constructor: ArgumentParserContinue
  };

  function getType(val) {
    if (val === undefined || val === null)
      return 'undefined';

    if (val === Boolean || val === 'boolean' || val === 'bool' || val instanceof Boolean)
      return 'boolean';

    if (val === Array || val === 'array' || val instanceof Array)
      return (val instanceof Array) ? ('array:' + getType(val[0])) : 'array';

    if (val === Number || val === 'number' || val instanceof Number)
      return 'number';

    if (val === String || val === 'string' || val instanceof String)
      return 'string';

    return val;
  }

  function ArgumentConverter() {
    this.index = 0;
    this.name = '';
    this.context = {};
    this.options = {};
    this.super = root.ArgumentConverter.prototype;
  }

  ArgumentConverter.prototype = {
    constructor: ArgumentConverter,
    continue: function(value) {
      return new ArgumentParserContinue(value);
    },
    coerce: function(value) {
      var number = parseFloat(value);
      if (!isNaN(number) && isFinite(number))
        return number;

      if (('' + value).match(/(true|yes)/i))
        return true;

      if (('' + value).match(/(false|no)/i))
        return false;

      if (value === undefined)
        return true;

      return value;
    },
    toNumber: function(value) {
      var number = parseFloat(value);
      if (!isNaN(number) && isFinite(number))
        return number;

      return 0;
    },
    toBoolean: function(value) {
      if (('' + value).match(/(true|yes)/i))
        return true;

      if (('' + value).match(/(false|no)/i))
        return false;

      return true;
    },
    convertValue: function(_value, _type) {
      var type  = _type || 'undefined';
      var value = _value;

      if (type === 'boolean') {
        return this.toBoolean(value);
      } else if (type === 'number') {
        return this.toNumber(value);
      } else if (type === 'string') {
        return value;
      } else if (type.match(/^array/)) {
        var typeParts = type.split(/:/g);
        var subType   = '' + typeParts[1];

        if (('' + value).match(/^\s*\[/)) {
          var parts       = ('' + value).trim().replace(/^.*?\[/,'').replace(/\].*$/,'').split(/[\s,]+\s*/g);
          var finalArray  = [];

          for (var i = 0, il = parts.length; i < il; i++)
            finalArray.push(this.convertValue(parts[i], subType));

          value = finalArray;
        }

        if (!(value instanceof Array))
          value = this.convertValue(value, subType);

        if (!(value instanceof Array))
          value = [value];

        var currentValue = this.get(this.name);
        if (currentValue === undefined)
          return this.continue(value);
        else if (currentValue === true)
          currentValue = [];

        return this.continue(currentValue.concat(value));
      } else {
        return this.coerce(value);
      }
    },
    convert: function(value) {
      var name  = this.name;
      var type  = getType(this.options[name]);

      return this.convertValue(value, type);
    },
    set: function(name, value) {
      this.context[name] = value;
    },
    get: function(name) {
      return this.context[name];
    }
  };

  function match(previous, arg) {
    return ('' + arg).match(/^--?([\w-]+)(?:=(.*))?$/);
  }

  function alias(key, aliases) {
    var alias = aliases[key];
    return (!alias) ? key : alias;
  }

  function parse(_args, _opts) {
    var opts      = _opts || {};
    var json      = {};
    var args      = _args;
    var initial   = opts._initial;
    var key       = undefined;
    var value     = undefined;
    var indexKey  = 0;
    var converter = opts._converter;
    var defaults  = opts._defaults;

    if (!args || !args.length)
      return json;

    if (!(converter instanceof root.ArgumentConverter) && converter instanceof Function)
      converter = new converter();
    else if (!converter)
      converter = new root.ArgumentConverter();

    converter.options = opts;
    converter.context = json;

    for (var i = 0, il = args.length; i < il; i++) {
      var arg = args[i];

      if (initial !== false && i === 0) {
        json._env = arg;
        continue;
      } else if (initial !== false && i === 1) {
        json._entry = arg;
        continue;
      }

      converter.index = i;

      var parts = root.match.call(json, key, arg);
      if (!parts) {
        if (key) {
          value = arg;
        } else {
          json[indexKey++] = arg;
          continue;
        }
      } else {
        if (key && json[key] === undefined)
          json[key] = true;

        key = parts[1];
        key = root.alias.call(json, key, opts._alias || {});
        converter.name = key;

        if (parts.length > 2 && parts[2] !== undefined) {
          value = converter.convert(parts[2]);

          json[key] = (value instanceof ArgumentParserContinue) ? value.value : value;

          key = undefined;
        } else {
          if (!json.hasOwnProperty(key))
            json[key] = undefined;
        }

        value = undefined;
        continue;
      }

      converter.name = (!key) ? i : key;
      value = converter.convert(value);

      if (!key) {
        json[indexKey++] = (value instanceof ArgumentParserContinue) ? value.value : value;
      } else {
        if (value instanceof ArgumentParserContinue) {
          json[key] = value.value;
          value = undefined;
          continue;
        }

        json[key] = value;
        key = undefined;
      }

      value = undefined;
    }

    if (key && json[key] === undefined)
      json[key] = true;

    var defaultKeys = Object.keys(defaults || {});
    for (var i = 0, il = defaultKeys.length; i < il; i++) {
      var defaultKey = defaultKeys[i];
      if (json[defaultKey] === undefined)
        json[defaultKey] = defaults[defaultKey];
    }

    return json;
  }

  root.ArgumentConverter = ArgumentConverter;
  root.match = match;
  root.alias = alias;
  root.parse = parse;

  return root;
});
