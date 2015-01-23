/**
 * Swap routes.
 * 
 * @author: Vicky Gong, Lily Seropian, Dylan Joss
 */

var express = require('express');
var router = express.Router();

var SwapController = require('../controllers/swap');
var RecordController = require('../controllers/record');
var UserController = require('../controllers/user');
var ShiftController = require('../controllers/shift');
var errors = require('../errors/errors');
var errorChecking = require('../errors/error-checking');

/**
 * POST to create a new swap.
 * Sends an email notification to the manager(s) that an employee put a shift up for swap.
 * Request body should contain:
 *     {ObjectId} shiftId    The id of the shift to put up for swap.
 *     {ObjectId} scheduleId The id of the schedule the shift is on.
 * Response body contains:
 *     {Swap} The created swap.
 */
router.post('/', function(req, res, next) {
    UserController.isEmployeeOfRole(req.user.email, req.body.scheduleId, function(err, isEmployeeOfRole) {
        if (err) {
            return next(err);
        }
        if (!isEmployeeOfRole) {
            return next(errors.notEmployeeOfRole);
        }
        // createSwap checks that the current user owns the shift for which to create a swap
        SwapController.createSwap(req.body.shiftId, req.user._id, req.body.scheduleId, function(err, swap) {
            if (err) {
                return next(err);
            } 

            RecordController.recordShiftUpForSwap(req.user.org, [], req.user.name, swap.shiftUpForSwap);
            res.send(swap);
        });
    });
});

/**
 * GET the swap for a given up for swap shift.
 * No request body parameters required.
 * Response body contains:
 *     {Swap} The found swap.
 */
router.get('/shift/:id', function(req, res, next) {
    SwapController.getSwapForShift(req.param('id'), function(err, swap) {
        if (err) {
            return next(err);
        }
        if (!swap) {
            return next(errors.swaps.noSwapsForShift);
        }
        res.send(swap);
    });
});

/**
 * GET all swaps for a schedule.
 * No request body parameters required.
 * Response body contains:
 *     {Swap[]} The found swaps.
 */
router.get('/schedule/:id', function(req, res, next) {
    SwapController.getSwapsOnSchedule(req.param('id'), function(err, swaps) {
        if (err) {
            return next(err);
        } 
        res.send(swaps);
    });
});

/**
 * PUT to propose a shift in exchange, accept a proposed swap, or reject a proposed swap.
 * Sends email notifications for all changes.
 * Request body should contain:
 *     {ObjectId?} shiftId    The id of the shift to propose. Should not be specified when accepting or rejecting a swap.
 *     {String}   acceptSwap 'true' to accept a swap, 'false' to reject it. Should not be specified when proposing a shift in exchange.
  * Response body contains:
 *     {Swap} The affected swap.
 */
router.put('/:id', function(req, res, next) {
    var id = req.param('id');

    ShiftController.getShift(req.body.shiftId, function(err, shift) {
        if (err) {
            return next(err);
        }
        // proposing a shift to swap
        if (req.body.shiftId !== undefined) {
            if (shift.schedule.toString() !== req.user.schedule.toString()) {
                return next(errors.notEmployeeOfRole);
            }
            SwapController.offerShiftForSwap(id, req.body.shiftId, function(err, swap) {
                if (err) {
                    return next(err);
                } 

                swap.shiftOfferedInReturn.responsiblePerson.name = req.user.name;
                RecordController.recordSwapProposal(req.user.org, [swap.shiftUpForSwap.responsiblePerson.email], swap);
                res.send(swap);
            });
        }
        // accepting or rejecting a proposed swap
        else {
            if (req.body.acceptSwap === 'true') {
                SwapController.acceptSwap(id, function(err, swap) {
                    if (err) {
                        return next(err);
                    }
                    swap.shiftUpForSwap.responsiblePerson.name = req.user.name;
                    RecordController.recordSwapAccepted(req.user.org, [swap.shiftOfferedInReturn.responsiblePerson.email], swap);
                    res.send(swap);
                });
            }
            else if (req.body.acceptSwap === 'false') {
                SwapController.resetOfferedShiftInSwap(id, function(err, swap) {
                    if (err) {
                        return next(err);
                    }
                    swap.shiftUpForSwap.responsiblePerson.name = req.user.name;
                    RecordController.recordSwapRejected(req.user.org, [swap.shiftOfferedInReturn.responsiblePerson.email], swap);
                    res.send(swap);
                });
            }
            else {
                return next(errors.swaps.badSwap);
            }
        }
    });
});

module.exports = router;