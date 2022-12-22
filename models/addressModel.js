/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	country: {
		type: String,
		required: true,
	},
	address: {
		type: String,
		required: true,
	},
	city: {
		type: String,
		required: true,
	},
	zip: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		immutable: true,
		default: () => Date.now(),
	},

});


module.exports = mongoose.model('Address', addressSchema);
