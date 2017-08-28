/* global trackerCapture, angular */

var trackerCapture = angular.module('trackerCapture');
trackerCapture.controller('outgoingController', ["$rootScope", "$scope", "$timeout", "$location", "SessionStorageService", "CurrentSelection", "CustomService", function ($rootScope, $scope, $timeout, $location, SessionStorageService, CurrentSelection, CustomService) {


	var ouid = SessionStorageService.get('ouSelected');
	var selections = CurrentSelection.get();
	selection.load();

	// Listen for OU changes
	selection.setListenerFunction(function () {
		$scope.selectedOrgUnitUid = selection.getSelected();
		$scope.loadQueue();
	}, false);

	debugger;
	$scope.goToDashboard = function (t) {
		t.clicked = true;
		var base = location.protocol + '//' + location.host + "/dhis"; //+window.location.pathname;
		$location.path('/dashboard').search({
			tei: t.tei,
			program: "L78QzNqadTV",
			//  ou: "CPtzIhyn36z",
			ou: ouid,
			queue: true,
			from: 'receivedReferral'
		});
		// $window.open(base+'/dhis-web-tracker-capture/index.html#/dashboard?tei='+ev.tei+'&program=a9cQSlDVI2n&ou=CPtzIhyn36z'+$scope.ouId, '_blank');
	};

	$scope.getRiskGroup = function (rg) {
		var riskgroup;
		if (rg == "sex_worker") { riskgroup = "Sex worker"; }
		else if (rg == "pwid") { riskgroup = "PWID"; }
		else if (rg == "msm_tg") { riskgroup = "MSM and TG"; }
		else if (rg == "blood_organ_recipient") { riskgroup = "Blood and organ recipient"; }
		else if (rg == "client_sex_worker") { riskgroup = "Client of sex worker"; }
		else if (rg == "migrants") { riskgroup = "Migrants"; }
		else if (rg == "spouse_migrants") { riskgroup = "Spouse of migrants"; }
		else if (rg == "other_risk_group") { riskgroup = "Others"; }
		else {
			riskgroup = "";
		}
		return riskgroup;
	};

	$scope.getEntryPoint = function (ep) {
		var entrypoint;
		if (ep == "htc") { entrypoint = "HTC"; }
		else if (ep == "tb_program") { entrypoint = "TB program"; }
		else if (ep == "out_patient_service") { entrypoint = "Out-patient service"; }
		else if (ep == "in_patient_service") { entrypoint = "In-patient service"; }
		else if (ep == "paediatrics_service") { entrypoint = "Paediatrics service"; }
		else if (ep == "pmtct") { entrypoint = "PMTCT"; }
		else if (ep == "sti_service") { entrypoint = "STI"; }
		else if (ep == "private_health_service") { entrypoint = "Private health service"; }
		else if (ep == "ngo") { entrypoint = "NGO"; }
		else if (ep == "self_referred") { entrypoint = "Self-referred"; }
		else if (ep == "out_special_service") { entrypoint = "Out/special service"; }
		else if (ep == "other_entry_point") { entrypoint = "Others"; }
		else {
			entrypoint = "";
		}
		return entrypoint;
	};

	var ounamee = "";
	$scope.getOuName = function (ou) {
		$.ajax({
			async: false,
			type: "GET",
			url: '../api/organisationUnits/' + ou + '.json',
			success: function (data) {
				ounamee = data.displayName;
			}
		});
		return ounamee;
	};


	$scope.loadQueue = function () {
		var filtered_data = [];
		var tei = "";
		var pdata = "";
		CustomService.getOuLevel($scope.selectedOrgUnitUid).then(function (response) {
			if (response.level == 5) {
				CustomService.getAllTeis($scope.selectedOrgUnitUid).then(function (data1) {
					//	console.log(data1);
					for (var i = 0; i < data1.trackedEntityInstances.length; i++) {
						tei = data1.trackedEntityInstances[i].trackedEntityInstance;
						pdata = data1;

						$.ajax({
							async: false,
							type: "GET",
							url: "../api/events.json?program=L78QzNqadTV&trackedEntityInstance=" + tei + "&paging=none",
							success: function (data) {

								for (var p = 0; p < data.events.length; p++) {
									if ($scope.selectedOrgUnitUid == data.events[p].orgUnit) { }
									else {

										if (data.events[p].status == "COMPLETED") { }
										else {
											var psd = "";
											var ps = data.events[p].programStage;
											if (ps == "zLxGw3kEplq") { psd = "ART-HIV Counselling and Testing"; }
											else if (ps == "YRSdePjzzfs") { psd = "ART Follow-up"; }
											else {
												var psd = "";
												return;
											}

											$.ajax({
												async: false,
												type: "GET",
												url: "../api/trackedEntityInstances/" + tei + ".json",
												success: function (data) {


													var teidata = data;
													teidata.tei = data.trackedEntityInstance;
													teidata.psd = psd;
													//console.log(teidata);
													for (var j = 0; j < data.attributes.length; j++) {
														if (data.attributes[j].displayName == "Client code") {
															teidata.clientcode = data.attributes[j].value;
														}
														if (data.attributes[j].displayName == "Marital status") {
															teidata.maritalstatus = data.attributes[j].value;
														}
														if (data.attributes[j].displayName == "Age") {
															teidata.age = data.attributes[j].value;
														}
														if (data.attributes[j].displayName == "Sex") {
															teidata.sex = data.attributes[j].value;
														}
														if (data.attributes[j].displayName == "Risk group") {
															var rg = $scope.getRiskGroup(data.attributes[j].value);
															teidata.riskgroup = rg;
														}
														if (data.attributes[j].displayName == "Entry point") {
															var ep = $scope.getEntryPoint(data.attributes[j].value);
															teidata.entrypoint = ep;
														}

													}
													var ouname = $scope.getOuName(data.orgUnit);
													teidata.rf = ouname;
													filtered_data.push(teidata);
													//console.log(filtered_data);

												}
											});
										}
									}
								}
							}
						});
					}
				});
				$timeout(function () {
					$scope.filtered_teidata = filtered_data;
				});
			}
			else { alert("Wrong Selection !"); }
		});
	};

	//$scope.loadQueue();


}]);