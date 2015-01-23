/**
 * UserService
 * 
 * Angular Service to contact User API.
 * 
 * @author: Lily Seropian
 */

var ZhiftApp = angular.module('ZhiftApp');

ZhiftApp.service('UserService', function() {
    var service = {
        /**
         * GET /user/employee/[employeeId].
         * @param {String}   employeeId The id of the employee to get.
         * @param {Function} fn         Called with retrieved employee or error.
         */
        getEmployee: function(employeeId, fn) {
            $.ajax({
                datatype: 'json',
                type: 'GET',
                url: '/user/employee/' + employeeId,
            }).success(function(res) {
                fn(null, res);
            }).error(function(res) {
                fn(res.responseText);
            });
        },

        /**
         * GET /user/org/[orgId]/employee.
         * @param {String}   id The id of the organization for which to get all employees.
         * @param {Function} fn Called with retrieved employees or error.
         */
        getEmployees: function(id, fn) {
            $.ajax({
                datatype: 'json',
                type: 'GET',
                url: '/user/org/' + id + '/employee/',
            }).success(function(res) {
                fn(null, res);
            }).error(function(res) {
                fn(res.responseText);
            });
        },

        /**
         * GET /user/sched/[scheduleId].
         * @param {String}   id The id of the schedule for which to get all employees.
         * @param {Function} fn Called with retrieved employees or error.
         */
        getEmployeesForSchedule: function(id, fn) {
            $.ajax({
                datatype: 'json',
                type: 'GET',
                url: '/user/sched/' + id,
            }).success(function(res) {
                fn(null, res);
            }).error(function(res) {
                fn(res.responseText);
            });
        },

        /**
         * POST /user/employee.
         * @param {String}   name  The name of the new employee.
         * @param {String}   email The email of the new employee.
         * @param {String}   role  The role of the new employee.
         * @param {String}   org   The org of the new employee.
         * @param {Function} fn    Callback that takes (err, employee).
         */
        createEmployee: function(name, email, role, org, fn) {
            $.ajax({
                datatype: 'json',
                type: 'POST',
                url: '/user/employee/',
                data: {
                    username: name,
                    email: email,
                    role: role,
                    org: org,
                },
            }).success(function(res) {
                fn(null, res);
            }).error(function(res) {
                fn(res.responseText);
            });
        },

        deleteEmployee: function(id, fn) {
            $.ajax({
                datatype: 'json',
                type: 'DELETE',
                url: '/user/employee/'+id
            }).success(function(res) {
                fn(null, res);
            }).error(function(res) {
                fn(res.responseText);
            });
        },
        
        /**
         * GET /user/org/[orgId]/manager.
         * @param {String}   id The id of the organization for which to get all managers.
         * @param {Function} fn Called with retrieved managers or error.
         */
        getManagers: function(id, fn) {
            $.ajax({
                datatype: 'json',
                type: 'GET',
                url: '/user/org/' + id + '/manager/',
            }).success(function(res) {
                fn(null, res);
            }).error(function(res) {
                fn(res.responseText);
            });
        },

        /**
         * POST /user/manager.
         * @param {String}   name  The name of the new manager.
         * @param {String}   email The email of the new manager.
         * @param {String}   org   The org of the new manager.
         * @param {Function} fn    Callback that takes (err, manager).
         */
        createManager: function(name, email, org, invite, fn) {
            $.ajax({
                datatype: 'json',
                type: 'POST',
                url: '/user/manager/',
                data: {
                    username: name,
                    email: email,
                    org: org,
                    invite: invite
                },
            }).success(function(res) {
                fn(null, res);
            }).error(function(res) {
                fn(res.responseText);
            });
        },

        /**
         * PUT /user/[userId]
         * @param {String}   id       The id of the user to update the password of.
         * @param {String}   password The new password.
         * @param {Function} fn       Callback that takes (err, user).
         */
        changePassword: function(id, password, fn) {
            $.ajax({
                datatype: 'json',
                type: 'PUT',
                url: '/user/' + id,
                data: {
                    password: password,
                },
            }).success(function(res) {
                fn(null, res);
            }).error(function(res) {
                fn(res.responseText);
            });
        },
    };
  
    return service;
});