/**
 * Record routes.
 *
 * @author: Lily Seropian, Dylan Joss
 */

var express = require('express');
var router = express.Router();

var RecordController = require('../controllers/record');
var UserController = require('../controllers/user');
var ScheduleController = require('../controllers/schedule');

var ObjectId = require('mongoose').Types.ObjectId; 

var errors = require('../errors/errors');
var errorChecking = require('../errors/error-checking');

var sendRecords = function(scheduleId, res, next) {
    RecordController.getRecordsForSchedule(scheduleId, function(err, records) {
        if (err) {
            return next(err);
        }
        res.send(records);
    });
};

/**
 * GET all records for a schedule.
 * No request body parameters required.
 * Response body contains:
 *     {Record[]} The found records.
 */
router.get('/schedule/:id', function(req, res, next) {
    ScheduleController.retrieveSchedule(req.param('id'), function(err, schedule) {
        if (err) {
            return next(err);
        }
        if (!schedule) {
            return next(errors.records.scheduleNotFound);
        }
        UserController.isManagerOfOrganization(req.user.email, schedule.org, function(err, isManager) {
            if (err) {
                return next(err);
            }
            if (!isManager) {
                UserController.isEmployeeOfRole(req.user.email, req.param('id'), function(err, isEmployee) {
                    if (err) {
                        return next(err);
                    }
                    if (!isEmployee) {
                        return next(errors.notManagerOrMemberOfRole);
                    }
                     sendRecords(req.param('id'), res);
                });
            }
            else {
                sendRecords(req.param('id'), res);
            }
        });
    });
});

/**
 * DELETE all records about changes that have already occurred.
 * No request body parameters requires.
 * No response body contents on success.
 */
router.delete('/old', function(req, res) {
    RecordController.deleteOldRecords(function(err, numDeleted) {
        if (err) {
            return next(err);
        }
        res.send({deleted: numDeleted});
    });
});

module.exports = router;