var SearchString = function (props) {
  this._field = null
  this._value = null
  this._inQuotes = false
  this._operator = 'and'

  if (props == null) {
  }

  else if (typeof props === 'string') {
    this.value = props
  }

  else if (props instanceof Object) {
    this.field = props.field
    this.value = props.value
    this.operator = props.operator
    this.inQuotes = props.inQuotes
  }
}

Object.defineProperty(SearchString.prototype, 'field', {
  set: function (value) { this._field = value || null },
  get: function () { return this._field },
  configurable: true,
  enumerable: true
})

Object.defineProperty(SearchString.prototype, 'value', {
  set: function (value) { this._value = value || null },
  get: function () { return this._value },
  configurable: true,
  enumerable: true
})

Object.defineProperty(SearchString.prototype, 'inQuotes', {
  set: function (value) { this._inQuotes = !!value },
  get: function () { return this._inQuotes },
  configurable: true,
  enumerable: true
})

Object.defineProperty(SearchString.prototype, 'operator', {
  set: function (value) { this._operator = /and|or|not/i.test(value) ? value.toLowerCase() : 'and' },
  get: function () { return this._operator },
  configurable: true,
  enumerable: true
})

Object.defineProperty(SearchString.prototype, 'and', {
  get: function () { return this._operator === 'and' }
})

Object.defineProperty(SearchString.prototype, 'or', {
  get: function () { return this._operator === 'or' }
})

Object.defineProperty(SearchString.prototype, 'not', {
  get: function () { return this._operator === 'not' }
})

SearchString.prototype.toString = function (noOperator) {
  var returns = []

  if (noOperator !== true && this.operator !== 'and') {
    returns.push(this.operator.toUpperCase() + ' ')
  }

  if (this.field) {
    returns.push(this.field + ':')
  }

  if (this.inQuotes) {
    returns.push('"' + this.value + '"')
  }

  else {
    returns.push(this.value)
  }

  return returns.join('')
}

var __extends__ = {
  Or: function (props) {
    SearchString.call(this, props)
    this.operator = 'or'
  },
  And: function (props) {
    SearchString.call(this, props)
    this.operator = 'and'
  },
  Not: function (props) {
    SearchString.call(this, props)
    this._operator = 'not'
  },
  Word: function (props) {
    SearchString.call(this, props)
  },
  Pipe: function (props) {
    SearchString.call(this, props)
    this._operator = 'or'
  },
  Minus: function (props) {
    SearchString.call(this, props)
    this._operator = 'not'
  },
  Field: function (props) {
    SearchString.call(this, props)
  },
  Brackets: function (props) {
    SearchString.call(this, props)
  },
  SingleQuotes: function (props) {
    SearchString.call(this, props)
    this._inQuotes = true
  },
  DoubleQuotes: function (props) {
    SearchString.call(this, props)
    this._inQuotes = true
  }
}

module.exports = SearchString

Object.keys(__extends__).forEach(function (className) {
  var childClass = __extends__[className]

  childClass.prototype = Object.create(SearchString.prototype, {
    constructor: {
      value: childClass,
      configurable: true,
      enumerable: false,
      writable: true
    }
  })

  module.exports[className] = childClass
})
