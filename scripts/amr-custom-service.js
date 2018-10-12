/* global angular, moment, dhis2 */

'use strict';

/* Services */

/**
 * Created by gourav.
 */

angular.module('trackerCaptureServices')
    .service('AMRCustomService', function ($http, $q) {
        return {
            //Get the name of sections to be disabled
            getSectionName: function () {
                var def = $q.defer();
                $http.get('../api/me.json?fields=id,name,displayName,surname,userCredentials[id,username],organisationUnits[id],attributeValues[attribute[id,code,name]],userGroups[id,code,name]&paging=false').then(function (response) {
                    def.resolve(response.data);
                });
                return def.promise;
            },
            //Check the available attributes value
            getProgramAttributes: function(programUid){
                var def = $q.defer();
                $http.get('../api/programs/' + programUid + '.json?fields=id,name,shortName,code,displayName,attributeValues[attribute[id,code,name],value],programStages[id,name,programStageDataElements[id,dataElement[id,name,optionSet[options[code,displayName]],sortOrder]]]&paging=false').then(function (response) {
                    def.resolve(response.data);
                });
                return def.promise;
            },

            getEventsWithoutFilter: function(selectedOrgUnit,selectedProgram,selectedProgramStage){
                var def = $q.defer();
                $http.get(DHIS2URL + "/events.json?orgUnit=" + selectedOrgUnit.id + "&ouMode=DESCENDANTS&program=" + selectedProgram.id + "&programStage=" + selectedProgramStage.id + "&skipPaging=true").then(function (response) {
                    def.resolve(response.data);
                });
                return def.promise;
            },

            getEventsWithFilter: function(selectedOrgUnit,selectedProgram,selectedProgramStage,startDate,endDate){
                var def = $q.defer();
                $http.get(DHIS2URL + "/events.json?orgUnit=" + selectedOrgUnit.id + "&ouMode=DESCENDANTS&program=" + selectedProgram.id + "&programStage=" + selectedProgramStage.id + "&startDate=" + startDate + "&endDate=" + endDate + "&skipPaging=true").then(function (response) {
                    def.resolve(response.data);
                });
                return def.promise;
            },

            getTEIData: function(evData,selectedProgram,selectedProgramStage){
                var def = $q.defer();
                $http.get(DHIS2URL + "/trackedEntityInstances/" + evData.tei + ".json?fields=trackedEntityInstance,orgUnit,created,attributes[attribute,displayName,value,code]&ou=" + evData.ou + "&ouMode=DESCENDANTSprogram=" + selectedProgram.id + "&programStage=" + selectedProgramStage.id + "&skipPaging=true").then(function (response) {
                    def.resolve(response.data);
                });
                return def.promise;
            },

            allOrgUnits: function(){
                var def = $q.defer();
                $http.get(DHIS2URL + "/organisationUnits.json?fields=id,name&paging=false").then(function (response) {
                    def.resolve(response.data);
                });
                return def.promise;
            }
        }
    })