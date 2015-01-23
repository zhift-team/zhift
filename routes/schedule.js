/**
 * All routes relating to schedules.
 * 
 * @author: Anji Ren, Lily Seropian, Vicky Gong, Dylan Joss
 */

var express = require('express');
var router = express.Router();

// Controllers
var ScheduleController = require('../controllers/schedule');
var UserController = require('../controllers/user');
var errors = require('../errors/errors');
var errorChecking = require('../errors/error-checking');

/**
 * POST to create a new schedule.
 * Request body should contain:
 *     {String} orgName The name of the organization to create the schedule for.
 *     {String} role    The name of the role for the new schedule.
 * Response body contains:
 *     {Schedule} The created schedule.
 */
router.post('/', function(req, res, next) {
    // checking if permissions are correct
    UserController.isManagerOfOrganization(req.user.email, req.body.orgName, function(err, isManager){
        if (err) {
            return next(err);
        }
        if (!isManager) {
            return next(errors.notManagerOfOrg);
        }

        // if the user is a manager, create the schedule
        ScheduleController.createSchedule(req.body.orgName, req.body.role, function(err, schedule) {
            if (err) {
                return next(err);
            } 
            res.send(schedule);
        });
    });
});

/**
 * DELETE an existing schedule.
 * No request body parameters required.
 * Response body contains:
 *     {Schedule} The deleted schedule.
 */
router.delete('/:id', function(req, res, next) {
    // checking if permissions are correct
    UserController.isManagerOfOrganization(req.user.email, req.user.org, function(err, isManager) {
        if (err) {
            return next(err);
        }
        if (!isManager) {
            return next(errors.notManagerOfOrg);
        }

        // if the user is a manager, delete the schedule
        ScheduleController.deleteSchedule(req.param('id'), req.user.org, function(err, schedule) {
            if (err) {
                return next(err);
            } 
            res.send(schedule);
        });
    });
});

/**
 * GET a schedule by id.
 * No request body parameters required.
 * Response body contains:
 *     {Schedule} The retrieved schedule.
 */
router.get('/:id', function(req, res, next) {
    // checking if permissions are correct
    UserController.isUserOfOrganization(req.user.email, req.user.org, function(err, isUser) {
        if (err) {
            return next(err);
        }
        // if the user is in organization, get the schedule
        if (!isUser) {
            return next(errors.notMemberOfOrg);
        }
        ScheduleController.retrieveSchedule(req.param('id'), function(err, schedule) {
            if (err) {
                return next(err);
            } 
            res.send(schedule);
        });
    });
});

/**
 * GET all schedules associated with an organization.
 * No request body parameters required.
 * Response body contains:
 *     {Schedule[]} The retrieved schedules.
 */
router.get('/all/:orgName', function(req, res) {
    // checking if permissions are correct
    UserController.isUserOfOrganization(req.user.email, req.param('orgName'), function(err, isUser) {
        if (err) {
            return next(err);
        }
        // if the user is in organization, get the schedule
        if (!isUser) {
            return next(errors.notMemberOfOrg);
        }
        ScheduleController.retrieveSchedulesByOrg(req.param('orgName'), function(err, schedules) {
            if (err) {
                return next(err);
            } 
            res.send(schedules);
        });
    });
});

module.exports = router;