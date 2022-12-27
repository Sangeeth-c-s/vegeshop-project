/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const User = require('../models/usermodel');
const bcrypt = require('bcrypt');
const Product = require('../models/productmodel');
const Orders = require('../models/orderModel');
const Address = require('../models/addressModel');
const fast2sms = require('fast-two-sms');
const Coupon = require('../models/couponsmodel');





// eslint-disable-next-line no-unused-vars
let newUser;
let newOtp;



const securePassword = async (password) => {
	try {
		const passwordHash = await bcrypt.hash(password, 10);
		return passwordHash;
	} catch (error) {
		console.log(error.message);
	}
};

const loadLandingPage = async (req, res) => {
	try {
		res.render('home');
	} catch (error) {
		console.log(error.message);
	}
};

const loadloginPage = async (req, res) => {
	try {
		res.render('userlogin');
	} catch (error) {
		console.log(error.message);
	}
};

const insertUser = async (req, res) => {
	console.log(req.body);
	try {
		const spassword = await securePassword(req.body.password);
		const user = new User({
			name: req.body.name,
			email: req.body.email,
			mobileNumber:req.body.mobileNumber,
			password: spassword,
			is_admin: 0,
		});

		const userData = await user.save();
		USERID = userData._id;
		if (userData) {
			const otp = sendMessage(req.body.mobileNumber);
			res.render('otp');
		} else {
			res.render('register', { message: 'Your registration has been failed' });
		}
	} catch (error) {
		console.log(error.message);
	}
};

const sendMessage = function (mobile, res) {
	randomOTP = Math.floor(Math.random() * 10000);
	var options = {
		authorization:
      'MSOj0bTnaP8phCARmWqtzkgEV4ZN2Ff9eUxXI7iJQ5HcDBKsL1vYiamnRcMxrsjDJboyFEXl0Sk37pZq',
		message: `Your OTP verification code is ${randomOTP}`,
		numbers: [mobile],
	};

	fast2sms
		.sendMessage(options)
		.then((response) => {
			console.log('OTP sent succcessfully');
		})
		.catch((error) => {
			console.log(error);
		});
	return randomOTP;
};

const otpValidation = async (req, res) => {
	try {
		userSession = req.session;
		const otp = req.body.otp;
		if (otp == randomOTP) {
			const validatedUser = await User.findById({ _id:USERID });
			validatedUser.is_varified = 1;
			const test = await validatedUser.save();
			if (test) {
				isLogin = true;
				res.redirect('/login');
			} else {
				res.render('otp', { message: 'Incorrect OTP' });
			}
		}
	} catch (error) {
		console.log(error.message);
	}
};
const verifyLogin = async (req, res) => {
	try {
		const email = req.body.email;
		const password = req.body.password;
		console.log(email,'mail');

		const userData = await User.findOne({ email: email });
		
		if (userData) {
			const passwordMatch = await bcrypt.compare(password, userData.password);
			if (passwordMatch) {
				if (userData.isVerified === 0) {
					res.render('userlogin', { message: 'please verify your OTP' });
				} else {
					if (userData.isAdmin === 1) {
						res.render('../signin', { message: 'Not user' });
					} else {
						userSession = req.session;
						userSession.user_id = userData._id;
						req.session.userID = userData._id;
						
						isLoggedin = true;
						res.redirect('/home');
						console.log('logged in');
					}
				}
			} else {
				res.render('userlogin', { message: 'Email and password is incorrect' });
			}
		} else {
			res.render('userlogin', { message: 'Email and password is incorrect' });
		}
	} catch (error) {
		console.log(error.message);
	}
};



const loadloghome = async (req, res) => {
	try {
		userSession = req.session;
		const user = await User.findById({ _id: userSession.user_id });
		if (user) {
			console.log(user.cart);
			res.render('loghome', { product: user.cart });	
		}
		
	} catch (error) {
		console.log(error.message);
	}
};

