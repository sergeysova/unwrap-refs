import test from "ava"
import { getByPath } from "../lib"

test("allows only root level paths", (t) => {
  const input = { foo: 1 }

  t.throws(
    () => {
      getByPath(input, "foo")
    },
    /Not supports/,
    "should be path",
  )
  t.throws(
    () => {
      getByPath(input, "foo/path")
    },
    /Not supports/,
    "should be root level",
  )
  t.throws(
    () => {
      getByPath(input, "#")
    },
    /Not supports/,
    "could not get root from root",
  )
})

test("get path from top level", (t) => {
  const input = { foo: 1 }
  const path = "#/foo"

  t.is(getByPath(input, path), input.foo)
})

test("get path from deep level", (t) => {
  const input = { foo: { bar: { baz: { gal: { rae: "HELLO" } } } } }
  const path = "#/foo/bar/baz/gal/rae"

  t.is(getByPath(input, path), input.foo.bar.baz.gal.rae)
})

test("get from array", (t) => {
  const input = { foo: { bar: { baz: [{ gal: { rae: ["HELLO"] } }] } } }
  const path = "#/foo/bar/baz/0/gal/rae/0"

  t.is(getByPath(input, path), input.foo.bar.baz[0].gal.rae[0])
})

test("get from toplevel array", (t) => {
  const input = [{ foo: { bar: { baz: [{ gal: { rae: ["HELLO"] } }] } } }]
  const path = "#/0/foo/bar/baz/0/gal/rae/0"

  t.is(getByPath(input, path), input[0].foo.bar.baz[0].gal.rae[0])
})

test("throw exception if path not found", (t) => {
  const input = { foo: 1 }
  const path = "#/bar"

  t.throws(
    () => {
      getByPath(input, path)
    },
    /not found/,
    "throw not found",
  )
})

test("fetch root with #/", (t) => {
  const input = { foo: 1 }
  const path = "#/"

  t.is(getByPath(input, path), input)
})

test("returns reference not copy", (t) => {
  const input = {
    foo: {
      bar: {
        baz: 1,
      },
    },
    bar: ["example", { baz: { value: 1 } }],
  }

  t.true(getByPath(input, "#/") === input, "ref to root")
  t.true(getByPath(input, "#/foo") === input.foo)
  t.true(getByPath(input, "#/foo/bar") === input.foo.bar)
  t.true(getByPath(input, "#/foo/bar/baz") === input.foo.bar.baz)
  t.true(getByPath(input, "#/bar/0") === input.bar[0])
  t.true(getByPath(input, "#/bar/1") === input.bar[1])
  t.true(getByPath(input, "#/bar/1/baz") === input.bar[1].baz)
  t.true(getByPath(input, "#/bar/1/baz/value") === input.bar[1].baz.value)
})

test("throws when deep path not found", (t) => {
  const input = {
    foo: {
      bar: {
        baz: 1,
      },
    },
    bar: ["example", { baz: { value: 1 } }],
  }

  t.throws(() => {
    getByPath(input, "#/foo/BAAAA/baz")
  }, 'Path "#/foo/BAAAA" not found')

  t.throws(() => {
    getByPath(input, "#/bar/2/value")
  }, 'Path "#/bar/2" not found')

  t.throws(() => {
    getByPath(input, "#/example/foo/bar/baz/bam")
  }, 'Path "#/example" not found')

  t.throws(() => {
    getByPath(input, "#/bar/1/baz/demo")
  }, 'Path "#/bar/1/baz/demo" not found')
})
