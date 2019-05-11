const { fetch } = require("cross-fetch")
const { getByPath } = require("./get-by-path")

function unwrapRemoteOnly(schema) {
  return visitRefs(schema, (ref) => convertRemoteReference(ref))
}

function unwrapAllRefs(schema) {
  return visitRefs(schema, (ref) => getByPath(schema, ref))
}

function convertAnyRef(ref, schema) {
  if (isRemoteRef(ref)) {
    return convertRemoteReference(ref)
  }

  if (isRelativeRef(ref)) {
    return getByPath(schema, ref)
  }

  return null // FIX IT
}

function visitRefs(object, callback) {
  if (!isSupported(object)) {
    throw new TypeError(`Unsupported type ${typeof object}`)
  }
  if (Array.isArray(object)) {
    return Promise.all(object.map((item) => visitRefs(item, callback)))
  }
  if (object === null) {
    return Promise.resolve(null)
  }

  if (isRef(object)) {
    const result = callback(object.$ref, object)

    return isThenable(result)
      ? result.then((newObject) => newObject)
      : Promise.resolve(result)
  }

  if (typeof object === "object") {
    const entriesPromises = Object.entries(object).map(([key, value]) =>
      visitRefs(value, callback).then((result) => [key, result]),
    )

    return Promise.all(entriesPromises).then((entries) =>
      entries.reduce((newObject, [key, value]) => {
        // eslint-disable-next-line no-param-reassign
        newObject[key] = value
        return newObject
      }, {}),
    )
  }

  return Promise.resolve(object)
}

function isSupported(object) {
  return ["object", "number", "string", "boolean"].includes(typeof object)
}

function isRef(object) {
  return typeof object === "object" && Boolean(object.$ref)
}

function isThenable(result) {
  return result && typeof result.then === "function"
}

/**
 * @param {string} ref Reference to jsonschema file
 */
function convertRemoteReference(ref) {
  if (!isRemoteRef(ref)) {
    return Promise.resolve(ref)
  }

  const [url, innerRef] = splitReference(ref)

  return fetch(url)
    .then(successToJson)
    .then((schema) =>
      visitRefs(schema, (refInFetched) => convertAnyRef(refInFetched, schema)),
    )
    .then((schema) => getByPath(schema, `#${innerRef}`))
}

/**
 * @param {string} ref
 */
function isRemoteRef(ref) {
  return /^https?:\/\//.test(ref)
}

function isRelativeRef(ref) {
  return ref.startsWith("#")
}

/**
 * @param {string} ref
 * @return {[string|string]} [Url | InnerRef]
 */
function splitReference(ref) {
  return ref.split("#")
}

function successToJson(response) {
  if (!response.ok) {
    return Promise.reject(
      new Error(`Failed to fetch resource: ${response.url}`),
    )
  }
  return response.json()
}

module.exports = {
  unwrapRemoteOnly,
}

unwrapAllRefs({
  example: {},
  definitions: {
    uniqueItems: {
      $ref: "https://json-schema.org/draft-04/schema#/properties/uniqueItems",
    },
    enum: {
      $ref: "https://json-schema.org/draft-04/schema#/properties/dependencies",
    },
  },
}).then((result) => console.log(JSON.stringify(result, 2, 2)))
