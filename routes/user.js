/**
 * All routes relating to users.
 *  
 * @author: Dylan Joss
 */

var express = require('express');
var router = express.Router();

// Controllers
var OrgController = require('../controllers/organization');
var UserController = require('../controllers/user');
var ScheduleController = require('../controllers/schedule');
var errors = require('../errors/errors');
var errorChecking = require('../errors/error-checking');

/**
 * POST to create a new manager.
 * Request body should contain:
 *     {String} username The username for the new manager.
 *     {String} email    The email for the new manager.
 *     {String} password The password for the new manager.
 *     {String} org      The organization the new manager belongs to.
 *     {Boolean} invite  Whether or not the manager was invited to be part of an existing org.
 * Response body contains:
 *     {ManagerUser} The created manager.
 */
router.post('/manager', function(req, res, next) {
    var isInvite = false;
    if (req.body.invite == "true") {
        isInvite = true;
    }
    console.log(req.body.invite, isInvite);
    UserController.createManager(req.body.username, req.body.email, req.body.password, req.body.org, isInvite, function(err, manager) {
        if (err) {
            return next(err);
        }
        res.send(manager);
    });
});

/**
 * POST to create a new employee.
 * Request body should contain:
 *     {String} username The username for the new employee.
 *     {String} email    The email for the new employee.
 *     {String} password The password for the new employee.
 *     {String} org      The organization the new employee belongs to.
 *     {String} role     The name of the role for the new employee.
 * Response body contains:
 *     {EmployeeUser} The created employee.
 */
router.post('/employee', function(req, res, next) {
    console.log(req.body.invite, "hi");
    UserController.isManagerOfOrganization(req.user.email, req.body.org, function(err, isManager) {
        if (err) {
            return next(err);
        }
        if (!isManager) {
            return next(errors.notManagerOfOrg);
        }
        UserController.createEmployee(req.body.username, req.body.email, req.body.org, req.body.role, function(err, employee) {
            if (err) {
                return next(err);
            }
            res.send(employee);
        });
    });
});

/**
 * GET a manager by id.
 * No request body parameters required.
 * Response body contains:
 *     {ManagerUser} The retrieved manager.
 */
router.get('/manager/:id', function(req, res, next) {
    UserController.retrieveManagerById(req.param('id'), function(err, manager) {
        if (err) {
            return next(err);
        }
        res.send(manager);
    });
});

/**
 * GET an employee by id.
 * No request body parameters required.
 * Response body contains:
 *     {EmployeeUser} The retrieved employee.
 */
router.get('/employee/:id', function(req, res, next) {
    UserController.retrieveEmployeeById(req.param('id'), function(err, employee) {
        if (err) {
            return next(err);
        }
        res.send(employee);
    });
});

/**
 * PUT to change the password of a user.
 */
router.put('/:id', function(req, res, next) {
    var id = req.param('id');

    if (req.user._id.toString() !== id) {
        return next(errors.notUser);
    }

    UserController.changePassword(id, req.body.password, function(err, user) {
        if (err) {
            return next(err);
        }
        res.send(user);
    });
});

/**
 * GET all managers associated with an organization.
 * No request body parameters required.
 * Response body contains:
 *     {ManagerUser[]} The retrieved managers.
 */
router.get('/org/:id/manager', function(req, res, next) {
    UserController.retrieveManagersByOrgId(req.param('id'), function(err, managers) {
        if (err) {
            return next(err);
        }
        res.send(managers);
    });
});

/**
 * GET all employees associated with an organization.
 * No request body parameters required.
 * Response body contains:
 *     {EmployeeUser[]} The retrieved employees.
 */
router.get('/org/:id/employee', function(req, res, next) {
    UserController.retrieveEmployeesByOrgId(req.param('id'), function(err, employees) {
        if (err) {
            return next(err);
        }
        res.send(employees);
    });
});

/**
 * DELETE a manager by id.
 */
router.delete('/manager/:id', function(req, res, next) {
    UserController.deleteManager(req.param('id'), function(err, user) {
        if (err) {
            return next(err);
        }
        res.status(200).end();
    });
});


/**
 * DELETE an employee by id.
 */
router.delete('/employee/:id', function(req, res, next) {
    UserController.deleteEmployee(req.param('id'), function(err, user) {
        console.log(req.param('id'));
        if (err) {
            return next(err);
        }
        res.status(200).end();
    });
});

/**
 * GET all employees associated with a schedule.
 * No request body parameters required.
 * Response body contains:
 *     {EmployeeUser[]} The retrieved employees.
 */
router.get('/sched/:id', function(req, res, next) {
    UserController.retrieveEmployeesByScheduleId(req.param('id'), function(err, employees) {
        if (err) {
            return next(err);
        } 
        res.send(employees);
    });
});

module.exports = router;