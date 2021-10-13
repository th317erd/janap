const Janap = require('../index.js');

describe("Janap", function() {
  const base = [ 'empty', 'empty' ];

  it("should be able to parse an argument containing periods", function() {
    var result = Janap.parse(base.concat([ '--ip', '127.0.0.1', '--ip=192.168.1.1' ]), {
      ip: [String],
    });

    expect(result['ip']).toEqual([ '127.0.0.1', '192.168.1.1' ]);
  });

  it("should be able to parse a single boolean flag", function() {
    var result = Janap.parse(base.concat([ '--bool' ]), {
      _defaults: {
        bool: false,
      },
      bool: Boolean,
    });

    expect(result['bool']).toBe(true);

    result = Janap.parse(base, {
      _defaults: {
        bool: false,
      },
      bool: Boolean,
    });

    expect(result['bool']).toBe(false);

    result = Janap.parse(base.concat([ '--bool=true' ]), {
      _defaults: {
        bool: false,
      },
      bool: Boolean,
    });

    expect(result['bool']).toBe(true);
  });
});