const loadshop = async (req, res) => {
	try {
		userSession = req.session;
		const user = await User.findById({ _id: userSession.user_id });

		userSession.choice = 'All';
		var search = '';
		if (req.query.search) {

			search = req.query.search;
      
		}
		var page = 1;
		if (req.query.page) {
			page = req.query.page;
		}
		const limit = 4;
		const productData = await Product.find({
			$or: [
				{ name: { $regex: '.*' + search + '.*', $options: 'i' } },
      
			]

		})
			.limit(limit * 1)
			.skip((page - 1) * limit)
			.exec();
    
		const count = await Product.find({
			$or: [{ name: { $regex: '.*' + search + '.*', $options: 'i' } }],
		}).countDocuments();

    
		res.render('shop', {
			isLoggedin,
			products: productData,
			id: userSession.user_id,
			choice: userSession.choice,
			totalpages: Math.ceil(count / limit),
			currentpage: new Number(page),
			product: user.cart,
		});
	} catch (error) {
		console.log(error.message);
	}
};

const loadcart = async (req, res, next) => {
	try {
		userSession = req.session;
	
		const user = await User.findById({ _id: userSession.user_id });
		
		if (userSession.user_id) {
			const userData = await User.findById({ _id: userSession.user_id });
			const completeUser = await userData.populate('cart.items.productId');
			res.render('cart', {
				isLoggedin,
				cartProducts: completeUser.cart,
				product: user.cart,
			});
		} else {
			res.render('cart', { isLoggedin, id: userSession.user_id });
		}
	} catch (error) {
		console.log(error.message);
	}
};

const deleteCart = async (req, res, next) => {
	const productId = req.query.id;
	userSession = req.session;
	const userData = await User.findById({ _id: userSession.user_id });
	userData.removefromCart(productId);
	res.redirect('/cart');
};

const editQty = async (req, res) => {
	try {
		id = req.query.id;
		console.log(id, ' : ', req.body.qty);
		userSession = req.session;
		const userData = await User.findById({ _id: userSession.user_id });
		const foundProduct = userData.cart.items.findIndex(
			(objInItems) => objInItems._id == id
		);
		console.log('product found at: ', foundProduct);

		userData.cart.items[foundProduct].qty = req.body.qty;
		console.log(userData.cart.items[foundProduct]);
		userData.cart.totalPrice = 0;

		const totalPrice = userData.cart.items.reduce((acc, curr) => {
			return acc + curr.price * curr.qty;
		}, 0);

		userData.cart.totalPrice = totalPrice;
		await userData.save();

		res.redirect('/cart');
	} catch (error) {
		console.log(error.message);
	}
};

const loadwishlist = async (req, res, next) => {
	try {
		userSession = req.session;
		if (userSession.user_id) {
			const userData = await User.findById({ _id: userSession.user_id });
			const completeUser = await userData.populate('wishlist.items.productId');
			res.render('wishlist', {
				isLoggedin,
				wishlistProducts: completeUser.wishlist,
			});
		} else {
			res.render('wishlist',{ isLoggedin, id: userSession.user_id });
		}
	} catch (error) {
		console.log(error.message);
	}
};

const logout = async (req, res) => {
	req.session.destroy();
	res.redirect('/');
	console.log('loggedout');
	
	
};

const profile = async (req, res) => {
	try {
		userSession = req.session;
    
		const userData = await User.findById({ _id: userSession.user_id });
    
		res.render('profile', { User: userData, product: userData.cart,wishlist: userData.wishlist });
	} catch (error) {
		console.log(error.message);
	}
};


const addToCart = async (req, res) => {
	const productId = req.query.id;
	userSession = req.session;
	const userData = await User.findById({ _id: userSession.user_id });
	const productData = await Product.findById({ _id: productId });
	userData.addToCart(productData);
	res.redirect('/shop');
};

const loadCheckout = async (req, res) => {
	try {
		userSession = req.session;
		const user = await User.findById({ _id: userSession.user_id });
		

		if (userSession.user_id) {
			const userData = await User.findById({ _id: userSession.user_id });
			const completeUser = await userData.populate('cart.items.productId');
			const address = await Address.find();
			
			if (req.query.id) {
				const selAddress = await Address.findById({ _id: req.query.id });
				console.log('id', req.query.id);
				res.render('checkout', {
					isLoggedin,
					cartProducts: completeUser.cart,
					product: user.cart,
					address: address,
					saveAddress: selAddress
				});
			}
			else {
				res.render('checkout', {
					isLoggedin,
					cartProducts: completeUser.cart,
					product: user.cart,
					address: address,
					saveAddress:''
					
					
				});
			}
		} else {
			res.render('checkout', { isLoggedin, id: userSession.user_id ,saveAddress});
		}
	} catch (error) {
		console.log(error.message);
	}
};


