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
                $http.get('../api/me.json?fields=id,name,surname,userCredentials[username],attributeValues[attribute[id,code,name]]&paging=false').then(function (response) {
                    def.resolve(response.data);
                });
                return def.promise;
            },
            //Check the available attributes value
            getProgramAttributes: function(programUid){
                var def = $q.defer();
                $http.get('../api/programs/' + programUid + '.json?fields=id,name,shortName,code,displayName,attributeValues[attribute[id,code,name],value]&paging=false').then(function (response) {
                    def.resolve(response.data);
                });
                return def.promise;
            }
        }
    })