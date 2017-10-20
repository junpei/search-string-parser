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

  this.regexp = new RegExp('(?:' + this.patterns.join('|') +  ')', 'g')

  this.settings = { field: null, operator: null }
  this.brackets = { field: null, operator: null }
}

SearchStringParser.prototype.parse = function (string) {
  var strings = immutable.List()

  if (string == null) {
    return strings
  }

  var that = this

  return strings.withMutations(function (state) {
    string.replace(that.regexp, function () {
      var props = Array.apply(null, arguments)
      var matchedStrings = props.slice(1, -2)
      var matchedIndex = matchedStrings.findIndex(function (row) { return row })
      var searchStringInstance = new that.stringClasses[matchedIndex]({
        field:    that.getField(),
        value:    matchedStrings[matchedIndex],
        operator: that.getOperator(),
      })

      switch (searchStringInstance.constructor) {
        case SearchString.Word:
        case SearchString.SingleQuotes:
        case SearchString.DoubleQuotes:
          state.push(searchStringInstance)
          that.resetSettings()
          break

        case SearchString.Brackets:
          that.setBrackets()
          state.push(that.parse(searchStringInstance.value))
          that.resetBrackets()
          break

        case SearchString.Field:
          that.setField(searchStringInstance.value)
          break

        case SearchString.And:
          that.setOperator('and')
          break

        case SearchString.Or:
        case SearchString.Pipe:
          var last = state.get(-1)
          last.operator = that.setOperator('or')
          state.set(-1, last)
          break

        case SearchString.Not:
        case SearchString.Minus:
          that.setOperator('not')
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
