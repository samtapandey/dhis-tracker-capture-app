/* Services */

/**
 * Created by Gourav for UPHMIS.
**/
'use strict';

angular.module('trackerCaptureServices')

    .service('CustomIDGenerationService', function () {
        return {
            getProgramAttributeAndValue: function (programUid) {
                var isValidProgram = false;
                $.ajax({
                    type: "GET",
                    dataType: "json",
                    contentType: "application/json",
                    async: false,
                    url: '../api/programs/' + programUid + ".json?fields=id,name,code,attributeValues[attribute[id,name,code],value]&paging=false",
                    success: function (response) {
                        if (response.attributeValues != undefined) {
                            for (var i = 0; i < response.attributeValues.length; i++) {
                                if (response.attributeValues[i].attribute.code == 'pbfProgram' && response.attributeValues[i].value == "true") {
                                    isValidProgram = true;
                                    break;
                                }
                            }
                        }

                    }
                });
                return isValidProgram;
            },
            getProgramStageAttributeAndValue: function (programStageUid) {
                var isValidProgramStage = false;
                $.ajax({
                    type: "GET",
                    dataType: "json",
                    contentType: "application/json",
                    async: false,
                    url: '../api/programStages/' + programStageUid + ".json?fields=id,name,code,attributeValues[attribute[id,name,code],value]&paging=false",
                    success: function (response) {
                        if (response.attributeValues != undefined) {
                            for (var i = 0; i < response.attributeValues.length; i++) {
                                if (response.attributeValues[i].attribute.code == 'PBRProgramStages' && response.attributeValues[i].value == "true") {
                                    isValidProgramStage = true;
                                    break;
                                }
                                else if(response.attributeValues[i].attribute.code == 'PBRProgramStages' && response.attributeValues[i].value == "false"){
                                    isValidProgramStage = false;
                                    break;
                                }
                            }
                        }

                    }
                });
                return isValidProgramStage;
            },
            getProfileValues: function () {
                var tempMatchUsername = '';
                var tempCurrentuserRole = [];
                $.ajax({
                    type: "GET",
                    dataType: "json",
                    async: false,
                    contentType: "application/json",
                    // url: '../api/me.json?fields=id,name,userCredentials[*,userRoles[*]],userGroups[id,name]&paging=false',
                     url: '../api/me.json?fields=id,name,userCredentials[id,username,userRoles[name,id,displayName]]&paging=false',
                    success: function (response) {
                        tempMatchUsername = response.userCredentials.username;
                        for (var i = 0; i < response.userCredentials.userRoles.length; i++) {
                            tempCurrentuserRole.push(response.userCredentials.userRoles[i].displayName);
                        }
                    }
                });
                return [tempMatchUsername, tempCurrentuserRole];
            }
        }
    })

