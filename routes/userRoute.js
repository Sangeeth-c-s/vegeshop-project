const express = require('express');
const user_route = express();

const session = require('express-session');



const config = require('../config/config');

user_route.use(
	session({
		secret: config.sessionSecret,
		
	})
);

const auth = require('../middleware/auth');

user_route.set('view engine', 'ejs');
user_route.set('views', './views/user');



user_route.use(express.json());
user_route.use(express.urlencoded({extended:true}));


const userController = require('../controllers/userController');

user_route.get('/', userController.loadLandingPage);

user_route.get('/login', auth.isLogout, userController.loadloginPage);

user_route.post('/login',userController.verifyLogin);

user_route.post('/registration', userController.insertUser);

user_route.get('/home', auth.isLogin, userController.loadloghome);

user_route.get('/shop',auth.isLogin, userController.loadshop);

user_route.get('/cart',  userController.loadcart);

user_route.get('/wishlist', auth.isLogin, userController.loadwishlist);

user_route.get('/logout', auth.isLogin, userController.logout);

user_route.get('/profile', auth.isLogin, userController.profile);

user_route.post('/profile', auth.isLogin, userController.addressDetails);


user_route.get('/add-to-cart', userController.addToCart);

user_route.get('/delete-cart', userController.deleteCart);

user_route.post('/edit-qty', userController.editQty);

user_route.get('/checkout', auth.isLogin, userController.loadCheckout);

user_route.post('/checkout', userController.storeOrder);

user_route.get('/add-to-wishlist', userController.addToWishlist);

user_route.post('/add-to-cartTowish', userController.addToWishlistToCart);


user_route.get('/delete-wishlist', userController.deletewishlist);

user_route.post('/edit-wish-qty', userController.editwishQty);

user_route.get('/vegetables', auth.isLogin, userController.vegetables);

user_route.get('/fruits', auth.isLogin, userController.fruits);

user_route.get('/juice', auth.isLogin, userController.juice);

user_route.get('/dried', auth.isLogin, userController.dried);

user_route.post('/otp-valid',  userController.otpValidation);




user_route.post('paypal', auth.isLogin, userController.paypalcheckout);

user_route.get('/orderSuccess', userController.orderSuccess);

user_route.get('/orders', auth.isLogin, userController.loadOrder);

user_route.get('/cancelOrder', auth.isLogin, userController.cancelOrder);

user_route.get('/coupons', auth.isLogin, userController.loadCoupons);

user_route.post('/coupon', auth.isLogin, userController.couponCheck);

user_route.get('/order-details', auth.isLogin, userController.orderDetails);

user_route.get('/view-product', auth.isLogin, userController.viewProduct);


module.exports = user_route;
