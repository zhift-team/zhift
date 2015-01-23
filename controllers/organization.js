/**  
 * All the functions related to manipulating and retrieving information from the Organization database.
 * @author: Vicky Gong
 */

var Organization = require('../models/organization');
var errors = require('../errors/errors');
var errorChecking = require('../errors/error-checking');

module.exports = {};

/**  
 * Create an org.
 * @param {String}   name Name of the organization to create.
 * @param {Function} fn   Callback that takes (err, org).
 */
module.exports.createOrg = function(name, fn) {
    var org = new Organization({
       _id: name
    });

    org.save(fn);
};

/**  
 * Retrieve an org, given its name.
 * @param {String}   name Name of the organization to retrieve.
 * @param {Function} fn   Callback that takes (err, org).
 */
module.exports.retrieveOrg = function(name, fn) {
    Organization.findById(name, fn);
}