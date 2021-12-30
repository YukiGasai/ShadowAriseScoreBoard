const mongoose = require('mongoose');

const achievmentTemplateModel = new mongoose.Schema(
	{
		index: {
			type: Number,
			required: true,
			unique: true,
		},
		name: {
			type: String,
			required: true,
			unique: true,
		},
		description: {
			type: String,
			required: true,
			unique: true,
		},
		imageUrl: {
			type: String,
			default: 'https://i.imgur.com/HkoIZ73.png',
		},
		count: {
			type: Number,
			default: 1,
		},
		isSecret: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('AchievmentTemplate', achievmentTemplateModel);
