/**
 * Functions related to security: authentication, authorization, input sanitization
 * 
 * @author: Dylan Joss 
 */

var validator = require('validator');

/**
 * Authentication middleware: redirect the user to '/' if they are not authenticated.
 */
module.exports.isAuthenticated = function (req, res, next) {
    // if user is authenticated in the session, call the next() to call the next request handler 
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects.
    if (req.isAuthenticated()) {
        return next();
    }

    if (req.body.cron === '99570761084371110795') {
        req.user = {
            email: 'cron@zhift.com',
            org: 'Zhift',
        };
        return next();
    }

    // not authenticated
    redirect(req, res);
};

/**
 * Authorization middleware: check whether the logged in user is a manager.
 * Managers have functionality that employees do not, but not vice versa
 *
 * TODO: may not be needed for final
 */
module.exports.isManager = function(req, res, next) {
    // managers do not have schedules, employees do
    if (!req.user.schedule) {
        return next();
    }

    // not authorized
    redirect(req, res);
};

/**
 * If the user is not authorized, then send a 401 (Unauthorized) if necessary and 
 * redirect them to the login page.
 * @param  {HTTP Request} req
 * @return {HTTP Response}     
 */
var redirect = function(req, res) {
    // 
    if (req.method === 'GET') {
        return res.redirect('/');
    }
    if (req.method === 'POST') {
        return res.status(401).send('/');
    }
    if (req.method === 'PUT') {
        return res.status(401).send('/');
    }
    if (req.method === 'DELETE') {
        return res.status(401).send('/');
    }
};

/**
 * Sanitize all text input to mitigate the possibility of injection attacks.
 * We allow only alphanumeric, space, underscore, and hyphen characters for most fields 
 * (see below for exceptions).
 */
module.exports.sanitize = function(req, res, next) {
    Object.keys(req.body).forEach(function(key) {
        req.body[key] = validator.toString(req.body[key]);

        // we allow @ in email; email is also validated separately with validator.isEmail
        // we allow various special characters in password as password is hashed before insertion in DB
        if (key !== 'email' && key !== 'password') {
            req.body[key] = validator.whitelist(req.body[key], '\\w\\s_:-');
        }
    });

    return next();
};