/**
* Tests for Schedule routes.
* @author Anji Ren
*/
QUnit.config.reorder = false; // Prevent QUnit from running test not in order.

function testScheduleRoutes() {
    QUnit.module('Schedule');

    var scheduleId = null; 

    var assignScheduleId = function(schedule) {
        scheduleId = schedule._id;
    };

    // POST
    QUnit.asyncTest('POST', function(assert) {
        // POST Create new Schedule/Role: 'Kung Fu Fighter' for Organization 'ZhiftTest'
        $.ajax({
            url: '/schedule',
            type: 'POST',
            data: {
                orgName: 'ZhiftTest',
                role: 'Kung Fu Fighter'
            },
            success: function(resObj, textStatus, jqXHR) {
                expectedSuccess(assert, 'Valid schedule', {role: 'Kung Fu Fighter'})(resObj, textStatus, jqXHR);
                assignScheduleId(resObj);

                QUnit.stop();
                // POST Create duplicate Schedule/Role: 'Kung Fu Fighter' for Organization 'ZhiftTest'
                $.ajax('/schedule', {
                    type: 'POST',
                    data: {
                        orgName: 'ZhiftTest',
                        role: 'Kung Fu Fighter',
                    },
                    success: unexpectedSuccess(assert, 'Duplicate schedule'),
                    error: expectedError(assert, 'Duplicate schedule', 400)
                });

                QUnit.stop();
                // GET Retrieve existing Schedule/Role: 'Kung Fu Fighter' for Organization 'ZhiftTest'
                $.ajax({
                    url: '/schedule/' + scheduleId,
                    type: 'GET',
                    success: expectedSuccess(assert, 'Existing schedule', {_id: scheduleId, org: 'ZhiftTest', role: 'Kung Fu Fighter'}),
                    error: unexpectedError(assert, 'Existing schedule')
                });
            },
            error: unexpectedError(assert, 'Valid schedule')
        });
    });

    // GET
    QUnit.asyncTest('GET', function(assert) {
        // GET Retrieve non-existing Schedule/Role for Organization 'ZhiftTest'
        $.ajax('/schedule/ffff', {
            type: 'GET',
            success: unexpectedSuccess(assert, 'Nonexistent schedule'),
            error: expectedError(assert, 'Nonexistent schedule', 400)
        });

        QUnit.stop();
        // GET Retrieve Schedule with empty id parameter
        $.ajax('/schedule/', {
            type: 'GET',
            success: unexpectedSuccess(assert, 'Empty schedule'),
            error: expectedError(assert, 'Empty schedule', 404)
        });
    });

    // DELETE
    QUnit.asyncTest('DELETE', function(assert) {
        // POST Create new Schedule/Role: 'Kung Fu Fighter' for Organization 'ZhiftTest'
        $.ajax({
            url: '/schedule',
            type: 'POST',
            data: {
                orgName: 'ZhiftTest',
                role: 'Cab Driver'
            },
            success: function(resObj, textStatus, jqXHR) {
                expectedSuccess(assert, 'Valid schedule', {role: 'Cab Driver'})(resObj, textStatus, jqXHR);
                assignScheduleId(resObj);
                QUnit.stop();
                // DELETE Remove existing Schedule/Role: 'Kung Fu Fighter' for Organization 'ZhiftTest'
                $.ajax({
                    url: '/schedule/' + scheduleId,
                    type: 'DELETE',
                    success: expectedSuccess(assert, 'Existing schedule', {_id: scheduleId, org: 'ZhiftTest', role: 'Cab Driver'}),
                    error: unexpectedError(assert, 'Existing schedule')
                });
            },
            error: unexpectedError(assert, 'Valid schedule')
        });

        // DELETE Remove non-existing Schedule/Role for Organization 'ZhiftTest'
        QUnit.stop();
        $.ajax('/schedule/', {
            type: 'DELETE',
            success: unexpectedSuccess(assert, 'Nonexistent schedule'),
            error: expectedError(assert, 'Nonexistent schedule', 404)
        });
    });
}