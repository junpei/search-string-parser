# search-string-parser

検索文字列の解析を行なう

## Example

### SearchStringParser

#### parse()

```javascript
const SearchStringParser = require('search-string-parser')
const parser = new SearchStringParser()

const searchStrings = parser.parse('foo bar:baz')
const searchStringFoo = searchStrings.get(0)
const searchStringBar = searchStrings.get(1)

console.log(searchStringFoo.field)    // null
console.log(searchStringFoo.value)    // foo
console.log(searchStringFoo.operator) // and
console.log(searchStringFoo.and)      // true
console.log(searchStringFoo.or)       // true
console.log(searchStringFoo.not)      // true
console.log(searchStringFoo.inQuotes) // false

console.log(searchStringBar.field)    // bar
console.log(searchStringBar.value)    // baz
console.log(searchStringBar.operator) // and
console.log(searchStringBar.and)      // true
console.log(searchStringBar.or)       // false
console.log(searchStringBar.not)      // false
console.log(searchStringBar.inQuotes) // false
```

#### parseAsync()

```javascript
const SearchStringParser = require('search-string-parser')
const parser = new SearchStringParser()

parser.parseAsync('foo OR bar:"ba  z"').then(searchStrings => {
  const searchStringFoo = searchStrings.first()
  const searchStringBar = searchStrings.last(1)

  console.log(searchStringFoo.field)    // null
  console.log(searchStringFoo.value)    // foo
  console.log(searchStringFoo.operator) // or
  console.log(searchStringFoo.and)      // false
  console.log(searchStringFoo.or)       // true
  console.log(searchStringFoo.not)      // false
  console.log(searchStringFoo.inQuotes) // false

  console.log(searchStringBar.field)    // bar
  console.log(searchStringBar.value)    // ba  z
  console.log(searchStringBar.operator) // or
  console.log(searchStringBar.and)      // false
  console.log(searchStringBar.or)       // true
  console.log(searchStringBar.not)      // false
  console.log(searchStringBar.inQuotes) // true
})
```

### SearchStrings

```javascript
const SearchStrings = require('search-strings')
const strings = new SearchStrings()

strings
.push({ value: 'first' })
.push({ value: 'second' })
.push({ value: 'third' })
.push({ value: 'fourth' })

console.log(strings.get(0))    // SearchString value: first
console.log(strings.first())   // SearchString value: first
console.log(strings.get(1))    // SearchString value: second
console.log(strings.get(2))    // SearchString value: third
console.log(strings.get(3))    // SearchString value: fourth
console.log(strings.last())    // SearchString value: fourth
console.log(strings.length())  // 4
console.log(strings.toArray()) // Array
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
```
