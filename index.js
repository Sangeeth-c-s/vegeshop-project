/* eslint-disable no-unused-vars */
const express = require('express');
const app = express();

const ejs= require('ejs');

const mongoose = require('mongoose');
const dbpath = require('./config/connection');
mongoose.connect(dbpath.dbpath, () => {
	console.log('Database Connected.');
});

const User = require('./models/usermodel');
const Product = require('./models/productmodel');
const Category = require('./models/categoryModel');

const user_route = require('./routes/userRoute');
const admin_route = require('./routes/adminroute');
const path = require('path');



app.use(function (req, res, next) {
	res.set(
		'Cache-Control',
		'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'
	);
	next();
});



user_route.set('view engine', 'ejs');
user_route.set('views', './views/user');
user_route.use('/', express.static('public'));

admin_route.set('view engine','ejs');
admin_route.set('views', './views/admin');
admin_route.use('/', express.static('public'));
admin_route.use('/', express.static('public/admin'));
admin_route.use('/', express.static('public/admin/assets'));









app.use('/', user_route);
app.use('/admin',admin_route);

app.use(function (req, res) {
	res.status(404).render('user/404page.ejs');
});
app.listen(3000, () => {
	console.log('server is running...');
});
