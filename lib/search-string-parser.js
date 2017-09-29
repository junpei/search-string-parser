const local = require('local-scope')()

const SearchString = require('./search-string')
const SearchStrings = require('./search-strings')

/**
 * private
 */
const getField = Symbol()
const setField = Symbol()
const getOperator = Symbol()
const setOperator = Symbol()

const setBrackets = Symbol()
const resetBrackets = Symbol()
const resetSettings = Symbol()

class SearchStringParser {

  constructor() {
    this.orPattern = '(OR)(?:\\s|$)'
    this.andPattern = '(AND)(?:\\s|$)'
    this.notPattern = '(NOT)(?:\\s|$)'
    this.pipePattern = '(\\|)(?:\\s|$)'
    this.wordPattern = '([^ 　]+)'
    this.minusPattern = '(-)'
    this.fieldPattern = '([a-z][a-z-_\.]*):'
    this.bracketsPattern = '\\(((?:[^)(]+|\\((?:[^)(]+|\\([^)(]*\\))*\\))+?)\\)'
    this.singleQuotesPattern = "'((?:\\\\'|[^'])+)'"
    this.doubleQuotesPattern = '"((?:\\\\"|[^"])+)"'

    this.patterns = [
      this.singleQuotesPattern,
      this.doubleQuotesPattern,
      this.bracketsPattern,
      this.andPattern,
      this.orPattern,
      this.notPattern,
      this.pipePattern,
      this.minusPattern,
      this.fieldPattern,
      this.wordPattern
    ]

    this.stringClasses = [
      SearchString.SingleQuotes,
      SearchString.DoubleQuotes,
      SearchString.Brackets,
      SearchString.And,
      SearchString.Or,
      SearchString.Not,
      SearchString.Pipe,
      SearchString.Minus,
      SearchString.Field,
      SearchString.Word,
    ]

    this.regexp = new RegExp(`(?:${ this.patterns.join('|') })`, 'g')

    local(this).settings = { field: null, operator: null }
    local(this).brackets = { field: null, operator: null }
  }

  parse(string) {
    const strings = new SearchStrings({})

    if (string == null) {
      return strings
    }

    string.replace(this.regexp, (...props) => {
      const matchedStrings = props.slice(1, -2)
      const matchedIndex = matchedStrings.findIndex(row => row)
      const searchStringInstance = new this.stringClasses[matchedIndex]({
        field:    this[getField](),
        value:    matchedStrings[matchedIndex],
        operator: this[getOperator](),
      })

      switch (searchStringInstance.constructor) {
        case SearchString.Word:
        case SearchString.SingleQuotes:
        case SearchString.DoubleQuotes:
          strings.push(searchStringInstance)
          this[resetSettings]()
          break

        case SearchString.Brackets:
          this[setBrackets]()
          strings.push(this.parse(searchStringInstance.value))
          this[resetSettings]()[resetBrackets]()
          break

        case SearchString.Field:
          this[setField](searchStringInstance.value)
          break

        case SearchString.And:
          this[setOperator]('and')
          break

        case SearchString.Or:
        case SearchString.Pipe:
          strings.last().operator = this[setOperator]('or')[getOperator]()
          break

        case SearchString.Not:
        case SearchString.Minus:
          this[setOperator]('not')
          break
      }
    })

    return strings
  }

  parseAsync(string) {
    return Promise.resolve(this.parse(string))
  }

  [getField]() {
    return  local(this).brackets.field|| local(this).settings.field
  }

  [setField](value) {
    local(this).settings.field = value
    return this
  }

  [setOperator](value) {
    local(this).settings.operator = value
    return this
  }

  [getOperator]() {
    return local(this).brackets.operator || local(this).settings.operator
  }

  [setBrackets]() {
    local(this).brackets.field    = local(this).settings.field
    local(this).brackets.operator = local(this).settings.operator
    return this
  }

  [resetBrackets]() {
    local(this).brackets.field    = null
    local(this).brackets.operator = null
    return this
  }

  [resetSettings]() {
    return this
    [setField](null)
    [setOperator](null)
  }

}

module.exports = SearchStringParser
