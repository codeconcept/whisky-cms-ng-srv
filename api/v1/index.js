const express = require('express');
const router = express.Router();
const Blogpost = require('../models/blogpost');

router.get('/ping', (req, res) => {
	res.status(200).json({ msg: 'pong', date: new Date()});
});

router.get('/blog-posts', (req, res) => {
	const posts = [
		{
			id: 1,
			title: 'Etre programmeur ça pique parfois !!!',
			subTitle: 'ce cactus est pas là pour rien',
			image: 'https://cdn.vuetifyjs.com/images/cards/sunshine.jpg',
			content:
        'I\'m a thing. But, like most politicians, he promised more than he could deliver. You won\'t have time for sleeping, soldier. not with all the bed making you\'ll be doing. Then we\'ll go with that data file! Hey, you add a one and two zeros to that or we walk! You\'re going to do his laundry? I\'ve got to find a way to escape.',
		},
		{
			id: 2,
			title: 'Un nouveau framework JS',
			subTitle: 'encore !?',
			image: 'https://fakeimg.pl/300/?text=frameworks',
			content: 'Ca en fait 1 par semaine. On va pas tenir le rythme',
		},
		{
			id: 3,
			title: 'Vive le vanilla JavaScript',
			subTitle: 'encore !?',
			image: 'https://fakeimg.pl/300/?text=JS',
			content: 'Là au moins, on est sûr que ça va durer',
		},
	];
	res.status(200).json(posts);
});

router.post('/blog-posts', (req, res) => {
	console.log('req.body', req.body);
	const blogPost = new Blogpost(req.body);
	blogPost.save((err, blogPost) => {
		if (err) {
			return res.status(500).json(err);
		}
		res.status(201).json(blogPost);
	});
});

module.exports = router;