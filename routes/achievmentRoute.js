const router = require('express').Router();
const AchievmentTemplateModel = require('../models/achievmentTemplateModel');
const Achievment = require('../models/achievmentModel');
const { randomName } = require('../helper/randomName');

const getStats = async index => {
	let count = await Achievment.find({ isFinished: true }).populate('template');

	count = count.filter(achievment => achievment.template.index == 10);

	count = count.length;

	let total = await Achievment.find({}).populate('template');

	total = total.filter(achievment => achievment.template.index == index);

	total = total.length;

	if (total == 0) return 0;

	return (count / total) * 100;
};

router.post('/all', async (req, res) => {
	if (!req.body.password || req.body.password != process.env.PASS)
		return res.status(400).json({ err: true, msg: 'Missing data' });

	const filter = req.body.index ? { index: req.body.index } : {};

	const foundAchievments = await Achievment.find(filter)
		.populate('template')
		.sort([['createdAt', -1]]);

	return res.status(200).json(foundAchievments);
});

/**
 * Get All collectet achievments by one player
 */
router.post('/player', async (req, res) => {
	if (!req.body.ip)
		return res.status(400).json({ err: true, msg: 'Missing data' });

	const allTemplates = await AchievmentTemplateModel.find({})
		.lean()
		.sort([['index', -1]]);

	const foundAchievments = await Achievment.find({
		name: randomName(req.body.ip),
	})
		.populate('template')
		.lean()
		.sort([['index', -1]]);

	allTemplates.forEach(template => {
		const isFound = foundAchievments.some(
			achievment => achievment.template.index == template.index
		);

		if (!isFound) {
			foundAchievments.push({
				_id: '',
				name: '',
				template: template,
				process: 0,
				isFinished: false,
				createdAt: '',
				updatedAt: '',
				__v: 0,
			});
		}
	});

	foundAchievments.sort(function (a, b) {
		return a.template.index - b.template.index;
	});

	for (let i = 0; i < foundAchievments.length; i++) {
		const successRate = await getStats(foundAchievments[i].template.index);
		foundAchievments[i].template = {
			...foundAchievments[i].template,
			successRate,
		};
	}

	return res.status(200).json(foundAchievments);
});

/**
 * Get All collectet achievments by one player
 */
router.post('/add', async (req, res) => {
	if (
		!req.body.ip ||
		!req.body.index ||
		!req.body.password ||
		req.body.password != process.env.PASS
	)
		return res.status(400).json({ err: true, msg: 'Missing data' });

	const addAmount = req.body.addAmount ? req.body.addAmount : 1;

	const foundTenplate = await AchievmentTemplateModel.findOne({
		index: req.body.index,
	});

	if (!foundTenplate)
		return res.status(404).json({ err: true, msg: 'Index not found' });

	let foundAchievment = await Achievment.find({
		name: randomName(req.body.ip),
	}).populate('template');

	foundAchievment = foundAchievment.filter(
		a => a.template.index == req.body.index
	);

	if (foundAchievment.length) {
		if (foundAchievment[0].isFinished) {
			return res
				.status(200)
				.json({ done: foundAchievment[0].isFinished, alreadyDone: true });
		}
	}

	try {
		//ADD
		if (!foundAchievment.length) {
			console.log('ADDING');
			const isFinished = foundTenplate.count <= addAmount;

			const newAchievment = await new Achievment({
				name: randomName(req.body.ip),
				template: foundTenplate._id,
				process: addAmount,
				isFinished,
			}).save();
			return res.status(200).json({ done: isFinished, alreadyDone: false });
			//UPDATE
		} else {
			console.log('UPDATEING');
			const amount = foundAchievment[0].process + addAmount;

			foundAchievment[0].isFinished = foundTenplate.count <= amount;

			foundAchievment[0].process =
				foundTenplate.count < amount ? foundTenplate.count : amount;

			const savedAchievment = await foundAchievment[0].save();
			return res
				.status(200)
				.json({ done: foundAchievment[0].isFinished, alreadyDone: false });
		}
	} catch (err) {
		console.log(err);
		return res
			.status(500)
			.json({ err: true, msg: 'Internal error updating achievment' });
	}
});

/**
 * Remove all achievments
 */
router.delete('/', async (req, res) => {
	if (!req.body.password || req.body.password != process.env.PASS)
		return res.status(400).json({ err: true, msg: 'Missing data' });

	const result = await Achievment.deleteMany({});
	if (!result) {
		return res
			.status(500)
			.json({ err: true, msg: 'Internal error deleting achievments' });
	}

	return res.status(200).json(result);
});

module.exports = router;
