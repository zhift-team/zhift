/*  Schema + Mongoose model for Template Shift

    @author: Anji Ren
    
    Formats:
        dayOfWeek: 'Monday', 'Tuesday', etc.
        start, end: 'HH:MM'
*/

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var errorChecking = require('../errors/error-checking');

var TemplateShiftSchema = new mongoose.Schema({
    dayOfWeek: {type: String, required: true},
    start: {type: String, required: true},
    end: {type: String, required: true},
    responsiblePerson: {type: ObjectId, ref: 'EmployeeUser', required: true},
    schedule: {type: ObjectId, ref: 'Schedule', required: true}
});

/*  Validator for dayOfWeek for TemplateShift Schema
*/
TemplateShiftSchema.path('dayOfWeek').validate(
    errorChecking.shifts.isProperDayOfWeek, 
    'Invalid day of the week.'
);

/*  Validator for start for TemplateShift Schema
*/
TemplateShiftSchema.path('start').validate(
    errorChecking.shifts.isProperTime, 
    'Invalid start time. Must be in the format HH:MM.'
);

/*  Validator for end for TemplateShift Schema
*/
TemplateShiftSchema.path('end').validate(
    errorChecking.shifts.isProperTime, 
    'Invalid end time. Must be in the format HH:MM.'
);

module.exports = mongoose.model('TemplateShift', TemplateShiftSchema);
