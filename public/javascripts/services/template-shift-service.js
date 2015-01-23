/**
 * TemplateShiftService
 * 
 * Angular Service for template shifts
 * 
 * @author: Lily Seropian, Anji Ren
 */

var ZhiftApp = angular.module('ZhiftApp');

ZhiftApp.service('TemplateShiftService', ['$rootScope', function($rootScope) {
    var service = {

        // Getting template shifts associated with a schedule
        getTemplateShifts: function(scheduleId, callback) {
            $.ajax({
                datatype: 'json',
                type: 'GET',
                url: '/template/all/' + scheduleId,
            }).success(function(res) {
                callback(null, res);
            }).error(function(res) {
                // TODO: error handling
                callback(res.responseText);
            });
        },

        // Creating a template shift with given parameters
        createTemplateShift: function(day, startTime, endTime, employeeId, scheduleId, callback) {
            $.ajax({
                datatype: 'json',
                type: 'POST',
                url: '/template/',
                data: {
                    day: day,
                    startTime: startTime,
                    endTime: endTime,
                    employeeId: employeeId,
                    scheduleId: scheduleId,
                },
            }).done(function(res) {
                callback(null, res);
            }).fail(function(res) {
                // TODO: error handling
                callback(res.responseText);
            });
        },
        // Deleting a template shift
        deleteTemplateShift: function(id, callback) {
            $.ajax({
                datatype: 'json',
                type: 'DELETE',
                url: '/template/' + id,
            }).success(function(res) {
                callback(null, res);
            }).error(function(res) {
                callback(res.responseText);
            })
        },

        // Reassigning the template shift to another employee
        reassignTemplateShift: function(id, day, startTime, endTime, reassignToEmployeeId, scheduleId, callback) {
            $.ajax({
                datatype: 'json',
                type: 'DELETE',
                url: '/template/' + id,
            }).success(function(res) {
                $.ajax({
                    datatype: 'json',
                    type: 'POST',
                    url: '/template/',
                    data: {
                        day: day,
                        startTime: startTime,
                        endTime: endTime,
                        employeeId: reassignToEmployeeId,
                        scheduleId: scheduleId,
                    },
                }).success(function(res) {
                    callback(null, res);
                }).error(function(res) {
                    // TODO: error handling
                    callback(res.responseText);
                });
            }).error(function(res) {
                // TODO: error handling
                callback(res.responseText);
            })
        }
    };
  
    return service;
}]);