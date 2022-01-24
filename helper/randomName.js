const {
	uniqueNamesGenerator,
	adjectives,
	colors,
	animals,
} = require('unique-names-generator');

const randomName = seed => {
	const og = seed;
	//Only Hex values stay
	seed = seed.replace(/[^A-Fa-f0-9]/g, '');

	//Cut id down to fit into seed size
	if (seed.length > 19) {
		seed = seed.substring(0, 19);
	}

	//Turn hex to int
	seed = parseInt(seed, 16);

	const name = uniqueNamesGenerator({
		dictionaries: [adjectives, colors, animals],
		seed: seed,
		length: 2,
	});
	return name;
};

module.exports.randomName = randomName;
