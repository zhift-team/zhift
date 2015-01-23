/**
 * Tests for User routes.
 * @author Dylan Joss
 */
QUnit.config.reorder = false; // Prevent QUnit from running test not in order.



function testUserRoutes(data) {
    var schedules = data.Schedule;
    var managers = data.ManagerUser;
    var employees = data.EmployeeUser;

    var crocheterScheduleId;
    var tuftedTitmouseCoalitionMemberYOLOSwag420HashtagPumpkinSpiceLatteBasicBetchScheduleId;
    var testManagerId;
    var testManagerPassword;
    var eLilySeropianId;
    var eLilySeropianScheduleId;
    var eLilySeropianPassword;

    if (schedules[0].role === 'Crocheter') {
        crocheterScheduleId = schedules[0]._id;
        tuftedTitmouseCoalitionMemberYOLOSwag420HashtagPumpkinSpiceLatteBasicBetchScheduleId = schedules[1]._id;
    }
    else {
        tuftedTitmouseCoalitionMemberYOLOSwag420HashtagPumpkinSpiceLatteBasicBetchScheduleId = schedules[0]._id;
        crocheterScheduleId = schedules[1]._id;
    }

    for (var i = 0; i < managers.length; i++) {
        manager = managers[i]

        if (manager.name === 'test') {
            testManagerId = manager._id;
            testManagerPassword = manager.password;
            break;
        }
    }

    for (var i = 0; i < employees.length; i++) {
        employee = employees[i]

        if (employee.name === 'E Lily Seropian') {
            eLilySeropianId = employee._id;
            eLilySeropianScheduleId = employee.schedule;
            eLilySeropianPassword = employee.password;
            break;
        }
    }

    QUnit.module('User');

    // GET all of ZhiftTest managers
    // GET all of ZhiftTest employees
    // GET all employees associated with crocheter 
    // PUT change pw of E Lily Seropian 
    // DELETE a ZhiftTest manager
    // DELETE a ZhiftTest employee
    
    // POST 
    QUnit.asyncTest('POST', function(assert) {
        // POST manager Bob for  Organization: ZhiftTest
        $.ajax({
            url: '/user/manager',
            type: 'POST',
            data: {
                username: 'Bob',
                email: 'bob@titmouse.gov',
                org: 'ZhiftTest',
                invite: false
            },
            success: expectedSuccess(assert, 'Create manager', {
                name: 'Bob',
                email: 'bob@titmouse.gov',
                org: 'ZhiftTest'
            }),
            error: unexpectedError(assert, 'Create manager')
        });

        QUnit.stop();

        // POST employee Alice for Organization: ZhiftTest
        // Role/Schedule: TuftedTitmouseCoalitionMemberYOLOSwag420HashtagPumpkinSpiceLatteBasicBetch
        $.ajax({
            url: '/user/employee',
            type: 'POST',
            data: {
                username: 'Alice',
                email: 'alice@titmouse.gov',
                org: 'ZhiftTest',
                role: 'TuftedTitmouseCoalitionMemberYOLOSwag420HashtagPumpkinSpiceLatteBasicBetch'
            },
            success: expectedSuccess(assert, 'Create employee', {
                name: 'Alice',
                email: 'alice@titmouse.gov',
                org: 'ZhiftTest',
                schedule: tuftedTitmouseCoalitionMemberYOLOSwag420HashtagPumpkinSpiceLatteBasicBetchScheduleId
            }),
            error: unexpectedError(assert, 'Create employee')
        });
    });

    // GET
    QUnit.asyncTest('GET', function(assert) {
        // GET existing manager, test
        $.ajax({
            url: 'user/manager/' + testManagerId,
            type: 'GET',
            success: expectedSuccess(assert, 'Get manager', {
                name: 'test',
                email: 'test@zhift.com',
                password: testManagerPassword,
                org: 'ZhiftTest',
            }),
            error: unexpectedError(assert, 'Get manager')
        });

        QUnit.stop();

        // GET existing employee, E Lily Seropian
        $.ajax({
            url: 'user/employee/' + eLilySeropianId,
            type: 'GET',
            success: expectedSuccess(assert, 'Get employee', {
                name: 'E Lily Seropian',
                email: 'seropian@gmail.edu',
                password: eLilySeropianPassword,
                org: 'ZhiftTest',
                schedule: eLilySeropianScheduleId
            }),
            error: unexpectedError(assert, 'Get employee')
        });
    });
}