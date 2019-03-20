module.exports = {
	extends: ["@atomix/eslint-config"],
	rules: {
		"no-use-before-define": [
			"error",
			{
				functions: false,
				classes: true,
				variables: false,
			},
		],
	},
}
