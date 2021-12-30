require('dotenv').config();
const express = require('express');
const app = express();
const expressSwagger = require('express-swagger-generator')(app);
const mongoose = require('mongoose');

const bodyParser = require('body-parser');
const cors = require('cors');

const PORT = process.env.PORT || 3000;

const scoreRoute = require('./routes/scoreRoute');
const playerRoute = require('./routes/playerRoute');
const templateRoute = require('./routes/achievmentTemplateRoute');
const achievmentRoute = require('./routes/achievmentRoute');

let options = {
	swaggerDefinition: {
		info: {
			description: 'This is the Shadow Arise backend',
			title: 'Swagger',
			version: '1.0.0',
		},
		host: 'localhost:' + PORT,
		basePath: '/api',
		produces: ['application/json'],
		schemes: ['http', 'https'],
		securityDefinitions: {
			JWT: {
				type: 'apiKey',
				in: 'header',
				name: 'auth-token',
				description: 'Jwt token to authenticate with app',
			},
		},
	},
	basedir: __dirname, //app absolute path
	files: ['./routes/*.js'], //Path to the API handle folder
};
expressSwagger(options);

app.use(cors());
app.use(bodyParser.json());

app.use('/api/player', playerRoute);
app.use('/api/score', scoreRoute);
app.use('/api/template', templateRoute);
app.use('/api/achievment', achievmentRoute);

app.use('/public', express.static('public'));

app.get('/', (req, res) => {
	res.sendFile('page.html', { root: __dirname });
});

mongoose.connect(process.env.DB_URL, () => {
	console.log('Connected to db');
});

app.listen(PORT, () => {
	console.log(`Server startet at ${PORT}`);
});
