# search-string-parser

検索文字列の解析を行なう

## Example

### SearchStringParser

#### parse()

```javascript
const SearchStringParser = require('search-string-parser')
const parser = new SearchStringParser()

const immutableList = parser.parse('foo bar:baz')
const searchStringFoo = immutableList.get(0)
const searchStringBar = immutableList.get(1)

console.log(searchStringFoo.field)      // null
console.log(searchStringFoo.value)      // foo
console.log(searchStringFoo.operator)   // and
console.log(searchStringFoo.and)        // true
console.log(searchStringFoo.or)         // true
console.log(searchStringFoo.not)        // true
console.log(searchStringFoo.inQuotes)   // false
console.log(searchStringFoo.toString()) // foo

console.log(searchStringBar.field)      // bar
console.log(searchStringBar.value)      // baz
console.log(searchStringBar.operator)   // and
console.log(searchStringBar.and)        // true
console.log(searchStringBar.or)         // false
console.log(searchStringBar.not)        // false
console.log(searchStringBar.inQuotes)   // false
console.log(searchStringBar.toString()) // bar:baz
```

#### parseAsync()

```javascript
const SearchStringParser = require('search-string-parser')
const parser = new SearchStringParser()

parser.parseAsync('foo OR bar:"ba  z"').then(immutableList => {
  const searchStringFoo = immutableList.first()
  const searchStringBar = immutableList.last(1)

  console.log(searchStringFoo.field)      // null
  console.log(searchStringFoo.value)      // foo
  console.log(searchStringFoo.operator)   // or
  console.log(searchStringFoo.and)        // false
  console.log(searchStringFoo.or)         // true
  console.log(searchStringFoo.not)        // false
  console.log(searchStringFoo.inQuotes)   // false
  console.log(searchStringFoo.toString()) // foo

  console.log(searchStringBar.field)      // bar
  console.log(searchStringBar.value)      // ba  z
  console.log(searchStringBar.operator)   // or
  console.log(searchStringBar.and)        // false
  console.log(searchStringBar.or)         // true
  console.log(searchStringBar.not)        // false
  console.log(searchStringBar.inQuotes)   // true
  console.log(searchStringBar.toString()) // OR bar:"ba  z"
})
```

### SearchString

```javascript
const SearchString = require('search-string')
const string = new SearchString({
  field:    'setField',
  value:    'setValue',
  operator: 'and', // and|or|not
  inQuotes: true,  // true|false
})

console.log(string.field)    // setField
console.log(string.value)    // setValue
console.log(string.operator) // 'and'
console.log(string.inQuotes) // true
console.log(string.and)      // true
console.log(string.or)       // false
console.log(string.not)      // false

console.log(string.toString())
// setField:"setValue"
```
