const mongoose = require('mongoose');

const playerModel = new mongoose.Schema(
	{
		ip: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		scores: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Score',
				default: [],
			},
		],
		achievments: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Achievment',
				default: [],
			},
		],
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Player', playerModel);
