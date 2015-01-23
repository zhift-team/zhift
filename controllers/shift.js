/**
 * All the functions related to manipulating and retrieving information from the Shift database.
 * @author: Vicky Gong, Lily Seropian
 */

var Shift = require('../models/shift');
var TemplateShift = require('../models/template-shift');
var errors = require('../errors/errors');
var datejs = require('../public/javascripts/libraries/date');
var errorChecking = require('../errors/error-checking');

module.exports = {};

/**
 * Create a shift.
 * @param {String}   day             What day of the week the shift is on.
 * @param {String}   startTime       Time the shift starts.
 * @param {String}   endTime         Time the shift ends.
 * @param {ObjectId} employeeId      The id of the employee responsible for the shift.
 * @param {ObjectId} scheduleId      The id of the schedule with which the shift is associated.
 * @param {ObjectId} templateShiftId The id of the template from which the shift is generated.
 * @param {Date}     date            Date of shift.
 * @param {Function} fn              Callback that takes (err, shift).
 */
var createShift = function(day, startTime, endTime, employeeId, scheduleId, templateShiftId, date, fn) {
    var shift = new Shift({
        dayOfWeek: day,
        start: startTime,
        end: endTime,
        responsiblePerson: employeeId,
        schedule: scheduleId,
        templateShift: templateShiftId,
        dateScheduled: date,
        upForGrabs: false,
        upForSwap: false
    });
    shift.save(fn);
};

/**
* Find a shift based on id.
* @param {ObjectId} shiftId The id of the shift.
* @param {Function} fn              Callback that takes (err, shift).
*/
module.exports.getShift = function(shiftId, fn) {
    Shift.findById(shiftId).populate('responsiblePerson').exec(function(err, shift) {
        if (err || !shift) {
            return fn(err);
        } else {
            return fn(null, shift);
        }
    });
};

/**
* Delete all shifts based on the same template shift.
* @param {ObjectId} templateShiftId The id of the template shift.
* @param {Function} fn              Callback that takes (err, shift).
*/
module.exports.deleteShiftsGeneratedFromTemplateShift = function(templateShiftId, fn) {
    Shift.remove({templateShift: templateShiftId}, fn);
};

/**
* Creates a shift from the template shift for the next <day of week> since the given date.
*
*   Ex. TemplateShift occurs on Tuesday 5 PM - 6 PM
*       next = 1
*       dateFrom: Today
*       Creates a shift for the next Tuesday that occurs after today
*       
*   Ex. next = 2
        Creates a shift for the next next Tuesday that occurs after today
*       
* @param {ObjectId} templateShiftId Template shift id to copy from.
* @param {int}      next            Times to skip to the next day.
* @param {Date}     dateFrom        Date calculated from or Date.now() if none.
* @param {Function} fn              Callback that takes (err, shift).
*/
module.exports.createShiftFromTemplateShift = function(templateShiftId, next, dateFrom, fn) {
    TemplateShift.findById(templateShiftId, function(err, templateShift) {
        if (err) {
            return fn(err);
        }

        // templateshift with given id doesn't exist, return error
        if (!templateShift) {
            return fn(errors.shifts.templateShiftDoesNotExist);
        }

        var day = templateShift.dayOfWeek;
        var startTime = templateShift.start;
        var endTime = templateShift.end;
        var employeeId = templateShift.responsiblePerson;
        var scheduleId = templateShift.schedule;
        var date = eval('dateFrom.next().' + day.toLowerCase() + '().addDays(' + (next-1)*7 + ')');
        date.setHours(0,0,0,0);

        // Check if this shift already exists
        Shift.findOne({templateShift: templateShiftId, dateScheduled: date}, function(err, shift) {
            if (err) {
                fn(err);
            }
            // If this shift exists for this day, do not create
            else if (shift) {
                fn(errors.shifts.shiftForWeekAlreadyCreated);
            }
            // Create only if this shift doesn't exist
            else {
                createShift(day, startTime, endTime, employeeId, scheduleId, templateShiftId, date, fn);
            }
        });
    });
};

/**
 * Put a shift up for grabs.
 * @param {ObjectId} shiftId The id of the shift to be put up for grabs.
 * @param {ObjectId} employeeId The id of the employee that is putting the shift up for grabs.
 * @param {Function} fn      Callback that takes (err, shift).
 */
module.exports.putUpForGrabs = function(shiftId, employeeId, fn) {
    Shift.findOneAndUpdate({_id: shiftId, responsiblePerson: employeeId}, {upForGrabs: true}, fn);
};

/**
 * Grab a shift and give the shift's responbility to another employee.
 * @param {ObjectId} shiftId    The id of the shift.
 * @param {ObjectId} employeeId The id of the employee that will take the shift.
 * @param {Function} fn         Callback that takes (err, shift).
 */
