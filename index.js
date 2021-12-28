require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Score = require('./models/scoreModel');
const bodyParser = require('body-parser');
const cors = require('cors');

const PORT = process.env.PORT || 3000;

const {
	uniqueNamesGenerator,
	adjectives,
	colors,
	animals,
} = require('unique-names-generator');

const randomName = seed => {
	return uniqueNamesGenerator({
		dictionaries: [adjectives, colors, animals],
		seed,
	});
};

const cleanScores = scores => {
	return scores.map(score => {
		const numberIp = parseInt(score.ip.replace(/\D/g, ''), 10);
		return { ...score, ip: randomName(numberIp) };
	});
};

mongoose.connect(process.env.DB_URL, () => {
	console.log('Connected to db');
});

app.use(bodyParser.json());

app.use(cors());

/**
 * List all highscores but group by ip
 */
app.get('/api/view', async (req, res) => {
	const sort = req.query.sort || 'gameTime';
	const sortOrder = req.query.sortOrder || 1;
	const showGrouped = req.query.grouped || 'true';
	const scores = await Score.find({})
		.sort([[sort, sortOrder]])
		.lean();

	const grouped = [];
	console.log(showGrouped);
	if (showGrouped == 'true') {
		scores.forEach(score => {
			if (!grouped.some(group => group.ip === score.ip)) {
				grouped.push(score);
			}
		});
		res.status(200).json(cleanScores(grouped));
	} else {
		res.status(200).json(cleanScores(scores));
	}
});

/**
 * Get Player Name
 */
app.get('/api/name', async (req, res) => {
	const ipAddr =
		req.headers['x-forwarded-for'] || req.socket.remoteAddress || '187.361.0.1';

	const numberIp = parseInt(ipAddr.replace(/\D/g, ''), 10);

	res.status(200).json({ name: randomName(numberIp) });
});

/**
 * Get own Scores
 */
app.get('/api/me', async (req, res) => {
	let result = {};
	const ipAddr =
		req.headers['x-forwarded-for'] || req.socket.remoteAddress || '187.361.0.1';

	const sort = req.query.sort || 'gameTime';
	const sortOrder = req.query.sortOrder || 1;
	const scores = await Score.find({ ip: ipAddr })
		.sort([[sort, sortOrder]])
		.lean();

	const numberIp = parseInt(ipAddr.replace(/\D/g, ''), 10);
	result.ip = randomName(numberIp);
	result.amount = scores.length;
	result.scores = cleanScores(scores);

	res.send(result);
});

/**
 * Add new Score to the list doesn't have to be highscore
 * Triggered by ingame unity Hub
 */
app.post('/api/add', async (req, res) => {
	if (req.body.password === 'Gronbowski') {
		const ipAddr =
			req.headers['x-forwarded-for'] ||
			req.socket.remoteAddress ||
			'187.361.0.1';

		const newSore = new Score({
			ip: ipAddr,
			deathCounter: req.body.deathCounter,
			gameTime: req.body.gameTime,
		});
		const savedScore = await newSore.save();
		res.status(200).json(savedScore);
	} else {
		res.status(401).json({ msg: 'cheater' });
	}
});

app.get('/', (req, res) => {
	res.sendFile('page.html', { root: __dirname });
});

app.listen(PORT, () => {
	console.log(`Server startet at ${PORT}`);
});
