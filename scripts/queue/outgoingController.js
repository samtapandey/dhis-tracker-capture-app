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


	var oun = "";
	$scope.getOu = function (tei) {
		$.ajax({
			async: false,
			type: "GET",
			url: '../api/events.json?program=L78QzNqadTV&programStage=zLxGw3kEplq&trackedEntityInstance=' + tei,
			success: function (data) {
				if (data.events.length == 0) {
					$.ajax({
						async: false,
						type: "GET",
						url: "../api/trackedEntityInstances/" + tei + ".json",
						success: function (data) {
							oun = data.orgUnit;
						}
					});
				}
				else { oun = data.events[0].orgUnit; }
			}
		});
		return oun;
	};
	var getAllEvents = function (tei) {
		var data5 = "";
		$.ajax({
			async: false,
			type: "GET",
			url: "../api/events.json?program=L78QzNqadTV&trackedEntityInstance=" + tei + "&order=eventDate:ASC&skipPaging=false",
			success: function (data) {
				data5 = data;
			}
		});
		return data5;
	};


	var getTeiData = function (tei) {
		var data2 = "";
		$.ajax({
			async: false,
			type: "GET",
			url: "../api/trackedEntityInstances/" + tei + ".json",
			success: function (data) {
				data2 = data;
			}
		});
		return data2;
	};

	var teiMap = function (data) {
		var mappedteis = [];
		var k = 0;
		for (var i = 0; i < data.events.length; i++) {
			if (mappedteis.indexOf(data.events[i].trackedEntityInstance) == -1) {
				mappedteis[k] = data.events[i].trackedEntityInstance;
				k++;
			}
		}
		return mappedteis;

	};

	$scope.loadQueue = function () {
		var tei = "";
		var pdata = "";
		var filtered_data = [];
		var flag;
		CustomService.getOuLevel($scope.selectedOrgUnitUid).then(function (response) {

			//checking ou level
			if (response.level == 5) {
				//getting all events on selected ou
				CustomService.getAllEvents($scope.selectedOrgUnitUid).then(function (eventsdata) {
					//getting unique teis from all events occuring on selected ou
					var allTeis = teiMap(eventsdata);

					for (var j = 0, len = allTeis.length; j < len; j++) {
						var tei = allTeis[j];

						//getting all events on one tei
						var teieventsd = getAllEvents(tei);
						var teievents = teieventsd.events;
						for (var y = 0, lenn = teievents.length - 1; y < lenn; y++) {

							//checking ou of two consecutive events and checking for refferals
							if (teievents[y].orgUnit == $scope.selectedOrgUnitUid && teievents[y + 1].orgUnit != $scope.selectedOrgUnitUid && teievents[y + 1].status != "COMPLETED") {

								//getting data of particular tei
								var returnedDdata = getTeiData(tei);
								var psd = "";
								var ps = teievents[y + 1].programStage;

								//checking and filtering for program stage
								if (ps == "zLxGw3kEplq") { psd = "ART-HIV Counselling and Testing"; }
								else if (ps == "YRSdePjzzfs") { psd = "ART Follow-up"; }
								else {
									var psd = "";
								}

								//pushing all data to tei object
								if (psd != "") {
									var teidata = returnedDdata;
									teidata.tei = returnedDdata.trackedEntityInstance;
									teidata.psd = psd;

									//getting all values of tei attributes
									for (var j = 0; j < returnedDdata.attributes.length; j++) {
										if (returnedDdata.attributes[j].displayName == "Client code") {
											teidata.clientcode = returnedDdata.attributes[j].value;
										}
										if (returnedDdata.attributes[j].displayName == "Marital status") {
											teidata.maritalstatus = returnedDdata.attributes[j].value;
										}
										if (returnedDdata.attributes[j].displayName == "Age (at registration)") {
											teidata.age = returnedDdata.attributes[j].value;
										}
										if (returnedDdata.attributes[j].displayName == "Sex") {
											teidata.sex = returnedDdata.attributes[j].value;
										}
										if (returnedDdata.attributes[j].displayName == "Risk group") {
											var rg = $scope.getRiskGroup(returnedDdata.attributes[j].value);
											teidata.riskgroup = rg;
										}
										if (returnedDdata.attributes[j].displayName == "Entry point") {
											var ep = $scope.getEntryPoint(returnedDdata.attributes[j].value);
											teidata.entrypoint = ep;
										}

									}

									// getting ou name through whichtei is reffered
									var ouname = $scope.getOuName(teievents[y + 1].orgUnit);
									teidata.rf = ouname;
									filtered_data.push(teidata);
								}

							}
						}
					}
				});
				$timeout(function () {
					$scope.filtered_teidata = filtered_data;
				});
				//document.getElementById('loader').style.display = "none";
			}
			else { alert("Wrong Selection !"); }
		});

	};


	//$scope.loadQueue();


}]);