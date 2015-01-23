/**
 * Angular Controller for the dashboard.
 *
 * @author: Lily Seropian
 *
 * TODO: error handling
 */

var ZhiftApp = angular.module('ZhiftApp');

ZhiftApp.controller('RecordController', function($scope, RecordService, ScheduleService) {

    /**
     * Get all records related to a given schedule and update the scope.
     * @param  {String} scheduleId The id of the schedule to get records for.
     * @param  {String} role       The name of the schedule.
     */
    var getRecordsForSchedule = function(scheduleId, role) {
        RecordService.getRecordsFor(scheduleId, function(records) {
            $scope.records.push({
                role: role,
                records: records,
            });
            $scope.$apply();
        });
    };

    $scope.getDisplayDate = function(dateString){
        return new Date(dateString).toDateString();
    }

    /**
     * Put all the records on the scope.
     * @param  {String} orgName    The name of the current user's organization.
     * @param  {String} scheduleId The id of the current user's role, if the current user is an employee. Otherwise 'undefined'.
     */
    $scope.init = function(orgName, scheduleId) {
        $scope.records = [];

        if (scheduleId !== 'undefined') { // is an employee
            ScheduleService.getSchedule(scheduleId, function(err, schedule) {
                getRecordsForSchedule(scheduleId, schedule.role);
            });
        }
        else { // is a manager
            ScheduleService.getSchedules(orgName, function(err, schedules) {
                schedules.forEach(function(schedule) {
                    getRecordsForSchedule(schedule._id, schedule.role);
                });
            });
        }
    }
});