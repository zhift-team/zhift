/**
 * All the functions related to manipulating and retrieving information from the User database.
 *  
 * @author: Anji Ren, Lily Seropian, Dylan Joss
 */

var User = require('../models/user');
var ManagerUser = require('../models/manager-user');
var EmployeeUser = require('../models/employee-user');
var OrgController = require('../controllers/organization');
var ScheduleController = require('../controllers/schedule');
var RecordController = require('../controllers/record');
var errors = require('../errors/errors');
var bCrypt = require('bcrypt-nodejs');
var validator = require('validator');


/**
 * Generate a random password of 10 characters.
 * Code from http://www.javascriptkit.com/script/script2/passwordgenerate.shtml.
 * @return {String} The generated password.
 */
var generatePassword = function() {
    var keylist = 'abcdefghijklmnopqrstuvwxyz123456789';
    var password = '';
    var PASSWORD_LENGTH = 10;
    for (i = 0; i < PASSWORD_LENGTH; i++) {
        password += keylist.charAt(Math.floor(Math.random() * keylist.length));
    }
    return password;
};

module.exports = {};

/**
 * Create an employee.
 * @param  {String}   name     Employee full name.
 * @param  {String}   email    Employee email.
 * @param  {String}   org      Organization employee is part of.
 * @param  {String}   role     Employee role.
 * @param  {Function} fn       Callback that takes (err, employee).
 */
module.exports.createEmployee = function(name, email, org, role, fn) {
    if (!validator.isEmail(email)) {
        return fn('Invalid email address.');
    }

    var password = generatePassword();

    var userData = {
        name: name,
        email: email,
        password: bCrypt.hashSync(password, bCrypt.genSaltSync(10)),
        org: org
    };

    var newUser = new User(userData);

    // employees cannot be associated with a nonexistent organization
    OrgController.retrieveOrg(org, function(err, retrievedOrg) {
        if (err) {
            return fn(err.message);
        }
        if (!retrievedOrg) {
            return fn('Employee cannot be associated with a nonexistent organization.');
        }
        else {
            // employees cannot be associated with a nonexistent role (i.e. one for which there
            // is no associated schedule)
            ScheduleController.retrieveScheduleByOrgAndRole(org, role, function(err, schedule) {
                if (err) {
                    return fn(err.message);                 
                }
                if (!schedule) {
                    return fn('No schedule found for that organization and role');
                }
                else {
                    newUser.save(function(err, user) {
                        if (err) {
                            return fn(err.message);
                        }

                        // ensure that the ID of User saved to the User database is same as that of 
                        // Employee saved to the EmployeeUser database
                        userData._id = user._id;

                        userData.schedule = schedule._id;

                        var newEmployee = new EmployeeUser(userData);

                        newEmployee.save(function(err, employee) {
                            if (err) {
                                return fn(err.message);
                            }
                            RecordController.inviteEmployee(name, email, password, role, org);
                            fn(null, employee);
                        });
                    });
                }
            });
        }
    });
};


var createManagerHelper = function(userData, inviteManager, fn) {
    var newUser = new User(userData);

    newUser.save(function(err, user) {
        if (err) {
            return fn(err.message);
        }
        // ensure that the ID of User saved to the User database is same as that of 
        // Manager saved to the ManagerUser database
        userData._id = user._id;

        var newManager = new ManagerUser(userData);

        newManager.save(function(err, manager) {
            if (err) {
                return fn(err.message);
            }
            if (inviteManager) {
                RecordController.inviteManager(manager.name, manager.email, manager.password, manager.org);
            }
            fn(null, manager);
        });
    });
};

/**
 * Create a manager.
 * @param  {String}   name     Manager full name.
 * @param  {String}   email    Manager email.
 * @param  {String}   password Manager password.
 * @param  {String}   org      Organization manager is part of.
 * @param  {Function} fn       Callback that takes (err, manager)
 */
module.exports.createManager = function(name, email, password, org, isInvite, fn) {
    if (!validator.isEmail(email)) {
        return fn('Invalid email address.');
    }

    var hashedPassword;
    
    if (!password) {
        password = generatePassword();
        hashedPassword = bCrypt.hashSync(password, bCrypt.genSaltSync(10));
    }

    var userData = {
        name: name,
        email: email,
        password: hashedPassword || password,
        org: org
    };

    // creating a manager associated with a new organization --> create that organization
    OrgController.retrieveOrg(org, function(err, retrievedOrg) {
        var inviteManager = ((retrievedOrg !== null) && (isInvite))

        if (err) {
            return fn(err.message);
        }
        if (!retrievedOrg) {
            OrgController.createOrg(org, function(err, newOrg) {
                if (err) {
                    return fn('Invalid organization name.'); 
                }
                createManagerHelper(userData, false, fn);
            }); 
        }
        else if (!inviteManager) {
            return fn('This organization already exists!');
        } else if (inviteManager) {
            createManagerHelper(userData, true, fn);
        }
    });
};

/**
 * Retrieve existing user.
 * @param {String}   email    User email.
 * @param {String}   org      Organization user is part of.
 * @param {Function} fn       Callback that takes (err, user).
 */
module.exports.retrieveUser = function(email, org, fn) {
    User.findOne({email: email, org: org}, function(err, user) {
        if (err) {
            return fn(err.message);
        } 
        if (!user) {
            return fn('Incorrect name or organization.');
        } 
        fn(null, user);
    });
};

/**
 * Retrieve existing employee by id.
 * @param {ObjectId} id       Employee id.
 * @param {Function} fn       Callback that takes (err, user).
 */
