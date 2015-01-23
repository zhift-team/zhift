/**
*   Tests for Shift routes
*   @author Vicky Gong
*/

function testShiftRoutes(data){
    QUnit.module('Shift');

    var templateShift = data.TemplateShift[0];
    var shift = data.Shift[0];
    var schedule = data.Schedule[0];
    var employees = {};

    setEmployees = function() {
        for (var i = 0; i < data.EmployeeUser.length; i++) {
            employees[data.EmployeeUser[i].name] =  data.EmployeeUser[i];
        }
    }

    // Gets the first shift of the existing shifts after the given date
    getNextShift = function(givenDate){
        var result = data.Shift[0];
        var resultDate = Date.today().add(20).days();

        for (var i = 0; i < data.Shift.length; i++){
            var current = new Date(data.Shift[i].dateScheduled);
            if (current >= givenDate && current < resultDate){
                result = data.Shift[i];
                resultDate = current;
            } 
        }
        return result;
    }

    QUnit.asyncTest('GET /one/:shiftId', function(assert){
        $.ajax({
            url: '/shift/one/' + shift._id,
            type: 'GET',
            success: function(d, textStatus, jqXHR) {
                var expectedData = [shift._id, shift.dayOfWeek, shift.dateScheduled, shift.start, 
                                    shift.end, shift.schedule, shift.responsiblePerson ];
                
                var checkData = [d._id, d.dayOfWeek, d.dateScheduled, d.start,
                                 d.end, d.schedule, d.responsiblePerson._id ];

                expectedSuccess(assert, 'Existing shift', expectedData)(checkData, textStatus, jqXHR);
                
            },
            error: unexpectedError(assert, 'Existing shift'),
        });

        QUnit.stop();
        $.ajax('/shift/one/lala', {
            type: 'GET',
            success: unexpectedSuccess(assert, 'Nonexistent shift'),
            error: expectedError(assert, 'Nonexistent shift', 400)
        });

        QUnit.stop();
        $.ajax('/shift/one/', {
            type: 'GET',
            success: unexpectedSuccess(assert, 'Empty shift'),
            error: expectedError(assert, 'Empty shift', 404)
        });
    });

    QUnit.asyncTest('GET /user/:id', function(assert) {
        setEmployees();

        $.ajax({
            url: '/shift/user/' + employees['Jane Doe']._id,
            type: 'GET',
            success: expectedSuccess(assert, 'Some shifts', data.Shift),
            error: unexpectedError(assert, 'Some shifts')
        });

        QUnit.stop();
        $.ajax({
            url: '/shift/user/' + employees['John Doe']._id,
            type: 'GET',
            success: expectedSuccess(assert, 'No shifts', []),
            error: unexpectedError(assert, 'No shifts')
        });

        QUnit.stop();
        $.ajax({
            url: '/shift/user/lala',
            type: 'GET',
            success: unexpectedSuccess(assert, 'Invalid user id'),
            error: expectedError(assert, 'Invalid user id', 404)
        });
        
        QUnit.stop();
        $.ajax({
            url:'/shift/user/',
            type: 'GET',
            success: unexpectedSuccess(assert, 'Empty user id'),
            error: expectedError(assert, 'Empty user id', 404)
        });
    });

    QUnit.asyncTest('GET /all/:id', function(assert){
        var shifts = data.Shift;
        $.ajax({
            url: '/shift/all/' + schedule._id,
            type: 'GET',
            success: function(d, textStatus, jqXHR) {
                var expectedData = [];
                for (var i = 0; i < shifts.length; i++){
                    var slot = {'_id' :shifts[i]._id, 
                                'dayOfWeek': shifts[i].dayOfWeek, 
                                'dateScheduled': shifts[i].dateScheduled, 
                                'start': shifts[i].start, 
                                'end': shifts[i].end, 
                                'schedule': shifts[i].schedule, 
                                'responsiblePerson': shifts[i].responsiblePerson };
                    expectedData.push(slot);
                }
                var checkedData = [];
                for (var i = 0; i < d.length; i++){
                    var slot = {'_id': d[i]._id, 
                                'dayOfWeek': d[i].dayOfWeek, 
                                'dateScheduled': d[i].dateScheduled, 
                                'start': d[i].start,
                                'end': d[i].end, 
                                'schedule': d[i].schedule, 
                                'responsiblePerson': d[i].responsiblePerson._id };
                    checkedData.push(slot);
                    expectedData.sort(compareIds);
                    checkedData.sort(compareIds);
                }
               
                expectedSuccess(assert, 'Existing shift', expectedData)(checkedData, textStatus, jqXHR);
                runPostTests();
                testTemplateShiftRoutes(data);
            },
            error: unexpectedError(assert, 'Existing shift'),
        });

        QUnit.stop();
        $.ajax({
            url: '/shift/all/lala',
            type: 'GET',
            success: unexpectedSuccess(assert, 'Invalid schedule id'),
            error: expectedError(assert, 'Invalid schedule id', 400)
        });
        
        QUnit.stop();
        $.ajax({
            url:'/shift/all/',
            type: 'GET',
            success: unexpectedSuccess(assert, 'Empty schedule id'),
            error: expectedError(assert, 'Empty schedule id', 404)
        });
    });

    QUnit.asyncTest('GET /week/:id/:date', function(assert){
        var currentDate = Date.today().next().sunday();
        
        var shift = getNextShift(currentDate);
        $.ajax({
            url: '/shift/week/' + schedule._id + '/' + currentDate,
            type: 'GET',
            success: function(d, textStatus, jqXHR) {
                var expectedData = [[shift._id, shift.dayOfWeek, shift.dateScheduled, shift.start, 
                                    shift.end, shift.schedule, shift.responsiblePerson ]];
                    
                var checkedData = [];
                for (var i = 0; i < d.length; i++){
                    var slot = [d[i]._id, d[i].dayOfWeek, d[i].dateScheduled, d[i].start, 
                                d[i].end, d[i].schedule, d[i].responsiblePerson._id ];
                    checkedData.push(slot);
                }
               
                expectedSuccess(assert, 'Existing shift', expectedData)(checkedData, textStatus, jqXHR);
                
            },
            error: unexpectedError(assert, 'Existing shift'),
        });

        QUnit.stop();
        $.ajax({
            url: '/shift/week/lala/' + currentDate,
            type: 'GET',
            success: unexpectedSuccess(assert, 'Invalid schedule id'),
            error: expectedError(assert, 'Invalid schedule id', 400)
        });
        
        QUnit.stop();
        $.ajax({
            url:'/shift/week//' + currentDate,
            type: 'GET',
            success: unexpectedSuccess(assert, 'Empty schedule id'),
            error: expectedError(assert, 'Empty schedule id', 404)
        });

        QUnit.stop();
        $.ajax({
            url:'/shift/week/' + schedule._id + '/asdd',
            type: 'GET',
            success: unexpectedSuccess(assert, 'Invalid Date'),
            error: expectedError(assert, 'Invalid Date', 400)
        });
    });
    
    var runPostTests = function() {
        QUnit.asyncTest('POST /:templateid', function(assert){
            $.ajax({
                url: '/shift/' + templateShift._id,
                type: 'POST',
                success: function(d, textStatus, jqXHR) {
                    var expectedData = [templateShift._id, templateShift.dayOfWeek, templateShift.start, 
                                        templateShift.end, templateShift.schedule, templateShift.responsiblePerson._id ];
                    
                    var checkData = [d.templateShift, d.dayOfWeek, d.start,
                                     d.end, d.schedule, d.responsiblePerson];

                    expectedSuccess(assert, 'Valid template id', expectedData)(checkData, textStatus, jqXHR);
                },
                error: unexpectedError(assert, 'Valid template id'),
            });

            QUnit.stop();
            $.ajax({
                url: '/shift/asda',
                type: 'POST',
                success: unexpectedSuccess(assert, 'Nonexistant template shift'),
                error: expectedError(assert, 'Nonexistent template shift', 400)
            });

            QUnit.stop();
            $.ajax({
                url: '/shift/',
                type: 'POST',
                success: unexpectedSuccess(assert, 'Empty shift'),
                error: expectedError(assert, 'Empty shift', 404)
            });
        });
    };
}
