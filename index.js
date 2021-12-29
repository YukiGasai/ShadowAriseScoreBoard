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
		seed: seed,
		length: 2,
	});
};

const cleanScores = scores => {
	return scores.map(score => {
		const numberIp = parseInt(score.ip.replace(/\D/g, ''), 10);
		return { ...score, ip: randomName(numberIp) };
	});
};

const formatScore = scores => {
	return scores.map(score => {
		let createdAt = convertDate(score.createdAt);
		let gameTime = converTime(score.gameTime);
		return { ...score, createdAt, gameTime };
	});
};

//2021-12-28T22:34:44.128Z
const convertDate = timestamp => {
	let date = new Date(timestamp);
	let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
	let month =
		date.getMonth() + 1 < 10 ? '0' + date.getMonth() + 1 : date.getMonth() + 1;
	let year =
		date.getFullYear() < 10 ? '0' + date.getFullYear() : date.getFullYear();
	let hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
	let minute =
		date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
	let second =
		date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
	return (
		day + '.' + month + '.' + year + ' ' + hour + ':' + minute + ':' + second
	);
};

//2021-12-28T22:34:44.128Z
const converTime = time => {
	let hours = Math.floor(time / 3600);
	let minutes = Math.floor(time / 60);
	let seconds = time % 60;

	if (hours < 10) hours = '0' + hours;
	if (minutes < 10) minutes = '0' + minutes;
	if (seconds < 10) seconds = '0' + seconds;

	return hours + ':' + minutes + ':' + seconds;
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
	const format = req.query.format || 'false';
	const scores = await Score.find({})
		.sort([[sort, sortOrder]])
		.lean();

	console.log(format);

	const grouped = [];
	if (showGrouped == 'true') {
		scores.forEach(score => {
			if (!grouped.some(group => group.ip === score.ip)) {
				grouped.push(score);
			}
		});

		if (format == 'true') {
			res.status(200).json(formatScore(cleanScores(grouped)));
		} else {
			res.status(200).json(cleanScores(grouped));
		}
	} else {
		if (format == 'true') {
			res.status(200).json(formatScore(cleanScores(scores)));
		} else {
			res.status(200).json(cleanScores(scores));
		}
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
	const ipAddr =
		req.headers['x-forwarded-for'] || req.socket.remoteAddress || '187.361.0.1';

	const sort = req.query.sort || 'gameTime';
	const sortOrder = req.query.sortOrder || 1;
	const scores = await Score.find({ ip: ipAddr })
		.sort([[sort, sortOrder]])
		.lean();

	res.send(scores);
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
