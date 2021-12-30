const {
	uniqueNamesGenerator,
	adjectives,
	colors,
	animals,
} = require('unique-names-generator');

const randomName = seed => {
	return uniqueNamesGenerator({
		dictionaries: [adjectives, colors, animals],
		seed: seed,
		length: 2,
	});
};

module.exports.randomName = randomName;
