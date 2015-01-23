/**
 * Angular Controller for an employee.
 *
 * @author: Lily Seropian
 *
 * TODO: error handling
 */

var ZhiftApp = angular.module('ZhiftApp');

ZhiftApp.controller('EmployeeController', function($scope, ShiftService, UserService, SwapService) {

    /**
     * Retrieve all information relevant to employee: their shifts, shifts for their role, available shifts, and swap proposals
     * @param {String} user_id The id of the employee.
     */
    $scope.init = function(user_id) {
        // get the current user
        UserService.getEmployee(user_id, function(err, employee) {
            $scope.user = employee;

            $scope.myShifts = {};
            $scope.allShiftsForMyRole = {};
            $scope.availableShifts = {};
            $scope.myShiftsICanSwap = {};
            $scope.swapProposals = {};

            // get the current user's shifts
            ShiftService.getShiftsFor($scope.user._id, function(shifts) {
                $scope.myShifts = {};
                for (var i = 0; i < shifts.length; i++) {
                    $scope.myShifts[shifts[i]._id] = shifts[i];
                }
                $scope.$apply();
            });

            // get all shifts for the current user's role
            ShiftService.getShifts($scope.user.schedule, function(err,shifts) {
                $scope.allShiftsForMyRole = {};
                for (var i = 0; i < shifts.length; i++) {
                    $scope.allShiftsForMyRole[shifts[i]._id] = shifts[i];
                }
                $scope.$apply();
            });

            // get all shifts up for grabs for the current user's role
            ShiftService.getShiftsUpForGrabs($scope.user.schedule, function(shifts) {
                for (var i = 0; i < shifts.length; i++) {
                    $scope.availableShifts[shifts[i]._id] = shifts[i];
                }
                $scope.$apply();
            });

            // get all shifts up for swap for the current user's role
            // get all swap proposals for any shifts the current user has put up for swap
            ShiftService.getShiftsUpForSwap($scope.user.schedule, function(shifts) {
                for (var i = 0; i < shifts.length; i++) {
                    $scope.availableShifts[shifts[i]._id] = shifts[i];

                    (function(shiftId) {
                        SwapService.getSwapForShift(shiftId, function(swap) {
                            $scope.availableShifts[shiftId].swapId = swap._id;
                            $scope.$apply();
                            if ($scope.myShifts[shiftId] !== undefined && swap.shiftOfferedInReturn) {
                                $scope.swapProposals[swap._id] = swap;
                                $scope.$apply();
                            }
                        });
                    })(shifts[i]._id);
                };
            });
        });
    }

    /**
     * Put up a shift for swap.
     * @param {ObjectId} shiftId The id of the shift to put up for swap.
     */
    $scope.swap = function(shiftId) {
        SwapService.putUpForSwap(shiftId, $scope.myShifts[shiftId].schedule, function(swap) {
            $scope.myShifts[shiftId].upForSwap = true;
            $scope.myShifts[shiftId].swapId = swap._id;
            $scope.availableShifts[shiftId] = $scope.myShifts[shiftId];
            $scope.$apply();
        });
    }

    /**
     * Show the shifts the user has available to swap.
     * @param {ObjectId} swapId  The id of the swap to show shifts for.
     */
    $scope.showShiftsForSwapping = function(swapId) {
        $scope.myShiftsICanSwap[swapId] = $scope.myShifts;
    }

    /**
     * Volunteer one of the current user's shifts in exchange for a shift up for swap.
     * @param {ObjectId} swapId  The id of the swap affected.
     * @param {ObjectId} shiftId The id of the shift to volunteer.
     */
    $scope.proposeSwap = function(swapId, shiftId) {
        SwapService.proposeSwap(swapId, shiftId, function(swap) {
            $scope.swapProposals[swap._id] = swap;
        });
    }

    /**
     * Put a shift up for grabs.
     * @param {ObjectId} shiftId The id of the shift to put up for grabs.
     */
    $scope.putUpForGrabs = function(shiftId) {
        ShiftService.putUpForGrabs(shiftId, function(swap) {
            $scope.myShifts[shiftId].upForGrabs = true;
            $scope.availableShifts[shiftId] = $scope.myShifts[shiftId];
            $scope.$apply();
        });
    }

    /**
     * Claim a shift that is up for grabs.
     * @param {ObjectId} shiftId The id of the shift to claim.
     */
    $scope.claim = function(shiftId) {
        ShiftService.claim(shiftId, $scope.user._id, function(shift) {
            delete $scope.availableShifts[shift._id];
            $scope.myShifts[shift._id] = shift;
            $scope.$apply();
        });
    }

    /**
     * Accept a proposed swap.
     * @param {ObjectId} swapId The id of the swap to accept.
     */
    $scope.acceptSwap = function(swapId) {
        SwapService.acceptSwap(swapId, function(swap) {
            delete $scope.swapProposals[swap._id];
            $scope.myShifts[swap.shiftUpForSwap._id].upForSwap = false;
            $scope.$apply();
        });
    }

    /**
     * Reject a proposed swap.
     * @param {ObjectId} swapId The id of the swap to reject.
     */
    $scope.rejectSwap = function(swapId) {
        SwapService.rejectSwap(swapId, function(swap) {
            delete $scope.swapProposals[swap._id];
            $scope.$apply();
        });
    }
});