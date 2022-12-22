const mongoose = require('mongoose');


const productSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	platform: {
		type: String,
		required: true,
	},
	genre: {
		type: String,
		// required:true
	},
	tags: {
		type: String,
		// required:true
	},
	description: {
		type: String,
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
	rating: {
		type: Number,
		required: true,
	},
	image: {
		type: String,
	},
	soft: {
		type: Number,
		required: true,
		default: 0,
	},
});

module.exports = mongoose.model('product', productSchema);