const storeOrder = async (req, res) => {
	try {
		userSession = req.session;
		if (userSession.user_id) {
			const userData = await User.findById({ _id: userSession.user_id });
			const completeUser = await userData.populate('cart.items.productId');
			console.log('CompleteUser: ', completeUser);

			// userData.cart.totalPrice = couponTotal;
			const updatedTotal = await userData.save();

			if (completeUser.cart.totalPrice > 0) {
				const order = Orders({
					userId: userSession.user_id,
					payment: req.body.payment,
					country: req.body.country,
					address: req.body.address,
					city: req.body.city,
          

          
					// state: req.body.state,
					zip: req.body.zip,
					products: completeUser.cart,
					// offer: offer.name,
				});
				console.log('hi');
				const orderData = await order.save();
				req.session.currentOrder = order._id;

				if (req.body.payment == 'Cash-on-Dilevery') {
					res.redirect('/orderSuccess');
				} else if (req.body.payment == 'razorpay') {
					res.render('razorpay', {
						userId: userSession.user_id,
						total: completeUser.cart.totalPrice,
					});
				} else if (req.body.payment == 'paypal') {
					res.render('paypal', {
						userId: userSession.user_id,
						total: completeUser.cart.totalPrice,
					});
				} else {
					res.redirect('/cart');
				}
			} else {
				res.redirect('/checkout');
			}
		} else {
			res.redirect('/cart');
		}
	} catch (error) {
		console.log(error.message);
	}
};
const addToWishlist = async (req, res) => {
	const productId = req.query.id;
	userSession = req.session;
	const userData = await User.findById({ _id: userSession.user_id });
	const productData = await Product.findById({ _id: productId });
	userData.addToWishlist(productData);
	res.redirect('/shop');
};

const addToWishlistToCart = async (req, res) => {
	try {
		const productId = req.query.id;
		console.log('pro_id',productId);
		userSession = req.session;
		const userData = await User.findById({ _id: userSession.user_id });
		const productData = await Product.findById({ _id: productId });
		if (productData) {
			console.log('product_data', productData);

			id = req.query.id;
			if (id) {
				userData.addToCart(productData);
				userData.removefromWishlist(productId);
				res.redirect('/wishlist');
			}
      
		}
    
  
	} catch (error) {
		console.log(error.message);
	}
};
const deletewishlist = async (req, res, next) => {
	const productId = req.query.id;
	userSession = req.session;
	const userData = await User.findById({ _id: userSession.user_id });
	userData.removefromWishlist(productId);
	res.redirect('/wishlist');
};

const editwishQty = async (req, res) => {
	try {
		id = req.query.id;
		console.log(id, ' : ', req.body.qty);
		userSession = req.session;
		const userData = await User.findById({ _id: userSession.user_id });
		const foundProduct = userData.wishlist.items.findIndex(
			(objInItems) => objInItems._id == id
		);
		console.log('product found at: ', foundProduct);

		userData.wishlist.items[foundProduct].qty = req.body.qty;
		console.log(userData.wishlist.items[foundProduct]);
		userData.wishlist.totalPrice = 0;

		const totalPrice = userData.wishlist.items.reduce((acc, curr) => {
			return acc + curr.price * curr.qty;
		}, 0);

		userData.wishlist.totalPrice = totalPrice;
		await userData.save();

		res.redirect('/wishlist');
	} catch (error) {
		console.log(error.message);
	}
};

const vegetables = async (req, res) => {
	try {
  
		userSession = req.session;
		userSession.choice ='vegetable';
		var search = '';
		if (req.query.search) {
			search = req.query.search;
		}
		var page = 1;
		if (req.query.page) {
			page = req.query.page;
		}
		const limit = 4;
		const productData = await Product.find({
			$and: [{ name: { $regex: '.*' + search + '.*', $options: 'i' } },{platform:'vegetable'}],
		})
			.limit(limit * 1)
			.skip((page - 1) * limit)
			.exec();

		const count = await Product.find({
			$or: [{ name: { $regex: '.*' + search + '.*', $options: 'i' } }],
		}).countDocuments();

		res.render('shop', {
			isLoggedin,
			products: productData,
			choice: userSession.choice,
			id: userSession.user_id,
			totalpages: Math.ceil(count / limit),
			currentpage: new Number(page),
		});
   
    
	} catch (error) {
		console.log(error.message);
	}
};

