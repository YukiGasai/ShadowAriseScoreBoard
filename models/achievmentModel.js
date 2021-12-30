const mongoose = require('mongoose');

const achievmentModel = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		template: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'AchievmentTemplate',
		},
		process: {
			type: Number,
			default: 0,
		},
		isFinished: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Achievment', achievmentModel);
