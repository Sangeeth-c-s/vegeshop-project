/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const User = require('../models/usermodel');
const bcrypt = require('bcrypt'); 
const Product = require('../models/productmodel');
const userModel = require('../models/usermodel');
const Order = require('../models/orderModel');
const Coupon = require('../models/couponsmodel'); 
const Category = require('../models/categoryModel');


let isAdminLoggedin;
isAdminLoggedin = false;
let adminSession = false || {};
let orderType = 'all';


const securePassword = async (password) => {
	try {
		const passwordHash = await bcrypt.hash(password, 10);
		return passwordHash;
	} catch (error) {
		console.log(error.message);
	}
};

const loadLogin = async (req, res) => {
	try {
		res.render('login');
	} catch (error) {
		console.log(error.message);
	}
};

const verifyLogin = async (req, res) => {
	try {
		const email = req.body.email;
		const password = req.body.password;

		const userData = await userModel.findOne({ email: email });
		if (userData) {
			const passwordMatch = await bcrypt.compare(password, userData.password);
			if (passwordMatch) {

				if (userData.isAdmin === 0) {
					res.render('login', {
						message: 'You are not an admin',
					});
				} else {
					req.session.user_id = userData._id;
					res.redirect('/admin/home');
				}
                
			} else {
				res.render('login', {
					message: 'Email and Password is incorrect',
				});
			}

		} else {
			res.render('login',{message:'Email and Password is incorrect'});
		}
        
	} catch (error) {
		console.log(error.message);
	}
};

const loadhome = async (req, res)=>{
	try {
		
		const userData = await User.findById({ _id: req.session.user_id });
		
		res.render('adminhome', { admin:userData});
	} catch (error) {
		console.log(error.message);
	}
};

const loadAdminHome = async(req,res)=>{
	try {
		adminSession = req.session;
		// const userData = await User.findById({ _id: req.session.user_id });
		const categoryData = await Category.find();
		const categoryArray = [];
		const orderGenreCount = [];
		for (let key of categoryData) {
			categoryArray.push(key.name);
			orderGenreCount.push(0);
		}
		console.log('categoryArray', categoryArray);
		console.log('orderGenreCount', orderGenreCount);
		const completeorder = [];
		const orderData = await Order.find();

		for (let key of orderData) {
			const uppend = await key.populate('products.items.productId');
			completeorder.push(uppend);
		}
		// console.log('completeorder', completeorder);

		for (let i = 0; i < completeorder.length; i++) {
			console.log(
				'completeorder[i].products.items.length',
				completeorder[i].products.items.length
			);

			for (let j = 0; j < completeorder[i].products.items.length; j++) {
				const genre = completeorder[i].products.items[j].productId.platform;
				console.log(
					'genre',
					completeorder[i].products.items[j].productId.platform
				);
				const isExisting = categoryArray.findIndex((category) => {
					return category === genre;
				});
				orderGenreCount[isExisting]++;
			}
		}

		console.log('categoryArray:', categoryArray);
		console.log('orderGenreCount:', orderGenreCount);
		// console.log('genre: ',completeorder[0].products.items[0].productId.genre);
		// const productData = await product.find();
		const userData = await User.find();
		res.render('adminhome', {
			// products: productData,
			admin: userData,
			category: categoryArray,
			count: orderGenreCount,
		});
	} catch (error) {
		console.log(error.message);
	}
};

const logout = async (req, res) => {
	try {
		req.session.destroy();
		res.redirect('/admin/login');
	} catch(error) {
		console.log(error.message);
	}
};	

