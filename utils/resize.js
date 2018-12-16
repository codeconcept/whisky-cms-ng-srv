const sharp = require('sharp');

module.exports = (config) => {
	console.log('config obj', config);
	return sharp(config.path)
		.resize(config.width, config.height)
		.toFile(config.outputName);
};