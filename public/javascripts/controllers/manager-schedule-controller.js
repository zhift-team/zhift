/**
 * Angular Controller for the manager template shift schedule
 *  portion of the site.
 *
 * Managers can:
 *     See all template shifts for a schedule
 *
 * @author: Vicky Gong, Anji Ren
 */

var ZhiftApp = angular.module('ZhiftApp');

ZhiftApp.controller('ManagerScheduleController', function($scope, ScheduleService, TemplateShiftService, UserService) {

    /**
     * Get roles, shifts, and template shifts from database.
     * @param  {String} org The name of the organization from which to get data.
     */
    $scope.init = function(org) {
        $scope.org = org;
        $scope.currentScheduleId = 1;
        $scope.schedules = [];
        $scope.employeesBySchedule = {};
        $scope.employeesOfCurrentSchedule = [];
        $scope.activeShift = {}
        resetTemplateShifts();

        // Populating schedules + setting current schedule
        getAllSchedules($scope.org, function() {
            if ($scope.schedules.length === 0) {
                return;
            }

            $scope.currentScheduleId = $scope.schedules[0]._id;
            $scope.$apply();

            // Populating templates based on current schedule
            getTemplateShifts($scope.currentScheduleId, function(err) {
                $scope.$apply();
            });

            // Populating employees of the organization
            getAllEmployees($scope.org, function(err) {
                $scope.employeesOfCurrentSchedule = $scope.employeesBySchedule[$scope.currentScheduleId]
                $scope.$apply();
            });
        });
    };

    /*  Gets template shifts associated with the scheduleId and 
    *   populates $scope.templateShiftByDay such that it has the following format:
    *   
    *   $scope.templateShiftByDay = {
    *       'Monday': {
    *           8: [], // list of template shifts starting at 8am on Monday
    *           9: [],
    *           etc.
    *        }
    *       'Tuesday':
    *       etc.
    *   }
    *
    *   @param {ObjectId} scheduleId        id of the schedule to get template shfits for
    *   @param {function} callback          callback function that takes err if there is an error, or null 
    *
    */
    var getTemplateShifts = function(scheduleId, callback){
        TemplateShiftService.getTemplateShifts(scheduleId, function(err, templateShifts){
            if (!err) {
                resetTemplateShifts();
                // Go through template shifts
                for (var i = 0; i < templateShifts.length; i++){
                    var templateDay = templateShifts[i].dayOfWeek;
                    var templateHour = getHour(templateShifts[i].start);

                    var scopeDayHour = $scope.templateShiftsByDay[templateDay];
                    
                    // Append templateshift to proper day and hour
                    if (!scopeDayHour[templateHour]){
                        scopeDayHour[templateHour] = [];
                    }

                    scopeDayHour[templateHour].push(templateShifts[i]);
                }
                callback();
            }
            else {
                callback(err);
            }
        });
    }

    $scope.getTemplateShifts = function(scheduleId) {
        getTemplateShifts(scheduleId, function(err) {
            if (err) {
                console.log(err);
            }
        });
    };

    var resetTemplateShifts = function(){
        $scope.templateShiftsByDay = 
            {'Monday': {},
            'Tuesday': {},
            'Wednesday': {},
            'Thursday': {},
            'Friday': {},
            'Saturday': {},
            'Sunday': {}};
    };
    
    /*  Returns the hour of "HH:MM" */
    var getHour = function(string){
        return parseInt(string.split(':')[0]);
    };

    /*  Gets all the schedules associated with the organization 
    */
    var getAllSchedules = function(orgId, callback) {
        ScheduleService.getSchedules(orgId, function(err, schedules) {
            $scope.schedules = schedules;
            callback();
        });
    };

    /*  Sets the current schedule to the new schedule
    *   And updates the template shifts
    */
    $scope.setCurrentSchedule = function(scheduleId) {
        $scope.currentScheduleId = scheduleId;
        getTemplateShifts(scheduleId, function(err){
            if (!err)
                $scope.$apply();
        });
        resetEmployeesOfCurrentSchedule();
        $scope.employeesOfCurrentSchedule = $scope.employeesBySchedule[scheduleId];   
    };

    /*  Gets all the employees assocaited with the organization
    *   and populates $scope.employeesBySchedule 
    */
    var getAllEmployees = function(orgId, callback) {
        // Get list of employees (User objects)
        UserService.getEmployees(orgId, function(err, employees) {
            if (!err) {
                // Go through employees and organize by role.
                for (var i = 0; i < employees.length; i++) {
                    var employee = employees[i];
                    var role = employees[i].schedule;
                    if (!$scope.employeesBySchedule[role]) {
                        $scope.employeesBySchedule[role] = [];
                    }

                    $scope.employeesBySchedule[role].push(employee);
                }
                return callback();
            }
            return callback(err);
        });
    };

    /* Function to reset list employees of current schedule.
    */
    var resetEmployeesOfCurrentSchedule = function() {
        $scope.employeesOfCurrentSchedule = [];
    };

    $scope.setActiveShiftInfo = function(id, day, startTime, endTime) {
        $scope.activeShift = {
            shiftId: id,
            day: day,
            startTime: hourToHHMM(startTime),
            endTime: hourToHHMM(endTime)
        }
        $scope.$apply();
    };

    /*  Function to create a template shift 
    */
    $scope.createTemplateShift = function(day, startTime, endTime, employeeId, scheduleId) {
        TemplateShiftService.createTemplateShift(day, startTime, endTime, employeeId, scheduleId, 
            function(err, newTemplateShift){
                if (err) {
                    //TODO
                    return console.log(err);
                }
                var scopeDayHour = $scope.templateShiftsByDay[newTemplateShift.dayOfWeek];
                var templateHour = getHour(newTemplateShift.start);
                if (!scopeDayHour[templateHour]) {
                    scopeDayHour[templateHour] = [];
                }
                scopeDayHour[templateHour].push(newTemplateShift);
                $scope.$apply();

            }
        );
    };

    $scope.deleteTemplateShift = function(id) {
        TemplateShiftService.deleteTemplateShift(id,
            function(err, shift) {
                if (err) {
                    return console.log(err);
                }
                var scopeDayHour = $scope.templateShiftsByDay[shift.dayOfWeek][getHour(shift.start)];
                for (var i = 0; i < scopeDayHour.length; i++) {
                    if (scopeDayHour[i]._id = shift._id) {
                        delete scopeDayHour[i];
                        $scope.$apply();
                        break;
                    }
                }
            }
        );
    };

    $scope.reassignTemplateShift = function(id, day, startTime, endTime, employeeId, scheduleId) {
        TemplateShiftService.reassignTemplateShift(id, day, startTime, endTime, employeeId, scheduleId,
            function(err, shift) {
                if (err) {
                    // TODO
                    return console.log(err);
                }
                var scopeDayHour = $scope.templateShiftsByDay[shift.dayOfWeek][getHour(shift.start)];
                for (var i = 0; i < scopeDayHour.length; i++) {
                    if (scopeDayHour[i]._id = shift._id) {
                        scopeDayHour[i] = shift;
                        $scope.$apply();
                        break;
                    }
                }
            }
        );
    };

    var hourToHHMM = function(hour) {
        // If hour is single digit
        var hourString = String(hour);
        if (hour < 10 && hour >= 0) {
            hourString = '0' + hourString;
        }
        return hourString + ':00';
    };

     /**
     * Create a new schedule, save it to the database, and display it in the frontend.
     * @param {String} scheduleName The name of the role to make a new schedule for.
     */
    $scope.createSchedule = function(scheduleName) {
        $('.message-container').text('');

        ScheduleService.createSchedule($scope.org, scheduleName, function(err, newSchedule) {
            if (err) {
                return $('.message-container').text(err);
            }
            $scope.schedules.push(newSchedule);
            $scope.setCurrentSchedule(newSchedule._id);
            $scope.$apply();
        });
    };
})

