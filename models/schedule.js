/*  Schema + Mongoose model for Schedule

    @author: Anji Ren, Dylan Joss
*/

var mongoose = require('mongoose');
var errorChecking = require('../errors/error-checking');

var ScheduleSchema = new mongoose.Schema({
	org: {type: String, ref: 'Organization', required: true, validate: [errorChecking.isValidText, 'Error']},
	role: {type: String, required: true, validate: [errorChecking.isValidText, 'Error']},
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
