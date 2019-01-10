const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');

const Blogpost = require('../models/blogpost');
const resize = require('../../utils/resize');

router.get('/ping', (req, res) => {
	res.status(200).json({ msg: 'pong', date: new Date()});
});

router.get('/blog-posts', (req, res) => {
	// to see if req.user exists right after registration or login
	console.log('req.user',req.user);
	Blogpost.find()
		.sort({ 'createdOn': -1 })
		.exec()
		.then(blogPosts => res.status(200).json(blogPosts))
		.catch(err => res.status(500).json({
			message: 'blog posts not found - :(',
			error: err
		}));
});

router.get('/blog-posts/:id', (req, res) => {
	const id = req.params.id;
	Blogpost.findById(id)
		.then(blogPost => res.status(200).json(blogPost))
		.catch(err => res.status(500).json({
			message: `blog post with id ${id} not found`,
			error: err
		}));
});

router.post('/blog-posts', (req, res) => {
	console.log('req.body', req.body);
	console.log('lastUploadedImageName', lastUploadedImageName);
	const smallImagePath = `./uploads/${lastUploadedImageName}`;
	const outputName = `./uploads/small-${lastUploadedImageName}`;
	resize({path: smallImagePath, width: 200, height: 200, outputName: outputName })
		.then(data => {
			console.log('OK resize', data.size);
		})
		.catch(err => console.error('err from resize', err));
	const blogPost = new Blogpost({
		...req.body, 
		image: lastUploadedImageName,
		smallImage: `small-${lastUploadedImageName}`
	});
	blogPost.save((err, blogPost) => {
		if (err) {
			return res.status(500).json(err);
		}
		res.status(201).json(blogPost);
	});
});

router.delete('/blog-posts/:id', (req, res) => {
	// return res.status(500).json({ msg: `TESTING ERROR HANDLING on ${req.params.id} delete`});
	console.log('req.isAuthenticated()', req.isAuthenticated());
	if(!req.isAuthenticated()) {
		return res.status(401).json({ result: 'KO', msg: 'NOT authorized to delete a blog post' });
	}
	console.log('router.delete / req.user >>>', req.user);
	const id = req.params.id;
	console.log('delete by id', id);
	Blogpost.findByIdAndDelete(id, (err, blogPost) => {
		if (err) {
			return res.status(500).json(err);
		}
		res.status(202).json({ msg: `blog post with id ${blogPost._id} deleted`});
	});
});

router.delete('/blog-posts', (req, res) => {
	// retrieves the query parameter: http://localhost:3000/api/v1/blog-posts?ids=5c1133b8225e420884687048,5c1133b6225e420884687047
	const ids = req.query.ids;
	console.log('query allIds', ids);
	const allIds = ids.split(',').map(id => {
		// casting as a mongoose ObjectId	
		if (id.match(/^[0-9a-fA-F]{24}$/)) {
			return mongoose.Types.ObjectId((id));		 
		}else {
			console.log('id is not valid', id);
			return -1;
		}
	});
	const condition = { _id: { $in: allIds} };
	Blogpost.deleteMany(condition, (err, result) => {
		if (err) {
			return res.status(500).json(err);
		}
		res.status(202).json(result);
	});
});

let lastUploadedImageName = '';
// file upload configuration
const storage = multer.diskStorage({
	destination: './uploads/',
	filename: function (req, file, callback) {
		crypto.pseudoRandomBytes(16, function(err, raw) {
			if (err) return callback(err);
			lastUploadedImageName = raw.toString('hex') + path.extname(file.originalname);
			callback(null, lastUploadedImageName);
		});
	}
});

var upload = multer({storage: storage});

// file upload route
router.post('/blog-posts/images', upload.single('image'), (req, res) => {
	// console.log('req.file', req.file);
	if (!req.file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
		return res.status(400).json({ msg: 'only image files please'});
	}
	res.status(201).send({ fileName: req.file.filename, file: req.file });
});


router.get('/images/:image', (req, res) => {
	const image = req.params.image;
	res.sendFile(path.join(__dirname, `./uploads/${image}`));
});

router.put('/blog-posts/:id', upload.single('image'), (req, res) => {
	const id = req.params.id;
	const conditions = { _id: id};
	const blogPost = {...req.body, image: lastUploadedImageName};
	const update = { $set: blogPost };
	const options = {
		upsert: true,
		new: true
	};
	Blogpost.findOneAndUpdate(conditions, update, options, (err, response) => {
		if(err) return res.status(500).json({ msg: 'update failed', error: err });
		res.status(200).json({ msg: `document with id ${id} updated`, response: response });
	});
});

module.exports = router;