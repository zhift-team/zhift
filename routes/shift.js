/**
 * All the routes relating to shifts.
 * 
 * @author: Lily Seropian, Vicky Gong, Anji Ren
 */
 
var express = require('express');
var router = express.Router();

// Controllers
var ShiftController = require('../controllers/shift');
var UserController = require('../controllers/user');
var RecordController = require('../controllers/record');
var errors = require('../errors/errors');
var errorChecking = require('../errors/error-checking');
var datejs = require('../public/javascripts/libraries/date');


/**
 * POST to create a new shift for a template shift for the next X week.
 * Request body should contain:
 *     {Integer}   week        The week to create the next template shift     
 *  
 * Response body contains:
 *     {Shift} The created shift.
 */
router.post('/:templateid', function(req, res, next) {
    UserController.isManagerOfOrganization(req.user.email, req.user.org, function(err, isManager) {
        if (!isManager) {
            return next(errors.notManagerOrOwner);
        }
        ShiftController.createShiftFromTemplateShift(req.param('templateid'), req.body.week, new Date(), function(err, shift) {
            if (err) {
                return next(err);
            }
            res.send(shift);
        });
    });
});

/**
 * GET a shift.
 * No request body parameters required.
 * Response body contains:
 *     {Shift} The retrieved shift.
 */
router.get('/one/:shiftId', function(req, res, next) {
    ShiftController.getShift(req.param('shiftId'), function(err, shift) {
        if (err) {
            return next(err);
        }
        if (shift.responsiblePerson.org !== req.user.org) {
            return next(errors.notManagerOrOwner);
        }
        if (!shift) {
            return next(errors.notFound);
        }

        res.send(shift);
    });
});

/**
 * GET all shifts associated with an employee.
 * No request body parameters required.
 * Response body contains:
 *     {Shift[]} The retrieved shifts.
 */
router.get('/user/:id', function(req, res, next) {
    // Checking if logged in user is userid
    if(req.param('id') !== req.user._id.toString() && req.user.schedule !== undefined) {
        return next(errors.notManagerOrOwner);
    }

    var getUserShifts = function() {
        ShiftController.getAllUserShifts(req.param('id'), function(err, shifts) {
            if (err) {
                return next(err);
            }
            if (!shifts) {
                return next(errors.shifts.noShiftsForUser);
            }
            res.send(shifts);
        });
    };
    
    // If the logged in user is a manager, check if the manager is part of the same org as the request employee
    if (!req.user.schedule) {
        UserController.retrieveEmployeeById(req.param('id'), function(err, employee) {
            if (employee) {
                if (req.user.org !== employee.org) {
                    return next(errors.shifts.notManagerOfOrg);
                }
                getUserShifts();
            }
            else {
                 return next(errors.shifts.employeeNotFound);
            }
        });
    }
    else {
        getUserShifts();
    }
    
  
});


/**
 * GET all shifts associated with a schedule.
 * No request body parameters required.
 * Response body contains:
 *     {Shift[]} The retrieved shifts.
 */
router.get('/all/:id', function(req, res, next) {
    ShiftController.getAllShiftsOnASchedule(req.param('id'), function(err, shifts) {
        if (err) {
            return next(err);
        }
        if (!shifts) {
            return next(errors.schedules.invalidScheduleId);
        }
        res.send(shifts);
    });
});

/**
 * GET all shifts within in the same week given date
 * associated with a schedule.
 * 
 * Request Param: None
 * Response body contains:
 *     {Shift[]} The retrieved shifts.
 */
router.get('/week/:id/:date', function(req, res, next) {
    var date = new Date(req.param('date'));

    if (date.toString() === 'Invalid Date'){
        return next(errors.shifts.invalidDate);
    }

    ShiftController.getAWeekShiftsOnASchedule(req.param('id'), date, function(err, shifts) {
        if (err) {
            return next(err);
        }
        if (!shifts) {
            return next(errors.schedules.invalidScheduleId);
        }
        res.send(shifts);
    });
});


/**
 * PUT shift up for grabs.
 * No request body parameters required.
 * Response body contains:
 *     {Shift} The shift put up for grabs.
 */
router.put('/upForGrabs/:id', function(req, res, next) {
    // putUpForGrabs checks that current user is owner of the shift
    ShiftController.putUpForGrabs(req.param('id'), req.user._id.toString(), function(err, shift) {
        if (err) {
            return next(err);
        }
        if (!shift) {
            return next(errors.notFound);
        }
        RecordController.recordShiftUpForGrabs(req.user.org, [], req.user.name, shift);
        res.send(shift);
    });
});


/**
 * GET all shifts up for grabs on a schedule.
 * No request body parameters required.
 * Response body contains:
 *     {Shift[]} The shifts up for grabs.
 */
router.get('/upForGrabs/:scheduleid', function(req, res, next) {
    ShiftController.getOfferedShiftsOnASchedule(req.param('scheduleid'), function(err, shifts) {
        if (err) {
            return next(err);
        }
        else if (!shifts) {
            return next(errors.schedules.invalidScheduleId);
        }
        res.send(shifts);
    });
});

/**
 * GET all shifts up for swap on a schedule.
 * No request body parameters required.
 * Response body contains:
 *     {Shift[]} The shifts up for swap.
 */
router.get('/upForSwap/:scheduleid', function(req, res, next) {
    ShiftController.getShiftsUpForSwapOnASchedule(req.param('scheduleid'), function(err, shifts) {
        if (err) {
            return next(err);
        }
        else if (!shifts) {
            return next(errors.schedules.invalidScheduleId);
        }
        res.send(shifts);
    });
});

/**
 * PUT shift up for swap.
 * No request body parameters required.
 * Response body contains:
 *     {Shift} The shift put up for swap.
 */
router.put('/upForSwap/:id', function(req, res, next) {
    // putUpForGrabs checks that current user is owner of the shift
    ShiftController.putUpForTrade(req.param('id'), function(err, shift) {
        if (err) {
            return next(err);
        }
        if (!shift) {
            return next(errors.notFound);
        }
        RecordController.recordShiftUpForGrabs(req.user.org, [], req.user.name, shift);
        res.send(shift);
    });
});

/**
 * PUT claim a given shift.
 * No request body parameters required.
 * Response body contains:
 *     {Shift} The claimed shift.
 */
router.put('/claim/:id', function(req, res, next) {
    ShiftController.giveShiftTo(req.param('id'), req.body.employeeId, function(err, shift, originalOwner) {
        if (err) {
            return next(err);
        }
        if (!shift) {
            return next(errors.notFound);
        }
        RecordController.recordShiftClaim(req.user.org, [originalOwner.email, req.user.email], originalOwner.name, req.user.name, shift);
        res.send(shift);
    });
});

/**
 * DELETE all shifts that have already happened. Only called by cron.
 * No request body parameters required.
 * No response body contents on success.
 */
router.delete('/old', function(req, res, next) {
    ShiftController.deleteOldShifts(function(err, numDeleted) {
        if (err) {
            return next(err);
        }
        res.status(200).end();
    });
});

/**
 * GET all shifts that are scheduled for tomorrow that are either up for grabs or up for swap. Only called by cron.
 * No request body parameters required.
 * Response body contains:
 *     {Shift[]} The unfilled shifts.
 */
router.get('/unfilledtomorrow', function(req, res, next) {
    ShiftController.getUnfilledShiftsForTomorrow(function(err, shifts) {
        if (err) {
            return next(err);
        }
        res.send(shifts);
    });
});

module.exports = router;