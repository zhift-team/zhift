#!/usr/bin/env node

/**
 * @author Lily Seropian
 */

var request = require('request');
var fs = require('fs');

var CRON_EMAIL = 'cron@zhift.com';
var CRON_PASSWORD = '99570761084371110795';
var CRON_ORG = 'Zhift';
var URL = 'http://zhift-seropian.rhcloud.com';
var LOG_FILE = process.env.OPENSHIFT_LOG_DIR;

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
}

/**
 * Get all template shifts in the database.
 * @param  {Function} fn Callback that takes (err, templateShifts)
 */
var getAllTemplateShifts = function(fn) {
    request.get(URL + '/template/all', {form: {cron: CRON_PASSWORD}}, function (err, res, body) {
        body = JSON.parse(body);
        if(body.message) {
            return logError(body.message);
        }
        fn(body);
    });
};

// Create shifts for 3 weeks from now
getAllTemplateShifts(function(templateShifts) {
    templateShifts.forEach(function(templateShift) {
        request.post(
            URL + '/shift/' + templateShift._id,
            {
                form: {
                    cron: CRON_PASSWORD,
                    week: 3,
                },
            },
            logError
        );
    });
});

// Delete all shifts that have already occurred.
request.del(
    URL + '/shift/old',
    {
        form: {
            cron: CRON_PASSWORD,
        },
    },
    logError
);

// Delete all records pertaining to shifts that have already occurred.
request.del(
    URL + '/record/old',
    {
        form: {
            cron: CRON_PASSWORD,
        },
    },
    logError
);