const fruits = async (req, res) => {
	try {
   
		userSession = req.session;
		userSession.choice = 'fruits';
		var search = '';
		if (req.query.search) {
			search = req.query.search;
		}
		var page = 1;
		if (req.query.page) {
			page = req.query.page;
		}
		const limit = 4;
		const productData = await Product.find({
			$and: [
				{ name: { $regex: '.*' + search + '.*', $options: 'i' } },
				{ platform: 'fruit' },
			],
		})
			.limit(limit * 1)
			.skip((page - 1) * limit)
			.exec();

		const count = await Product.find({
			$or: [{ name: { $regex: '.*' + search + '.*', $options: 'i' } }],
		}).countDocuments();

		res.render('shop', {
			isLoggedin,
			products: productData,
			choice: userSession.choice,
			id: userSession.user_id,
			totalpages: Math.ceil(count / limit),
			currentpage: new Number(page),
		});
	} catch (error) {
		console.log(error.message);
	}
};

const juice = async (req, res) => {
	try {
    
		userSession = req.session;
		userSession.choice = 'juice';
		var search = '';
		if (req.query.search) {
			search = req.query.search;
		}
		var page = 1;
		if (req.query.page) {
			page = req.query.page;
		}
		const limit = 4;
		const productData = await Product.find({
			$and: [
				{ name: { $regex: '.*' + search + '.*', $options: 'i' } },
				{ platform: 'juice' },
			],
		})
			.limit(limit * 1)
			.skip((page - 1) * limit)
			.exec();

		const count = await Product.find({
			$or: [{ name: { $regex: '.*' + search + '.*', $options: 'i' } }],
		}).countDocuments();

		res.render('shop', {
			isLoggedin,
			products: productData,
			choice: userSession.choice,
			id: userSession.user_id,
			totalpages: Math.ceil(count / limit),
			currentpage: new Number(page),
		});
	} catch (error) {
		console.log(error.message);
	}
};

const dried = async (req, res) => {
	try {
   
		userSession = req.session;
		userSession.choice = 'dried';
		var search = '';
		if (req.query.search) {
			search = req.query.search;
		}
		var page = 1;
		if (req.query.page) {
			page = req.query.page;
		}
		const limit = 4;
		const productData = await Product.find({
			$and: [
				{ name: { $regex: '.*' + search + '.*', $options: 'i' } },
				{ platform: 'dried' },
			],
		})
			.limit(limit * 1)
			.skip((page - 1) * limit)
			.exec();

		const count = await Product.find({
			$or: [{ name: { $regex: '.*' + search + '.*', $options: 'i' } }],
		}).countDocuments();

		res.render('shop', {
			isLoggedin,
			products: productData,
			choice:userSession.choice,
			id: userSession.user_id,
			totalpages: Math.ceil(count / limit),
			currentpage: new Number(page),
		});
	} catch (error) {
		console.log(error.message);
	}
};


const paypalcheckout = async (req, res) => {
	try {
		userSession = req.session;
		res.render('paypal',{userId:userSession.user_id,total:completeUser.cart.totalPrice});
	} catch (error) {
		console.log(error.message);
	}
  
};

const orderSuccess = async (req, res) => {
	try {
		
		userSession = req.session;
		if (userSession.user_id) {
			const orderData = await Orders.findOne({ userId: req.session.userID });
			console.log('orderdata',orderData);
			await Orders.updateOne(
				{ userId: userSession.user_id },
				{ $set: { status: 'Build' } }
			);
			await User.updateOne(
				{ _id: userSession.user_id },
				{ $set: { 'cart.items': [], 'cart.totalPrice': '0' } },
				{ multi: true }
			);
			console.log('Order Built and Cart is Empty.');
		}
		res.render('order-success');
	} catch (error) {
		console.log(error.message);
	}
};

