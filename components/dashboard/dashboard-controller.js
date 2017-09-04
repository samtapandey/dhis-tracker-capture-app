/* global trackerCapture, angular */

//Controller for dashboard
var trackerCapture = angular.module('trackerCapture');
trackerCapture.controller('DashboardController',
    function ($rootScope,
            $scope,
            $location,
            $modal,
            $timeout,
            $filter,
            $translate,
            $q,
            TCStorageService,
            orderByFilter,
            SessionStorageService,
            TEIService,
            TEService,
            MetaDataFactory,
            EnrollmentService,
            ProgramFactory,
            DHIS2EventFactory,
            DashboardLayoutService,
            AttributesFactory,
            CurrentSelection,
            ModalService,
            AuthorityService,
            OrgUnitFactory,
            NotificationService) {
    
	$scope.names = 'working';
    
    //selections
    var orgUnitUrl = ($location.search()).ou;
    
    $scope.displayEnrollment = false;
    $scope.dataEntryMainMenuItemSelected = false;    
    $scope.metaDataCached = false;
    $scope.model = {orgUnitClosed: false};
    if ( !dhis2.tc.metaDataCached){
        downloadMetaData().then(function () {
            updateDashboard();
        });
    }
    else {
        updateDashboard();
    }

    function getOrgUnit() {
        var def = $q.defer();
        var selection = CurrentSelection.get();
        if(selection.orgUnit && selection.orgUnit.id === orgUnitUrl) {
            def.resolve(selection.orgUnit);
        } else {
            OrgUnitFactory.getFromStoreOrServer(orgUnitUrl).then(function(ou){
                def.resolve(ou);
            })
        }
        return def.promise;
    }    

    function updateDashboard() {
        
        $scope.metaDataCached = true;

        getOrgUnit().then(function (orgUnit) {
            if (!orgUnit) {
                return;
            }

            $scope.selectedTeiId = ($location.search()).tei;
            $scope.selectedProgramId = ($location.search()).program;
            $scope.selectedOrgUnit = orgUnit;
            $scope.userAuthority = AuthorityService.getUserAuthorities(SessionStorageService.get('USER_PROFILE'));
            $scope.sortedTeiIds = CurrentSelection.getSortedTeiIds();
            $scope.useTopBar = false;
            $scope.showSettingsButton = true;
            $scope.topbarClass = $scope.showSettingsButton ? "dashboard-info-box-sm" : "dashboard-info-box-lg";
            $scope.topbarRightSizeClass = $scope.showSettingsButton ? "dashboard-info-btn-right-two-buttons" : "dashboard-info-btn-right-one-button";

            //Labels
            $scope.removeLabel = $translate.instant('remove');
            $scope.expandLabel = $translate.instant('expand');
            $scope.collapseLabel = $translate.instant('collapse');
            $scope.noDataReportLabel = $translate.instant('no_data_report');
            $scope.noRelationshipLabel = $translate.instant('no_relationship');
            $scope.settingsLabel = $translate.instant('settings');
            $scope.showHideWidgetsLabel = $translate.instant('show_hide_widgets');
            $scope.notEnrolledLabel = $translate.instant('not_yet_enrolled_data_entry');
            $scope.stickLabel = $translate.instant('stick_right_widgets');
            $scope.unstickLabel = $translate.instant('unstick_right_widgets');

            $scope.model.stickyDisabled = true;
            $scope.previousTeiExists = false;
            $scope.nextTeiExists = false;

            $scope.temporaryHideWidgets = [];
            $scope.temporaryShowWidgets = [];

            if ($scope.sortedTeiIds && $scope.sortedTeiIds.length > 0) {
                var current = $scope.sortedTeiIds.indexOf($scope.selectedTeiId);

                if (current !== -1) {
                    if ($scope.sortedTeiIds.length - 1 > current) {
                        $scope.nextTeiExists = true;
                    }

                    if (current > 0) {
                        $scope.previousTeiExists = true;
                    }
                }
            }

            //get ouLevels
            TCStorageService.currentStore.open().done(function () {
                TCStorageService.currentStore.getAll('ouLevels').done(function (response) {
                    var ouLevels = angular.isObject(response) ? orderByFilter(response, '-level').reverse() : [];
                    CurrentSelection.setOuLevels(orderByFilter(ouLevels, '-level').reverse());
                });
            });

            if ($scope.selectedTeiId) {

                //get option sets
                $scope.optionSets = [];

                MetaDataFactory.getAll('optionSets').then(function (optionSets) {
                    angular.forEach(optionSets, function (optionSet) {
                        $scope.optionSets[optionSet.id] = optionSet;
                    });

                    AttributesFactory.getAll().then(function (atts) {

                        $scope.attributesById = [];
                        angular.forEach(atts, function (att) {
                            $scope.attributesById[att.id] = att;
                        });

                        CurrentSelection.setAttributesById($scope.attributesById);

                        //Fetch the selected entity
                        TEIService.get($scope.selectedTeiId, $scope.optionSets, $scope.attributesById).then(function (response) {
                            if (response) {
                                $scope.selectedTei = response;

                                //get the entity type
                                TEService.get($scope.selectedTei.trackedEntity).then(function (te) {
                                    $scope.trackedEntity = te;

                                    //get enrollments for the selected tei
                                    EnrollmentService.getByEntity($scope.selectedTeiId).then(function (response) {
                                        if(!response) {
                                            return;
                                        }
                                        var enrollments = angular.isObject(response) && response.enrollments ? response.enrollments : [];
                                        var selectedEnrollment = null, backupSelectedEnrollment = null;
                                        if (enrollments.length === 1) {
                                            selectedEnrollment = enrollments[0];
                                        } else {
                                            if ($scope.selectedProgramId) {
                                                angular.forEach(enrollments, function (en) {
                                                    if (en.program === $scope.selectedProgramId) {
                                                        if (en.status === 'ACTIVE') {
                                                            selectedEnrollment = en;
                                                        } else {
                                                            backupSelectedEnrollment = en;
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                        selectedEnrollment = selectedEnrollment ? selectedEnrollment : backupSelectedEnrollment;

                                        ProgramFactory.getAll().then(function (programs) {
                                            $scope.programs = [];
                                            $scope.programNames = [];
                                            $scope.programStageNames = [];

                                            //get programs valid for the selected ou and tei
                                            angular.forEach(programs, function (program) {
                                                if (program.trackedEntity.id === $scope.selectedTei.trackedEntity) {
                                                    $scope.programs.push(program);
                                                    $scope.programNames[program.id] = {
                                                        id: program.id,
                                                        displayName: program.displayName
                                                    };
                                                    angular.forEach(program.programStages, function (stage) {
                                                        $scope.programStageNames[stage.id] = {
                                                            id: stage.id,
                                                            displayName: stage.displayName
                                                        };
                                                    });

                                                    if ($scope.selectedProgramId && program.id === $scope.selectedProgramId || selectedEnrollment && selectedEnrollment.program === program.id) {
                                                        $scope.selectedProgram = program;
                                                    }
                                                }
                                            });

                                            //filter those enrollments that belong to available programs
                                            var len = enrollments.length;
                                            while (len--) {
                                                if (enrollments[len].program && !$scope.programNames[enrollments[len].program]) {
                                                    enrollments.splice(len, 1);
                                                }
                                            }

                                            DHIS2EventFactory.getEventsByProgram($scope.selectedTeiId, null).then(function (events) {
                                                //prepare selected items for broadcast
                                                CurrentSelection.setSelectedTeiEvents(events);
                                                CurrentSelection.set({
                                                    tei: $scope.selectedTei,
                                                    te: $scope.trackedEntity,
                                                    prs: $scope.programs,
                                                    pr: $scope.selectedProgram,
                                                    prNames: $scope.programNames,
                                                    prStNames: $scope.programStageNames,
                                                    enrollments: enrollments,
                                                    selectedEnrollment: selectedEnrollment,
                                                    optionSets: $scope.optionSets,
                                                    orgUnit: $scope.selectedOrgUnit
                                                });
                                                getDashboardLayout();
                                            });
                                        });
                                    });
                                });
                            }
                        });
                    });
                });
            }            
        });
    }
    
    //dashboard items
    var getDashboardLayout = function () {
        $rootScope.dashboardWidgets = [];
        $scope.widgetsChanged = [];
        $scope.dashboardStatus = [];
        $scope.dashboardWidgetsOrder = {biggerWidgets: [], smallerWidgets: []};
        $scope.orderChanged = false;

        DashboardLayoutService.get().then(function (response) {
            $scope.dashboardLayouts = response;            
            var defaultLayout = $scope.dashboardLayouts.defaultLayout['DEFAULT'];
            var selectedLayout = null;
            if ($scope.selectedProgram && $scope.selectedProgram.id) {
                selectedLayout = $scope.dashboardLayouts.customLayout && $scope.dashboardLayouts.customLayout[$scope.selectedProgram.id] ? $scope.dashboardLayouts.customLayout[$scope.selectedProgram.id] : $scope.dashboardLayouts.defaultLayout[$scope.selectedProgram.id];
            }
            selectedLayout = !selectedLayout ? defaultLayout : selectedLayout;

            $scope.model.stickyDisabled = selectedLayout.stickRightSide ? !selectedLayout.stickRightSide : true;

            angular.forEach(selectedLayout.widgets, function (widget) {
                if (widget.title !== "activePrograms") {
                    $rootScope[widget.title + 'Widget'] = widget;
                    $rootScope.dashboardWidgets.push($rootScope[widget.title + 'Widget']);
                    $scope.dashboardStatus[widget.title] = angular.copy(widget);
                }
            });

            angular.forEach(defaultLayout.widgets, function (w) {
                if (!$scope.dashboardStatus[w.title]) {
                    $rootScope[w.title + 'Widget'] = w;
                    $rootScope.dashboardWidgets.push($rootScope[w.title + 'Widget']);
                    $scope.dashboardStatus[w.title] = angular.copy(w);
                }
            });

            $scope.hasBigger = false;
            angular.forEach(orderByFilter($filter('filter')($scope.dashboardWidgets, {parent: "biggerWidget"}), 'order'), function (w) {
                if (w.show) {
                    $scope.hasBigger = true;
                }
                $scope.dashboardWidgetsOrder.biggerWidgets.push(w.title);
            });

            $scope.hasSmaller = false;
            angular.forEach(orderByFilter($filter('filter')($scope.dashboardWidgets, {parent: "smallerWidget"}), 'order'), function (w) {
                if (w.show) {
                    $scope.hasSmaller = true;
                }
                $scope.dashboardWidgetsOrder.smallerWidgets.push(w.title);
            });

            setWidgetsSize();
            $scope.broadCastSelections();
            setInactiveMessage();
        });
    };

    var setWidgetsSize = function () {

        $scope.widgetSize = {smaller: "col-sm-6 col-md-4", bigger: "col-sm-6 col-md-8"};

        if (!$scope.hasSmaller) {
            $scope.widgetSize = {smaller: "col-sm-1", bigger: "col-sm-11"};
        }

        if (!$scope.hasBigger) {
            $scope.widgetSize = {smaller: "col-sm-11", bigger: "col-sm-1"};
        }
    };

    var setInactiveMessage = function () {
        if ($scope.selectedTei.inactive) {
            var teName = $scope.trackedEntity && $scope.trackedEntity.displayName ? $scope.trackedEntity.displayName : $translate.instance('tracked_entity_instance');
            setHeaderDelayMessage(teName + " " + $translate.instant('tei_inactive_only_read'));
        }
    };
    
    //listen for any change to program selection
    //it is possible that such could happen during enrollment.
    $scope.$on('mainDashboard', function (event, args) {
        var selections = CurrentSelection.get();
        $scope.selectedProgram = null;
        angular.forEach($scope.programs, function (pr) {
            if (pr.id === selections.pr) {
                $scope.selectedProgram = pr;
            }
        });

        $scope.applySelectedProgram();
    });

    function getCurrentDashboardLayout() {
        var widgets = [];
        $scope.hasBigger = false;
        $scope.hasSmaller = false;
        angular.forEach($rootScope.dashboardWidgets, function (widget) {
            var w = angular.copy(widget);
            if ($scope.orderChanged) {
                if ($scope.widgetsOrder.biggerWidgets.indexOf(w.title) !== -1) {
                    $scope.hasBigger = $scope.hasBigger || w.show;
                    w.parent = 'biggerWidget';
                    w.order = $scope.widgetsOrder.biggerWidgets.indexOf(w.title);
                }

                if ($scope.widgetsOrder.smallerWidgets.indexOf(w.title) !== -1) {
                    $scope.hasSmaller = $scope.hasSmaller || w.show;
                    w.parent = 'smallerWidget';
                    w.order = $scope.widgetsOrder.smallerWidgets.indexOf(w.title);
                }
            }
            widgets.push(w);
        });

        return {widgets: widgets, program: $scope.selectedProgram && $scope.selectedProgram.id ? $scope.selectedProgram.id : 'DEFAULT'};
    }

    function saveDashboardLayout() {
        var currentLayout = $scope.dashboardLayouts.customLayout ? angular.copy($scope.dashboardLayouts.customLayout) : {};
        var programId = $scope.selectedProgram && $scope.selectedProgram.id ? $scope.selectedProgram.id : 'DEFAULT';        
        currentLayout[programId] = getCurrentDashboardLayout();
        
        DashboardLayoutService.saveLayout(currentLayout, false).then(function () {
            if (!$scope.orderChanged) {
                $scope.hasSmaller = $filter('filter')($scope.dashboardWidgets, {
                    parent: "smallerWidget",
                    show: true
                }).length > 0;
                $scope.hasBigger = $filter('filter')($scope.dashboardWidgets, {
                    parent: "biggerWidget",
                    show: true
                }).length > 0;
            }
            setWidgetsSize();
        });
    };
    
    $scope.saveDashboarLayoutAsDefault = function () {
        var layout = angular.copy($scope.dashboardLayouts.defaultLayout);        
        var programId = $scope.selectedProgram && $scope.selectedProgram.id ? $scope.selectedProgram.id : 'DEFAULT';        
        layout[programId] = getCurrentDashboardLayout();
        delete layout.DEFAULT;
        DashboardLayoutService.saveLayout(layout, true);
    };

    //persist widget sorting
    $scope.applyWidgetsOrderChange = function(param){
        $scope.widgetsOrder = param;
        $scope.orderChanged = false;
        for (var i = 0; i < $scope.widgetsOrder.smallerWidgets.length; i++) {
            if ($scope.widgetsOrder.smallerWidgets.length === $scope.dashboardWidgetsOrder.smallerWidgets.length && $scope.widgetsOrder.smallerWidgets[i] !== $scope.dashboardWidgetsOrder.smallerWidgets[i]) {
                $scope.orderChanged = true;
            }

            if ($scope.widgetsOrder.smallerWidgets.length !== $scope.dashboardWidgetsOrder.smallerWidgets.length) {
                $scope.orderChanged = true;
            }
        }

        for (var i = 0; i < $scope.widgetsOrder.biggerWidgets.length; i++) {
            if ($scope.widgetsOrder.biggerWidgets.length === $scope.dashboardWidgetsOrder.biggerWidgets.length && $scope.widgetsOrder.biggerWidgets[i] !== $scope.dashboardWidgetsOrder.biggerWidgets[i]) {
                $scope.orderChanged = true;
            }

            if ($scope.widgetsOrder.biggerWidgets.length !== $scope.dashboardWidgetsOrder.biggerWidgets.length) {
                $scope.orderChanged = true;
            }
        }

        if ($scope.orderChanged) {
            saveDashboardLayout();
        }
    };

    $scope.$on('DataEntryMainMenuItemSelected', function (event) {
        $scope.dataEntryMainMenuItemSelected = true;
    });

    $scope.$on('DataEntryMainMenuVisibilitySet', function (event, data) {
        if (data.visible) {
            //hide all widgets except visibleItems in data
            angular.forEach($scope.dashboardWidgets, function (widget) {
                if (!data.visibleItems[widget.title]) {
                    $scope.temporaryHideWidgets[widget.title] = true;
                } else {
                    $scope.temporaryShowWidgets[widget.title] = true;
                }

            });
        } else if (data.closingStage) {//Palestine, show only closing stage

        } else {
            //show widgets, reset temporary settings
            $scope.temporaryHideWidgets = [];
            $scope.temporaryShowWidgets = [];

        }
    });
    
    $scope.applySelectedProgram = function (pr) {
        if (pr) {
            $scope.selectedProgram = pr;
        }
        getDashboardLayout();
    };

    $scope.broadCastSelections = function (tei) {

        var selections = CurrentSelection.get();
        if (tei) {
            $scope.selectedTei = tei;
        } else {
            $scope.selectedTei = selections.tei;
        }

        $scope.trackedEntity = selections.te;
        $scope.optionSets = selections.optionSets;
        $scope.selectedEnrollment = null;

        if ($scope.selectedProgram) {
            for (var i = 0; i < selections.enrollments.length; i++) {
                if (selections.enrollments[i].program === $scope.selectedProgram.id) {
                    $scope.selectedEnrollment = selections.enrollments[i];
                    break;
                }
            }
        }

        CurrentSelection.set({
            tei: $scope.selectedTei,
            te: $scope.trackedEntity,
            prs: $scope.programs,
            pr: $scope.selectedProgram,
            prNames: $scope.programNames,
            prStNames: $scope.programStageNames,
            enrollments: selections.enrollments,
            selectedEnrollment: $scope.selectedEnrollment,
            optionSets: $scope.optionSets,
            orgUnit: $scope.selectedOrgUnit
        });
        $timeout(function () {
            $rootScope.$broadcast('selectedItems', {programExists: $scope.programs.length > 0});
        }, 500);
    };

    $scope.activiateTEI = function () {
        var st = !$scope.selectedTei.inactive || $scope.selectedTei.inactive === '' ? true : false;

        var modalOptions = {
            closeButtonText: 'no',
            actionButtonText: 'yes',
            headerText: st ? 'deactivate' : 'activate',
            bodyText: 'are_you_sure_to_proceed'
        };

        ModalService.showModal({}, modalOptions).then(function (result) {

            $scope.selectedTei.inactive = st;
            TEIService.update($scope.selectedTei, $scope.optionSets, $scope.attributesById).then(function (data) {
                setInactiveMessage();
                $scope.broadCastSelections($scope.selectedTei);
            });
        }, function () {
        });
    };
    
    $scope.deleteTEI = function () {
        var modalOptions = {
            closeButtonText: 'no',
            actionButtonText: 'yes',
            headerText: 'delete',
            bodyText: $translate.instant('are_you_sure_to_proceed') + ' ' + $translate.instant('will_delete_all_data_associated') + ' ' + $scope.trackedEntity.displayName
        };
        
        ModalService.showModal({}, modalOptions).then(function (result) {
            TEIService.delete($scope.selectedTeiId).then(function (response) {
                if( !response ){
                    var teis = CurrentSelection.getTrackedEntities();                
                    if( teis && teis.rows && teis.rows.own && teis.rows.own.length > 0 ){
                        var index = -1;
                        for( var i=0; i<teis.rows.own.length && index === -1; i++ ){
                            if( teis.rows.own[i].id === $scope.selectedTeiId ){
                                index = i;
                            }
                        }

                        if( index !== -1 ){
                            teis.rows.own.splice(index, 1);
                            CurrentSelection.setTrackedEntities(teis);
                        }
                    }
                    
                    NotificationService.showNotifcationDialog($translate.instant('success'), $scope.trackedEntity.displayName + ' ' + $translate.instant('deleted'));                
                    $scope.back();
                }
                
            });
        });
    };

    $scope.back = function () {
        if (!$scope.dataEntryMainMenuItemSelected) {
            //reload OU tree
            selection.load();
            $location.path('/').search({program: $scope.selectedProgramId});
        } else {
            $rootScope.$broadcast('DashboardBackClicked');
            $scope.dataEntryMainMenuItemSelected = false;
        }
    };
            
    $scope.getBackButtonText = function () {
        if (!$scope.dataEntryMainMenuItemSelected) {
            return $translate.instant('back');
        } else {
            return $translate.instant('menu');
        }
    };

		 $scope.eventmodel = function () {
		 var addtomarque;
        var screen;
       var blood;
       var sugar;
	   var count=0;
        var Table = document.getElementById("table1");
        Table.innerHTML = "";
		var emptymarque=document.getElementById("marq");
		emptymarque.innerHTML = "";
             var url = window.location.href;
			 var params = url.split('=');
			 var per =params[1];
			 var finper=per.split('&');
	var trackid=finper[0];
	
	var perr =params[2];
			 var finperr=perr.split('&');
	var programidd=finperr[0];
			//alert(programidd);
			var npcdcsid="jC8Gprj4pWV";
			if(npcdcsid==programidd){
		  $.get("../api/events.json?orgUnit=lZtSBQjZCaX&program=jC8Gprj4pWV&trackedEntityInstance="+trackid+"&order=eventDate:asc", function (data1) {
			  var trackdata=data1;
			  for(var j=0;j<trackdata.events.length;j++)
				{
				
				
				var screenoutcome="<tr  style='border:1px solid black;background-color:white;height:30px'>  <td style='text-align:center;color:white;background-color:#5BC0DE'><b>Screening Outcome<b></td>";
				var bloodpressure="<tr  style='border:1px solid black;background-color:white;height:30px'>  <td style='text-align:center;color:white;background-color:orange'><b>Blood Pressure<b></td>";
				var sugarfastning="<tr  style='border:1px solid black;background-color:white;height:30px'>  <td style='text-align:center;color:white;background-color:#D9534F'><b>Sugar Fastning<b></td>";
					           	           
				// leng=eventdata.events.length;
				var dateofvisit= trackdata.events[j].eventDate;  //
			     //  console.log(leng);
				   var dataval=trackdata.events[j].dataValues;
				   if(dataval.length >1){
					    count++;
				   for(var q=0;q<dataval.length;q++)
				   {
				   var id=dataval[q].dataElement;
				 
				   if(id=="ObkhLek0zZf")// oral ca
				   {
				   	          screenoutcome=screenoutcome+"<td style='border:1px solid black;text-align:center'><b>Oral Ca<b></td>";
					           
				  // var aa="you have oral ca";
				  //  $(".reporttt").append(first);
				 // $(".report").append(name);

				   }
				   else if(id=="xFhzzBJ4Z6K")// RF
				   {
				    screenoutcome=screenoutcome+"<td style='border:1px solid black;text-align:center'><b>RF<b></td>";
					          
				   // var bb="you have RF";
				  
				 //  alert("you have RF");

				   }
				    else if(id=="C4YdSPG3Mr0")// Brease CA
				   {
				   
				    screenoutcome=screenoutcome+"<td style='border:1px solid black;text-align:center'><b>Breast CA<b></td>";

				   }
				    else if(id=="gpJWjauP93y")// cervical CA
				   {
				   
				    screenoutcome=screenoutcome+"<td style='border:1px solid black;text-align:center'><b>Cervical CA<b></td>";

				   }
				    else if(id=="Fay65bFZIkC")// CKD
				   {
				   
				   screenoutcome=screenoutcome+"<td style='border:1px solid black;text-align:center'><b>CKD<b></td>";

				   }
				    else if(id=="doZmhIPTR2O")// COPD
				   {
				   
				   screenoutcome=screenoutcome+"<td style='border:1px solid black;text-align:center'><b>COPD<b></td>";

				   }
				    else if(id=="GREEuTukX3P")// DM
				   {
				   
				   screenoutcome=screenoutcome+"<td style='border:1px solid black;text-align:center'><b>DM<b></td>";

				   }
				    else if(id=="FSD6mDILc7l")// HTN
				   {
				   
				   screenoutcome=screenoutcome+"<td style='border:1px solid black;text-align:center'><b>HTN<b></td>";

				   }
				    else if(id=="m63ulx9T3Ri")// CVD1   
				   {
				   
				   screenoutcome=screenoutcome+"<td style='border:1px solid black;text-align:center'><b>CVD1<b></td>";

				   }
				    else if(id=="bv7PMXbyOZD")// CA-other   
				   {
				   
				  screenoutcome=screenoutcome+"<td style='border:1px solid black;text-align:center'><b>CA-Other<b></td>";

				   }
				    else if(id=="HQz8UUWfvo0")// systolic blood presure  
				   {
				      var systol=dataval[q].value;
				  bloodpressure=bloodpressure+"<td style='border:1px solid black;text-align:center'><b>"+systol+"&nbsp&nbsp&nbspSystolic"+"<b></td>";
                        //  alert("hyy");
				   }
				     else if(id=="pTuKCcPRn9k")// diasitoli cblood presure
				   {
				   var diasit=dataval[q].value;
				  bloodpressure=bloodpressure+"<td style='border:1px solid black;text-align:center'><b>"+diasit+"&nbsp&nbspDiasitolic"+"<b></td>";
                         // alert("hyy");
				   }
				    else if(id=="kfqBvvoWuzA")//FBS (mg/dl)
				   {
				   var fbs=dataval[q].value;
				  sugarfastning=sugarfastning+"<td style='border:1px solid black;text-align:center'><b>"+fbs+"&nbsp&nbspFBS(mg/dl)"+"<b></td>";
                         // alert("hyy");
				   }
				    else if(id=="XtI1MSP154r")// PPBS (mg/dl)
				   {
				   var ppbs=dataval[q].value;
				  sugarfastning=sugarfastning+"<td style='border:1px solid black;text-align:center'><b>"+ppbs+"&nbsp&nbspPPBS(mg/dl)"+"<b></td>";
                         // alert("hyy");
				   }
				    else if(id=="FHBrdgsPgDY")// RBS (mg/dl)
				   {
				   var rbs=dataval[q].value;
				  sugarfastning=sugarfastning+"<td style='border:1px solid black;text-align:center'><b>"+rbs+"&nbsp&nbspRBS(mg/dl)"+"<b></td>";
                         // alert("hyy");
				   }
				   }
				   screenoutcome=screenoutcome+"</tr>";
				   bloodpressure=bloodpressure+"</tr>"
				   sugarfastning=sugarfastning+"</tr>";
				   var visitnno ="<tr><td >Visit No: "+count+"</td><td>"+dateofvisit.substring(0, 10);+"</td></tr>";
				    var emptyRoww ="<tr class='emptyRow'><td height='35px'></td><tr>";
					 var blankmarque ="<td width='50px'></td>";
					   $(".reporttt").append(visitnno);
				     $(".reporttt").append(screenoutcome);
				   $(".reporttt").append(bloodpressure);
				   $(".reporttt").append(sugarfastning);
				   $(".reporttt").append(emptyRoww);
				   }
				   }
				  
				   screen=screenoutcome;
				   screen=screen.slice(0, -5);
				   blood=bloodpressure;
				   blood=blood.slice(0, -5);
				  blood = blood.replace("<tr  style='border:1px solid black;background-color:white;height:30px'>", "");
				  sugarfastning=sugarfastning.replace("<tr  style='border:1px solid black;background-color:white;height:30px'>", "");
				    addtomarque=screen+blankmarque+blood+blankmarque+sugarfastning;
				  // console.log("check"+addtomarque);
			
			// 
			 
			  });
			 // $("#myModal").modal();
			   $("#myModal").modal('show');
         $("#myModal").on('hidden.bs.modal', function () {
               $("#marq").append(addtomarque);
			   addtomarque="";
    });
		
		 }
		 else{
			 window.alert("This Functionality is only for NPCDCS program");
		 }
    };
	
	
    $scope.showEnrollment = function () {
        $scope.displayEnrollment = true;
    };

    $scope.removeWidget = function (widget) {
        widget.show = false;
        saveDashboardLayout();
    };

    $scope.expandCollapse = function (widget) {
        widget.expand = !widget.expand;
        saveDashboardLayout();
    };

    $scope.showHideWidgets = function () {
        var modalInstance = $modal.open({
            templateUrl: "components/dashboard/dashboard-widgets.html",
            controller: "DashboardWidgetsController"
        });

        modalInstance.result.then(function () {
        });
    };

    $rootScope.closeOpenWidget = function () {
        saveDashboardLayout();
    };

    $scope.fetchTei = function (mode) {
        var current = $scope.sortedTeiIds.indexOf($scope.selectedTeiId);
        var pr = ($location.search()).program;
        var tei = null;
        if (mode === 'NEXT') {
            tei = $scope.sortedTeiIds[current + 1];
        } else {
            tei = $scope.sortedTeiIds[current - 1];
        }
        $location.path('/dashboard').search({tei: tei, program: pr ? pr : null, ou: orgUnitUrl ? orgUnitUrl : null});
    };
});
