# janap

Just Another Node Argument Parser is a super small and super flexible command line argument parser for node

I wrote this because all other argument parsers out there were large, had dependencies, or didn't allow customization

# Install
```bash
npm install janap
```

# Use
```javascript
var janap = require('janap');
var args = janap.parse(process.argv);

//args contain parsed arguments
//i.e. node myscript.js --arg1=false --boolean -hello world
// = {arg1: false, boolean: true, hello: "world"}
```

# Skip Initial parsing (argument 0 and 1)
```javascript
var janap = require('janap');
var args = janap.parse(process.argv.slice(2), {
  _initial: false
});
```

# Data Types
With janap you can force a data type per-argument:
```javascript
var janap = require('janap');
var args = janap.parse(process.argv, {
  force: Boolean,
  count: Number,
  paths: Array
});

//note: you can also use strings such as "bool", "boolean", "number", "array", or something custom
```

# Aliases
```javascript
var janap = require('janap');
var args = janap.parse(process.argv, {
  _alias: {
    'o': 'option'
  }
});

//Arguments of "--o=value" or "-o value" will result in "args" object of {option: value}
```

# Customize
janap was built with customization in mind. You can override 'match' to specify your own argument format:
```javascript
var janap = require('janap');
janap.match = function(arg) {
  //We want triple dashes on our arguments
  //the second match is always the value
  //i.e. ---argument=value
  return ('' + arg).match(/^---([\w-]+)(?:=(.*))?$/);
}

var args = janap.parse(process.argv);
```

# Custom type converters
With janap you can specify custom type converters. Just pass in a "_converter" key to the options object to specify your own custom converter:
```javascript    
var janap = require('janap');

function MyArgumentConverter() {
  janap.ArgumentConverter.call();
}

var p = MyArgumentConverter.prototype = Object.create(ArgumentConverter.prototype);
p.constructor = MyArgumentConverter;
p.convertValue = function(value, type) {
  if (this.name === 'my-special-case-argument')
    return 'some other value';

  //Custom data-type, specified through {'my-argument': 'custom'} in the options object
  if (type === 'custom')
    return myCustomValueConverter(value);

  if (type === 'number')
    return this.toNumber(value);

  if (type === 'boolean')
    return this.toBoolean(value);

  //this.continue tells the parser to use this value,
  //but continue onto with the next argument using the same "name" / key
  if (type === 'array') {
    var currentValue = this.get(this.name);
    if (currentValue === undefined) {
      //Not set yet
      return this.continue([value]);
    }

    return this.continue(currentValue.concat(value));
  }

  if (this.name === 'do-stuff') {
    //This adds/sets an argument called "doStuffRequested" to true in the final arguments object
    this.set('doStuffRequested', true);
    return value;
  }

  //Default value converter
  //super is a convenience helper that is always set to "ArgumentConverter.prototype"
  return this.super.convertValue(value, type);
};

var args = janap.parse(process.argv, {
  _converter: new MyArgumentConverter()
});
```

# Enjoy! :)