const adminDashboard = async (req, res) => {
	try {
      
		const userData = await User.findById({ _id: req.session.user_id });
		
		res.render('dashboard',{users:userData,admin:userData});
	} catch (error) {
		console.log(error.message);
	}
};
const blockUser = async (req, res) => {
	try {
		const id = req.query.id;
		const userData = await User.findById({ _id: id });
		if (userData.isVerified) {
			await User.findByIdAndUpdate({ _id: id }, { $set: { isVerified: 0 } });
		} else {
			await User.findByIdAndUpdate({ _id: id }, { $set: { isVerified: 1 } });
		}
		res.redirect('/admin/user-list');
	} catch (error) {
		console.log(error.message);
	}
};


const path = require('path');
const multer = require('multer');
const { log } = require('console');
let Storage = multer.diskStorage({
	destination: './public/assets/uploads/',
	filename: (req, file, cb) => {
		cb(
			null,
			file.fieldname + '_' + Date.now() + path.extname(file.originalname)
		);
	},
});
let upload = multer({
	storage: Storage,
}).single('gImage');

const viewProduct = async (req, res) => {
	try {
		const productData = await Product.find();
		res.render('viewProduct', { products: productData });
	} catch (error) {
		console.log(error.message);
	}
};

const addProductLoad = async (req, res) => {
	try {
		const categoryData = await Category.find();
		console.log('category', categoryData);
		if (categoryData) {
			res.render('addProduct', { category: categoryData });	
		}
	} catch (error) {
		console.log(error.message);
	}

	
};
const updateAddProduct = async (req, res) => {
	try {
		const spassword = await securePassword(req.body.password);
		const category = await Category.find();
		const product = Product({
			name: req.body.gName,
			platform: req.body.gPlatform,
			price: req.body.gPrice,
			description: req.body.gDescription,
			rating: req.body.gRating,
			image: req.file.filename,
		});
		console.log(product);
		const productData = await product.save();
		if (productData) {
			res.render('addProduct', {
				message: 'Your registration was successfull.',category
			});
		} else {
			res.render('addProduct', { message: 'Your registration failed',category });
		}
	} catch (error) {
		console.log(error.message);
	}
};
const deleteProduct = async (req, res) => {
	try {
		const id = req.query.id;
		const productData = await Product.updateOne({_id:id},{ soft:1 });	
		res.redirect('/admin/view-product');
	} catch (error) {
		console.log(error.message);
	}
};
const editProduct = async (req, res) => {
	try {
		const id = req.query.id;
		const productData = await Product.findById({ _id: id });
		if (productData) {
			res.render('editProduct', { product: productData });
		} else {
			res.redirect('/admin/viewProduct');
		}
	} catch (error) {
		console.log(error.message);
	}
};
const updateEditProduct = async(req,res)=>{
	try {
        
		const productData = await Product.findByIdAndUpdate({ _id: req.body.id }, { $set: { name: req.body.gName, platform: req.body.gPlatform, price: req.body.gPrice, description: req.body.gDescription, image: req.file.filename } }); 
		res.redirect('/admin/view-product');

	} catch (error) {
		console.log(error.message);
	}
};
const adminLogout = async (req, res) => {
	adminSession = req.session;
	adminSession.userId = false;
	isAdminLoggedin = false;
	console.log('Admin logged out');
	res.redirect('/admin');
};

const loadOrder = async (req, res) => {
	const orderData = await Order.find();
	if(orderType == undefined){
		res.render('orderlist',{order:orderData});
	}else{
		id = req.query.id;
		res.render('orderlist',{id:id,order:orderData});
	}
};
const adminCancelOrder = async (req, res) => {
	const id = req.query.id;
	await Order.deleteOne({ _id: id });
	res.redirect('/admin/Orderlist');
};
const adminConfirmorder = async (req, res) => {
	const id = req.query.id;
	await Order.updateOne({ _id: id }, { $set: { status: 'Confirmed' } });
	res.redirect('/admin/Orderlist');
};
const adminDeliveredorder = async (req, res) => {
	const id = req.query.id;
	await Order.updateOne({ _id: id }, { $set: { status: 'Delivered' } });
	res.redirect('/admin/Orderlist');
};
const loadcoupons = async (req, res) => {
	try {
		res.render('addcoupons');
	} catch (error) {
		console.log(error.message);
	}
};


