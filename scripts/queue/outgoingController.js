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
		//$scope.loadQueue2();
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

	var ps1events = [];
	var ps2events = [];
	var ps3events = [];

	var ps1 = function (ou) {
		$.ajax({
			async: false,
			type: "GET",
			url: '../api/events.json?program=L78QzNqadTV&programStage=HpS6GtD2Yk5&orgUnit=' + ou,
			success: function (data) {
				for (var i = 0; i < data.events.length; i++) {
					var data1 = [];
					if (data.events[i].status != "COMPLETED") {
						data1.push(data.events[i].trackedEntityInstance);
						data1.push(data.events[i].orgUnit);
						ps1events.push(data1);
					}
				}
			}
		});
	};

	var ps2 = function (ou) {
		$.ajax({
			async: false,
			type: "GET",
			url: '../api/events.json?program=L78QzNqadTV&programStage=zLxGw3kEplq&orgUnit=' + ou,
			success: function (data) {
				for (var i = 0; i < data.events.length; i++) {
					var data2 = [];
					if (data.events[i].status != "COMPLETED") {
						data2.push(data.events[i].trackedEntityInstance);
						data2.push(data.events[i].orgUnit);
						ps2events.push(data2);
					}
				}
			}
		});

	};

	var ps3 = function (ou) {
		$.ajax({
			async: false,
			type: "GET",
			url: '../api/events.json?program=L78QzNqadTV&programStage=YRSdePjzzfs&orgUnit=' + ou,
			success: function (data) {
				for (var i = 0; i < data.events.length; i++) {
					var data3 = [];
					if (data.events[i].status != "COMPLETED") {
						data3.push(data.events[i].trackedEntityInstance);
						data3.push(data.events[i].orgUnit);
						ps3events.push(data3);
					}
				}
			}
		});
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
	var udata = "";
	var checkData = function (tei) {
		$.ajax({
			async: false,
			type: "GET",
			url: '../api/events.json?program=L78QzNqadTV&programStage=zLxGw3kEplq&trackedEntityInstance=' + tei,
			success: function (data) {
				udata = data;
			}
		});
		return udata;
	};
	var u2data = "";
	var checkData2 = function (tei) {
		$.ajax({
			async: false,
			type: "GET",
			url: '../api/events.json?program=L78QzNqadTV&programStage=YRSdePjzzfs&trackedEntityInstance=' + tei,
			success: function (data) {
				u2data = data;
			}
		});
		return u2data;
	};
var outei ="";
	var checkteiData = function (tei) {
		$.ajax({
			async: false,
			type: "GET",
			url: "../api/trackedEntityInstances/" + tei + ".json",
			success: function (data) {
				outei = data.orgUnit;
			}
		});
		return outei;
	};

	$scope.loadQueue = function () {
		var tei = "";
		var pdata = "";
		var filtered_data = [];
		var flag;
		CustomService.getOuLevel($scope.selectedOrgUnitUid).then(function (response) {
			if (response.level == 5) {
				CustomService.getAllTeis($scope.selectedOrgUnitUid).then(function (data1) {
					//	console.log(data1);
					for (var i = 0; i < data1.trackedEntityInstances.length; i++) {
						tei = data1.trackedEntityInstances[i].trackedEntityInstance;
						flag = 0;

						$.ajax({
							async: false,
							type: "GET",
							url: "../api/events.json?program=L78QzNqadTV&trackedEntityInstance=" + tei + "&paging=none",
							success: function (data5) {

								for (var p = 0; p < data5.events.length; p++) {
									if ($scope.selectedOrgUnitUid == data5.events[p].orgUnit) { }
									else {

										if (data5.events[p].status == "COMPLETED") { }
										else {
											pdata = data5.events[p];
											var psd = "";
											var ps = data5.events[p].programStage;
											if (ps == "zLxGw3kEplq") {
												psd = "ART-HIV Counselling and Testing";

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
														var ouname = $scope.getOuName(pdata.orgUnit);
														teidata.rf = ouname;
														filtered_data.push(teidata);
														//console.log(filtered_data);

													}
												});
											}
											else if (ps == "YRSdePjzzfs") { }
											else {
												var psd = "";
												//return;
											}

										}
									}
								}
							}
						});
					}
				});
				$.ajax({
					async: false,
					type: "GET",
					url: '../api/events.json?program=L78QzNqadTV&programStage=YRSdePjzzfs&ou=' + $scope.selectedOrgUnitUid,
					success: function (data) {
						for (var o = 0; o < data.events.length; o++) {
							if (data.events[o].orgUnit != $scope.selectedOrgUnitUid) {
								tei = data.events[o].trackedEntityInstance;
								var psd = "";
								pdata = data.events[o];
								var ps = data.events[o].programStage;
								if (ps == "YRSdePjzzfs") { psd = "ART Follow-up"; }
								else {
									var psd = "";
									return;
								}

								var dataa = checkData(tei);
								if (dataa.events.length == 0) {
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
											var ouname = $scope.getOuName(pdata.orgUnit);
											var ouname2 = $scope.getOu(teidata.tei);
											if (teidata.orgUnit != ouname2) {
												ouname = $scope.getOuName(ouname2);
											}
											teidata.rf = ouname;
											filtered_data.push(teidata);
										}
									});
								}
								else {
									var tempOu = checkData2(tei);
									var teiou = checkteiData(tei);
									if ($scope.selectedOrgUnitUid == teiou && tempOu.events[0].length != 0){ }
									else{
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
											
											//var ouname2 = $scope.getOu(tempOu.events[0].orgUnit);
											var ouname = tempOu.events[0].orgUnitName;
											teidata.rf = ouname;
											filtered_data.push(teidata);
										}
									});
								}
								}
								$timeout(function () {
									$scope.filtered_teidata = filtered_data;
								});
							}
						}

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