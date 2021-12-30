const router = require('express').Router();
const AchievmentTemplateModel = require('../models/achievmentTemplateModel');
const Achievment = require('../models/achievmentModel');
const { randomName } = require('../helper/randomName');

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
	if (
		!req.body.ip ||
		!req.body.password ||
		req.body.password != process.env.PASS
	)
		return res.status(400).json({ err: true, msg: 'Missing data' });

	const filter = req.body.index
		? { index: req.body.index, name: randomName(req.body.ip) }
		: { name: randomName(req.body.ip) };

	const foundAchievments = await Achievment.find(filter)
		.populate('template')
		.sort([['createdAt', -1]]);

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

	console.log(foundAchievment);
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
			return res.status(200).json(newAchievment);
			//UPDATE
		} else {
			console.log('UPDATEING');
			const amount = foundAchievment[0].process + addAmount;

			foundAchievment[0].isFinished = foundTenplate.count <= amount;

			foundAchievment[0].process =
				foundTenplate.count < amount ? foundTenplate.count : amount;

			const savedAchievment = await foundAchievment[0].save();
			return res.status(200).json(savedAchievment);
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
