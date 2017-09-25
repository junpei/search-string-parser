const SearchString = require('../lib/search-string.js')

describe('search-string', () => {
  const toStringTest = (noOperator = false) => testObject => {
    describe('noOperator = ' + noOperator, () => {
      for (const expectedValue of Object.keys(testObject)) {
        const testArgs = testObject[expectedValue]
        it(
          JSON.stringify(testArgs),
          () => expect(new SearchString(testArgs).toString(noOperator)).toEqual(expectedValue)
        )
      }
    })
  }

  describe('default', () => {
    const instance = new SearchString({ value: 'is default' })
    it('instanceOf', () => expect(instance).toBeInstanceOf(SearchString))
    it('field', () => expect(instance.field).toBeNull())
    it('value', () => expect(instance.value).toBe('is default'))
    it('inQuotes', () => expect(instance.inQuotes).toBeFalsy())
    it('operator', () => expect(instance.operator).toBe('and'))
    it('and', () => expect(instance.and).toBeTruthy())
    it('or', () => expect(instance.or).toBeFalsy())
    it('not', () => expect(instance.not).toBeFalsy())

    describe('toString', () => {
      it('is Function', () => expect(instance.toString).toBeInstanceOf(Function))

      toStringTest()({
        'foo':         { value: 'foo' },
        'foo:bar':     { field: 'foo', value: 'bar', operator: 'and' },
        '"foo: ba r"': { value: 'foo: ba r', inQuotes: true },
        'foo':         { value: 'foo', operator: 'and' },
        'OR foo':      { value: 'foo', operator: 'or' },
        'NOT foo':     { value: 'foo', operator: 'not' },
      })

      toStringTest(true)({
        'foo':         { value: 'foo' },
        'foo:bar':     { field: 'foo', value: 'bar', operator: 'and' },
        '"foo: ba r"': { value: 'foo: ba r', inQuotes: true },
        'foo1':        { value: 'foo1', operator: 'and' },
        'foo2':        { value: 'foo2', operator: 'or' },
        'foo3':        { value: 'foo3', operator: 'not' },
      })
    })
  })

  describe('Or', () => {
    const instance = new SearchString.Or({ value: 'is or' })
    it('instanceOf', () => expect(instance).toBeInstanceOf(SearchString.Or))
    it('field', () => expect(instance.field).toBeNull())
    it('value', () => expect(instance.value).toBe('is or'))
    it('inQuotes', () => expect(instance.inQuotes).toBeFalsy())
    it('operator', () => expect(instance.operator).toBe('and'))
    it('and', () => expect(instance.and).toBeTruthy())
    it('or', () => expect(instance.or).toBeFalsy())
    it('not', () => expect(instance.not).toBeFalsy())
  })

  describe('And', () => {
    const instance = new SearchString.And({ value: 'is and' })
    it('instanceOf', () => expect(instance).toBeInstanceOf(SearchString.And))
    it('field', () => expect(instance.field).toBeNull())
    it('value', () => expect(instance.value).toBe('is and'))
    it('inQuotes', () => expect(instance.inQuotes).toBeFalsy())
    it('operator', () => expect(instance.operator).toBe('and'))
    it('and', () => expect(instance.and).toBeTruthy())
    it('or', () => expect(instance.or).toBeFalsy())
    it('not', () => expect(instance.not).toBeFalsy())
  })

  describe('Not', () => {
    const instance = new SearchString.Not({ field: 'set field', value: 'is not' })
    it('instanceOf', () => expect(instance).toBeInstanceOf(SearchString.Not))
    it('field', () => expect(instance.field).toBe('set field'))
    it('value', () => expect(instance.value).toBe('is not'))
    it('inQuotes', () => expect(instance.inQuotes).toBeFalsy())
    it('operator', () => expect(instance.operator).toBe('and'))
    it('and', () => expect(instance.and).toBeTruthy())
    it('or', () => expect(instance.or).toBeFalsy())
    it('not', () => expect(instance.not).toBeFalsy())
  })

  describe('Word', () => {
    const instance = new SearchString.Word()
    it('instanceOf', () => expect(instance).toBeInstanceOf(SearchString.Word))
    it('field', () => expect(instance.field).toBeNull())
    it('value', () => expect(instance.value).toBeNull())
    it('inQuotes', () => expect(instance.inQuotes).toBeFalsy())
    it('operator', () => expect(instance.operator).toBe('and'))
    it('and', () => expect(instance.and).toBeTruthy())
    it('or', () => expect(instance.or).toBeFalsy())
    it('not', () => expect(instance.not).toBeFalsy())
  })

  describe('Pipe', () => {
    const instance = new SearchString.Pipe()
    it('instanceOf', () => expect(instance).toBeInstanceOf(SearchString.Pipe))
    it('field', () => expect(instance.field).toBeNull())
    it('value', () => expect(instance.value).toBeNull())
    it('inQuotes', () => expect(instance.inQuotes).toBeFalsy())
    it('operator', () => expect(instance.operator).toBe('and'))
    it('and', () => expect(instance.and).toBeTruthy())
    it('or', () => expect(instance.or).toBeFalsy())
    it('not', () => expect(instance.not).toBeFalsy())
  })

  describe('Minus', () => {
    const instance = new SearchString.Minus()
    it('instanceOf', () => expect(instance).toBeInstanceOf(SearchString.Minus))
    it('field', () => expect(instance.field).toBeNull())
    it('value', () => expect(instance.value).toBeNull())
    it('inQuotes', () => expect(instance.inQuotes).toBeFalsy())
    it('operator', () => expect(instance.operator).toBe('and'))
    it('and', () => expect(instance.and).toBeTruthy())
    it('or', () => expect(instance.or).toBeFalsy())
    it('not', () => expect(instance.not).toBeFalsy())
  })

  describe('Field', () => {
    const instance = new SearchString.Field()
    it('instanceOf', () => expect(instance).toBeInstanceOf(SearchString.Field))
    it('field', () => expect(instance.field).toBeNull())
    it('value', () => expect(instance.value).toBeNull())
    it('inQuotes', () => expect(instance.inQuotes).toBeFalsy())
    it('operator', () => expect(instance.operator).toBe('and'))
    it('and', () => expect(instance.and).toBeTruthy())
    it('or', () => expect(instance.or).toBeFalsy())
    it('not', () => expect(instance.not).toBeFalsy())
  })

  describe('Brackets', () => {
    const instance = new SearchString.Brackets()
    it('instanceOf', () => expect(instance).toBeInstanceOf(SearchString.Brackets))
    it('field', () => expect(instance.field).toBeNull())
    it('value', () => expect(instance.value).toBeNull())
    it('inQuotes', () => expect(instance.inQuotes).toBeFalsy())
    it('operator', () => expect(instance.operator).toBe('and'))
    it('and', () => expect(instance.and).toBeTruthy())
    it('or', () => expect(instance.or).toBeFalsy())
    it('not', () => expect(instance.not).toBeFalsy())
  })

  describe('SingleQuotes', () => {
    const instance = new SearchString.SingleQuotes()
    it('instanceOf', () => expect(instance).toBeInstanceOf(SearchString.SingleQuotes))
    it('field', () => expect(instance.field).toBeNull())
    it('value', () => expect(instance.value).toBeNull())
    it('inQuotes', () => expect(instance.inQuotes).toBeTruthy())
    it('operator', () => expect(instance.operator).toBe('and'))
    it('and', () => expect(instance.and).toBeTruthy())
    it('or', () => expect(instance.or).toBeFalsy())
    it('not', () => expect(instance.not).toBeFalsy())
  })
  
  describe('DoubleQuotes', () => {
    const instance = new SearchString.DoubleQuotes()
    it('instanceOf', () => expect(instance).toBeInstanceOf(SearchString.DoubleQuotes))
    it('field', () => expect(instance.field).toBeNull())
    it('value', () => expect(instance.value).toBeNull())
    it('inQuotes', () => expect(instance.inQuotes).toBeTruthy())
    it('operator', () => expect(instance.operator).toBe('and'))
    it('and', () => expect(instance.and).toBeTruthy())
    it('or', () => expect(instance.or).toBeFalsy())
    it('not', () => expect(instance.not).toBeFalsy())
  })

})