module.exports.retrieveEmployeeById = function(id, fn) {
    EmployeeUser.findById(id, function(err, employeeUser) {
        if (err) {
            return fn(err);
        } 
        if (!employeeUser) {
            return fn('Incorrect employee id.');
        } 
        fn(null, employeeUser);
    });
};

/**
 * Retrieve existing manager by id.
 * @param {ObjectId} id       Manager id.
 * @param {Function} fn       Callback that takes (err, user).
 */
module.exports.retrieveManagerById = function(id, fn) {
    ManagerUser.findById(id, function(err, managerUser) {
        if (err) {
            return fn(err);
        } 
        if (!managerUser) {
            return fn('Incorrect manager id.');
        } 
        fn(null, managerUser);
    });
};

/** 
 * Retrieve all employees associated with the org with the id.
 * @param {ObjectId} id       Org id.
 * @param {Function} fn       Callback that takes (err, user).
 */
module.exports.retrieveEmployeesByOrgId = function(id, fn) {
    EmployeeUser.find({org: id}, function(err, employeeUsers) {
        if (err) {
            return fn(err);
        } 
        if (!employeeUsers) {
            return fn('Incorrect org id.');
        } 
        fn(null, employeeUsers);
    });
};

/** 
 * Retrieve all managers associated with the org with the id.
 * @param {ObjectId} id       Org id.
 * @param {Function} fn       Callback that takes (err, user).
 */
module.exports.retrieveManagersByOrgId = function(id, fn) {
    ManagerUser.find({org: id}, function(err, managerUsers) {
        if (err) {
            return fn(err);
        } 
        if (!managerUsers) {
            return fn('Incorrect org id.');
        } 
        fn(null, managerUsers);
    });
};

/** 
 * Retrieve all employees associated with the schedule with the id.
 * @param {ObjectId} id       Org id.
 * @param {Function} fn       Callback that takes (err, user).
 */
module.exports.retrieveEmployeesByScheduleId = function(id, fn) {
    EmployeeUser.find({schedule: id}, function(err, employeeUsers) {
        if (err) {
            return fn(err);
        } 
        if (!employeeUsers) {
            return fn('Incorrect schedule id.');
        } 
        fn(null, employeeUsers);
    });
};

/** 
 * Check if given user is in the organization.
 * @param {ObjectId} userEmail User email.
 * @param {String}   orgName   Name of organization.
 * @param {Function} fn        Callback that takes (err, user).
 */
module.exports.isUserOfOrganization = function(userEmail, orgName, fn) {
    User.findOne({email: userEmail, org: orgName}, function(err, user) {
        fn(err, user !== null);
    });
};

/** 
 * Check if given user is a manager of the organization.
 * @param {ObjectId} userEmail User email.
 * @param {String}   orgName   Name of organization.
 * @param {Function} fn        Callback that takes (err, user).
 */
module.exports.isManagerOfOrganization = function(userEmail, orgName, fn) {
    ManagerUser.findOne({email: userEmail, org: orgName}, function(err, manager) {
        fn(err, manager !== null);
    });
};

/** 
 * Check if given user is a manager of the organization.
 * @param {ObjectId} userEmail User email.
 * @param {String}   orgName   Name of organization.
 * @param {Function} fn        Callback that takes (err, user).
 */
module.exports.isEmployeeOfOrganization = function(userEmail, orgName, fn) {
    EmployeeUser.findOne({email: userEmail, org: orgName}, function(err, employee) {
        fn(err, employee !== null);
    });
};

/** 
 * Check if given user is a member of the schedule.
 * @param {ObjectId} userEmail  User email.
 * @param {String}   scheduleId The id of schedule.
 * @param {Function} fn         Callback that takes (err, user).
 */
module.exports.isEmployeeOfRole = function(userEmail, scheduleId, fn) {
    EmployeeUser.findOne({email: userEmail, schedule: scheduleId}, function(err, employee) {
        fn(err, employee !== null);
    });
};

/**
 * Change the password of a user.
 * @param {ObjectId} userId      The id of the user to change the password for.
 * @param {String}   newPassword The new password the user desires.
 * @param {Function} fn          Callback that takes (err, user).
 */
module.exports.changePassword = function(userId, newPassword, fn) {
    var hashedPassword = bCrypt.hashSync(newPassword, bCrypt.genSaltSync(10));
    User.findByIdAndUpdate(userId, {password: hashedPassword}, function(err, user) {
        if (err) {
            return fn(err);
        }
        if (user.schedule) { // is an employee
            EmployeeUser.findByIdAndUpdate(userId, {password: hashedPassword}, fn);
        }
        else { // is a manager
            ManagerUser.findByIdAndUpdate(userId, {password: hashedPassword}, fn);
        }
    });
};

/**
 * Delete a manager.
 * @param  {ObjectId} userId    The id of the manager to be deleted.
 * @param  {Function} fn        Callback that takes (err, user)
 */
module.exports.deleteManager = function(userId, fn) {
    User.remove(userId, function(err, user) {
        if (err) {
            return fn(err);
        }
        ManagerUser.remove(userId, fn);
    });
};

/**
 * Delete an employee.
 * @param  {ObjectId} userId    The id of the employee to be deleted.
 * @param  {Function} fn        Callback that takes (err, user)
 */
module.exports.deleteEmployee = function(userId, fn) {
    User.remove(userId, function(err, user) {
        if (err) {
            return fn(err);
        }
        EmployeeUser.remove(userId, fn);
    });
};