const addCoupon = async (req, res) => {
	try {
		const spassword = await securePassword(req.body.password);
		const coupon =new Coupon({
			name: req.body.name,
			offertype: req.body.offertype,
			offer: req.body.offer,
			valid:req.body.valid,
			description: req.body.description,
			code:req.body.code,
		});

		const couponData = await coupon.save();
		console.log(couponData);
		if (couponData) {
			res.render('addcoupons', {
				message: 'Your registration was successfull.',
			});
		} else {
			res.render('addcoupons', { message: 'Your registration failed' });
		}
	} catch (error) {
		console.log(error);
	}
};

const viewCoupons = async (req, res) => {
	try {
		const couponData = await Coupon.find();
		res.render('viewCoupon',{coupons:couponData});
	} catch (error) {
		console.log(error.message);
	}
};
const adminConfirmCoupon = async (req, res) => {
	const id = req.query.id;
	await Coupon.updateOne({ _id: id }, { $set: { status: 'valid' } });
	res.redirect('/admin/viewCoupon');
};
const adminCancelCoupon = async (req, res) => {
	const id = req.query.id;
	await Coupon.updateOne({ _id: id }, { $set: { status: 'invalid' } });
	res.redirect('/admin/viewCoupon');
};
const adminDeleteCoupon = async (req, res) => {
	const id = req.query.id;
	await Coupon.deleteOne({ _id: id });
	res.redirect('/admin/viewCoupon');
};

const userlist = async (req, res) => {
	try {
		
		userSession = req.session;
		userSession.choice = 'All';
		var search = '';
		if (req.query.search) {
			search = req.query.search;
		}
		var page = 1;
		if (req.query.page) {
			page = req.query.page;
		}
		const limit = 8;
		const users = await User.find({
			$or: [
				{ name: { $regex: '.*' + search + '.*', $options: 'i' } },
				{ email: { $regex: '.*' + search + '.*', $options: 'i' } },
			],
		})
			.limit(limit * 1)
			.skip((page - 1) * limit)
			.exec();

		const count = await User.find({
			$or: [
				{ name: { $regex: '.*' + search + '.*', $options: 'i' } },
				{ name: { $regex: '.*' + search + '.*', $options: 'i' } },
			],
		}).countDocuments();
		res.render('userList', {
			users: users,
			id: userSession.user_id,
			choice: userSession.choice,
			totalpages: Math.ceil(count / limit),
			currentpage: new Number(page),
		});
	} catch (error) {
		console.log(error.message);
	}
};

const loadCategory = async (req, res) => {
	try {
		const categoryData = await Category.find();
		res.render('addCategory',{category:categoryData});
	} catch (error) {
		console.log(error.message);
	}
};
const addCategory = async (req, res) => {
	const category = Category({
		name: req.body.category,
	});
	const categoryData = await category.save();
	res.redirect('/admin/category');
};
const deleteCategory = async (req, res) => {
	try {
		const id = req.query.id;
		await Category.deleteOne({ _id: id });
		res.redirect('/admin/category');
	} catch (error) {
		console.log(error.message);
	}
};

module.exports = {
	loadLogin,
	verifyLogin,
	loadhome,
	logout,
	adminDashboard,
	blockUser,
	viewProduct,
	addProductLoad,
	updateAddProduct,
	upload,
	deleteProduct,
	editProduct,
	updateEditProduct,
	adminLogout,
	loadOrder,
	adminCancelOrder,
	adminConfirmorder,
	adminDeliveredorder,
	loadcoupons,
	addCoupon,
	viewCoupons,
	adminConfirmCoupon,
	adminCancelCoupon,
	adminDeleteCoupon,
	userlist,
	loadCategory,
	addCategory,
	deleteCategory,
	loadAdminHome,
};

