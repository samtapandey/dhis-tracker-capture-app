/* global trackerCapture, angular */

var trackerCapture = angular.module('trackerCapture');
trackerCapture.controller('RegistrationController', 
        function($rootScope,
                $scope,
                $location,
                $timeout,
                $modal,
                $translate,
                $parse,
                orderByFilter,
                AttributesFactory,
                DHIS2EventFactory,
                TEService,
                CustomFormService,
                EnrollmentService,
                NotificationService,
                CurrentSelection,
                MetaDataFactory,
                EventUtils,
                RegistrationService,
                DateUtils,
                TEIGridService,
                TEIService,
                TrackerRulesFactory,
                TrackerRulesExecutionService,
                TCStorageService,
                ModalService,
                // for Custome-Id Generation
                CustomIDGenerationService) {
    $scope.today = DateUtils.getToday();
    $scope.trackedEntityForm = null;
    $scope.customRegistrationForm = null;    
    $scope.selectedTei = {};
    $scope.tei = {};    
    $scope.warningMessages = [];
    $scope.hiddenFields = [];    
    $scope.assignedFields = [];
    $scope.errorMessages = {};
    $scope.hiddenSections = [];
    $scope.currentEvent = null;
    $scope.prStDes = null;
    $scope.registrationAndDataEntry = false;
    $scope.model={autoGeneratedAttFailed : false, savingRegistration: false};
    $scope.helpTexts = {};
    $scope.registrationMode = 'REGISTRATION';
    var flag = {debug: true, verbose: false};
    $rootScope.ruleeffects = {};
	
	// for tibet-customizations display on load
	$scope.customeId = 'yeI6AOQjrqg';
  $scope.parentName = 'iRJYMHN0Rel';
	$scope.orgUnitCode = '';
  $scope.parentDisplayName = '';

  $scope.eddDate = 'vvqXiTuKL9V';
  $scope.updatedEDDDate = '';
  $scope.generatedCustomId = '';

  $scope.calculatedDOB ='anFTfRZyC1Q';
  $scope.ageInYears = 'GjdO5wHfmru'; 
  $scope.selectedDOB = '';
  $scope.selectedDOBToBeUsed = '';


    $scope.attributesById = CurrentSelection.getAttributesById();

    if(!$scope.attributesById){
        $scope.attributesById = [];
        AttributesFactory.getAll().then(function(atts){
            angular.forEach(atts, function(att){
                $scope.attributesById[att.id] = att;
            });
            
            CurrentSelection.setAttributesById($scope.attributesById);
        });
    }
    
    //get ouLevels
    $scope.ouLevels = CurrentSelection.getOuLevels();
    if(!$scope.ouLevels){
        TCStorageService.currentStore.open().done(function(){
            TCStorageService.currentStore.getAll('ouLevels').done(function(response){
                var ouLevels = angular.isObject(response) ? orderByFilter(response, '-level').reverse() : [];
                CurrentSelection.setOuLevels(orderByFilter(ouLevels, '-level').reverse());
            });
        });
    }
    
    $scope.optionSets = CurrentSelection.getOptionSets();        
    if(!$scope.optionSets){
        $scope.optionSets = [];
        MetaDataFactory.getAll('optionSets').then(function(optionSets){
            angular.forEach(optionSets, function(optionSet){                        
                $scope.optionSets[optionSet.id] = optionSet;
            });
            CurrentSelection.setOptionSets($scope.optionSets);
        });
    }

    // update for Tibet  for disable attribute patient_identifier
    $scope.isDisabled = function(attribute) {
      if( attribute.code === 'doh_id_no')
      {
        return true;
      }
      else{
        return attribute.generated || $scope.assignedFields[attribute.id] || $scope.editingDisabled;
      }
    };

    var selectedOrgUnit = CurrentSelection.get()["orgUnit"];

    if (selectedOrgUnit) {
        $scope.selectedOrgUnit = selectedOrgUnit;
        $scope.model.orgUnitId = $scope.selectedOrgUnit.id;
    } else {
        $scope.model.orgUnitId = ($location.search()).ou;
    }

    $scope.selectedEnrollment = {
        enrollmentDate: $scope.today,
        incidentDate: $scope.today,
        orgUnitName: $scope.selectedOrgUnit ? $scope.selectedOrgUnit.displayName : ""
    };

    $scope.trackedEntities = {available: []};
    TEService.getAll().then(function (entities) {
        $scope.trackedEntities.available = entities;
        $scope.trackedEntities.selected = $scope.trackedEntities.available[0];
    });

    var getProgramRules = function () {
        $scope.trackedEntityForm = null;
        $scope.customRegistrationForm = null;
        $scope.allProgramRules = {
            constants: [],
            programIndicators: {},
            programVariables: [],
            programRules: []
        };
        if (angular.isObject($scope.selectedProgram) && $scope.selectedProgram.id) {
            return TrackerRulesFactory.getRules($scope.selectedProgram.id).then(function (rules) {
                $scope.allProgramRules = rules;
            });
        }
    };

    //watch for selection of program
    $scope.$watch('selectedProgram', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            getProgramRules();

            if ($scope.registrationMode === 'REGISTRATION') {
                $scope.getAttributes($scope.registrationMode);
            }
        }
        $scope.model.minEnrollmentDate = "";
        $scope.model.maxEnrollmentDate =  ($scope.selectedProgram && $scope.selectedProgram.selectEnrollmentDatesInFuture) ? '' : "0";
        if ($scope.selectedOrgUnit.reportDateRange) {
            if ($scope.selectedOrgUnit.reportDateRange.minDate) {
                $scope.model.minEnrollmentDate = $scope.selectedOrgUnit.reportDateRange.minDate;
            }
            if ($scope.selectedOrgUnit.reportDateRange.maxDate) {
                $scope.model.maxEnrollmentDate = $scope.selectedOrgUnit.reportDateRange.maxDate;
            }
        }
    });



    //listen to modes of registration
    $scope.$on('registrationWidget', function (event, args) {
        $scope.selectedTei = {};
        $scope.tei = {};
        $scope.registrationMode = args.registrationMode;
        $scope.orgUnitNames = CurrentSelection.getOrgUnitNames();

        if ($scope.registrationMode !== 'REGISTRATION') {
            $scope.selectedTei = args.selectedTei;
            $scope.tei = angular.copy(args.selectedTei);
        }

        $scope.teiOriginal = angular.copy($scope.tei);

        if ($scope.registrationMode === 'PROFILE') {
            $scope.selectedEnrollment = args.enrollment ? args.enrollment : {};
        }

        $scope.getAttributes($scope.registrationMode);

        if ($scope.selectedProgram && $scope.selectedProgram.id) {
            getProgramRules().then( function (rules) {
                $scope.executeRules();
            });
        }
    });

    $scope.getAttributes = function (_mode) {
        var mode = _mode ? _mode : 'ENROLLMENT';
        $scope.customRegistrationFormExists = false;
        $scope.customDataEntryForm = null;
        $scope.schedulingEnabled = true;

        if( $scope.selectedProgram && $scope.selectedProgram.captureCoordinates && angular.isObject($scope.selectedEnrollment) ){                
            $scope.selectedEnrollment.coordinate = $scope.selectedEnrollment.coordinate ? $scope.selectedEnrollment.coordinate : {};
        }

        AttributesFactory.getByProgram($scope.selectedProgram).then(function (atts) {
            $scope.attributes = TEIGridService.generateGridColumns(atts, null, false).columns;
			
			// change for tibet-customizations display on load
			$timeout( function (){
				
				var date = new Date();
				var year = date.getFullYear();
				
				var org_id = $scope.selectedOrgUnit.id;
				
				 $.getJSON("../api/organisationUnits/"+ org_id +".json?fields=id,displayName,code,parent[id,displayName]", function (data) {
				
					$scope.orgUnitCode = data.code;
          $scope.parentDisplayName = data.parent.displayName;

          /*
					if( !$scope.selectedTei[$scope.customeId] && $scope.selectedTei[$scope.customeId] == undefined)
					{
              //alert( $scope.orgUnitCode +"-"+year + "-" );
              $scope.selectedTei[$scope.customeId] = $scope.orgUnitCode +"-"+ year + "-"; //put default value on load form
					}
          */
          if( !$scope.selectedTei[$scope.parentName] && $scope.selectedTei[$scope.parentName] == undefined)
          {
              //alert( $scope.parentDisplayName );
              $scope.selectedTei[$scope.parentName] = $scope.selectedOrgUnit.displayName;//put default value on load for
          }

           $scope.calculateEDDDate();
          //$scope.selectedEnrollment.incidentDate

				});
				
			},0);					
			
            fetchGeneratedAttributes();
            if ($scope.selectedProgram && $scope.selectedProgram.id) {
                if ($scope.selectedProgram.dataEntryForm && $scope.selectedProgram.dataEntryForm.htmlCode) {
                    $scope.customRegistrationFormExists = true;
                    $scope.trackedEntityForm = $scope.selectedProgram.dataEntryForm;
                    $scope.trackedEntityForm.attributes = $scope.attributes;
                    $scope.trackedEntityForm.selectIncidentDatesInFuture = $scope.selectedProgram.selectIncidentDatesInFuture;
                    $scope.trackedEntityForm.selectEnrollmentDatesInFuture = $scope.selectedProgram.selectEnrollmentDatesInFuture;
                    $scope.trackedEntityForm.displayIncidentDate = $scope.selectedProgram.displayIncidentDate;
                    $scope.customRegistrationForm = CustomFormService.getForTrackedEntity($scope.trackedEntityForm, mode);
                }

                if ($scope.selectedProgram.programStages && $scope.selectedProgram.programStages[0] && $scope.selectedProgram.useFirstStageDuringRegistration && $scope.registrationMode === 'REGISTRATION') {
                    $scope.currentEvent = {};
                    $scope.registrationAndDataEntry = true;
                    $scope.prStDes = [];
                    $scope.currentStage = $scope.selectedProgram.programStages[0];
                    $scope.currentEvent.event = 'SINGLE_EVENT';
                    $scope.currentEvent.providedElsewhere = {};
                    $scope.currentEvent.orgUnit = $scope.selectedOrgUnit.id;
                    $scope.currentEvent.program = $scope.selectedProgram.id;
                    $scope.currentEvent.programStage = $scope.currentStage.id;
                    $scope.currentEvent.enrollmentStatus = $scope.currentEvent.status = 'ACTIVE';
                    $scope.currentEvent.executionDateLabel = $scope.currentStage.executionDateLabel;
                    $rootScope.ruleeffects[$scope.currentEvent.event] = {};
                    $scope.selectedEnrollment.status = 'ACTIVE';

                    if( $scope.currentStage.captureCoordinates ){                            
                        $scope.currentEvent.coordinate = {};
                    }

                    angular.forEach($scope.currentStage.programStageDataElements, function (prStDe) {                            
                        $scope.prStDes[prStDe.dataElement.id] = prStDe;
                        if (prStDe.allowProvidedElsewhere) {
                            $scope.allowProvidedElsewhereExists[$scope.currentStage.id] = true;
                        }
                    });

                    $scope.customDataEntryForm = CustomFormService.getForProgramStage($scope.currentStage, $scope.prStDes);
                }
            }
        });
    };

    var fetchGeneratedAttributes = function() {
        angular.forEach($scope.attributes, function(att) {
            if (att.generated && !$scope.selectedTei[att.id]) {
                TEIService.getGeneratedAttributeValue(att.id).then(function (data) {
                    if (data && data.status === "ERROR") {
                        NotificationService.showNotifcationDialog($translate.instant("error"), data.message);
                        $scope.model.autoGeneratedAttFailed = true;
                    } else {
                        if (att.valueType === "NUMBER") {
                            $scope.selectedTei[att.id] = Number(data);
                        } else {
                            $scope.selectedTei[att.id] = data;
                        }
                        $scope.model.autoGeneratedAttFailed = false;
                    }
                });
            }
        });
    };

    var goToDashboard = function (destination, teiId) {
        //reset form
        $scope.selectedTei = {};
        $scope.selectedEnrollment = {
            enrollmentDate: $scope.today,
            incidentDate: $scope.today,
            orgUnitName: $scope.selectedOrgUnit.displayName
        };
        $scope.outerForm.submitted = false;
        $scope.outerForm.$setPristine();

        if (destination === 'DASHBOARD') {
            $location.path('/dashboard').search({
                tei: teiId,
                program: $scope.selectedProgram ? $scope.selectedProgram.id : null,
                ou:$scope.selectedOrgUnit.id
            });
        }
        else if (destination === 'SELF') {
            //notify user
            var headerText =  $translate.instant("success");
            var bodyText =  $translate.instant("registration_complete");
            NotificationService.showNotifcationDialog(headerText, bodyText);
            $scope.selectedTei = {};
            $scope.tei = {};
            $scope.currentEvent = {};
            $timeout(function() {
                $rootScope.$broadcast('registrationWidget', {registrationMode: 'REGISTRATION'});
            });
        }
    };

    var reloadProfileWidget = function () {
        var selections = CurrentSelection.get();
        CurrentSelection.set({
            tei: $scope.selectedTei,
            te: $scope.selectedTei.trackedEntity,
            prs: selections.prs,
            pr: $scope.selectedProgram,
            prNames: selections.prNames,
            prStNames: selections.prStNames,
            enrollments: selections.enrollments,
            selectedEnrollment: $scope.selectedEnrollment,
            optionSets: selections.optionSets,
            orgUnit: selections.orgUnit
        });
        $timeout(function () {
            $rootScope.$broadcast('profileWidget', {});
        }, 200);
    };

    var notifyRegistrtaionCompletion = function (destination, teiId) {
        if ($scope.registrationMode === 'ENROLLMENT') {
            broadcastTeiEnrolled();
        }
        else {
            goToDashboard(destination ? destination : 'DASHBOARD', teiId);

          // add for Generate CustomId for Tibet-customizations
          /*
          $timeout( function (){
            CustomIDGenerationService.validateAndCreateCustomId($scope.tei,$scope.selectedEnrollment.program,$scope.attributes,destination,$scope.optionSets,$scope.attributesById,$scope.selectedEnrollment.enrollmentDate).then(function(){
              console.log("Custom ID")
              goToDashboard(destination ? destination : 'DASHBOARD', teiId);
            });
          },0);
          */
        }
    };

    var performRegistration = function (destination) {
        if (destination === "DASHBOARD" || destination === "SELF") {
           $scope.model.savingRegistration = true;
        }
        RegistrationService.registerOrUpdate($scope.tei, $scope.optionSets, $scope.attributesById).then(function (registrationResponse) {
            var reg = registrationResponse.response ? registrationResponse.response : {};
            if (reg.reference && reg.status === 'SUCCESS') {
                $scope.tei.trackedEntityInstance = reg.reference;

                if ($scope.registrationMode === 'PROFILE') {
                    reloadProfileWidget();
                    $rootScope.$broadcast('teiupdated', {});
                    $scope.model.savingRegistration = false;
                }
                else {
                    if ($scope.selectedProgram) {

                        //enroll TEI
                        var enrollment = {};
                        enrollment.trackedEntityInstance = $scope.tei.trackedEntityInstance;
                        enrollment.program = $scope.selectedProgram.id;
                        enrollment.status = 'ACTIVE';
                        enrollment.orgUnit = $scope.selectedOrgUnit.id;
                        enrollment.enrollmentDate = $scope.selectedEnrollment.enrollmentDate;
                        enrollment.incidentDate = $scope.selectedEnrollment.incidentDate === '' ? $scope.selectedEnrollment.enrollmentDate : $scope.selectedEnrollment.incidentDate;

                        if( $scope.selectedEnrollment.coordinate ){
                            enrollment.coordinate = $scope.selectedEnrollment.coordinate;
                        }

                        EnrollmentService.enroll(enrollment).then(function (enrollmentResponse) {
                            $scope.model.savingRegistration = false;
                            if(enrollmentResponse) {
                                var en = enrollmentResponse.response && enrollmentResponse.response.importSummaries &&
                                enrollmentResponse.response.importSummaries[0] ? enrollmentResponse.response.importSummaries[0] : {};
                                if (en.reference && en.status === 'SUCCESS') {
                                    enrollment.enrollment = en.reference;
                                    $scope.selectedEnrollment = enrollment;
                                    var avilableEvent = $scope.currentEvent && $scope.currentEvent.event ? $scope.currentEvent : null;
                                    var dhis2Events = EventUtils.autoGenerateEvents($scope.tei.trackedEntityInstance, $scope.selectedProgram, $scope.selectedOrgUnit, enrollment, avilableEvent);
                                    if (dhis2Events.events.length > 0) {
                                        DHIS2EventFactory.create(dhis2Events).then(function () {
                                            notifyRegistrtaionCompletion(destination, $scope.tei.trackedEntityInstance);
                                        });
                                    } else {
                                        notifyRegistrtaionCompletion(destination, $scope.tei.trackedEntityInstance);
                                    }
                                }
                                else {
                                    //enrollment has failed
                                    NotificationService.showNotifcationDialog($translate.instant("enrollment_error"), enrollmentResponse.message);
                                    return;
                                }
                            }
                        });
                    }
                    else {
                        notifyRegistrtaionCompletion(destination, $scope.tei.trackedEntityInstance);
                        $scope.model.savingRegistration = false;
                    }
                }
            }
            else {//update/registration has failed
                var headerText = $scope.tei && $scope.tei.trackedEntityInstance ? $translate.instant('update_error') :
                                 $translate.instant('registration_error');
                var bodyText = registrationResponse.message;
                NotificationService.showNotifcationDialog(headerText, bodyText);
                $scope.model.savingRegistration = false;
                return;
            }
        });

    };

    function broadcastTeiEnrolled() {
        $rootScope.$broadcast('teienrolled', {});
    }

    $scope.registerEntity = function (destination) {
        //check for form validity
        $scope.outerForm.submitted = true;
        if ($scope.outerForm.$invalid) {
            return false;
        }

        if ($scope.model.autoGeneratedAttFailed) {
            NotificationService.showNotifcationDialog($translate.instant("registration_error"), $translate.instant("auto_generate_failed"));
            return false;
        }

        if ($scope.registrationAndDataEntry) {
            $scope.outerDataEntryForm.submitted = true;
            if ($scope.outerDataEntryForm.$invalid) {
                return false;
            }
        }

        //form is valid, continue the registration
        //get selected entity
        if (!$scope.selectedTei.trackedEntityInstance) {
            $scope.selectedTei.trackedEntity = $scope.tei.trackedEntity = $scope.selectedProgram && $scope.selectedProgram.trackedEntity && $scope.selectedProgram.trackedEntity.id ? $scope.selectedProgram.trackedEntity.id : $scope.trackedEntities.selected.id;
            $scope.selectedTei.orgUnit = $scope.tei.orgUnit = $scope.selectedOrgUnit.id;
            $scope.selectedTei.attributes = $scope.tei.attributes = [];
        }

        if ($scope.registrationMode === 'REGISTRATION')
        {
          // change for tibet-customizations display on load
         // $timeout( function (){

            var date = new Date();
            var year = date.getFullYear();

            var org_id = $scope.selectedOrgUnit.id;

           // $.getJSON("../api/organisationUnits/"+ org_id +".json?fields=id,displayName,code,parent[id,displayName]", function (data) {

              //$scope.orgUnitCode = data.code;

              $.ajax({
                async:false,
                type: "GET",
                url: '../api/trackedEntityInstances.json?ou=' + org_id + "&skipPaging=true",
                success: function(responseTei){

                  var totalTei = responseTei.trackedEntityInstances.length;

                  var prefix = "";
                  //console.log( "total Count -- " + response.data.height);
                  //var totalTei = response.data.height + 1;

                  // for Reset after count 9999
                  //totalTei = 10000;
                  totalTei = totalTei%10000;

                  if( totalTei === 0 ) totalTei = 1;

                  if( totalTei <10) prefix="0000";
                  else if (totalTei >9 && totalTei<100) prefix="000";
                  else if(totalTei>99 && totalTei<1000) prefix="00";
                  else if(totalTei>999 && totalTei<10000) prefix="0";
                  // change in requirement - adding random number
                  //prefix=Math.floor(Math.random()*(9999-1000) + 1000);
                  //def.resolve(constant + prefix + totalTei );

                  $scope.generatedCustomId = $scope.orgUnitCode +"-" + year + "-"+ prefix + totalTei;

                },
                error: function(responseTei){
                }

              });
            //});
          //},200);
        }
        //get tei attributes and their values
        //but there could be a case where attributes are non-mandatory and
        //registration form comes empty, in this case enforce at least one value
        var result = RegistrationService.processForm($scope.tei, $scope.selectedTei, $scope.teiOriginal, $scope.attributesById, $scope.generatedCustomId);
        $scope.formEmpty = result.formEmpty;
        $scope.tei = result.tei;

        if ($scope.formEmpty) {//registration form is empty
            NotificationService.showNotifcationDialog($translate.instant("error"), $translate.instant("form_is_empty_fill_at_least_one"));
            return;
        }
        performRegistration(destination);
    };

    $scope.executeRules = function () {
        //repopulate attributes with updated values
        $scope.selectedTei.attributes = [];
        angular.forEach($scope.attributes, function (metaAttribute) {
            var newAttributeInArray = {
                attribute: metaAttribute.id,
                code: metaAttribute.code,
                displayName: metaAttribute.displayName,
                type: metaAttribute.valueType,
                value: $scope.selectedTei[metaAttribute.id]
            };

            $scope.selectedTei.attributes.push(newAttributeInArray);
        });

        if ($scope.selectedProgram && $scope.selectedProgram.id) {
            var eventExists = $scope.currentEvent && $scope.currentEvent.event;
            var evs = null;
            if( eventExists ){
                evs = {all: [], byStage: {}};
                evs.all = [$scope.currentEvent];
                evs.byStage[$scope.currentStage.id] = [$scope.currentEvent];
            }
            
            TrackerRulesExecutionService.executeRules(
                $scope.allProgramRules, 
                eventExists ? $scope.currentEvent : 'registration', 
                evs,
                $scope.prStDes, 
                $scope.attributesById,
                $scope.selectedTei, 
                $scope.selectedEnrollment, 
                $scope.optionSets, 
                flag);
        }
    };

    //check if field is hidden
    $scope.isHidden = function (id) {
        //In case the field contains a value, we cant hide it.
        //If we hid a field with a value, it would falsely seem the user was aware that the value was entered in the UI.

        return $scope.selectedTei[id] ? false : $scope.hiddenFields[id];
    };

    $scope.teiValueUpdated = function (tei, field) {
        $scope.executeRules();
    };


    $scope.saveDataValueForRadio = function(field, context, value){
        if(field.dataElement) {
            //The saveDataValueForRadio was called from the dataentry template. Update dataelement og current event:
            context[field.dataElement.id] = value;
        }
        else {
            //The saveDataValueForRadio was called from the registration controller. Update the selected TEI:
            context[field.id] = value;
        }

        $scope.executeRules();
    }

    //listen for rule effect changes
    $scope.$on('ruleeffectsupdated', function (event, args) {
        if (args.event === "registration" || args.event === 'SINGLE_EVENT') {
            $scope.warningMessages = [];
            $scope.hiddenFields = [];
            $scope.assignedFields = [];
            $scope.errorMessages = {};
            $scope.hiddenSections = [];

            var effectResult = TrackerRulesExecutionService.processRuleEffectAttribute(args.event, $scope.selectedTei, $scope.tei, $scope.currentEvent, {}, $scope.currentEvent, $scope.attributesById, $scope.prStDes, $scope.hiddenFields, $scope.hiddenSections, $scope.warningMessages, $scope.assignedFields, $scope.optionSets);
            $scope.selectedTei = effectResult.selectedTei;
            $scope.currentEvent = effectResult.currentEvent;
            $scope.hiddenFields = effectResult.hiddenFields;
            $scope.hiddenSections = effectResult.hiddenSections;
            $scope.assignedFields = effectResult.assignedFields;
            $scope.warningMessages = effectResult.warningMessages;
        }
    });

    $scope.interacted = function (field) {
        var status = false;
        if (field) {
            status = $scope.outerForm.submitted || field.$dirty;
        }
        return status;
    };

    $scope.getTrackerAssociate = function (selectedAttribute, existingAssociateUid) {
        var modalInstance = $modal.open({
            templateUrl: 'components/teiadd/tei-add.html',
            controller: 'TEIAddController',
            windowClass: 'modal-full-window',
            resolve: {
                relationshipTypes: function () {
                    return $scope.relationshipTypes;
                },
                addingRelationship: function () {
                    return false;
                },
                selections: function () {
                    return CurrentSelection.get();
                },
                selectedTei: function () {
                    return $scope.selectedTei;
                },
                selectedAttribute: function () {
                    return selectedAttribute;
                },
                existingAssociateUid: function () {
                    return existingAssociateUid;
                },
                selectedProgram: function () {
                    return $scope.selectedProgram;
                },
                relatedProgramRelationship: function () {
                    return $scope.relatedProgramRelationship;
                }
            }
        });
        modalInstance.result.then(function (res) {
            if (res && res.id) {
                $scope.selectedTei[selectedAttribute.id] = res.id;
            }
        });
    };


    // custom methods

    $scope.ageToDob = function (inputAge) {
        if(inputAge != undefined && inputAge!= ''){

        var coustomDate = new Date();
        var coustomYear = coustomDate.getFullYear();

        var yearOfDob = parseInt( coustomYear ) - parseInt( inputAge )
        
        $scope.selectedTei[$scope.calculatedDOB] = yearOfDob + '-07-01';//put calculated value in month text box
        }
        else{
            $scope.selectedTei[$scope.calculatedDOB] = '';
        }
    };

    $scope.dobToAge = function (inputDob) {
        if(inputDob != undefined && inputDob!= ''){
        
            var selectedDOBObject = new Date(inputDob);

            var currentDateObject = new Date();

            //var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
            
            //var diffDays = Math.round(Math.abs((currentDateObject.getTime() - selectedDOBObject.getTime()) / (oneDay)));

            //var diffYear = diffDays/365;

            var differenceInMonths = (currentDateObject.getFullYear()*12 + currentDateObject.getMonth()) - (selectedDOBObject.getFullYear()*12 + selectedDOBObject.getMonth());
            var diffYear = differenceInMonths/12;

            var yearInDecimal = ( Math.round(diffYear*100))/100;

            var year = yearInDecimal.toString().split(".")[0];
            var ageInMonth = ( yearInDecimal.toString().split(".")[1]*12)/100;

            ageInMonth = Math.round(ageInMonth);

            //ageInMonth = ( Math.round(ageInMonth*100))/100;

            if( isNaN(ageInMonth)){
                $scope.selectedTei[$scope.ageInYears] = year + ".0";
            }

            else{
                $scope.selectedTei[$scope.ageInYears] = year + "." + ageInMonth.toString().split(".")[0];//put calculated value in month text box
            }    
            
        }
        else{
            $scope.selectedTei[$scope.ageInYears] = '';
        }
    };

    

    $scope.cancelRegistrationWarning = function (cancelFunction) {
        var result = RegistrationService.processForm($scope.tei, $scope.selectedTei, $scope.teiOriginal, $scope.attributesById);
        var prStDe;
        if (!result.formChanged) {
            if ($scope.currentStage &&  $scope.currentStage.programStageDataElements) {
                for (var index = 0; index < $scope.currentStage.programStageDataElements.length; index++) {
                    prStDe = $scope.currentStage.programStageDataElements[index];
                    if ($scope.currentEvent[prStDe.dataElement.id]) {
                        result.formChanged = true;
                        break;
                    }
                }
            }
        }
        if (result.formChanged) {
            var modalOptions = {
                closeButtonText: 'no',
                actionButtonText: 'yes',
                headerText: 'cancel',
                bodyText: 'are_you_sure_to_cancel_registration'
            };

            ModalService.showModal({}, modalOptions).then(function () {
                $scope.outerForm.$setPristine();
                cancelFunction();
            });
        }
        else {
            $scope.outerForm.$setPristine();
            cancelFunction();
        }
    };

    $scope.showAttributeMap = function (obj, id) {
        var lat = "",
            lng = "";
        if (obj[id] && obj[id].length > 0) {
            var coordinates = obj[id].split(",");
            lng = coordinates[0];
            lat = coordinates[1];
        }
        var modalInstance = $modal.open({
            templateUrl: '../dhis-web-commons/angular-forms/map.html',
            controller: 'MapController',
            windowClass: 'modal-full-window',
            resolve: {
                location: function () {
                    return {lat: lat, lng: lng};
                }
            }
        });

        modalInstance.result.then(function (location) {
            if (angular.isObject(location)) {
                obj[id] = location.lng + ',' + location.lat;
            }
        }, function () {
        });
    };

    $scope.showDataElementMap = function (obj, id) {
        var lat = "",
            lng = "";
        if (obj[id] && obj[id].length > 0) {
            var coordinates = obj[id].split(",");
            lng = coordinates[0];
            lat = coordinates[1];
        }
        var modalInstance = $modal.open({
            templateUrl: '../dhis-web-commons/angular-forms/map.html',
            controller: 'MapController',
            windowClass: 'modal-full-window',
            resolve: {
                location: function () {
                    return {lat: lat, lng: lng};
                }
            }
        });

        modalInstance.result.then(function (location) {
            if (angular.isObject(location)) {
                obj[id] = location.lng + ',' + location.lat;
            }
        }, function () {
        });
    };

    $scope.showProgramStageMap = function(event){
        var modalInstance = $modal.open({
            templateUrl: '../dhis-web-commons/angular-forms/map.html',
            controller: 'MapController',
            windowClass: 'modal-full-window',
            resolve: {
                location: function () {
                    return {lat: event.coordinate.latitude, lng: event.coordinate.longitude};
                }
            }
        });

        modalInstance.result.then(function (location) {
            if(angular.isObject(location)){
                event.coordinate.latitude = location.lat;
                event.coordinate.longitude = location.lng;
            }
        }, function () {
        });
    };

    $scope.saveDatavalue = function () {
        $scope.executeRules();
    };

    $scope.verifyExpiryDate = function(eventDateStr) {
        calculateEDDDate();
        var dateGetter, dateSetter, date;
        dateGetter = $parse(eventDateStr);
        dateSetter = dateGetter.assign;
        date = dateGetter($scope);
        if(!date) {
            return;
        }
        if($scope.model.ouDates) {
            if (!DateUtils.verifyOrgUnitPeriodDate(date, $scope.model.ouDates.startDate, $scope.model.ouDates.endDate)) {
                dateSetter($scope, null);
                return;
            }
        }
        if (!DateUtils.verifyExpiryDate(date, $scope.selectedProgram.expiryPeriodType, $scope.selectedProgram.expiryDays)) {
            dateSetter($scope, null);
        }
    };

    $scope.calculateEDDDate = function() {

        //alert($scope.selectedEnrollment.incidentDate);

        if( $scope.selectedEnrollment.incidentDate != undefined )
        {
          var EDDDate = new Date($scope.selectedEnrollment.incidentDate);
          var numberOfDaysToAdd = 280;

          EDDDate.setDate(EDDDate.getDate()+numberOfDaysToAdd);

          //var dd = EDDDate.getDate();
          //var mm = EDDDate.getMonth() + 1;
          //var y = EDDDate.getFullYear();
          //
          //$scope.updatedEDDDate = y + '-'+ mm + '-'+ dd;

          $scope.updatedEDDDate = EDDDate.getFullYear() + "-" +  ("0"+(EDDDate.getMonth()+1)).slice(-2) + "-" + ("0" + EDDDate.getDate()).slice(-2);

          //alert( $scope.updatedEDDDate );
          $scope.selectedTei[$scope.eddDate] = $scope.updatedEDDDate; //put calculated value in EDD text box

          /*

           var datestring = ("0" + d.getDate()).slice(-2) + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" +
           d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
           */
        }
    };


});
