# Untry
### Better error handling in JavaScript

This library provides a simple way to handle errors in JavaScript, inspired by the error handling philosophy in Go.

## Installation
npm
```
npm install untry
```

yarn
```
yarn add untry
```

## Usage

`untry` executes a function and return an array with the resulting value in the first place, and the thrown error in the second one.

```ts
import untry from 'untry'

let [value, error] = untry(() => someFunc())

// async
let [value, error] = await untry(() => someFunc())
```

### Defer

Defer executes the passed functions if any error is thrown inside the `untry` execution.
```ts
let [value, error] = untry((defer) => {
  defer(error => {
    // execute if any error
  })

  // function code
  return someFunc()
})
```

Example:

```ts
import fs from 'node:fs/promises'

let [value, error] = untry((defer) => {
  let filehandle

  // close file handler if something unexpected happens
  defer(error => {
    console.log(error)
    if (filehandle) filehandle.close()
  })

  filehandle = await fs.open('/Users/joe/test.txt', 'r')
  return filehandle.readFile({ encoding: 'utf8' })
})
```

### Utilities

`error(err: Error, name: string): CustomError`

Returns a serializable custom Error
```ts

const err = untry.error(new Error('Bad token!'), 'TOKEN_ERROR')

console.log(JSON.stringify(err))

/*
Console output

{
  '@untry/error': true,
  'name': 'TOKEN_ERROR',
  'message': 'Bad token!'
}
*/

```

Contributing
---------------
Contributions are welcome! Please submit a pull request or issue on GitHub.

License
-------
MIT (c) 2019-present Yosbel Marin
