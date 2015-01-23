/**
 * Angular Controller for the edit organization portion of the site.
 * @author: Lily Seropian
 */

var ZhiftApp = angular.module('ZhiftApp');

ZhiftApp.controller('ManagerEditController', function($scope, ScheduleService, UserService) {
    $scope.init = function(org) {
        $scope.org = org;
        $scope.schedules = {};
        $scope.employees = [];
        $scope.name = '';
        $scope.email = '';
        $scope.invite = "true";
        $scope.role = '';
        $scope.tab = 'Managers';

        ScheduleService.getSchedules($scope.org, function(err, schedules) {
            for (var i = 0; i < schedules.length; i++) {
                $scope.schedules[schedules[i]._id] = schedules[i].role;
            }
            $scope.role = (schedules.length === 0) ? 'None' : schedules[0].role;
            $scope.$apply();
        });

        UserService.getEmployees(org, function(err, employees) {
            $scope.employees = employees;
            $scope.$apply();
        });

        UserService.getManagers($scope.org, function(err, managers) {
            $scope.managers = managers;
            $scope.$apply();
        });
    };

    /**
     * Create a new manager for this organization.
     * @param {String} name  The name of the new manager.
     * @param {String} email The email of the new manager.
     */
    $scope.createManager = function() {
        UserService.createManager($scope.name, $scope.email, $scope.org, $scope.invite, function(err, manager) {
            if (err) {
                return $('.message-container').text(err);
            }
            $scope.managers.push(manager);
            $scope.name = '';
            $scope.email = '';
            $scope.$apply();
        });
    };

    /**
     * Create a new employee for this organization.
     * @param {String} name  The name of the new employee.
     * @param {String} email The email of the new employee.
     * @param {String} role  The role of the new employee.
     */
    $scope.createEmployee = function(role) {
        UserService.createEmployee($scope.name, $scope.email, role, $scope.org, function(err, employee) {
            if (err) {
                return $('.message-container').text(err);
            }
            $scope.employees.push(employee);
            $scope.name = '';
            $scope.email = '';
            $scope.role = '';
            $scope.$apply();
        });
    };

    $scope.removeEmployee = function(id) {
        UserService.deleteEmployee(id, function(err, employee) {
            if (err) {
                return $('.message-container').text(err);
            }
            $scope.employees = [];
        
            UserService.getEmployees(org, function(err, employees) {
                $scope.employees = employees;
                $scope.$apply();
            });
        });
    };
})

.directive('removeEmployee', function() {
    return {
        restrict: 'C', 
        link: function(scope, element, attrs) {
            element.unbind('click');
            element.bind('click', function(evt) {
                console.log(evt.currentTarget.dataset.employeeId);
                scope.removeEmployee(
                    evt.currentTarget.dataset.employeeId
                );
            });
        }
    };
})
