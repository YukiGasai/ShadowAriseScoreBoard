const mongoose = require('mongoose');

const scoreModel = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		deathCounter: {
			type: Number,
			required: true,
		},
		gameTime: {
			type: Number,
			required: true,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Score', scoreModel);
