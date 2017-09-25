const SearchString = require('../lib/search-string')
const SearchStrings = require('../lib/search-strings')
const SearchStringParser = require('../lib/search-string-parser')

describe('search-string-value-parser', () => {
  const parser = new SearchStringParser()
  const patternMatchTest = patternName => testObject => {
    describe(patternName, () => {
      const regexp = new RegExp('^' + parser[patternName])
      for (const string of Object.keys(testObject)) {
        it(
          string,
          () => testObject[string]
            ? expect(regexp.exec(string)[0]).toMatch(testObject[string])
            : expect(regexp.exec(string)).toBeNull()
        )
      }
    })
  }
  const parseTest = testObject => {
    for (const string of Object.keys(testObject)) {
      it(
        string,
        () => expect(parser.parse(string)).toEqual(testObject[string])
      )
    }
  }
  const parseTestAsync = testObject => {
    for (const string of Object.keys(testObject)) {
      it(
        string,
        () => expect(parser.parseAsync(string)).resolves.toEqual(testObject[string])
      )
    }
  }
  const makeSearchStrings = (...sources) => {
    return sources.reduce((searchStrings, source) => {
      return searchStrings.push(
        source instanceof SearchStrings
          ? source
          : new SearchString[source[0]](source[1])
      )
    }, new SearchStrings())
  }
  const mixedString = 'foo \'bar\' AND "baz" OR qux | quux NOT alpha -bravo charlie:delta ("echo" AND foxtrot OR (golf \'hotel\') -india)'
  const mixedReturn = makeSearchStrings(
    ['Word', 'foo'],
    ['SingleQuotes', 'bar'],
    ['DoubleQuotes', { value: 'baz', operator: 'or' }],
    ['Word', { value: 'qux', operator: 'or' }],
    ['Word', { value: 'quux', operator: 'or' }],
    ['Word', { value: 'alpha', operator: 'not' }],
    ['Word', { value: 'bravo', operator: 'not' }],
    ['Word', { field: 'charlie', value: 'delta' }],
    makeSearchStrings(
      ['DoubleQuotes', 'echo'],
      ['Word', { value: 'foxtrot', operator: 'or' }],
      makeSearchStrings(
        ['Word', { value: 'golf', operator: 'or' }],
        ['SingleQuotes', { value: 'hotel', operator: 'or' }],
      ),
      ['Word', { value: 'india', operator: 'not' }]
    )
  )
  const performanceTest = testObject => {
    for (const length of Object.keys(testObject)) {
      const longString = Array(length - 0).fill(mixedString).join(' ')
      const threshold = testObject[length]
      it(`${ length }, ${ threshold }msec`, () => {
        const time = process.hrtime()
        const parsed = parser.parse(longString)
        const diff = process.hrtime(time)
        const msec = diff[0] * 1000 + diff[1] / 1000000
        expect(msec).toBeLessThan(threshold)
      })
    }
  }

  it('instanceOf', () => expect(parser).toBeInstanceOf(SearchStringParser))

  patternMatchTest('orPattern')({
    'OR': 'OR',
    'OR ': 'OR',
    'OR　': 'OR',
    'or': null,
    'Or': null,
    'oR': null,
    ' OR': null,
    'OR-': null,
    '-OR ': null,
  })

  patternMatchTest('pipePattern')({
    '|': '|',
    '| ': '|',
    ' |': null,
    ' |a': null,
    'a|': null,
  })

  patternMatchTest('andPattern')({
    'AND': 'AND',
    'AND ': 'AND',
    'AND　': 'AND',
    'and': null,
    'And': null,
    'aNd': null,
    'anD': null,
    'aND': null,
    'AnD': null,
    'ANd': null,
    ' AND': null,
    'AND-': null,
    '-AND ': null,
  })

  patternMatchTest('notPattern')({
    'NOT': 'NOT',
    'NOT ': 'NOT',
    'NOT　': 'NOT',
    'not': null,
    'Not': null,
    'nOt': null,
    'noT': null,
    'nOT': null,
    'NoT': null,
    'NOt': null,
    ' NOT': null,
    'NOT-': null,
  })

  patternMatchTest('minusPattern')({
    '-': '-',
    '--': '-',
    '-foo': '-',
    '- foo': '-',
    ' -': null,
    ' - ': null,
    ' -foo': null,
  })

  patternMatchTest('wordPattern')({
    '-': '-',
    '--': '--',
    'foo': 'foo',
    'f oo': 'f',
    'fo o': 'f',
    'bar': 'bar',
    'b　ar': 'b',
    'ba　r': 'ba',
    ' bar': null,
    '　bar': null,
  })

  patternMatchTest('fieldPattern')({
    'foo:': 'foo',
    'foo-:': 'foo-',
    'foo-bar:': 'foo-bar',
    'foo.bar:': 'foo.bar',
    'foo_bar:': 'foo_bar',
    '-': null,
    'foo': null,
    ' foo': null,
    '　foo': null,
    '0foo:': null,
    '_foo:': null,
    '-foo:': null,
    'FOO:': null,
    'FOo:': null,
    'Foo:': null,
  })

  patternMatchTest('bracketsPattern')({
    '(foo)': 'foo',
    '(foobar)': 'foobar',
    '(foo bar)': 'foo bar',
    '( foo )': ' foo ',
    '( foo bar )': ' foo bar ',
    '(　foo　bar　)': '　foo　bar　',
    '( foo bar ( baz qux ) )': ' foo bar ( baz qux ) ',
    '( foo bar ) ( baz qux )': ' foo bar ',
    '( foo:bar )': ' foo:bar ',
    '(foo': null,
    'foo)': null,
    '((foo)': null,
    ' ( foo )': null,
    ' ( foo bar )': null,
    ' (　foo　bar　)': null,
    ' ( foo bar ( baz qux ) )': null,
    '　( foo )': null,
    '　( foo bar )': null,
    '　(　foo　bar　)': null,
    '　( foo bar ( baz qux ) )': null,
  })

  patternMatchTest('singleQuotesPattern')({
    "'foo'": 'foo',
    "'f oo'": 'f oo',
    "'fo o'": 'fo o',
    "'f　oo'": 'f　oo',
    "'fo　o'": 'fo　o',
    "'f\\'oo'": 'f\\\'oo',
    "'fo\\'o'": 'fo\\\'o',
    "'f\\'\\'oo'": 'f\\\'\\\'oo',
    "'fo\\'\\'o'": 'fo\\\'\\\'o',
    "'f\\'\\'\\'oo'": 'f\\\'\\\'\\\'oo',
    "'fo\\'\\'\\'o'": 'fo\\\'\\\'\\\'o',
    "'foo": null,
    "f'o'o": null,
    "fo'o'": null,
    " 'foo'": null,
    "　'foo'": null,
  })

  patternMatchTest('duableQuotesPattern')({
    '"foo"': "foo",
    '"f oo"': "f oo",
    '"fo o"': "fo o",
    '"f　oo"': "f　oo",
    '"fo　o"': "fo　o",
    '"f\\"oo"': "f\\\"oo",
    '"fo\\"o"': "fo\\\"o",
    '"f\\"\\"oo"': "f\\\"\\\"oo",
    '"fo\\"\\"o"': "fo\\\"\\\"o",
    '"f\\"\\"\\"oo"': "f\\\"\\\"\\\"oo",
    '"fo\\"\\"\\"o"': "fo\\\"\\\"\\\"o",
    '"foo': null,
    'f"o"o': null,
    'fo"o"': null,
    ' "foo"': null,
    '　"foo"': null,
  })

  describe('parse()', () => {
    it('is Function', () => expect(parser.parse).toBeInstanceOf(Function))
    it('return is SearchStrings', () => expect(parser.parse()).toBeInstanceOf(SearchStrings))

    describe('string', () => {
      it('none', () => expect(parser.parse()).toBeInstanceOf(SearchStrings))
      it('null', () => expect(parser.parse(null)).toBeInstanceOf(SearchStrings))
      it('undefined', () => expect(parser.parse(undefined)).toBeInstanceOf(SearchStrings))

      parseTest({
        'foo bar': makeSearchStrings(['Word', 'foo'], ['Word', 'bar']),
        'foo "bar"': makeSearchStrings(['Word', 'foo'], ['DoubleQuotes', { value: 'bar', inQuotes: true }]),
        'foo "b\\"ar"': makeSearchStrings(['Word', 'foo'], ['DoubleQuotes', { value: 'b\\\"ar', inQuotes: true }]),
        'foo "b\\"\\"ar"': makeSearchStrings(['Word', 'foo'], ['DoubleQuotes', { value: 'b\\\"\\\"ar', inQuotes: true }]),
        'foo \'bar\'': makeSearchStrings(['Word', 'foo'], ['SingleQuotes', { value: 'bar', inQuotes: true }]),
        'foo \'b\\\'ar\'': makeSearchStrings(['Word', 'foo'], ['SingleQuotes', { value: 'b\\\'ar', inQuotes: true }]),
        'foo \'b\\\'\\\'ar\'': makeSearchStrings(['Word', 'foo'], ['SingleQuotes', { value: 'b\\\'\\\'ar', inQuotes: true }]),
        'foo bar:baz': makeSearchStrings(['Word', 'foo'], ['Word', { field: 'bar', value: 'baz' }]),
        'foo bar:(baz qux)': makeSearchStrings(['Word', 'foo'], makeSearchStrings(['Word', { field: 'bar', value: 'baz' }], ['Word', { field: 'bar', value: 'qux' }])),
        'foo bar:(baz OR qux)': makeSearchStrings(['Word', 'foo'], makeSearchStrings(['Word', { field: 'bar', value: 'baz', operator: 'or' }], ['Word', { field: 'bar', value: 'qux', operator: 'or' }])),
        'foo AND bar': makeSearchStrings(['Word', 'foo'], ['Word', 'bar']),
        'foo OR bar': makeSearchStrings(['Word', { value: 'foo', operator: 'or' }], ['Word', { value: 'bar', operator: 'or' }]),
        'foo | bar': makeSearchStrings(['Word', { value: 'foo', operator: 'or' }], ['Word', { value: 'bar', operator: 'or' }]),
        'foo NOT bar': makeSearchStrings(['Word', 'foo'], ['Word', { value: 'bar', operator: 'not' }]),
        'foo -bar': makeSearchStrings(['Word', 'foo'], ['Word', { value: 'bar', operator: 'not' }]),
        'foo (bar)': makeSearchStrings(['Word', 'foo'], makeSearchStrings(['Word', 'bar'])),
        'foo (bar OR baz)': makeSearchStrings(['Word', 'foo'], makeSearchStrings(['Word', { value: 'bar', operator: 'or' }], ['Word', { value: 'baz', operator: 'or' }])),
        'foo (bar OR baz NOT (qux quux))': makeSearchStrings(['Word', 'foo'], makeSearchStrings(['Word', { value: 'bar', operator: 'or' }], ['Word', { value: 'baz', operator: 'or' }], makeSearchStrings(['Word', { value: 'qux', operator: 'not' }], ['Word', { value: 'quux', operator: 'not' }]))),
        [mixedString]: mixedReturn
      })

      describe('long long string', () => {
        performanceTest({
          1000: 300,
          10000: 3000,
        })
      })
    })
  })

  describe('parseAsync()', () => {
    it('is Function', () => expect(parser.parseAsync).toBeInstanceOf(Function))
    it('return is Promise', () => expect(parser.parseAsync()).toBeInstanceOf(Promise))

    describe('string', () => {
      it('none', () => expect(parser.parseAsync()).resolves.toBeInstanceOf(SearchStrings))
      it('null', () => expect(parser.parseAsync(null)).resolves.toBeInstanceOf(SearchStrings))
      it('undefined', () => expect(parser.parseAsync(undefined)).resolves.toBeInstanceOf(SearchStrings))

      parseTestAsync({
        'foo bar': makeSearchStrings(['Word', 'foo'], ['Word', 'bar']),
        'foo "bar"': makeSearchStrings(['Word', 'foo'], ['DoubleQuotes', { value: 'bar', inQuotes: true }]),
        'foo "b\\"ar"': makeSearchStrings(['Word', 'foo'], ['DoubleQuotes', { value: 'b\\\"ar', inQuotes: true }]),
        'foo "b\\"\\"ar"': makeSearchStrings(['Word', 'foo'], ['DoubleQuotes', { value: 'b\\\"\\\"ar', inQuotes: true }]),
        'foo \'bar\'': makeSearchStrings(['Word', 'foo'], ['SingleQuotes', { value: 'bar', inQuotes: true }]),
        'foo \'b\\\'ar\'': makeSearchStrings(['Word', 'foo'], ['SingleQuotes', { value: 'b\\\'ar', inQuotes: true }]),
        'foo \'b\\\'\\\'ar\'': makeSearchStrings(['Word', 'foo'], ['SingleQuotes', { value: 'b\\\'\\\'ar', inQuotes: true }]),
        'foo bar:baz': makeSearchStrings(['Word', 'foo'], ['Word', { field: 'bar', value: 'baz' }]),
        'foo bar:(baz qux)': makeSearchStrings(['Word', 'foo'], makeSearchStrings(['Word', { field: 'bar', value: 'baz' }], ['Word', { field: 'bar', value: 'qux' }])),
        'foo bar:(baz OR qux)': makeSearchStrings(['Word', 'foo'], makeSearchStrings(['Word', { field: 'bar', value: 'baz', operator: 'or' }], ['Word', { field: 'bar', value: 'qux', operator: 'or' }])),
        'foo NOT bar:baz': makeSearchStrings(['Word', 'foo'], ['Word', { field: 'bar', value: 'baz', operator: 'not' }]),
        'foo -bar:baz': makeSearchStrings(['Word', 'foo'], ['Word', { field: 'bar', value: 'baz', operator: 'not' }]),
        'foo bar:-baz': makeSearchStrings(['Word', 'foo'], ['Word', { field: 'bar', value: 'baz', operator: 'not' }]),
        'foo AND bar': makeSearchStrings(['Word', 'foo'], ['Word', 'bar']),
        'foo OR bar': makeSearchStrings(['Word', { value: 'foo', operator: 'or' }], ['Word', { value: 'bar', operator: 'or' }]),
        'foo | bar': makeSearchStrings(['Word', { value: 'foo', operator: 'or' }], ['Word', { value: 'bar', operator: 'or' }]),
        'foo NOT bar': makeSearchStrings(['Word', 'foo'], ['Word', { value: 'bar', operator: 'not' }]),
        'foo -bar': makeSearchStrings(['Word', 'foo'], ['Word', { value: 'bar', operator: 'not' }]),
        'foo (bar)': makeSearchStrings(['Word', 'foo'], makeSearchStrings(['Word', 'bar'])),
        'foo (bar OR baz)': makeSearchStrings(['Word', 'foo'], makeSearchStrings(['Word', { value: 'bar', operator: 'or' }], ['Word', { value: 'baz', operator: 'or' }])),
        'foo (bar OR baz NOT (qux quux))': makeSearchStrings(['Word', 'foo'], makeSearchStrings(['Word', { value: 'bar', operator: 'or' }], ['Word', { value: 'baz', operator: 'or' }], makeSearchStrings(['Word', { value: 'qux', operator: 'not' }], ['Word', { value: 'quux', operator: 'not' }]))),
        [mixedString]: mixedReturn
      })

      describe('long long string', () => {
        performanceTest({
          1000: 300,
          10000: 3000,
        })
      })
    })
  })

})
