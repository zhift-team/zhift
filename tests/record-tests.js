/**
 * Tests for Record routes.
 * @author Lily Seropian
 */

function testRecordRoutes(data) {
    var records = data.Record;
    var schedule = data.Schedule[0];

    QUnit.module('Record');

    QUnit.asyncTest('GET /scheduleId', function(assert) {
        $.ajax({
            url: '/record/schedule/' + schedule._id,
            type: 'GET',
            success: function(data, textStatus, jqXHR) {
                expectedSuccess(assert, 'Existing record', records)(data, textStatus, jqXHR);
                // Don't delete the records until the test to see if they're there is done!
                runDeleteTests();
            },
            error: unexpectedError(assert, 'Existing record'),
        });

        QUnit.stop();
        $.ajax({
            url: '/record/schedule/000000000000000000000000',
            type: 'GET',
            success: unexpectedSuccess(assert, 'No records on schedule'),
            error: expectedError(assert, 'No records on schedule', 404),
        });

        QUnit.stop();
        $.ajax({
            url: '/record/schedule/asdf',
            type: 'GET',
            success: unexpectedSuccess(assert, 'Invalid schedule'),
            error: expectedError(assert, 'Invalid schedule', 400),
        });

        QUnit.stop();
        $.ajax('/record/schedule/', {
            type: 'GET',
            success: unexpectedSuccess(assert, 'Empty schedule'),
            error: expectedError(assert, 'Empty schedule', 404),
        });
    });

    var runDeleteTests = function() {
        QUnit.module('Record');

        QUnit.asyncTest('DELETE', function(assert) {
            $.ajax('/record/old', {
                type: 'DELETE',
                success: function(data, textStatus, jqXHR) {
                    expectedSuccess(assert, 'Old records present', {deleted: 1})(data, textStatus, jqXHR);
                    // once the old records have been deleted, successive calls shouldn't delete anything
                    QUnit.stop();
                    $.ajax('/record/old', {
                        type: 'DELETE',
                        success: expectedSuccess(assert, 'Old records not present', {deleted: 0}),
                        error: unexpectedError(assert, 'Old records not present'),
                    });
                },
                error: unexpectedError(assert, 'Old records present'),
            });
        });
    };
}