/**
 * Script to clear the test database.
 * @author Lily Seropian
 */

var EmployeeUser = require('../models/employee-user');
var ManagerUser = require('../models/manager-user');
var Organization = require('../models/organization');
var Record = require('../models/record');
var Schedule = require('../models/schedule');
var Shift = require('../models/shift');
var Swap = require('../models/swap');
var TemplateShift = require('../models/template-shift');
var User = require('../models/user');

/**
 * Delete all documents in the database.
 * @param {Function} fn Callback that takes (err).
 */
module.exports = function(fn) {
    var models = [EmployeeUser, ManagerUser, Organization, Record, Schedule, Shift, Swap, TemplateShift, User];
    var counter = {
        numRemoved: 0
    };
    models.forEach(function(model) {
        model.remove({}, function(err, numRemoved) {
            if (err) {
                return fn(err);
            }
            counter.numRemoved ++;
            if (counter.numRemoved === models.length) {
                fn();
            }
        });
    });
};