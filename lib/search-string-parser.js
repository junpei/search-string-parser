const local = require('local-scope')()
const immutable = require('immutable')
const Promise = require('bluebird')

const SearchString = require('./search-string')

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
    const strings = immutable.List()

    if (string == null) {
      return strings
    }

    return strings.withMutations(state => {
      string.replace(this.regexp, (...props) => {
        const matchedStrings = props.slice(1, -2)
        const matchedIndex = matchedStrings.findIndex(row => row)
        const searchStringInstance = new this.stringClasses[matchedIndex]({
          field:    _getField(this),
          value:    matchedStrings[matchedIndex],
          operator: _getOperator(this),
        })

        switch (searchStringInstance.constructor) {
          case SearchString.Word:
          case SearchString.SingleQuotes:
          case SearchString.DoubleQuotes:
            state.push(searchStringInstance)
            _resetSettings(this)
            break

          case SearchString.Brackets:
            _setBrackets(this)
            state.push(this.parse(searchStringInstance.value))
            _resetBrackets(this)
            break

          case SearchString.Field:
            _setField(this, searchStringInstance.value)
            break

          case SearchString.And:
            _setOperator(this, 'and')
            break

          case SearchString.Or:
          case SearchString.Pipe:
            const last = state.get(-1)
            last.operator = _setOperator(this, 'or')
            state.set(-1, last)
            break

          case SearchString.Not:
          case SearchString.Minus:
            _setOperator(this, 'not')
            break
        }
      })
    })
  }

  parseAsync(string) {
    return Promise.resolve(this.parse(string))
  }

}

/**
 * private
 */
const _getField = self => {
  return local(self).brackets.field || local(self).settings.field
}

const _setField = (self, value) => {
  return local(self).settings.field = value
}

const _setOperator = (self, value) => {
  return local(self).settings.operator = value
}

const _getOperator = self => {
  return local(self).brackets.operator || local(self).settings.operator
}

const _setBrackets = self => {
  local(self).brackets.field    = local(self).settings.field
  local(self).brackets.operator = local(self).settings.operator
}

const _resetBrackets = self => {
  local(self).brackets.field    = null
  local(self).brackets.operator = null
  _resetSettings(self)
}

const _resetSettings = self => {
  local(self).settings.field    = null
  local(self).settings.operator = null
}

module.exports = SearchStringParser
