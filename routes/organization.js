/**
 * All the routes relating to organizations.
 *
 * TODO: error handling, permissions
 * 
 * @author: Vicky Gong 
 */

var express = require('express');
var router = express.Router();

// Controllers
var OrgController = require('../controllers/organization');
var errors = require('../errors/errors');

/**
 * POST to create a new organization.
 * Request body should contain:
 *     {String} name The name of the organization to create.
 * Response body contains:
 *     {Organization} The created organization.
 */
router.post('/', function(req, res, next) {
    OrgController.createOrg(req.body.name, function(err, org) {
        if (err) {
            return next(err);
        }
        res.send(org);
    });
});

/**
 * GET org by name.
 * No request body parameters required.
 * Response body contains:
 *     {Organization} The retrieved organization.
 */
router.get('/:id', function(req, res, next) {
    OrgController.retrieveOrg(req.param('id'), function(err, org) {
        if (err) {
            return next(err);
        } 
        if (!org) {
            return next(errors.notFound);
        }
        res.send(org);
    });
});

module.exports = router;