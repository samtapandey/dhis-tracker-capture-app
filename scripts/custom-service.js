/* global angular, moment, dhis2 */

'use strict';

/* Custom Services */

/**
 * Created by Gourav.
 */
angular.module('trackerCaptureServices')
    .service('UPHMISCustomService', function ($http, $q, $timeout) {
        var dailyProgramStagesUIDs = ["XOD2Nl5kncW",
            "tOQIl0vKx7l",
            "Ew6LSYXKAzl",
            "PfRIIrvnjcU"];
        var monthlyProgramStagesUIDs = ["d8ar9Ndh5mL",
            "OVBvzaxZpWs"];
        return {
            uphmisCheckIfEventAlreadyExistsForSelDate: function (currentDate, events, programStage) {
                if (this.checkForDailyStages(currentDate, events, programStage)) {
                    return true;
                }

                if (this.checkForMonthlyStages(currentDate, events, programStage)) {
                    return true;
                }

                return false;
            },
            checkForDailyStages: function (currentDate, events, programStage) {
                if (dailyProgramStagesUIDs.indexOf(programStage) > -1) {
                    for (var i = 0; i < events.length; i++) {
                        if (events[i].eventDate === currentDate) {
                            return true;
                        }
                    }
                    return false;
                }
            },
            checkForMonthlyStages: function (currentDate, events, programStage) {
                if (monthlyProgramStagesUIDs.indexOf(programStage) > -1) {
                    for (var i = 0; i < events.length; i++) {
                        if (events[i].eventDate === currentDate) {
                            return true;
                        }
                    }
                    return false;
                }
            }

        }
    });