const loadOrder = async (req, res) => {
	try {
    
		userSession = req.session;
		const userData = await User.findById({ _id: userSession.user_id });
		const orderData = await Orders.find({ userId: userSession.user_id });
    
		res.render('Order',{userId: userData,userOrders:orderData});
	} catch (error) {
		console.log(error.message);
	}
};

const cancelOrder = async (req, res) => {
	const id = req.query.id;
	console.log(id);
	await Orders.deleteOne({ _id: id });
	res.redirect('/orders');
};

const loadCoupons = async (req, res) => {
  
	try {
		const couponData = await Coupon.find();
		res.render('coupons',{coupon:couponData});
    
	} catch (error) {

		console.log(error.message);
    
	}
};

const couponCheck = async (req, res) => {
  
	try {

		if (req.session.user_id) {
			const userData = await User.findById({ _id: req.session.user_id });
			const offerData = await Coupon.findOne({ code: req.body.couponCode });
			const completeUser = await userData.populate('cart.items.productId');
			const address = await Address.find();
			console.log(offerData.usedBy,'hi');
     
			if (offerData) {
				if (offerData.usedBy.includes(req.session.user_id)) { 
					res.redirect('/checkout');
				} else {
					console.log(offerData.usedBy);
					let updatedTotal =
            userData.cart.totalPrice -
            (userData.cart.totalPrice * offerData.offer) / 100;
					const userCheck = await User.findById({ _id: req.session.user_id });

					if (userCheck) {
						console.log('userdata:', userCheck);
						userCheck.cart.totalPrice = updatedTotal;
						await userCheck.save();
					}
					console.log('coup', req.body.couponCode);
					console.log(req.body.couponCode, 'man');
					const offerUpdate = await Coupon.updateOne(
						{ code: req.session.couponCode },
						{ $push: { usedBy: req.session.user_id } }
					);
					console.log(userCheck.cart.totalPrice);
					res.render('checkout', {
						isLoggedin,
						cartProducts: completeUser.cart,
						address,saveAddress:''
					});
				}
        
			} else {
				const address = await Address.find();
				console.log('no coupon');
				res.render('checkout', {
					isLoggedin,
					cartProducts: completeUser.cart, message: 'Invalid Coupon',
					address,saveAddress:''
					
				});
			}

		} else {
			const address = await Address.find();
			res.render('checkout', {
				isLoggedin,
				cartProducts: completeUser.cart,
				message: 'Invalid Coupon',
				address,saveAddress:''
			});
		}
	}
      
  
	catch (error) {
		console.log(error.message);
	}
};

const orderDetails = async (req, res) => {
	try {
		userSession = req.session;
		const userData = await User.findById({ _id: userSession.user_id });
		const orderData = await Orders.findById({ _id: req.query.id }).populate('products.items.productId');
		const order = await Orders.findById({ _id: req.query.id });
		
		console.log(orderData.products.items,'pro');
		res.render('orderDetails', {order:order,  userOrders: orderData.products.items,user:userData });
	} catch (error) {
		console.log(error.message);
	}
  
};

const addressDetails = async (req, res) => {
	try {
		userSession = req.session;
		if (userSession.user_id) {
			const userData = await User.findById({ _id: userSession.user_id });

			if (userData) {
				const address = Address({
					userId: userSession.user_id,
					name: req.body.name,
					phone: req.body.phone,
					country: req.body.country,
					address: req.body.address,
					city: req.body.city,
					zip: req.body.zip,
					
				});
				console.log('hi');
				const addressData = await address.save();
				req.session.currentOrder = address._id;
				res.redirect('/profile');
			}
		}
	} catch (error) {
		console.log(error.message);	
	}
};


module.exports = {
	verifyLogin,
	insertUser,
	loadLandingPage,
	loadloginPage,
	loadloghome,
	loadshop,
	loadcart,
	loadwishlist,
	logout,
	profile,
	addToCart,
	deleteCart,
	editQty,
	loadCheckout,
	storeOrder,
	addToWishlist,
	deletewishlist,
	editwishQty,
	vegetables,
	fruits,
	juice,
	dried,
	addToWishlistToCart,
	paypalcheckout,
	orderSuccess,
	loadOrder,
	cancelOrder,
	otpValidation,
	loadCoupons,
	couponCheck,
	orderDetails,
	addressDetails,
};