.directive('setCurrentSchedule', function() {
    return {
        restrict: 'C', 
        link: function(scope, element, attrs) {
            element.unbind('click');
            element.bind('click', function(evt) {
                evt.stopPropagation();
                var scheduleId = evt.currentTarget.id;
                scope.setCurrentSchedule(scheduleId);
            });
        }
    };
})

.directive('setActiveShiftInfo', function() {
    return {
        restrict: 'C', 
        link: function(scope, element, attrs) {
            element.unbind('click');
            element.bind('click', function(evt) {
                // Store information of clicked shift
                scope.setActiveShiftInfo(
                    evt.currentTarget.dataset.shiftId, 
                    evt.currentTarget.dataset.dayWeek, 
                    evt.currentTarget.dataset.startTime,
                    evt.currentTarget.dataset.endTime
                );
            });
        }
    };
})

.directive('createTemplateShift', function() {
    return {
        restrict: 'C', 
        link: function(scope, element, attrs) {
            element.unbind('click');
            element.bind('click', function(evt) {
                var employeeId = $('select[name="addShiftEmployee"]').children(':selected').attr('id');
                scope.createTemplateShift(
                    scope.activeShift['day'],
                    scope.activeShift['startTime'],
                    scope.activeShift['endTime'],
                    employeeId,
                    scope.currentScheduleId
                );
            });
        }
    };
})

.directive('deleteTemplateShift', function() {
    return {
        restrict: 'C', 
        link: function(scope, element, attrs) {
            element.unbind('click');
            element.bind('click', function(evt) {
                scope.deleteTemplateShift(
                    scope.activeShift['shiftId']
                );
                window.location.reload();
            });
        }
    };
})

.directive('reassignTemplateShift', function() {
    return {
        restrict: 'C', 
        link: function(scope, element, attrs) {
            element.unbind('click');
            element.bind('click', function(evt) {
                var employeeId = $('select[name="reassignShiftEmployee"]').children(':selected').attr('id');
                scope.reassignTemplateShift(
                    scope.activeShift['shiftId'],
                    scope.activeShift['day'],
                    scope.activeShift['startTime'],
                    scope.activeShift['endTime'],
                    employeeId, 
                    scope.currentScheduleId
                );
            });
        }
    };
})

.directive('createNewRole', function() {
    return {
        restrict: 'C',
        link: function(scope, element, attrs) {
            element.unbind('click');
            element.bind('click', function(evt) {
                var roleName = $('#role-name').val();
                $('#role-name').val('');
                scope.createSchedule(roleName);
            });
        }
    };
});
