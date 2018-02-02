/* global trackerCapture, angular */

var trackerCapture = angular.module('trackerCapture');
trackerCapture.controller('ProfileController',
    function ($rootScope,
        $scope,
        $timeout,
        CurrentSelection) {
        $scope.editingDisabled = true;
        $scope.enrollmentEditing = false;
        $scope.widget = 'PROFILE';
        $scope.gynaecologistPBR = "Gynaecologist - PBR monitoring";
        $scope.anaesthetistPBR = "Anaesthetist - PBR monitoring";
        $scope.paediatricPBR = "Paediatric - PBR monitoring";
        //listen for the selected entity
        var selections = {};
        $scope.$on('dashboardWidgets', function (event, args) {
            listenToBroadCast();
        });

        //listen to changes in profile
        $scope.$on('profileWidget', function (event, args) {
            listenToBroadCast();
        });

        //listen to changes in enrollment editing
        $scope.$on('enrollmentEditing', function (event, args) {
            $scope.enrollmentEditing = args.enrollmentEditing;
        });

        var listenToBroadCast = function () {
            $scope.editingDisabled = true;
            selections = CurrentSelection.get();
            $scope.selectedTei = angular.copy(selections.tei);
            $scope.trackedEntity = selections.te;
            $scope.selectedProgram = selections.pr;
            $scope.selectedEnrollment = selections.selectedEnrollment;
            $scope.optionSets = selections.optionSets;
            $scope.trackedEntityForm = null;
            $scope.customForm = null;
            $scope.attributesById = CurrentSelection.getAttributesById();

            //display only those attributes that belong to the selected program
            //if no program, display attributesInNoProgram        
            angular.forEach($scope.selectedTei.attributes, function (att) {
                $scope.selectedTei[att.attribute] = att.value;
            });

            $timeout(function () {
                $rootScope.$broadcast('registrationWidget', { registrationMode: 'PROFILE', selectedTei: $scope.selectedTei, enrollment: $scope.selectedEnrollment });
            });

            $.ajax({
                type: "GET",
                dataType: "json",
                async: false,
                contentType: "application/json",
                url: '../api/me.json',
                success: function (response) {
                    $scope.matchUsername = response.userCredentials.username;
                }
            });
            $scope.selectedEntityinstance = CurrentSelection.currentSelection.tei.attributes;
            for (var i = 0; i < $scope.selectedEntityinstance.length; i++) {
                if ($scope.selectedEntityinstance[i].displayName === "User") {
                    $scope.selectedUserName = $scope.selectedEntityinstance[i].value;
                }
            }
        };
        $scope.editProfile = function () {
            if (CurrentSelection.currentSelection.pr.displayName == $scope.gynaecologistPBR || CurrentSelection.currentSelection.pr.displayName == $scope.anaesthetistPBR || CurrentSelection.currentSelection.pr.displayName == $scope.paediatricPBR) {
                if ($scope.matchUsername === $scope.selectedUserName) {
                    return true
                }
                else {
                    return false
                }
            }
            else {
                return true
            }
        }
        $scope.enableEdit = function () {
            $scope.teiOriginal = angular.copy($scope.selectedTei);
            $scope.editingDisabled = !$scope.editingDisabled;
            $rootScope.profileWidget.expand = true;
        };

        $scope.cancel = function () {
            $scope.selectedTei = $scope.teiOriginal;
            $scope.editingDisabled = !$scope.editingDisabled;
            $timeout(function () {
                $rootScope.$broadcast('registrationWidget', { registrationMode: 'PROFILE', selectedTei: $scope.selectedTei, enrollment: $scope.selectedEnrollment });
            }, 600);
        };
    });