/*  Schema + Mongoose model for EmployeeUser

    @author: Anji Ren, Dylan Joss
*/

var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var UserSchema = require('./user').schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

var EmployeeUserSchema = UserSchema.extend({
    schedule: {type: ObjectId, required: true} 
});

module.exports = mongoose.model('EmployeeUser', EmployeeUserSchema);