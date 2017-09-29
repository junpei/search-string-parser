const local = require('local-scope')()
const SearchString = require('./search-string')

class SearchStrings {

  constructor() {
    this.values = []
  }

  push(value) {
    if (value) {
      this.values.push(value)
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
