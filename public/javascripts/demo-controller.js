/*  Controller for the api testing page
*   Contains all the eventlisteners and variables.
* 
*   @author: Vicky Gong, Lily Seropian, Dylan Joss
*/
var DemoController = function() {
  
    // Starts all processes
    var init = function() {
      eventListeners();
    };

    var eventListeners = function() {

        var attachCreateListener = function(formId, url, responseBoxId, isUserCall) {
            $('#' + formId).on('submit', function(evt) {
                evt.preventDefault();

                var data = $(this).serializeArray();

                var urlString = '/' + url;

                if (isUserCall) {
                    urlString = urlString + '/' + getUserType(data); 
                }

                $.ajax({
                    datatype: 'json', 
                    type: 'POST', 
                    url: urlString, 
                    data: data
                }).always(function(res) {
                    $('#' + responseBoxId).text(JSON.stringify(res));
                });
            });
        };

        var attachGetListener = function(formId, url, responseBoxId, isUserCall) {
            $('#' + formId).on('submit', function(evt) {
                evt.preventDefault();

                var id = $(this)[0].elements['id'].value;

                var urlString = '/' + url + '/' + id;

                if (isUserCall) {
                    var userType = $(this)[0].elements['userType'].value;
                    urlString = '/' + url + '/' + userType.toLowerCase() + '/' + id; 
                }

                $.ajax({
                    datatype: 'json',
                    type: 'GET',
                    url: urlString
                }).always(function(res) {
                    $('#' + responseBoxId).text(JSON.stringify(res));
                })
            });
        };

        var attachDeleteListener = function(formId, url, responseBoxId) {
            $('#' + formId).on('submit', function(evt){
                evt.preventDefault();

                var id = $(this)[0].elements['id'].value;

                $.ajax({
                    datatype: 'json', 
                    type: 'DELETE', 
                    url: '/' + url + '/' + id, 
                }).always(function(res) {
                    $('#' + responseBoxId).text(JSON.stringify(res));
                });
            });
        };

        var getUserType = function(array) {
            for (var i = 0; i < array.length; i++) {
                if (array[i].name === 'type') {
                    return array[i].value;
                }
            }
        };

        /*================================= Organization ===============================*/
        (function() {
            attachCreateListener('createOrgForm', 'org', 'createOrgResponse', false);
            attachGetListener('getOrgForm', 'org', 'getOrgResponse', false);
        })();

        /*=================================== Schedule =================================*/
        (function() {
            attachCreateListener('createScheduleForm', 'schedule', 'createScheduleResponse', false);
            attachGetListener('getScheduleForm', 'schedule', 'getScheduleResponse', false);
        })();

        /*===================================== User ===================================*/
        (function() {
            attachCreateListener('createUserForm', 'user', 'createUserResponse', true);
            attachGetListener('getUserForm', 'user', 'getUserResponse', true);
        })();

        /*================================ TemplateShift ===============================*/
        (function() {
            attachCreateListener('createTemplateShiftForm', 'shift/template', 'createTemplateShiftResponse', false);
            attachGetListener('getTemplateShiftForm', 'shift/template', 'getTemplateShiftResponse', false);
            attachDeleteListener('deleteTemplateShiftForm', 'shift/template', 'deleteTemplateShiftResponse');
        })();

        /*==================================== Shift ===================================*/
        (function() {
            attachCreateListener('createShiftForm', 'shift', 'createShiftResponse', false);
            attachGetListener('getShiftForm', 'shift', 'getShiftResponse', false);
        })();
    }
      
    return {
        init: init
    };
}