module.exports.giveShiftTo = function(shiftId, employeeId, fn) {
    Shift.findById(shiftId).populate('responsiblePerson').exec(function(err, shift) {
        // TODO: error handling
        if (err || !shift) {
            return fn(err);
        }

        var originalOwner = shift.responsiblePerson;
        shift.responsiblePerson = employeeId;
        shift.upForGrabs = false;
        shift.save(function(err, shift) {
            return fn(err, shift, originalOwner);
        });
    });
};

/**
 * Mark a shift is up for swap.
 * @param {ObjectId} shiftId The id of the shift to be put up for swap.
 * @param {Function} fn      Callback that takes (err, shift).
 */
module.exports.putUpForTrade = function(shiftId, fn) {
    Shift.findByIdAndUpdate(shiftId, {upForSwap: true}, fn);
};



/**
 * Switch the people responsible for the two given shifts.
 * 
 * TODO: if the 2nd fails to occur, the first still occurs.
 * 
 * @param {ObjectId} shiftIdA The id of the first shift.
 * @param {ObjectId} shiftIdB The id of the second shift.
 * @param {Function} fn       Callback that takes (err, shift[]).
 */
module.exports.tradeShifts = function(shiftIdA, shiftIdB, fn) {
    // Updating shiftA
    Shift.findById(shiftIdA, function(err, shiftA) {
        Shift.findById(shiftIdB, function(err, shiftB) {
            var temp = shiftA.responsiblePerson;

            shiftA.responsiblePerson = shiftB.responsiblePerson;
            shiftA.upForSwap = false;
            shiftA.save(function(err, shiftA) {
            if (err) {
                return fn(err);
            }

            shiftB.responsiblePerson = temp;
            shiftB.upForSwap = false;
            shiftB.save(function(err, shiftB) {
                    if (err) {
                        return fn(err);
                    }
                    fn(null, [shiftA, shiftB]);
                });
            });
        });
    });
};

/**
 * Get all shifts associated with a user.
 * @param {ObjectId} employeeId The id of the employee to get shifts for.
 * @param {Function} fn         Callback that takes (err, shift[]).
 */
module.exports.getAllUserShifts = function(employeeId, fn) {
    Shift.find({responsiblePerson: employeeId}, fn);
};

/**
 * Get all shifts associated with a schedule to get shifts for.
 * @param {ObjectId} scheduleId The id of the schedule.
 * @param {Function} fn         Callback that takes (err, shift[]).
 */
module.exports.getAllShiftsOnASchedule = function(scheduleId, fn) {
    Shift.find({schedule: scheduleId})
        .populate('responsiblePerson', 'name')
        .exec(fn);
};

/**
 * Get all shifts within a week from the given date
 * associated with a schedule 
 *
 * @param {ObjectId} scheduleId The id of the schedule.
 * @param {Date} dateFrom       The date from to get within 7 days of
 * @param {Function} fn         Callback that takes (err, shift[]).
 */
module.exports.getAWeekShiftsOnASchedule = function(scheduleId, dateFrom, fn){
    var end = new Date(dateFrom);
    end.next().sunday();

    Shift.find({'schedule': scheduleId,
                'dateScheduled': {"$gte": dateFrom, "$lt": end}
               })
        .populate('responsiblePerson', 'name')
        .exec(fn);
}

/**
 * Get all shifts currently on open offer.
 * @param {ObjectId} scheduleId The id of the schedule to get shifts for.
 * @param {Function} fn         Callback that takes (err, shift[]).
 */
module.exports.getOfferedShiftsOnASchedule = function(scheduleId, fn) {
    Shift.find({schedule: scheduleId, upForGrabs: true}, fn);
};

/**
 * Get all shifts currently up for grabs.
 * @param {ObjectId} scheduleId The id of the schedule to get shifts for.
 * @param {Function} fn         Callback that takes (err, shift[]).
 */
module.exports.getShiftsUpForSwapOnASchedule = function(scheduleId, fn) {
    Shift.find({schedule: scheduleId, upForSwap: true}, fn);
};

/**
 * Delete all shifts that have already happened. Only called by cron.
 * @param  {Function} fn Callback that takes (err, numShiftsDeleted).
 */
module.exports.deleteOldShifts = function(fn) {
    Shift.remove({dateScheduled: {$lt: new Date()}}, fn);
};

/**
 * Get all shifts that are scheduled for tomorrow that are either up for grabs or up for swap. Only called by cron.
 * @param  {Function} fn Callback that takes (err, shift[]).
 */
module.exports.getUnfilledShiftsForTomorrow = function(fn) {
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    Shift.find({dateScheduled: tomorrow, $or: [{upForGrabs: true}, {upForSwap: true}]}).populate('responsiblePerson').exec(fn);
};