/**
 * EditOrgService
 * 
 * Angular Service for editOrg mixin
 * 
 * @author: Lily Seropian
 */

var ZhiftApp = angular.module('ZhiftApp');

ZhiftApp.service('ScheduleService', ['$rootScope', function($rootScope) {
    var service = {
        // Function to display all shifts associated with a schedule
        createSchedule: function(orgName, roleName, callback) {
            $.ajax({
                datatype: 'json', 
                type: 'POST', 
                url: '/schedule/',
                data: {
                    orgName: orgName,
                    role: roleName,
                }
            }).success(function(res) {
                callback(null, res);
            }).error(function(res){
                callback(res.responseText);
            });
        },

        // Get all schedules associated with org
        getSchedules: function(orgName, callback) {
            $.ajax({
                datatype: 'json',
                type: 'GET',
                url: '/schedule/all/' + orgName,
            }).success(function(res) {
                callback(null, res);
            }).error(function(res) {
                callback(res.responseText);
            });
        },

        // To get a specific schedule
        getSchedule: function(scheduleId, callback) {
            $.ajax({
                datatype: 'json',
                type: 'GET',
                url: '/schedule/' + scheduleId,
            }).success(function(res) {
                callback(null, res);
            }).error(function(res) {
                callback(res.responseText);
            });
        },
    };
  
    return service;
}]);