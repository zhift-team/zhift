#!/usr/bin/env node

/**
 * @author Lily Seropian
 */

var request = require('request');
var fs = require('fs');
var sendgrid = require('sendgrid')('zhift', 'shifty6170');

var CRON_EMAIL = 'cron@zhift.com';
var CRON_PASSWORD = '99570761084371110795';
var CRON_ORG = 'Zhift';
var URL = 'http://zhift-seropian.rhcloud.com';
var LOG_FILE = process.env.OPENSHIFT_LOG_DIR;

var FROM = '6170-zhift@mit.edu';

if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD === undefined) {
    URL = 'http://localhost:8080';
    LOG_FILE = '../logs/weekly-maintenance.log';
}

var logError = function(err) {
    if (err) {
        fs.appendFile(LOG_FILE, new Date() + ': ' + err + '.\n', function(err) {
            if (err) {
                console.log(err);
            }
        });
    }
};

var notifyManagers = function(shifts) {
    shifts.forEach(function(shift) {
        var org = shift.responsiblePerson.org;
        request.get(
            URL + '/user/org/' + org + '/manager',
            {
                form: {
                    cron: CRON_PASSWORD,
                }
            },
            function(err, res, body) {
                var to = JSON.parse(body).map(function(manager) {
                    return manager.email;
                });
                var email = {
                    to: to,
                    from: FROM,
                    subject: 'Unfilled shift for tomorrow',
                    text: 'The ' + new Date(shift.dateScheduled).toLocaleDateString() + ' shift from ' + shift.start + ' to ' + shift.end + ' has not been claimed.'
                };
                // sendgrid.send(email, console.log);
            }
        );
    });
};

// Delete all records pertaining to shifts that have already occurred.
request.get(
    URL + '/shift/unfilledtomorrow',
    {
        form: {
            cron: CRON_PASSWORD,
        },
    },
    function(err, res, body) {
        if (err) {
            logError(err);
        }
        notifyManagers(JSON.parse(body));
    }
);