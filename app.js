const express = require('express');
const app = express();
const api = require('./api/v1');
// logger
const morgan = require('morgan');
const bodyParser = require('body-parser');
// to allow request from my Angular test client that use another port
const cors = require('cors');

app.set('port', (process.env.port || 3000));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());

app.use('/api/v1', api);
app.use(express.static('static'));

app.use(morgan('dev'));

app.use(function (req, res) {
	const err = new Error('404 - Not found');
	err.status = 404;
	res.json(err);
});

app.listen(app.get('port'), function () {
	console.log(`Express server listening on port ${app.get('port')}`);// eslint-disable-line no-console
});

