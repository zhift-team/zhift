/**
 * Routing for website page rendering and authentication.
 * @author Anji Ren
 */

var express = require('express');
var router = express.Router();
var security = require('../errors/security');

module.exports = function(passport) {
	/**
	 * Get API demo page.
	 */
	router.get('/api', function(req, res){
	    res.render('api-demo/apidemo', {title: 'API Demo'});
	});

	/**
	 * Get login page.
	 */
	router.get('/', function(req, res) {
    	// Display the Login page with any flash message, if any
		res.render('account-management/login', { message: req.flash('message') });
	});

	/**
	 * Post to login a user.
	 */
	router.post('/login', passport.authenticate('login', {
		successRedirect: '/home',
		failureRedirect: '/',
		failureFlash: true  
	}));

	/**
	 * Get registration page.
	 */
	router.get('/signup', function(req, res) {
		res.render('account-management/register', {message: req.flash('message')});
	});

	/**
	 * Post to register a new user.
	 */
	router.post('/signup', passport.authenticate('signup', {
		successRedirect: '/home',
		failureRedirect: '/signup',
		failureFlash: true  
	}));

	/**
	 * Get 'Home' page.
	 */
	router.get('/home', security.isAuthenticated, function(req, res) {
		res.render('index', {user: req.user});
	});

	/**
	 * Get 'Edit Organization' page.
	 * TODO: security - must be manager
	 */
	router.get('/edit', security.isAuthenticated, function(req, res) {
		res.render('manager/edit', {user: req.user});
	});

	/**
	 * Get 'Shifts view' page.
	 */
	router.get('/shift', security.isAuthenticated, function(req, res){
		res.render('manager/shifts', {user: req.user});
	})

	/**
	 * Get 'User Settings' page.
	 */
	router.get('/settings', security.isAuthenticated, function(req, res) {
		res.render('account-management/settings', {user: req.user});
	});

	/**
	 * Get to sign out a user.
	 */
	router.get('/signout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	/**
	 * Get 'Dashboard' page.
	 */
	router.get('/dashboard', security.isAuthenticated, function(req, res) {
		res.render('dashboard/dash', {user: req.user});
	});

	return router;
}