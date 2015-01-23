/**
 * RecordService
 * 
 * Angular Service for records
 * TODO: error handling
 * 
 * @author: Lily Seropian
 */

var ZhiftApp = angular.module('ZhiftApp');

ZhiftApp.service('RecordService', function() {
    var service = {
        getRecordsFor: function(scheduleId, callback) {
            $.ajax({
                datatype: 'json',
                type: 'GET',
                url: '/record/schedule/' + scheduleId,
            }).success(function(res) {
                callback(res);
            }).error(function(res) {
                callback(res.responseText);
            });
        },
    };
  
    return service;
});