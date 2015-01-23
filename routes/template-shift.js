/**
 * All routes relating to template shifts.
 * 
 * @author: Anji Ren, Lily Seropian, Dylan Joss
 */

var express = require('express');
var router = express.Router();

// Controllers
var TemplateShiftController = require('../controllers/template-shift');
var ShiftController = require('../controllers/shift');
var UserController = require('../controllers/user');
var errors = require('../errors/errors');
var errorChecking = require('../errors/error-checking');

/**
 * POST to create a new template shift.
 * Request body should contain:
 *     {String}   day        The day of the week to make a template shift for. 
 *                           Must be one of {Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday}.
 *     {String}   startTime  The time the template shift starts. Must be in HH:MM format.
 *     {String}   endTime    The time the template shift ends. Must be in HH:MM format.
 *     {ObjectId} employeeId The id of the employee to assign to the template shift.
 *     {ObjectId} scheduleId The id of the schedule to make the template shift for.
 * Response body contains:
 *     {TemplateShift} The created template shift.
 */
router.post('/', function(req, res, next) {
    UserController.retrieveEmployeeById(req.body.employeeId, function(err, employee) {
        if (err) {
            return next(err);
        }
        if (req.body.scheduleId.toString() !== employee.schedule.toString()) {
            return next(errors.notEmployeeOfRole);
        }
        UserController.isManagerOfOrganization(req.user.email, employee.org, function(err, isManager) {
            if (err) {
                return next(err);
            }
            if (!isManager) {
                return next(errors.notManagerOfOrg);
            }

            TemplateShiftController.createShift(req.body.day, req.body.startTime, req.body.endTime, 
                req.body.employeeId, req.body.scheduleId, function(err, templateShift) {
                    if (err) {
                        return next(err);
                    }
                    res.send(templateShift);

                    [1, 2, 3].forEach(function(next) {
                        ShiftController.createShiftFromTemplateShift(templateShift._id, next, new Date(), function(err, shift) {
                            if (err) {
                                console.log(err);
                            }
                        });
                    });
                }
            );
        });
    });
});

/**
 * GET all template shifts in the database. Should only be accessible by cron.
 * TODO: permissions
 * No request body parameters required.
 * Response body contains:
 *     {TemplateShift[]} The retrieved template shfits.
 */
router.get('/all', function(req, res, next) {
    TemplateShiftController.getAllShifts(function(err, templateShifts) {
        if (err) {
            return next(err);
        }
        res.send(templateShifts);
    });
});

/**
 * GET all template shifts associated with a schedule.
 * No request body parameters required.
 * Response body contains:
 *     {TemplateShift[]} The retrieved template shifts. 
 */
router.get('/all/:scheduleId', function(req, res, next) {
    TemplateShiftController.getAllShiftsBySchedule(req.param('scheduleId'), function(err, templateShifts) {
        if (err) {
            return next(err);
        }
        res.send(templateShifts);
    });
});

/**
 * GET a template shift by id.
 * No request body parameters required.
 * Response body contains:
 *     {TemplateShift} The retrieved template shift.
 */
router.get('/:id', function(req, res) {
    TemplateShiftController.retrieveShift(req.param('id'), function(err, templateShift) {
        if (err) {
            return next(err);
        }
        res.send(templateShift);
    });
});

/**
 * DELETE an existing template shift and all shifts generated from that template shift.
 * No request body parameters required.
 * Response body contains:
 *     {TemplateShift} The deleted template shift.
 */
router.delete('/:id', function(req, res) {
    var id = req.param('id');

    TemplateShiftController.retrieveShift(id, function(err, retrievedTemplateShift) {
        if (err) {
            return next(err);
        }
        UserController.retrieveEmployeeById(retrievedTemplateShift.responsiblePerson, function(err, employee) {
            if (err) {
                return next(err);
            }
            UserController.isManagerOfOrganization(req.user.email, employee.org, function(err, isManager) {
                if (err) {
                    return next(err);
                }
                if (!isManager) {
                    return next(errors.notManagerOfOrg);
                }

                TemplateShiftController.deleteShift(id, function(err, templateShift) {
                    if (err) {
                        return next(err);
                    } 
                    ShiftController.deleteShiftsGeneratedFromTemplateShift(id, function(err) {
                        if (err) {
                            return next(err);
                        } 
                        res.send(templateShift);
                    });
                }); 
            });
        });
    });    
});

/**
 * PUT to reassign the employee responsible for an existing template shift.
 * Request body should contain:
 *     {ObjectId} employeeId The id of the employee to assign to the template shift.
 * Response body contains:
 *     {TemplateShift} The changed template shift.
 */
router.put('/reassign/:id', function(req, res) {
    UserController.retrieveEmployeeById(req.body.employeeId, function(err, employee) {
        if (err) {
            return next(err);
        }
        UserController.isManagerOfOrganization(req.user.email, employee.org, function(err, isManager) {
            if (err) {
                return next(err);
            }
            if (!isManager) {
                return next(errors.notManagerOfOrg);
            }
            TemplateShiftController.giveShiftTo(req.param('id'), req.body.employeeId, function(err, templateShift) {
                if (err) {
                    return next(err);
                }
                res.send(templateShift);
            });
        });
    });
});

module.exports = router;