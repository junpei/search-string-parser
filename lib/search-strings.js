const local = require('local-scope')()
const SearchString = require('./search-string')

class SearchStrings {

  constructor(props = {}) {
    local(this).field = props.field || null
    local(this).operator = props.operator || null
    this.values = []
  }

  push(value) {
    if (!value) {
      return this
    }

    else if (value instanceof SearchString) {
      value.field = local(this).field || value.field
      value.operator = local(this).operator || value.operator
      this.values.push(value)
    }

    else if (value instanceof SearchStrings) {
      this.values.push(value)
    }

    else if (value instanceof Object) {
      this.values.push(new SearchString(value))
    }

    return this
  }

  get(i = 0) {
    return i === -1 ? this.last() : this.values[i]
  }

  first() {
    return this.get(0)
  }

  last() {
    return this.values[this.length(-1)]
  }

  length(i = 0) {
    return this.values.length + i
  }

  toArray() {
    return this.values
  }
}

module.exports = SearchStrings
