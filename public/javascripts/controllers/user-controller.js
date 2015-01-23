/**
 * Angular Controller for an employee.
 *
 * @author: Lily Seropian
 *
 * TODO: error handling
 */

var ZhiftApp = angular.module('ZhiftApp');

ZhiftApp.controller('UserController', function($scope, UserService, ScheduleService) {
    $scope.init = function(userId, scheduleId) {
        $scope.userId = userId;

        if (scheduleId !== 'undefined') { // if the user is an employee
            ScheduleService.getSchedule(scheduleId, function(err, schedule) {
                if (err) {
                    return $('.message-container').text(err);
                }
                $scope.role = schedule.role;
                $scope.$apply();
            });
        }
    };

    /**
     * Put up a shift for swap.
     * @param {ObjectId} shiftId The id of the shift to put up for swap.
     */
    $scope.changePassword = function(newPassword) {
        UserService.changePassword($scope.userId, newPassword, function(err, user) {
            if (err) {
                $('.message-container').text(err);
            }
        });
    };
});