require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Score = require('./models/scoreModel');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.DB_URL, () => {
	console.log('Connected to db');
});

app.use(bodyParser.json());

app.post('/api/view', async (req, res) => {
	if (req.body.password === 'Gronbowski') {
		const scores = await Score.find();
		res.status(200).json(scores);
	} else {
		res.status(200).json({ msg: 'hi' });
	}
});

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
		res.status(4001).json({ msg: 'cheater' });
	}
});

app.get('/', (req, res) => {
	res.sendFile('page.html', { root: __dirname });
});

app.listen(PORT, () => {
	console.log(`Server startet at ${PORT}`);
});
