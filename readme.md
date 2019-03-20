# unwrap-refs [![Build Status](https://travis-ci.com/sergeysova/unwrap-refs.svg?branch=master)](https://travis-ci.com/sergeysova/unwrap-refs) [![codecov](https://codecov.io/gh/sergeysova/unwrap-refs/badge.svg?branch=master)](https://codecov.io/gh/sergeysova/unwrap-refs?branch=master)

> Unwrap { \$ref } in object

## Install

```
$ npm install unwrap-refs
```

## Usage

```js
const { unwrapRefs, getByPath } = require("unwrap-refs")

const object = {
	first: {
		second: { $ref: "#/defs/value" },
	},
	defs: {
		value: {
			hello: "world",
		},
	},
}

const result = unwrapRefs(object)
/*
const object = {
  first: {
    second: { hello: "world" },
  },
  defs: {
    value: {
      hello: "world"
    },
  },
}
*/
```

## API

### `unwrapRefs(object)`

Returns unwrapped copy of `object`.

### `getByPath(root, path)`

Get part of object from `root` by `path`.

#### `root: Object`

Target object to get path from.

#### `path: String`

Path from root, in format `#/foo/bar`.

#### Example

```js
const target = {
  foo: {
    bar: { value: 1 },
  },
},

const result = getByPath(target, "#/foo/bar")
// { value: 1 }
```

## License

MIT © [Sergey Sova](https://sova.dev)
