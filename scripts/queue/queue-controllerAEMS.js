/* global trackerCapture, angular */
	
	var trackerCaptureAEMS = angular.module('trackerCapture');
	trackerCaptureAEMS.controller('QueueControllerAEMS', ["$rootScope", "$scope", "$timeout", "$location", "SessionStorageService", "CurrentSelection", function ($rootScope, $scope, $timeout, $location, SessionStorageService, CurrentSelection) {
	
					var ouid = SessionStorageService.get('ouSelected');
					var selections = CurrentSelection.get();
					selection.load();
	
					debugger;
					$scope.goToDashboard = function (ev) {
									ev.clicked = true;
									var base = location.protocol + '//' + location.host + "/dhis"; //+window.location.pathname;
									$location.path('/dashboard').search({ tei: ev.tei,
													program: "eV13Hfo7qiv",
													//  ou: "CPtzIhyn36z",
													ou: ouid,
													queue: true,
													from:'amesdistrict'
													});
									// $window.open(base+'/dhis-web-tracker-capture/index.html#/dashboard?tei='+ev.tei+'&program=a9cQSlDVI2n&ou=CPtzIhyn36z'+$scope.ouId, '_blank');
					};
	
					$scope.loadQueue = function () {
									var filtered_events = [];
									$.getJSON('../api/sqlViews/Wnhqk54gvnw/data.json?var=orgunit:' + ouid, function (response) {
	
													var events = response.rows;
													var sampleCollectedFlag = false;
													for (var i = 0; i < response.rows.length; i++) {
																	sampleCollectedFlag = false;
																	events[i].tei = response.rows[i][0];
																	events[i].date = response.rows[i][1];
																	events[i].district = response.rows[i][2];
																	events[i].aesid = response.rows[i][3];
																	events[i].nid = response.rows[i][4];
																	events[i].name = response.rows[i][5];
																	events[i].age = response.rows[i][6];
																	events[i].csfc = response.rows[i][8];
																	events[i].csfs = response.rows[i][9];
																	events[i].serumc = response.rows[i][10];
																	events[i].serums = response.rows[i][11];
																	events[i].wbc = response.rows[i][12];
																	events[i].wbs = response.rows[i][13];
																	events[i].csfwbcc = response.rows[i][14];
																	events[i].csfje = response.rows[i][15];
																	events[i].csfg = response.rows[i][16];
																	events[i].csfp = response.rows[i][17];
																	events[i].serumje = response.rows[i][18];
																	events[i].serumige = response.rows[i][19];
																	events[i].dnsr = response.rows[i][20];
																	events[i].dnse = response.rows[i][21];
																	events[i].serumstie = response.rows[i][22];
																	if (response.rows[i][8] != "") {
																					events[i].csfc = "Yes";
																	} else {
																					events[i].csfc = "No";
																	}
																	if (response.rows[i][9] != "") {
																					events[i].csfs = "Yes";
																	} else {
																					events[i].csfs = "No";
																	}
																	if (response.rows[i][10] != "") {
																					events[i].serumc = "Yes";
																	} else {
																					events[i].serumc = "No";
																	}
																	if (response.rows[i][11] != "") {
																					events[i].serums = "Yes";
																	} else {
																					events[i].serums = "No";
																	}
																	if (response.rows[i][12] != "") {
																					events[i].wbc = "Yes";
																	} else {
																					events[i].wbc = "No";
																	}
																	if (response.rows[i][13] != "") {
																					events[i].wbs = "Yes";
																	} else {
																					events[i].wbs = "No";
																	}
																	filtered_events.push(events[i]);
													}
	
													$timeout(function () {
																	$scope.queueEvents = filtered_events;
													});
									});
					};
	
					$scope.loadQueue();
	
					$scope.$watch('selectedOrgUnit', function () {
									$scope.loadQueue();
					});
	}]);
