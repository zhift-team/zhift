/*  Schema + Mongoose model for ManagerUser

    @author: Anji Ren
*/

var mongoose = require('mongoose');
var extend 	= require('mongoose-schema-extend');
var UserSchema = require('./user').schema;

var ManagerUserSchema = UserSchema.extend({});

module.exports = mongoose.model('ManagerUser', ManagerUserSchema);