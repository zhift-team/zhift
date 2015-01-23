/**
 * Angular Controller for the manager portion of the site.
 *
 * Managers can:
 *     See all roles
 *     Add roles
 *     See all template shifts
 *     See all shifts
 *
 * TODO: find better, more standardized way to display errors
 *
 * @author: Lily Seropian
 */

var ZhiftApp = angular.module('ZhiftApp');

ZhiftApp.controller('ManagerController', function($scope, ScheduleService, ShiftService, TemplateShiftService, UserService) {
    $scope.currentPage = 'Home';
    
    /**
     * Get roles, shifts, and template shifts from database.
     * @param {String} org The name of the organization from which to get data.
     */
    $scope.init = function(org) {
        $scope.org = org;
        $scope.schedules = {};
        $scope.employees = {};
        $scope.employeeId = {};
        $scope.templateShifts = {};
        $scope.templateShiftId = {};

        ScheduleService.getSchedules($scope.org, function(err, schedules) {
            if (schedules.length === 0) {
                return;
            }

            $scope.scheduleId = schedules[0]._id;

            schedules.forEach(function(schedule) {
                $scope.schedules[schedule._id] = schedule;

                ShiftService.getShifts(schedule._id, function(err,shifts) {
                    schedule.shifts = shifts;
                    $scope.$apply();
                });

                TemplateShiftService.getTemplateShifts(schedule._id, function(err, templateShifts) {
                    schedule.templateShifts = templateShifts;
                    $scope.templateShifts[schedule._id] = templateShifts.map(function(s) { return s._id; });
                    if (templateShifts.length === 0) {
                        $scope.templateShifts[schedule._id] = ['None'];
                    }
                    $scope.templateShiftId[schedule._id] = $scope.templateShifts[schedule._id][0];
                    $scope.$apply();
                });


                UserService.getEmployeesForSchedule(schedule._id, function(err, employees) {
                    $scope.employees[schedule._id] = employees;
                    if (employees.length === 0) {
                        $scope.employees[schedule._id] = [{name: 'None', _id: 'None'}];
                    }
                    $scope.employeeId[schedule._id] = $scope.employees[schedule._id][0]._id;
                });
            });
        });
    };

    /**
     * Create a new shift from a template shift, save it to the database, and display it in the frontend.
     * @param {String} scheduleId The id of the schedule the new shift is on.
     * @param {Number} week       The week to generate the shift for (1 = 1 week from now, etc.).
     */
    $scope.createShift = function(scheduleId, week) {
        $('.message-container').text('');

        ShiftService.createShift($scope.templateShiftId[scheduleId], week, function(err, shift) {
            if (err) {
                return $('.message-container').text(err);
            }
            $scope.schedules[scheduleId].shifts.push(shift);
            $scope.$apply();
        });
    };
});