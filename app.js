const express = require('express');
const app = express();
const api = require('./api/v1');
// logger
const morgan = require('morgan');
const bodyParser = require('body-parser');
// to allow request from my Angular test client that use another port
const cors = require('cors');

const mongoose = require('mongoose');
const connection = mongoose.connection;


app.set('port', (process.env.port || 3000));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());

const uploadsDir = require('path').join(__dirname,'/uploads');
console.log('uploadsDir', uploadsDir);
app.use(express.static(uploadsDir));

app.use('/api/v1', api);
app.use(express.static('static'));

app.use(morgan('dev'));

app.use(function (req, res) {
	const err = new Error('404 - Not found');
	err.status = 404;
	res.json(err);
});

// useNewUrlParser to avoid de deprecation warning
mongoose.connect('mongodb://localhost:27017/whiskycms', { useNewUrlParser: true });

connection.on('error', (err) => {
	console.error(`connection to MongoDB error: ${err.message}`); // eslint-disable-line no-console
});

connection.once('open', () => {
	console.log('Connected to MongoDB'); // eslint-disable-line no-console

	app.listen(app.get('port'), () => {
		console.log(`Express server listening on port ${app.get('port')}`);// eslint-disable-line no-console
	});
});
