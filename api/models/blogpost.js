const mongoose = require('mongoose');

const blogpostSchema = new mongoose.Schema({
	title: String,
	subTitle: String,
	image: String,
	content: String,
	createdOn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Blogpost', blogpostSchema);