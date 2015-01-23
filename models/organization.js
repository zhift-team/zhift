/*  Schema + Mongoose model for Organization

    @author: Vicky Gong
*/

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var errorChecking = require('../errors/error-checking');

var OrganizationSchema = new mongoose.Schema({
	_id: {type: String, required: true}
});

module.exports = mongoose.model('Organization', OrganizationSchema);
