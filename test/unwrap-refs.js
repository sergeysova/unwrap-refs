import test from "ava"
import { unwrapRefs } from "../lib"

test("copy object when run without refs", (t) => {
	const input = {}
	t.false(input === unwrapRefs(input))
})

test("Correctly works on json types", (t) => {
	t.notThrows(() => unwrapRefs({}), "object")
	t.notThrows(() => unwrapRefs([]), "array")
	t.notThrows(() => unwrapRefs(1), "number")
	t.notThrows(() => unwrapRefs("str"), "string")
	t.notThrows(() => unwrapRefs(false), "boolean")
	t.notThrows(() => unwrapRefs(null), "null")
})

test("Throws on non json types", (t) => {
	t.throws(() => unwrapRefs(() => {}), /Unsupported type/, "function")
	t.throws(() => unwrapRefs(Symbol("foo")), /Unsupported type/, "symbol")
	t.throws(() => unwrapRefs(undefined), /Unsupported type/, "undefined")
})

test.todo("check cyclic refs")

test("unwrap simple ref on first level", (t) => {
	const input = {
		foo: { $ref: "#/bar" },
		bar: { value: 1 },
	}

	const expected = {
		foo: { value: 1 },
		bar: { value: 1 },
	}

	t.deepEqual(unwrapRefs(input), expected)
})

test("unwrap deep ref on first level", (t) => {
	const input = {
		foo: { bar: { baz: { $ref: "#/bar" } } },
		bar: { value: 1 },
	}

	const expected = {
		foo: { bar: { baz: { value: 1 } } },
		bar: { value: 1 },
	}

	t.deepEqual(unwrapRefs(input), expected)
})

test("unwrap deep ref on deep level", (t) => {
	const input = {
		foo: { bar: { baz: { $ref: "#/bar/foo/baz" } } },
		bar: { foo: { baz: { value: 1 } } },
	}

	const expected = {
		foo: { bar: { baz: { value: 1 } } },
		bar: { foo: { baz: { value: 1 } } },
	}

	t.deepEqual(unwrapRefs(input), expected)
})

test("unwrap deep ref on first level with deep copy", (t) => {
	const input = {
		foo: { bar: { baz: { $ref: "#/bar" } } },
		bar: { foo: { baz: { value: 1 } } },
	}

	const expected = {
		foo: { bar: { baz: { foo: { baz: { value: 1 } } } } },
		bar: { foo: { baz: { value: 1 } } },
	}

	t.deepEqual(unwrapRefs(input), expected)
})

test("unwrap deep ref on deep level with deep copy with arrays", (t) => {
	const input = {
		foo: { bar: { baz: [{ $ref: "#/bar/0/foo" }] } },
		bar: [{ foo: { baz: { value: 1 } } }],
	}

	const expected = {
		foo: { bar: { baz: [{ baz: { value: 1 } }] } },
		bar: [{ foo: { baz: { value: 1 } } }],
	}

	t.deepEqual(unwrapRefs(input), expected)
})

test("unwrap deep ref with ref on deep level with deep copy with arrays", (t) => {
	const input = {
		foo: { bar: { baz: [{ $ref: "#/bar/0/foo" }] } },
		bar: [{ foo: { baz: { value: 1, second: { $ref: "#/baz/another/0" } } } }],
		baz: { another: ["EXAMPLE"] },
	}

	const expected = {
		foo: { bar: { baz: [{ baz: { value: 1, second: "EXAMPLE" } }] } },
		bar: [{ foo: { baz: { value: 1, second: "EXAMPLE" } } }],
		baz: { another: ["EXAMPLE"] },
	}

	t.deepEqual(unwrapRefs(input), expected)
})
