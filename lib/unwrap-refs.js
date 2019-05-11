const { getByPath } = require("./get-by-path")

const supportedTypes = ["object", "number", "string", "boolean"]

function unwrapRefs(object) {
	function unwrapper(root, current) {
		if (supportedTypes.indexOf(typeof current) === -1) {
			throw new TypeError(`Unsupported type ${typeof current}`)
		}
		if (Array.isArray(current)) {
			return current.map((item) => unwrapper(root, item))
		}
		if (current === null) {
			return null
		}
		if (typeof current === "object" && current.$ref) {
			return unwrapper(root, getByPath(root, current.$ref))
		}
		if (typeof current === "object") {
			const newObject = {}
			for (const [key, value] of Object.entries(current)) {
				newObject[key] = unwrapper(root, value)
			}
			return newObject
		}
		return current
	}

	return unwrapper(object, object)
}

module.exports = {
	unwrapRefs,
	supportedTypes,
}
