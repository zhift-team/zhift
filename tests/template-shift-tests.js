/**
* Tests for Template Shift routes.
* @author Anji Ren
*/
QUnit.config.reorder = false; // Prevent QUnit from running test not in order.

function testTemplateShiftRoutes(data) {
    QUnit.module('TemplateShift');

    var employee = data.EmployeeUser[0]; 
    var otherEmployee = data.EmployeeUser[1];
    var scheduleId = data.Schedule[0]._id;
    var templateShiftId = null;

    var assignTemplateShiftId = function(templateShift) {
        templateShiftId = templateShift._id;
    };

    // POST
    QUnit.asyncTest('POST / Reassign', function(assert) {
        // POST Create new Template Shift: Thursday 10:00 - 11:00
        $.ajax({
            url: '/template',
            type: 'POST',
            data: {
                day: 'Thursday',
                startTime: '10:00',
                endTime: '11:00',
                employeeId: employee._id,
                scheduleId: scheduleId,
            },
            success: function(resObj, textStatus, jqXHR) {
                expectedSuccess(assert, 'Valid template shift', 
                    {dayOfWeek: 'Thursday', start: '10:00', end: '11:00'})(resObj, textStatus, jqXHR);
                assert.ok( function() {
                    return resObj.responsiblePerson._id === employee._id;
                });
                assignTemplateShiftId(resObj);

                // PUT Reassign existing Template Shift to other employee
                QUnit.stop();
                $.ajax({
                    url: '/template/reassign/' + templateShiftId,
                    type: 'PUT',
                    data: {
                        employeeId: otherEmployee._id
                    },
                    success: function(resObj, textStatus, jqXHR) {
                        expectedSuccess(assert, 'Valid reassign', {dayOfWeek: 'Thursday', start: '10:00', end: '11:00'})(resObj, textStatus, jqXHR);
                        assert.ok( function() {
                            return resObj.responsiblePerson._id === otherEmployee._id;
                        });
                    },
                    error: unexpectedError(assert, 'Valid reassign')
                })
            },
            error: unexpectedError(assert, 'Valid template shift')
        });
    });

    var deleteTemplateShiftId = null;

    var assignDeleteTemplateShiftId = function(templateShift) {
        deleteTemplateShiftId = templateShift._id;
    };

    // DELETE
    QUnit.asyncTest('POST / Delete', function(assert) {
        // POST Create new Template Shift: Wednesday 3:00 - 4:00
        $.ajax({
            url: '/template',
            type: 'POST',
            data: {
                day: 'Wednesday',
                startTime: '03:00',
                endTime: '04:00',
                employeeId: employee._id,
                scheduleId: scheduleId,
            },
            success: function(resObj, textStatus, jqXHR) {
                expectedSuccess(assert, 'Valid template shift', 
                    {dayOfWeek: 'Wednesday', start: '03:00', end: '04:00'})(resObj, textStatus, jqXHR);
                assert.ok( function() {
                    return resObj.responsiblePerson._id === employee._id;
                });
                assignDeleteTemplateShiftId(resObj);

                // DELETE Existing Template Shift
                QUnit.stop();
                $.ajax({
                    url: '/template/' + deleteTemplateShiftId,
                    type: 'DELETE',
                    success: function(resObj, textStatus, jqXHR) {
                        expectedSuccess(assert, 'Valid delete', {dayOfWeek: 'Wednesday', start: '03:00', end: '04:00'})(resObj, textStatus, jqXHR);
                        assert.ok( function() {
                            return resObj.responsiblePerson._id === employee._id;
                        });
                    },
                    error: unexpectedError(assert, 'Valid delete')
                })
            },
            error: unexpectedError(assert, 'Valid template shift')
        });
    });
}