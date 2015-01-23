/**
 * SwapService
 *
 * Angular Service for swaps.
 * TODO: error handling
 * 
 * @author: Lily Seropian
 */

var ZhiftApp = angular.module('ZhiftApp');

ZhiftApp.service('SwapService', ['$rootScope', function($rootScope) {
    var service = {
        // Putting a shift up for swap
        putUpForSwap: function(shiftId, scheduleId, callback) {
            $.ajax({
                datatype: 'json',
                type: 'POST',
                url: '/swap/',
                data: {
                    shiftId: shiftId,
                    scheduleId: scheduleId,
                }
            }).success(function(res) {
                callback(res);
            }).error(function(res){
                callback(res);
            });
        },

        // Proposing a shift that is up for swap
        proposeSwap: function(swapId, shiftId, callback) {
            $.ajax({
                datatype: 'json',
                type: 'PUT',
                url: '/swap/' + swapId,
                data: {
                    shiftId: shiftId,
                }
            }).success(function(res) {
                callback(res);
            }).error(function(res){
                callback(res);
            });
        },

        // Getting a swap
        getSwapForShift: function(shiftId, callback) {
            $.ajax({
                datatype: 'json',
                type: 'GET',
                url: '/swap/shift/' + shiftId,
            }).success(function(res) {
                callback(res);
            }).error(function(res){
                callback(res);
            });
        },

        // Accepting a swap
        acceptSwap: function(swapId, callback) {
            $.ajax({
                datatype: 'json',
                type: 'PUT',
                url: '/swap/' + swapId,
                data: {
                    acceptSwap: true,
                }
            }).success(function(res) {
                callback(res);
            }).error(function(res){
                callback(res);
            });
        },

        // Rejecting a swap
        rejectSwap: function(swapId, callback) {
            $.ajax({
                datatype: 'json',
                type: 'PUT',
                url: '/swap/' + swapId,
                data: {
                    acceptSwap: false,
                }
            }).success(function(res) {
                callback(res);
            }).error(function(res){
                callback(res);
            });
        }
    };

    return service;
}]);