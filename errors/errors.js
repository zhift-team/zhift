/**
 * File containing specific errors used by the app
 *
 * @author: Vicky Gong, Lily Seropian
 */

// Any specific errors go into their own object
module.exports.shifts = {};
module.exports.records = {};
module.exports.swaps = {};

/**
 * Create an error.
 * @param  {Number} status  The status code for the error.
 * @param  {String} name    The name of the error.
 * @param  {String} message Details about the error.
 * @return {Object}         An error that may be used as an HTTP response.
 */
var createError = function(status, name, message) {
    return {
        status: status,
        name: name,
        message: message
    };
};

/**
 * Create a 400 error message.
 * @param  {String} message Details about the error.
 * @return {Object}         An error that may be used as an HTTP response.
 */
var create400 = function(message) {
    return createError(400, 'Bad Input', message);
};

/**
 * Create a 401 error message.
 * @param  {String} message Details about the error.
 * @return {Object}         An error that may be used as an HTTP response.
 */
var create401 = function(message) {
    return createError(401, 'Bad Permissions', message);
};

/**
 * Create a 404 error message.
 * @param  {String} message Details about the error.
 * @return {Object}         An error that may be used as an HTTP response.
 */
var create404 = function(message) {
    return createError(404, 'Not Found', message);
};

/* Authorization */

module.exports.notManagerOfOrg = create401('You are not a manager of this organization.');
module.exports.notMemberOfOrg = create401('You are not a member of this organization.');
module.exports.notManagerOrEmployeeOfRole = create401('You are neither an employee of this role nor a manager.');
module.exports.notManagerOrOwner = create401('You are neither responsible for this shift nor a manager.');
module.exports.notEmployeeOfRole = create401('You are not an employee of the appropriate schedule.');
module.exports.notUser = create401('You are not the user associated with this request.');

/* Not found */

module.exports.notFound = create404('');

/* Shift */

module.exports.shifts.invalidDate = create400('Invalid Date.');
module.exports.shifts.shiftForWeekAlreadyCreated = create400('Shift associated with this template shift and week already exists! Try another week!');
module.exports.shifts.noShiftsForUser = create404('This user is not responsible for any shifts.');
module.exports.shifts.templateShiftDoesNotExist = create404('Template shift not found.');
module.exports.shifts.employeeNotFound = create404('Employee not found.');

/* Record */

module.exports.records.scheduleNotFound = create404('Schedule not found.');

/* Swap */

module.exports.swaps.badSwap = create400('Unidentified request.');
module.exports.swaps.noSwapsForShift = create404('This shift has no swaps associated with it.');