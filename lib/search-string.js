const _field = Symbol()
const _value = Symbol()
const _inQuotes = Symbol()
const _operator = Symbol()

class SearchString {

  constructor(props = {}) {
    this.field = null
    this.value = null
    this.inQuotes = false
    this.operator = null

    if (typeof props === 'string') {
      this.value = props
    }

    else if (props instanceof Object) {
      this.field = props.field
      this.value = props.value
      this.operator = props.operator
      this.inQuotes = props.inQuotes
    }
  }

  set field(value) {
    this[_field] = value || null
  }

  set value(value) {
    this[_value] = value || null
  }

  set operator(value) {
    this[_operator] = /and|or|not/i.test(value) ? value.toLowerCase() : 'and'
  }

  set inQuotes(value) {
    this[_inQuotes] = !!value
  }

  get field() {
    return this[_field]
  }

  get value() {
    return this[_value]
  }

  get operator() {
    return this[_operator]
  }

  get inQuotes() {
    return this[_inQuotes]
  }

  get and() {
    return this[_operator] === 'and'
  }

  get or() {
    return this[_operator] === 'or'
  }

  get not() {
    return this[_operator] === 'not'
  }

  toString(noOperator = false) {
    const returns = []

    if (noOperator === false && this.operator !== 'and') {
      returns.push(this.operator.toUpperCase() + ' ')
    }

    if (this.field) {
      returns.push(this.field + ':')
    }

    if (this.inQuotes) {
      returns.push(`"${ this.value }"`)
    }

    else {
      returns.push(this.value)
    }

    return returns.join('')
  }

}

const __extends__ = {
  Or: class SearchStringOr extends SearchString {},
  And: class SearchStringAnd extends SearchString {},
  Not: class SearchStringNot extends SearchString {},
  Word: class SearchStringWord extends SearchString {},
  Pipe: class SearchStringPipe extends SearchString {},
  Minus: class SearchStringMinus extends SearchString {},
  Field: class SearchStringField extends SearchString {},
  Brackets: class SearchStringBrackets extends SearchString {},
  SingleQuotes: class SearchStringSingleQuotes extends SearchString {
    constructor(props) {
      super(props)
      this.inQuotes = true
    }
  },
  DoubleQuotes: class SearchStringDoubleQuotes extends SearchString {
    constructor(props) {
      super(props)
      this.inQuotes = true
    }
  }
}

module.exports = SearchString

for (const className of Object.keys(__extends__)) {
  module.exports[className] = __extends__[className]
}
