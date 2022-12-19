const express = require('express');
const admin_route = express();



const session = require('express-session');
const config = require('../config/config');
admin_route.use(session({ secret: config.sessionSecret }));

const bodyParser = require('body-parser');
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({ extended: true }));

admin_route.set('view engine', 'ejs');
admin_route.set('views', './views/admin');

const auth = require('../middleware/adminauth');

const adminController = require('../controllers/admincontroller');

admin_route.get('/',auth.isLogout, adminController.loadLogin);

admin_route.post('/', adminController.verifyLogin);

admin_route.get('/home',auth.isLogin, adminController.loadDashboard);

admin_route.get('/logout',auth.isLogout, adminController.logout);

// admin_route.get("*", (req, res) => {
//   res.redirect("/admin");
// });

admin_route.get('/dashboard', auth.isLogin, adminController.adminDashboard);
admin_route.get(
	'/block-user',
	auth.isLogin,
	adminController.blockUser
);

admin_route.get(
	'/add-product',
	auth.isLogin,
	adminController.addProductLoad
);
admin_route.post(
	'/add-product',
	adminController.upload,
	adminController.updateAddProduct
);
admin_route.get(
	'/view-product',
	auth.isLogin,
	adminController.viewProduct
);
admin_route.get('/delete-product', auth.isLogin, adminController.deleteProduct);

admin_route.get(
	'/edit-product',
	auth.isLogin,
	adminController.editProduct
);
admin_route.post(
	'/edit-product',
	adminController.upload,
	adminController.updateEditProduct
);

admin_route.get(
	'/adminlogout',
	auth.isLogin,
	adminController.adminLogout
);

admin_route.get('/orderlist', auth.isLogin, adminController.loadOrder);

admin_route.get(
	'/admin-cancel-order',
	auth.isLogin,
	adminController.adminCancelOrder
);
admin_route.get(
	'/admin-confirm-order',
	auth.isLogin,
	adminController.adminConfirmorder
);
admin_route.get(
	'/admin-delivered-order',
	auth.isLogin,
	adminController.adminDeliveredorder
);
admin_route.get('/coupons', auth.isLogin, adminController.loadcoupons);

admin_route.post('/coupons', adminController.addCoupon);

admin_route.get('/viewCoupon', auth.isLogin, adminController.viewCoupons);

admin_route.get(
	'/admin-confirm-coupon',
	auth.isLogin,
	adminController.adminConfirmCoupon
);

admin_route.get(
	'/admin-cancel-coupon',
	auth.isLogin,
	adminController.adminCancelCoupon
);

admin_route.get(
	'/admin-delete-coupon',
	auth.isLogin,
	adminController.adminDeleteCoupon
);






module.exports = admin_route;


