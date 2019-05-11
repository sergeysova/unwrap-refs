import test from "ava"
import { unwrapRemoteOnly } from "../lib"

const original = {
  definitions: {
    uniqueItems: {
      $ref: "https://json-schema.org/draft-04/schema#/properties/uniqueItems",
    },
    enum: {
      $ref: "https://json-schema.org/draft-04/schema#/properties/enum",
    },
  },
}

const expected = {
  definitions: {
    uniqueItems: {
      type: "boolean",
      default: false,
    },
    enum: {
      type: "array",
      minItems: 1,
      uniqueItems: true,
    },
  },
}

test("simple object", async (t) => {
  const actual = await unwrapRemoteOnly(original)

  t.deepEqual(actual, expected)
})
