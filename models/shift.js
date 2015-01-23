/*  Schema + Mongoose model for Shift

    @author: Vicky Gong
    
    Formats:
        dayOfWeek: 'Monday', 'Tuesday', etc.
        start, end: 'HH:MM'

    upForGrabs: boolean indicating whether the shift is being offered
        default: False
    upForSwap: boolean indicating whether shift is being offered for swap
        default: False

*/

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var errorChecking = require('../errors/error-checking');

var ShiftSchema = new mongoose.Schema({
    dayOfWeek: {type: String, required: true},
    start: {type: String, required: true},
    end: {type: String, required: true},
    responsiblePerson: {type: ObjectId, ref: 'EmployeeUser', required: true},
    schedule: {type: ObjectId, ref: 'Schedule', required: true},
    dateScheduled: {type: Date, required: true},
    upForGrabs: {type: Boolean, required: true},
    upForSwap: {type: Boolean, required: true},
    templateShift: {type: ObjectId, ref: 'TemplateShift', required: true}
});

/*  Validator for dayOfWeek for Shift Schema
*/
ShiftSchema.path('dayOfWeek').validate(
    errorChecking.shifts.isProperDayOfWeek, 
    'Invalid day of the week'
);

/*  Validator for start for Shift Schema
*/
ShiftSchema.path('start').validate(
    errorChecking.shifts.isProperTime, 
    'Invalid start time. Must be in the format HH:MM.'
);

/*  Validator for end for Shift Schema
*/
ShiftSchema.path('end').validate(
    errorChecking.shifts.isProperTime, 
    'Invalid end time. Must be in the format HH:MM.'
);

module.exports = mongoose.model('Shift', ShiftSchema);
