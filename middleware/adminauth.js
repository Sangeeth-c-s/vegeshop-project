/* eslint-disable no-unused-vars */
const session = require('express');

const isLogin = async (req, res, next) => {
	try {
		if (req.session.user_id) { /* empty */ }
		else {
			res.redirect('/admin');
		}
		next();
	} catch (error) {
		console.log(error.message);
	}
};
 
const isLogout = async (req, res, next) => {
	try {
		if (req.session.user_id) {
			res.redirect('/admin/home');
		}
		next();
        
	} catch (error) {
		console.log(error.message);
	}
};
module.exports = {
	isLogin,
	isLogout
};