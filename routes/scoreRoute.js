const router = require('express').Router();

const Score = require('../models/scoreModel');
const Player = require('../models/playerModel');
const { convertDate, converTime } = require('../helper/converter');
const { randomName } = require('../helper/randomName');

const formatScore = scores => {
	return scores.map(score => {
		let createdAt = convertDate(score.createdAt);
		let gameTime = converTime(score.gameTime);
		return { ...score, createdAt, gameTime };
	});
};

/**
 * View all scores with prefrences
 * Used in Unity to view the Scores
 */
router.post('/view', async (req, res) => {
	const sort = req.query.sort || 'gameTime';
	const sortOrder = req.query.sortOrder || 1;
	const showGrouped = req.query.grouped || 'true';
	const format = req.query.format || 'false';
	const scores = await Score.find({})
		.sort([[sort, sortOrder]])
		.lean();

	const grouped = [];
	if (showGrouped == 'true') {
		scores.forEach(score => {
			if (!grouped.some(group => group.name === score.name)) {
				grouped.push(score);
			}
		});

		if (format == 'true') {
			return res.status(200).json(formatScore(grouped));
		} else {
			return res.status(200).json(grouped);
		}
	} else {
		if (format == 'true') {
			return res.status(200).json(formatScore(scores));
		} else {
			return res.status(200).json(scores);
		}
	}
});

/**
 * Get own Scores
 */
router.post('/me', async (req, res) => {
	if (!req.body.ip)
		return res.status(400).json({ err: true, msg: 'Missing data' });

	const sort = req.query.sort || 'gameTime';
	const sortOrder = req.query.sortOrder || 1;
	const scores = await Score.find({ name: randomName(req.body.ip) })
		.sort([[sort, sortOrder]])
		.lean();

	return res.status(200).send(scores);
});

/**
 * Add new Score to the list doesn't have to be highscore
 * Triggered by ingame unity Hub
 */
router.post('/add', async (req, res) => {
	if (
		!req.body.ip ||
		!req.body.password ||
		req.body.password != process.env.PASS
	)
		return res.status(400).json({ err: true, msg: 'Missing data' });

	try {
		const savedScore = await new Score({
			name: randomName(req.body.ip),
			deathCounter: req.body.deathCounter,
			gameTime: req.body.gameTime,
		}).save();
		return res.status(200).json(savedScore);
	} catch (err) {
		return res
			.status(500)
			.json({ err: true, msg: 'Internal error saving score' });
	}
});

/**
 * Remove all scores
 */

router.delete('/', async (req, res) => {
	if (!req.body.password || req.body.password != process.env.PASS)
		return res.status(400).json({ err: true, msg: 'Missing data' });

	const result = await Score.deleteMany({});
	if (!result) {
		return res
			.status(500)
			.json({ err: true, msg: 'Internal error deleting scores' });
	}

	return res.status(200).json(result);
});

module.exports = router;
