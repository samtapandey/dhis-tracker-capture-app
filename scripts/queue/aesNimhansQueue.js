/* global trackerCapture, angular */
	
	var trackerCaptureaesNimhans = angular.module('trackerCapture');
	trackerCaptureaesNimhans.controller('aesNimhansQueueController', ["$rootScope", "$scope", "$timeout", "$location", "SessionStorageService", "CurrentSelection", function ($rootScope, $scope, $timeout, $location, SessionStorageService, CurrentSelection) {
	
		var ouid2 = SessionStorageService.get('ouSelected');
		var selections = CurrentSelection.get();
		selection.load();
	
		debugger;
		$scope.goToDashboard = function (evv) {
			evv.clicked = true;
			var base = location.protocol + '//' + location.host + "/dhis"; //+window.location.pathname;
			$location.path('/dashboard').search({ tei: evv.tei,
				program: "a9cQSlDVI2n",
				//  ou: "CPtzIhyn36z",
				ou: ouid2,
				queue: true,
				from: 'aesnimhans' });
			// $window.open(base+'/dhis-web-tracker-capture/index.html#/dashboard?tei='+ev.tei+'&program=a9cQSlDVI2n&ou=CPtzIhyn36z'+$scope.ouId, '_blank');
		};
	
		$scope.loadQueue2 = function () {
			var filtered_events2 = [];
			$.getJSON('../api/sqlViews/FLGWuDTFkKm/data.json?var=orgunit:' + ouid2, function (response) {
	
				var events2 = response.rows;
				var sampleCollectedFlag = false;
				for (var i = 0; i < response.rows.length; i++) {
					sampleCollectedFlag = false;
					events2[i].tei = response.rows[i][0];
					events2[i].date = response.rows[i][1];
					events2[i].district = response.rows[i][2];
					events2[i].aesid = response.rows[i][3];
					events2[i].nid = response.rows[i][4];
					events2[i].name = response.rows[i][5];
					events2[i].age = response.rows[i][6];
					events2[i].result1 = response.rows[i][11];
					events2[i].result2 = response.rows[i][12];
					events2[i].result3 = response.rows[i][13];
					events2[i].result4 = response.rows[i][14];
					events2[i].result5 = response.rows[i][15];
					events2[i].result6 = response.rows[i][16];
	
					if (response.rows[i][8] != "") {
						events2[i].sampleReceivedCSF = "Yes";
					} else {
						events2[i].sampleReceivedCSF = "No";
					}
					if (response.rows[i][9] != "") {
						events2[i].sampleReceivedSERUM = "Yes";
					} else {
						events2[i].sampleReceivedSERUM = "No";
					}
					if (response.rows[i][10] != "") {
						events2[i].sampleReceivedWB = "Yes";
					} else {
						events2[i].sampleReceivedWB = "No";
					}
					filtered_events2.push(events2[i]);
				}
	
				$timeout(function () {
					$scope.queueEvents2 = filtered_events2;
				});
			});
		};
	
		$scope.loadQueue2();
	
		$scope.$watch('selectedOrgUnit', function () {
			$scope.loadQueue2();
		});
	}]);