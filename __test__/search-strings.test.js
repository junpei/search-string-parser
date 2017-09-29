const SearchString = require('../lib/search-string.js')
const SearchStrings = require('../lib/search-strings.js')

describe('search-strings', () => {
  it('instanceOf', () => expect(new SearchStrings()).toBeInstanceOf(SearchStrings))

  describe('push()', () => {
    const values = new SearchStrings()

    it('is Function', () => expect(values.push).toBeInstanceOf(Function))
    it('return is this', () => expect(values.push()).toBeInstanceOf(SearchStrings))

    describe('argument', () => {
      it('none', () => expect(values.push()).toBeInstanceOf(SearchStrings))
      it('{}', () => expect(values.push({})).toBeInstanceOf(SearchStrings))
    })
  })

  describe('get()', () => {
    const values = (new SearchStrings())
    .push(new SearchString({ value: 'first()' }))
    .push(new SearchString({ value: 'next()' }))
    .push(new SearchString({ value: 'second()' }))
    it('is Function', () => expect(values.get).toBeInstanceOf(Function))
    it('return is SearchString', () => expect(values.get()).toEqual(new SearchString({ value: 'first()' })))

    describe('argument', () => {
      it('1', () => expect(values.get(1)).toEqual(new SearchString({ value: 'next()' })))
      it('2', () => expect(values.get(2)).toEqual(new SearchString({ value: 'second()' })))
    })
  })

  describe('first()', () => {
    const values = (new SearchStrings())
    .push(new SearchString({ value: 'first()' }))
    .push(new SearchString({ value: 'next()' }))
    it('is Function', () => expect(values.first).toBeInstanceOf(Function))
    it('return is SearchString', () => expect(values.first()).toEqual(new SearchString({ value: 'first()' })))
  })

  describe('last()', () => {
    const values = (new SearchStrings())
    .push(new SearchString({ value: 'last()' }))
    it('is Function', () => expect(values.last).toBeInstanceOf(Function))
    it('return is SearchString', () => expect(values.last()).toEqual(new SearchString({ value: 'last()' })))
  })

  describe('length()', () => {
    const values = (new SearchStrings())
    it('is Function', () => expect(values.length).toBeInstanceOf(Function))
    it('return is Number', () => expect(values.length()).toBe(0))

    describe('argument', () => {
      it('0', () => expect(values.length(0)).toBe(0))
      it('1', () => expect(values.length(1)).toBe(1))
      it('-1', () => expect(values.length(-1)).toBe(-1))
    })
  })

  describe('toArray()', () => {
    const values = new SearchStrings()
    it('is Function', () => expect(values.toArray).toBeInstanceOf(Function))
    it('return is Array', () => expect(values.toArray()).toBeInstanceOf(Array))
  })

})
