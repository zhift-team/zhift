/**
 * All the functions related to manipulating and retrieving information from the Template Shift database.
 * @author: Anji Ren
 */

var TemplateShift = require('../models/template-shift');
var errors = require('../errors/errors');
var errorChecking = require('../errors/error-checking');

module.exports = {};

/**
 * Create a template for a regularly occurring shift.
 * @param {String}   day        What day of the week the shift is on.
 * @param {String}   startTime  Time the shift starts.
 * @param {String}   endTime    Time the shift ends.
 * @param {ObjectId} employeeId The id of the employee regularly responsible for shift.
 * @param {ObjectId} scheduleId The id of the schedule the shift is associated with.
 * @param {Function} fn         Callback that takes (err, templateShift).
 */
module.exports.createShift = function(day, startTime, endTime, employeeId, scheduleId, fn) {
    // Create new Template Shift
    var shift = new TemplateShift({
         dayOfWeek: day,
         start: startTime,
         end: endTime,
         responsiblePerson: employeeId,
         schedule: scheduleId
    });

    // Add to database
    shift.save(function(err, shift) {
        if (err) {
            return fn(err);
        }
        shift.populate('responsiblePerson', fn);
    });
};

/**
 * Retrieve a template for a regularly occurring shift.
 * @param {ObjectId} shiftId The id of the shift to be retrieved.
 * @param {Function} fn      Callback that takes (err, templateShift).
 */
module.exports.retrieveShift = function(shiftId, fn) {
    TemplateShift.findById(shiftId, fn);
};

/**
 * Delete a template for a regularly occurring shift.
 * @param {ObjectId} shiftId The id of the shift to be deleted.
 * @param {Function} fn      Callback that takes (err, templateShift).
*/
module.exports.deleteShift = function(shiftId, fn) {
    TemplateShift.findByIdAndRemove(shiftId, fn);
};

/**
 * Grab a template shift and give the shift's responsibility to another employee.
 * @param {ObjectId} shiftId    The id of the shift.
 * @param {ObjectId} employeeId The id of the employee that will take the shift.
 * @param {Function} fn         Callback that takes (err, templateShift).
*/
module.exports.giveShiftTo = function(shiftId, employeeId, fn) {
    TemplateShift.findByIdAndUpdate(shiftId, {responsiblePerson: employeeId}, fn);
};

/**
 * Get all template shifts associated with a schedule.
 * @param {ObjectId} scheduleId The id of the schedule shift is part of.
 * @param {Function} fn         Callback that takes (err, templateShift).
*/
module.exports.getAllShiftsBySchedule = function(scheduleId, fn) {
    TemplateShift.find({schedule: scheduleId})
        .populate('responsiblePerson', 'name')
        .exec(fn);
};

/**
 * Get all template shifts in database. Used only by cron.
 * @param {Function} fn Callback that takes (err, templateShift[]).
 */
module.exports.getAllShifts = function(fn) {
    TemplateShift.find({}, fn);
}