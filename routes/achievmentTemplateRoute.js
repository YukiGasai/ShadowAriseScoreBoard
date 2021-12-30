const router = require('express').Router();

const AchievmentTemplateModel = require('../models/achievmentTemplateModel');

const getLastIndex = async () => {
	const foundTemplate = await AchievmentTemplateModel.find({}).sort([
		['index', -1],
	]);
	if (foundTemplate.length > 0) {
		return foundTemplate[0].index + 10;
	}
	return 10;
};

/**
 * Get one achievment template by Id
 */
router.get('/', async (req, res) => {
	if (!req.query.id) {
		return res.status(400).json({ err: true, msg: 'Missing data' });
	}

	const foundTemplate = await AchievmentTemplateModel.find({
		_id: '' + req.query.id,
	});

	if (foundTemplate.length <= 0) {
		return res.status(404).json({ err: true, msg: 'Template not found' });
	}
	return res.status(200).json(foundTemplate[0]);
});

/**
 * Get all achivments order by index
 */
router.get('/all', async (req, res) => {
	const showSecret = req.query.showSecret || 'false';
	let foundTemplates;
	if (showSecret == 'false') {
		foundTemplates = await AchievmentTemplateModel.find({
			isSecret: false,
		}).sort([['index', 1]]);
	} else {
		foundTemplates = await AchievmentTemplateModel.find({}).sort([
			['index', 1],
		]);
	}
	return res.status(200).json(foundTemplates);
});

/**
 * Add new Achievment Template
 */
router.post('/', async (req, res) => {
	if (!req.body.password || req.body.password != process.env.PASS)
		return res.status(400).json({ err: true, msg: 'Missing data' });

	if (
		!req.body.name ||
		req.body.name == '' ||
		!req.body.description ||
		req.body.description == ''
	) {
		return res
			.status(400)
			.json({ err: true, msg: 'Missing name or description' });
	}

	let index = req.body.index || (await getLastIndex());

	try {
		const savedTemplate = await new AchievmentTemplateModel({
			index,
			name: req.body.name,
			description: req.body.description,
			imageUrl: req.body.imageUrl,
			count: req.body.count,
			isSecret: req.body.isSecret,
		}).save();

		return res.status(200).json(savedTemplate);
	} catch (err) {
		return res.status(500).json({ err: true, msg: 'Error saving template' });
	}
});

/**
 * Remove all templates
 */
router.delete('/', async (req, res) => {
	if (!req.body.password || req.body.password != process.env.PASS)
		return res.status(400).json({ err: true, msg: 'Missing data' });

	const result = await AchievmentTemplateModel.deleteMany({});
	if (!result) {
		return res
			.status(500)
			.json({ err: true, msg: 'Internal error deleting templates' });
	}

	return res.status(200).json(result);
});

module.exports = router;
