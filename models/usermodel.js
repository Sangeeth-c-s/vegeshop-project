const mongoose = require('mongoose');
const Product = require('./productmodel');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	isAdmin: {
		type: Number,
		required: true,
		default: 0,
	},
	isVerified: {
		type: Number,
		default: 1,
	},
	mobileNumber: {
		type: Number,
    
	},
	otp: {
		type: Number,
	},
	cart: {
		items: [
			{
				productId: {
					type: mongoose.Types.ObjectId,
					ref: 'product',
					required: true,
				},
				price: {
					type: Number,
				},
				qty: {
					type: Number,
					required: true,
				},
			},
		],

		totalPrice: {
			type: Number,
			default: 0,
		},
	},
	wishlist: {
		items: [
			{
				productId: {
					type: mongoose.Types.ObjectId,
					ref: 'product',
					required: true,
				},
				price: {
					type: Number,
				},
				qty: {
					type: Number,
					required: true,
				},
			},
		],

		totalPrice: {
			type: Number,
			default: 0,
		},
	},
});

userSchema.methods.addToCart = function (product) {
	const cart = this.cart;
	console.log('cart', cart);
	const isExisting = cart.items.findIndex((objInItems) => {
		return (
			new String(objInItems.productId).trim() == new String(product._id).trim()
		);
	});
	console.log('isexisting', isExisting);
	if (isExisting >= 0) {
		cart.items[isExisting].qty += 1;
	} else {
		cart.items.push({ productId: product._id, qty: 1, price: product.price });
	}

	cart.totalPrice += product.price;
	console.log('User in schema:', this);
	return this.save();
};
userSchema.methods.removefromCart = async function (productId) {
	const cart = this.cart;
	console.log(this);
	const isExisting = cart.items.findIndex((objInItems) => {
		new String(objInItems.productId).trim() === new String(productId).trim();
	});
	if (isExisting >= 0) {
		const prod = await Product.findById(productId);
		cart.totalPrice -= prod.price * cart.item[isExisting].qty;
		cart.item.splice(isExisting, 1);
		console.log('User in schema:', this);
		return this.save();
	}
};

userSchema.methods.addToWishlist = function (product) {
	const wishlist = this.wishlist;
	console.log('wishlist', wishlist);
	const isExisting = wishlist.items.findIndex((objInItems) => {
		return (
			new String(objInItems.productId).trim() == new String(product._id).trim()
		);
	});
	console.log('isexisting', isExisting);
	if (isExisting >= 0) {
		wishlist.items[isExisting].qty += 1;
	} else {
		wishlist.items.push({
			productId: product._id,
			qty: 1,
			price: product.price,
		});
	}

	wishlist.totalPrice += product.price;
	console.log('User in schema:', this);
	return this.save();
};

userSchema.methods.removefromWishlist = async function (productId) {
	const wishlist = this.wishlist;
	console.log(wishlist);
	const isExisting = wishlist.items.findIndex((objInItems) => {
		new String(objInItems.productId).trim() === new String(productId).trim();
	});
	if (isExisting >= 0) {
		const prod = await Product.findById(productId);
		wishlist.totalPrice -= prod.price * wishlist.item[isExisting].qty;
		wishlist.item.splice(isExisting, 1);
		console.log('User in schema:', this);
		return this.save();
	}
};

module.exports = mongoose.model('User', userSchema);
