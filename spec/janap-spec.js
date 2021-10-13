const Janap = require('../index.js');

describe("Janap", function() {
  const base = [ 'empty', 'empty' ];

  it("should be able to parse a single boolean flag", function() {
    var result = Janap.parse(base.concat('--bool'), {
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

    result = Janap.parse(base.concat('--bool=true'), {
      _defaults: {
        bool: false,
      },
      bool: Boolean,
    });

    expect(result['bool']).toBe(true);
  });
});
