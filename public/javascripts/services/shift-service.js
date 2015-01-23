/**
 * ShiftsService
 *
 * Angular Service for shifts mixin.
 * TODO: Error handling
 * 
 * @author: Lily Seropian, Vicky Gong
 */

var ZhiftApp = angular.module('ZhiftApp');

ZhiftApp.service('ShiftService', ['$rootScope', function($rootScope) {
    var service = {

        // Function to get one shift
        getShift: function(shiftId, callback) {
            $.ajax({
                datatype: 'json',
                type: 'GET',
                url: 'shift/one/' + shiftId,
            }).success(function(res) {
                callback(null, res);
            }).error(function(res){
                callback(res);
            });            
        },

        // Function to get shifts associated with a schedule
        getShifts: function(scheduleId, callback) {
            $.ajax({
                datatype: 'json',
                type: 'GET',
                url: 'shift/all/' + scheduleId,
            }).success(function(res) {
                callback(null, res);
            }).error(function(res){
                callback(res);
            });
        },

        // Function to get a user's shifts
        getMyShifts: function(userId, callback) {
            $.ajax({
                datatype: 'json',
                type: 'GET',
                url: 'shift/user/' + userId,
            }).success(function(res) {
                callback(null, res);
            }).error(function(res){
                callback(res);
            });
        },

        // Function to get the shifts in the week of the given day
        getWeekOfShifts: function(scheduleId, dateFrom, callback){
            $.ajax({
                datatype: 'json',
                type: 'GET',
                url: 'shift/week/' + scheduleId + '/' + dateFrom
            }).success(function(res) {
                callback(null,res);
            }).error(function(res){
                callback(res);
            });
        },

        // Function to get shifts for an employee
        getShiftsFor: function(employeeId, callback) {
            $.ajax({
                datatype: 'json',
                type: 'GET',
                url: 'shift/user/' + employeeId,
            }).success(function(res) {
                callback(res);
            }).error(function(res){
                callback(res);
            });
        },

        // Function to get shifts that are available for grabs
        getShiftsUpForGrabs: function(scheduleId, callback) {
            $.ajax({
                datatype: 'json',
                type: 'GET',
                url: 'shift/upForGrabs/' + scheduleId,
            }).success(function(res) {
                callback(res);
            }).error(function(res){
                callback(res);
            });
        },

        // Function to get shifts up for swap
        getShiftsUpForSwap: function(scheduleId, callback) {
            $.ajax({
                datatype: 'json',
                type: 'GET',
                url: 'shift/upForSwap/' + scheduleId,
            }).success(function(res) {
                callback(res);
            }).error(function(res){
                callback(res);
            });
        },

        // Putting a shift up for grabs
        putUpForGrabs: function(shiftId, callback) {
            $.ajax({
                datatype: 'json',
                type: 'PUT',
                url: 'shift/upForGrabs/' + shiftId,
            }).success(function(res) {
                callback(res);
            }).error(function(res) {
                if (res.status === 401) {
                    return window.location = res.responseText;
                }
                callback(res);
            });
        },

        // Putting a shift up for trade
        putUpForTrade: function(shiftId, callback) {
            $.ajax({
                datatype: 'json',
                type: 'PUT',
                url: 'shift/upForSwap/' + shiftId,
            }).success(function(res) {
                callback(res);
            }).error(function(res) {
                if (res.status === 401) {
                    return window.location = res.responseText;
                }
                callback(res);
            });
        },

        // Claiming a shift
        claim: function(shiftId, employeeId, callback) {
            $.ajax({
                datatype: 'json',
                type: 'PUT',
                url: 'shift/claim/' + shiftId,
                data: {
                    employeeId: employeeId,
                }
            }).success(function(res) {
                callback(res);
            }).error(function(res) {
                if (res.status === 401) {
                    return window.location = res.responseText;
                }
                callback(res);
            });
        },

        // Creating a shift
        createShift: function(templateShiftId, week, callback) {
            $.ajax({
                datatype: 'json',
                type: 'POST',
                url: '/shift/' + templateShiftId,
                data: {
                    week: week,
                },
            }).success(function(res) {
                callback(null, res);
            }).error(function(res) {
                if (res.status === 401) {
                    return window.location = res.responseText;
                }
                callback(res.responseText);
            });
        },
    };
  
    return service;
}]);