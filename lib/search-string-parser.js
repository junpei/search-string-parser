var Promise = require('bluebird')
var immutable = require('immutable')
var SearchString = require('./search-string')

var SearchStringParser = function () {
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

  this.settings = { field: null, operator: null }
  this.brackets = { field: null, operator: null }
}

SearchStringParser.prototype.parse = function (string) {
  var strings = immutable.List()

  if (string == null) {
    return strings
  }

  return strings.withMutations(state => {
    string.replace(this.regexp, (...props) => {
      var matchedStrings = props.slice(1, -2)
      var matchedIndex = matchedStrings.findIndex(row => row)
      var searchStringInstance = new this.stringClasses[matchedIndex]({
        field:    this.getField(),
        value:    matchedStrings[matchedIndex],
        operator: this.getOperator(),
      })

      switch (searchStringInstance.constructor) {
        case SearchString.Word:
        case SearchString.SingleQuotes:
        case SearchString.DoubleQuotes:
          state.push(searchStringInstance)
          this.resetSettings()
          break

        case SearchString.Brackets:
          this.setBrackets()
          state.push(this.parse(searchStringInstance.value))
          this.resetBrackets()
          break

        case SearchString.Field:
          this.setField(searchStringInstance.value)
          break

        case SearchString.And:
          this.setOperator('and')
          break

        case SearchString.Or:
        case SearchString.Pipe:
          var last = state.get(-1)
          last.operator = this.setOperator('or')
          state.set(-1, last)
          break

        case SearchString.Not:
        case SearchString.Minus:
          this.setOperator('not')
          break
      }
    })
  })
}

SearchStringParser.prototype.parseAsync = function (string) {
  return Promise.resolve(this.parse(string))
}

SearchStringParser.prototype.getField = function () {
  return this.brackets.field || this.settings.field
}

SearchStringParser.prototype.setField = function (value) {
  return this.settings.field = value
}

SearchStringParser.prototype.getOperator = function () {
  return this.brackets.operator || this.settings.operator
}

SearchStringParser.prototype.setOperator = function (value) {
  return this.settings.operator = value
}

SearchStringParser.prototype.setBrackets = function () {
  this.brackets.field    = this.settings.field
  this.brackets.operator = this.settings.operator
}

SearchStringParser.prototype.resetBrackets = function () {
  this.brackets.field    = null
  this.brackets.operator = null
  this.resetSettings()
}

SearchStringParser.prototype.resetSettings = function () {
  this.settings.field    = null
  this.settings.operator = null
}

module.exports = SearchStringParser
