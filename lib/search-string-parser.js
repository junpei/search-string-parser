const local = require('local-scope')() 

const SearchString = require('./search-string')
const SearchStrings = require('./search-strings')

const createSearchStringInstance = Symbol()

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
    this.duableQuotesPattern = '"((?:\\\\"|[^"])+)"'

    this.patterns = [
      this.singleQuotesPattern,
      this.duableQuotesPattern,
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

    this.regexp = new RegExp(`^(?:${ this.patterns.join('|') })`)
  }

  parse(string) {
    const strings = new SearchStrings({
      field: local(this).field,
      operator: local(this).operator
    })

    local(this).operator = null

    if (string == null) {
      return strings
    }

    while (string = string.trim().replace(this.regexp, (...props) => {
      const searchStringInstance = this[createSearchStringInstance](props.slice(1, -2))

      /**
       * 単語
       */
      if ( 
        searchStringInstance instanceof SearchString.Word ||
        searchStringInstance instanceof SearchString.DoubleQuotes ||
        searchStringInstance instanceof SearchString.SingleQuotes
      ) {
        strings.push(searchStringInstance)
        local(this).operator = local(this).field = null
      }

      /**
       * ブラケット
       */
      else if (searchStringInstance instanceof SearchString.Brackets) {
        strings.push(this.parse(searchStringInstance.value))
        local(this).operator = local(this).field = null
      }

      /**
       * フィールド
       */
      else if (searchStringInstance instanceof SearchString.Field) {
        local(this).field = searchStringInstance.value
      }

      /**
       * 演算子 AND OR NOT
       */
      else if (
        searchStringInstance instanceof SearchString.And
      ) {
        local(this).operator = 'and'
      }

      else if (
        searchStringInstance instanceof SearchString.Or ||
        searchStringInstance instanceof SearchString.Pipe
      ) {
        strings.last().operator = local(this).operator = 'or'
      }

      else if (
        searchStringInstance instanceof SearchString.Not ||
        searchStringInstance instanceof SearchString.Minus
      ) {
        local(this).operator = 'not'
      }

      return ''
    })) {}

    return strings
  }

  parseAsync(string) {
    return Promise.resolve(this.parse(string))
  }

  [createSearchStringInstance](matchedStrings) {
    for (let i = 0; i < matchedStrings.length; ++i) {
      const stringValue = matchedStrings[i]
      const stringClass = this.stringClasses[i]

      if (stringValue) {
        return new stringClass({
          field: local(this).field,
          value: stringValue,
          operator: local(this).operator,
        })
      }
    }

    return null
  }

}

module.exports = SearchStringParser
