function getByPath(root, path) {
	if (path.indexOf("#/") === -1) {
		throw new TypeError("Not supports relative path in refs")
	}

	function getter(object, nextPath, alreadyInPath) {
		const currentKey = nextPath.shift()
		if (!currentKey) return object

		alreadyInPath.push(currentKey)

		const foundValue = object[currentKey]
		if (!foundValue) {
			throw new TypeError(`Path "${alreadyInPath.join("/")}" not found`)
		}

		return getter(foundValue, nextPath, alreadyInPath)
	}

	const next = path.split("/")
	const already = [next.shift()]

	return getter(root, next, already)
}

module.exports = {
	getByPath,
}
