/**  Schema + Mongoose model for User

    @author: Anji Ren, Dylan Joss
*/

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var errorChecking = require('../errors/error-checking');

var UserSchema = new mongoose.Schema({
    name: {type: String, required: true, validate: [errorChecking.isValidText, 'Error']},
    email: {type: String, require: true, unique: true},
    password: {type: String, required: true},
    org: {type: String, ref: 'Organization', required: true, validate: [errorChecking.isValidText, 'Error']}, 
});

module.exports = mongoose.model('User', UserSchema);