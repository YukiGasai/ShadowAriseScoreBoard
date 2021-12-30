const router = require('express').Router();
const Player = require('../models/playerModel');
const Achievment = require('../models/achievmentModel');
const AchievmentTemplate = require('../models/achievmentTemplateModel');
const { randomName } = require('../helper/randomName');

/**
 * Get Player Count
 */
router.post('/count', async (req, res) => {
	if (!req.body.ip)
		return res.status(400).json({ err: true, msg: 'Missing data' });

	let result = {};

	result.done = (
		await Achievment.find({ name: randomName(req.body.ip), isFinished: true })
	).length;

	result.inProgress = (
		await Achievment.find({ name: randomName(req.body.ip), isFinished: false })
	).length;

	result.total = (await AchievmentTemplate.find({})).length;

	res.status(200).json(result);
});

/**
 * Get Player Name
 */
router.post('/name', async (req, res) => {
	if (!req.body.ip)
		return res.status(400).json({ err: true, msg: 'Missing data' });

	res.status(200).json({ name: randomName(req.body.ip) });
});

/**
 * Get One Player by MAC Address
 */
router.post('/', async (req, res) => {
	if (
		!req.body.ip ||
		!req.body.password ||
		req.body.password != process.env.PASS
	)
		return res.status(400).json({ err: true, msg: 'Missing data' });

	const foundPlayer = await Player.findOne({ ip: req.body.ip });
	if (!foundPlayer) {
		return res.status(404).json({ err: true, msg: 'Player not found' });
	}

	res.status(200).json(foundPlayer);
});

/**
 * Get All Players
 */
router.post('/all', async (req, res) => {
	if (!req.body.password || req.body.password != process.env.PASS)
		return res.status(400).json({ err: true, msg: 'Missing data' });

	const foundPlayers = await Player.find();

	res.status(200).json(foundPlayers);
});

/**
 * Get Player Name
 */
router.post('/add', async (req, res) => {
	if (!req.body.ip)
		return res.status(400).json({ err: true, msg: 'Missing data' });

	const foundPlayer = await Player.findOne({ ip: req.body.ip });
	if (foundPlayer) {
		return res.status(404).json({ err: true, msg: 'Player already exists' });
	}

	const savedPlayer = await new Player({
		ip: req.body.ip,
		name: randomName(req.body.ip),
	}).save();

	if (!savedPlayer) {
		return res
			.status(500)
			.json({ err: true, msg: 'Internal error saving player' });
	}
	res.status(200).json({ err: false, msg: 'Player added' });
});

router.delete('/', async (req, res) => {
	if (!req.body.password || req.body.password != process.env.PASS)
		return res.status(400).json({ err: true, msg: 'Missing data' });

	const result = await Player.deleteMany({});
	if (!result) {
		return res
			.status(500)
			.json({ err: true, msg: 'Internal error deleting players' });
	}

	res.status(200).json(result);
});

module.exports = router;
