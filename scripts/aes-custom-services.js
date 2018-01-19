/* global angular, moment, dhis2 */

'use strict';

/* Services */

/**
 * Created by mithilesh.
 */


angular.module('trackerCaptureServices')

  .service('OrganisationUnitService', function ($http, $q) {
    return {
      //http://127.0.0.1:8090/dhis/api/organisationUnits.json?fields=id,name&filter=level:eq:1&paging=false
      getRootOrganisationUnit: function () {
        var def = $q.defer();
        $http.get('../api/organisationUnits.json?fields=id,name&filter=level:eq:1&paging=false').then(function (response) {

          def.resolve(response.data);
        });
        return def.promise;
      },

      //http://127.0.0.1:8090/dhis/api/organisationUnits.json?fields=id,name&filter=level:eq:2&sortOrder=ASC&paging=false
      getLevel2OrganisationUnit: function () {
        var def = $q.defer();
        $http.get('../api/organisationUnits.json?fields=id,name&filter=level:eq:2&sortOrder=ASC&paging=false').then(function (response) {
          def.resolve(response.data);
        });
        return def.promise;
      },

      getLevel3OrganisationUnit: function () {
        var def = $q.defer();
        $http.get('../api/organisationUnits.json?fields=id,name&filter=level:eq:3&sortOrder=ASC&paging=false').then(function (response) {
          def.resolve(response.data);
        });
        return def.promise;
      },

      getLevel5OrganisationUnit: function () {
        var def = $q.defer();
        $http.get('../api/organisationUnits.json?fields=id,name&filter=level:eq:5&sortOrder=ASC&paging=false').then(function (response) {
          def.resolve(response.data);
        });
        return def.promise;
      },

      //http://127.0.0.1:8090/dhis/api/organisationUnits/Jgc02tIKupW.json?fields=id,name,children[id,name]
      getChildrenOrganisationUnits: function (parentOrgUnitUid) {
        var def = $q.defer();
        $http.get('../api/organisationUnits/' + parentOrgUnitUid + ".json?fields=id,name,children[id,name]&paging=false").then(function (response) {
          def.resolve(response.data);
        });
        return def.promise;
      },


      //http://localhost:8090/dhis/api/organisationUnits/AIFbJiJBxJZ.json?fields=id,name&includeDescendants=true&paging=false
      getAllChildrenOrganisationUnits: function (parentOrgUnitUid) {
        var def = $q.defer();
        $http.get('../api/organisationUnits/' + parentOrgUnitUid + ".json?fields=id,name&includeDescendants=true&paging=false").then(function (response) {
          def.resolve(response.data);
        });
        return def.promise;
      },

      // http://localhost:8090/dhis/api/organisationUnits/AIFbJiJBxJZ.json?fields=id,name,children[children[id,name]]&paging=false
      getLevel5OrganisationUnitsByLevel3: function (orgUnitUid) {
        var def = $q.defer();
        $http.get('../api/organisationUnits/' + orgUnitUid + ".json?fields=id,name,children[children[id,name]]&paging=false").then(function (response) {
          def.resolve(response.data);
        });
        return def.promise;
      },

      //http://127.0.0.1:8090/dhis/api/organisationUnits/Jgc02tIKupW.json?fields=id,name,children[id,name]
      getOrganisationUnitObject: function (orgUnitUid) {
        var def = $q.defer();
        $http.get('../api/organisationUnits/' + orgUnitUid + ".json?fields=id,name,displayName&paging=false").then(function (response) {
          def.resolve(response.data);
        });

        return def.promise;
      },

      //http://127.0.0.1:8090/dhis/api/organisationUnits/CPtzIhyn36z.json?fields=id,name,parent[id,displayName]
      getParentOrganisationUnit: function (orgUnitUid) {
        var def = $q.defer();
        $http.get('../api/organisationUnits/' + orgUnitUid + ".json?fields=id,name,displayName,parent[id,displayName]&paging=false").then(function (response) {
          def.resolve(response.data);
        });

        return def.promise;
      },


      //http://127.0.0.1:8090/dhis/api/organisationUnits/Jgc02tIKupW.json?fields=id,name,children[id,name]
      getOrganisationUnitObjectForTEI: function (orgUnitUid) {
        //var def = $q.defer();
        var def = $.Deferred();
        $http.get('../api/organisationUnits/' + orgUnitUid + ".json?fields=id,name,displayName&paging=false").then(function (response) {
          //def.resolve(response.data);
          def.resolve(response.data);
        });

        //return def.promise;
        return def;
      },

      //http://127.0.0.1:8090/dhis/api/trackedEntityInstances/wwrDjEJInqE.json?skipPaging=true
      getTEIAttributesValue: function (teiUid) {
        //var def = $q.defer();
        var def = $.Deferred();
        $http.get('../api/trackedEntityInstances/' + teiUid + ".json?paging=false").then(function (response) {
          //def.resolve(response.data);
          def.resolve(response.data);
        });

        //return def.promise;
        return def;
      }


      /*
      getTEAttributesAttributeAndValue: function () {
          var def = $q.defer();
          $http.get('../api/trackedEntityAttributes.json?fields=id,name,valueType,attributeValues[attribute[id,name,code],value]&paging=false').then(function (response) {

              def.resolve(response.data);
          });
          return def.promise;
      },

      getTotalTeiByProgram: function ( programUid ) {
          var def = $q.defer();
          $http.get('../api/trackedEntityInstances.json?program=' + programUid + "&ouMode=ALL&skipPaging=true").then(function (response) {

              def.resolve(response.data);
          });
          return def.promise;
      },

      getOrgunitCode: function ( orgUnitUid ) {
          var def = $q.defer();
          $http.get('../api/organisationUnits/' + orgUnitUid + ".json?fields=id,name,code,parent[id],attributeValues[attribute[id,name,code],value]&paging=false").then(function (response) {

              def.resolve(response.data);
          });
          return def.promise;
      }
      */

    };
  })

  .service('ProgramAndTEIService', function ($http, $q) {
    return {
      //127.0.0.1:8090/dhis/api/trackedEntityInstances.json?program=ieLe1vT4Vad&ouMode=ALL&skipPaging=true
      getTrackedEntityInstancesByProgram: function (programUid) {
        var def = $q.defer();
        $http.get('../api/trackedEntityInstances.json?program=' + programUid + "&ouMode=ALL&skipPaging=true").then(function (response) {
          def.resolve(response.data);
        });
        return def.promise;
      }
    };
  })

  //http://127.0.0.1:8090/dhis/api/events.json?trackedEntityInstance=KwLJwA6w6Rl&programStage=GOWaC9DJ8ua&orgUnit=zpkwWCuP8oc&skipPaging=true
  .service('EventAndDataValueService', function (DHIS2EventFactory, $http, $q) {
    return {

      createEventForParentOrgUnit: function (eventForSave, parentOrgUnit) {
        var def = $.Deferred();
        var teiParentEvent = {
          event: eventForSave.event,
          orgUnit: parentOrgUnit,
          program: eventForSave.program,
          programStage: 'GOWaC9DJ8ua',
          status: eventForSave.status,
          trackedEntityInstance: eventForSave.trackedEntityInstance,
          dataValues: [
            {

            }
          ]
        };

        DHIS2EventFactory.updateForSingleValue(teiParentEvent).then(function (responseEventCreate) {

          if (responseEventCreate.httpStatus === "OK") {
            def.resolve(responseEventCreate);
          }
        });

        return def;
      },
      //http://127.0.0.1:8090/dhis/api/events.json?trackedEntityInstance=KwLJwA6w6Rl&programStage=GOWaC9DJ8ua&orgUnit=zpkwWCuP8oc&skipPaging=true
      getEventByTeiAndProgramStageAndOrgUnit: function (teiUid, programStageUid, orgUnitUid) {
        var def = $q.defer();
        $http.get('../api/events.json?trackedEntityInstance=' + teiUid + '&programStage=' + programStageUid + '&orgUnit=' + orgUnitUid + "&skipPaging=true").then(function (response) {

          def.resolve(response.data);
        });
        return def.promise;
      }


    }

  })


  .service('AESService', function ($http, $q) {
    return {
      //http://127.0.0.1:8090/dhis/api/optionSets/RyHTAVjHjGt.json?fields=id,name,options[name,code]
      getOptionsByOptionSet: function (optionSetUid) {
        var def = $q.defer();
        $http.get('../api/optionSets/' + optionSetUid + ".json?fields=id,name,options[name,code]&paging=false").then(function (response) {
          def.resolve(response.data);
        });
        return def.promise;
      }

    };
  });