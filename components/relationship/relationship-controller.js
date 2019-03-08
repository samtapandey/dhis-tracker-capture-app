/* global trackerCapture, angular */

var trackerCapture = angular.module('trackerCapture');
trackerCapture.controller('RelationshipController',
        function($scope,
                $rootScope,
                $modal,                
                $location,
                TEIService,
                AttributesFactory,
                CurrentSelection,
                RelationshipFactory,
                OrgUnitFactory,
                ProgramFactory,
                EnrollmentService,
				RegistrationService,
                ModalService,
                CommonUtils) {
    $rootScope.showAddRelationshipDiv = false;
    $scope.relatedProgramRelationship = false;
    var ENTITYNAME = "TRACKED_ENTITY_INSTANCE";
    var allPrograms = [];

    ProgramFactory.getAll().then(function(result) {
        allPrograms = result.programs;
    });
    
    //listen for the selected entity       
    $scope.$on('dashboardWidgets', function(event, args) { 
        $scope.relationshipTypes = []; 
        $scope.relationships = [];
        $scope.relatedTeisTo = [];
        $scope.relatedTeisFrom = [];
        $scope.selections = CurrentSelection.get();
        $scope.optionSets = $scope.selections.optionSets;
        $scope.selectedTei = angular.copy($scope.selections.tei);        
        $scope.attributesById = CurrentSelection.getAttributesById();

        $scope.relationshipPrograms = [];
        
        $scope.attributes = [];
        for(var key in $scope.attributesById){
            if($scope.attributesById.hasOwnProperty(key)){
                $scope.attributes.push($scope.attributesById[key]);
            }            
        }
        
        $scope.trackedEntityType = $scope.selections.te;
        $scope.selectedEnrollment = $scope.selections.selectedEnrollment;
        $scope.selectedProgram = $scope.selections.pr;
        $scope.programs = $scope.selections.prs;
        $scope.programsById = {};
        angular.forEach($scope.programs, function(program){
            $scope.programsById[program.id] = program;
        });
        
        RelationshipFactory.getAll().then(function(relTypes){
            //Supports only TEI-TEI of same type.
            $scope.relationshipTypes = relTypes.filter(function(relType){
                return relType.fromConstraint && relType.fromConstraint.relationshipEntity === ENTITYNAME
                    && relType.toConstraint.relationshipEntity === ENTITYNAME
                    && relType.fromConstraint.trackedEntityType && relType.fromConstraint.trackedEntityType.id === $scope.trackedEntityType.id;  
            });

            angular.forEach($scope.relationshipTypes, function(rel){
                $scope.relationships[rel.id] = rel;
            });

            setRelationships();
        });
        $scope.selectedOrgUnit = $scope.selections.orgUnit;
    });
    
    $scope.showAddRelationship = function(related) {
        $scope.relatedProgramRelationship = related;
        $rootScope.showAddRelationshipDiv = !$rootScope.showAddRelationshipDiv;
       
        if($rootScope.showAddRelationshipDiv){
            var modalInstance = $modal.open({
                templateUrl: 'components/teiadd/tei-add.html',
                controller: 'TEIAddController',
                windowClass: 'modal-full-window',
                resolve: {
                    relationshipTypes: function () {
                        return $scope.relationshipTypes;
                    },
                    selectedAttribute: function(){
                        return null;
                    },
                    existingAssociateUid: function(){
                        return null;
                    },
                    addingRelationship: function(){
                        return true;
                    },
                    selections: function () {
                        return $scope.selections;
                    },
                    selectedTei: function(){
                        return $scope.selectedTei;
                    },
                    selectedProgram: function(){
                        return $scope.selectedProgram;
                    },
                    relatedProgramRelationship: function(){
                        return $scope.relatedProgramRelationship;
                    },
                    allPrograms: function(){
                        return allPrograms;
                    }
                }
            });

            modalInstance.result.then(function (relationships) {
                $scope.selectedTei.relationships = relationships;                
                setRelationships();
            });
        }
    };
    
    $scope.removeRelationship = function(rel){
        
        var modalOptions = {
            closeButtonText: 'cancel',
            actionButtonText: 'delete',
            headerText: 'delete',
            bodyText: 'are_you_sure_to_delete_relationship'
        };

        ModalService.showModal({}, modalOptions).then(function(result){
            
            var index = -1;
            for(var i=0; i<$scope.selectedTei.relationships.length; i++){
                if($scope.selectedTei.relationships[i].relationship === rel.relId){
                    index = i;
                    break;
                }
            }

            if( index !== -1 ){
                $scope.selectedTei.relationships.splice(index,1);
                var trimmedTei = angular.copy($scope.selectedTei);
                angular.forEach(trimmedTei.relationships, function(rel){
                    delete rel.relative;
                });
                TEIService.update(trimmedTei, $scope.optionSets, $scope.attributesById).then(function(response){
                    if(!response || response.response && response.response.status !== 'SUCCESS'){//update has failed
                        return;
                    }
                    setRelationships();
                });
            }
        });        
    };
    
    $scope.showDashboard = function(teiId, program){    
        $location.path('/dashboard').search({tei: teiId, program: program, ou: $scope.selectedOrgUnit.id});
    };
    
	
	 //For Intpart

    // modal creation for household members...
    $scope.householdmembers = function (){
        $.ajaxSetup({
            async: false
            });
            var Table = document.getElementById("tablehouse");
            Table.innerHTML = "";
            var objhouse=[];
            var objattribute=[];
			var obj_type_house=[];
			var obj_family_member=[];
			var obj_family_unique_id=[];
			var obj_locality=[];
			var obj_anm_name=[];
			var housemember_religion=[];
			var obj_asha_name=[];
			var obj_religion=[];
			var obj_caste=[];
            var objtrack1=[];
			var housemember_obj_anm_name=[];
            var count=1;
			var housemember_locality=[];
			var obj_altertivenumber=[];
            var objatt=[];
            var namee=[];
            var adharnumber=[];
            var familyuniqueid=[];
			var alternative_housenumber=[];
            var sex=[];
            var dateofbirth=[];
            var maritalstatus=[];
            var housedetailss=["xalnzkNfD77","sQkCGHnMRYE","rad0NDmyYj8","nHR1zCU0maL","Dnm1mq6iq2d","PbEhJPnon0o","kelN057pfhq","zLsKdtlBCIx","yDCO4KM4WVA","MV4wWoZBrJS","ZmH0W6XHS9S"];
            // selct_date=document.getElementById('Start').value;
            var url = window.location.href;
                var params = url.split('=');
                var per =params[1];
                var finper=per.split('&');
            var trackid=finper[0];


                

            $.get("../api/trackedEntityInstances/"+trackid+".json?", function (data) {
                var trackdata=data;
                
                                
                    
                for(var q=0;q<trackdata.attributes.length;q++)
                        {
                
                    if(trackdata.attributes[q].attribute=="ZQMF7taSAw8")//house number
                    {
                    var housenumber=trackdata.attributes[q].value;
                    objhouse.push(housenumber);
                
                    }
					else if(trackdata.attributes[q].attribute=="dCer94znEuY")//Type of House
                    {
                    var typehouse=trackdata.attributes[q].value;
                    obj_type_house.push(typehouse);
                
                    }
					else if(trackdata.attributes[q].attribute=="FML9pARILz5")//Head of Family Member
                    {
                    var typehouse=trackdata.attributes[q].value;
                    obj_family_member.push(typehouse);
                
                    }
                    else if(trackdata.attributes[q].attribute=="uHv60gjn2gp")//Family unique id
                    {
                    var typehouse=trackdata.attributes[q].value;
                    obj_family_unique_id.push(typehouse);
                
                    }
                    else if(trackdata.attributes[q].attribute=="MV4wWoZBrJS")//Locality name
                    {
                    var typehouse=trackdata.attributes[q].value;
                    obj_locality.push(typehouse);
                
                    }
                    else if(trackdata.attributes[q].attribute=="yDCO4KM4WVA")//ANM name
                    {
                    var typehouse=trackdata.attributes[q].value;
                    obj_anm_name.push(typehouse);
                
                    }
                    else if(trackdata.attributes[q].attribute=="rnCEx9tSU3j")//ASHA name
                    {
                    var typehouse=trackdata.attributes[q].value;
                    obj_asha_name.push(typehouse);
                
                    }	
					 else if(trackdata.attributes[q].attribute=="rad0NDmyYj8")//Alternative house  name
                    {
                    var alternativenumber=trackdata.attributes[q].value;
                    obj_altertivenumber.push(alternativenumber);
                
                    }
                  else if(trackdata.attributes[q].attribute=="ZmH0W6XHS9S")//Religion
                    {
                    var typehouse=trackdata.attributes[q].value;
                    obj_religion.push(typehouse);
                
                    }	
                   else if(trackdata.attributes[q].attribute=="vbUue5poEcT")//Caste
                    {
                    var typehouse=trackdata.attributes[q].value;
                    obj_caste.push(typehouse);
                
                    }						
                    }		      
                    

                        }); 
                        //api/trackedEntityInstances.json?ou=lZtSBQjZCaX&program=TcaMMqHJxK5&filter=YFjB0zhySP6:EQ:3509,dCer94znEuY:EQ:B2&skipPaging=true
            $.get("../api/trackedEntityInstances.json?ou=lZtSBQjZCaX&program=TcaMMqHJxK5&filter=YFjB0zhySP6:EQ:"+objhouse[0]+",dCer94znEuY:EQ:"+obj_type_house[0]+"&skipPaging=true", function (data1) {

                var trackkdata=data1;
                
                                for(var i=0;i<trackkdata.trackedEntityInstances.length;i++)
                    {
            
                var attributepath=trackkdata.trackedEntityInstances[i].attributes; 
                for(var q=0;q<attributepath.length;q++)
                        {
                        
                    if(attributepath[q].displayName=="Household")
                    {
                    var aa=attributepath[q].value;
                    if(objhouse[0]==aa)
                    {
                    
                    var track1= trackkdata.trackedEntityInstances[i].trackedEntityInstance;
                        
                        objtrack1.push(track1);
                        
                    
                        }
                    }
                    
                        
                        }
                        }
                    
                    
                        
                    }); 
                    
            for(var x=0;x<objtrack1.length;x++)
            {
            var url1=  "../api/trackedEntityInstances/"+objtrack1[x]+".json?";
            $.get(url1, function (data1) {
                
                var trackdata=data1;
                        
                    
                    for(var q=0;q<trackdata.attributes.length;q++)
                        {
                        var idd =trackdata.attributes[q].attribute;
                        objatt.push(idd);
                    if(trackdata.attributes[q].attribute=="xalnzkNfD77")//name of family member
                    {
                    
                    var aa=trackdata.attributes[q].value;
					
                    namee.push(aa);
                    
                    }
                    else if(trackdata.attributes[q].attribute=="nHR1zCU0maL")  //adhar number
                    {
                    
                    var aa=trackdata.attributes[q].value;
                    adharnumber.push(aa);
                    
                    }
                   else if(trackdata.attributes[q].attribute=="Dnm1mq6iq2d")//family unique id
                    {
                    
                    var aa=trackdata.attributes[q].value;
                    familyuniqueid.push(aa);
                    
                    }
                   else if(trackdata.attributes[q].attribute=="PbEhJPnon0o")//sex
                    {
                    
                    var aa=trackdata.attributes[q].value;
                    sex.push(aa);
                    
                    }
					 else if(trackdata.attributes[q].attribute=="MV4wWoZBrJS")//locality
                    {
                    
                    var aa=trackdata.attributes[q].value;
                    
					//---auto saving--
						if(aa==obj_locality[0]){
                    housemember_locality.push(aa);
					}
				else 
				{
					trackdata.attributes[q].value=obj_locality[0];
                    RegistrationService.registerOrUpdate(trackdata,$scope.optionSets, $scope.attributesById).then(function(response){
                        if (response.response.status == "SUCCESS"){  
							return;
                        } 
                    });
				}
					
					//>>>>>>>>>>>>>>>>>>>>>>>>>>>
                    
                    }
                   else if(trackdata.attributes[q].attribute=="kelN057pfhq")//date of birth
                    {
                    
                    var aa=trackdata.attributes[q].value;
                        dateofbirth.push(aa);
                    
                    }
                   else if(trackdata.attributes[q].attribute=="zLsKdtlBCIx")//marital status   
                    {
                    
                    var aa=trackdata.attributes[q].value;
                    maritalstatus.push(aa);
                    
                    }
					 else if(trackdata.attributes[q].attribute=="ZmH0W6XHS9S")//Religion   
                    {
                    
                    var aa=trackdata.attributes[q].value;
                   
						if(aa==obj_religion[0]){
                    housemember_religion.push(aa);
					}
				else 
				{
					trackdata.attributes[q].value=obj_religion[0];
                    RegistrationService.registerOrUpdate(trackdata,$scope.optionSets, $scope.attributesById).then(function(response){
                        if (response.response.status == "SUCCESS"){  
							return;
                        } 
                    });
				}
				
				
                    
                    }
					else if(trackdata.attributes[q].attribute=="rad0NDmyYj8")//Alternative house number   
                    {
                    
                    var aa=trackdata.attributes[q].value;
                   
						if(aa==obj_altertivenumber[0]){
                    alternative_housenumber.push(aa);
					}
				else 
				{
					trackdata.attributes[q].value=obj_altertivenumber[0];
                    RegistrationService.registerOrUpdate(trackdata,$scope.optionSets, $scope.attributesById).then(function(response){
                        if (response.response.status == "SUCCESS"){  
							return;
                        } 
                    });
				}
				
				
                    
                    }
                   else if(trackdata.attributes[q].attribute==="yDCO4KM4WVA")//ANM name
                    {
                    var aa=trackdata.attributes[q].value;
					//---auto saving--
					if(aa==obj_anm_name[0]){
                    housemember_obj_anm_name.push(aa);
					}
				else 
				{
					trackdata.attributes[q].value=obj_anm_name[0];
                    RegistrationService.registerOrUpdate(trackdata,$scope.optionSets, $scope.attributesById).then(function(response){
                        if (response.response.status == "SUCCESS"){  
							return;
                        } 
                    });
				}
				//>>>>>>>>>>>>>>>>>>>>>>>>
                    }
                
                        

                    }
					
					var tei_value_anm = {
              attribute: "yDCO4KM4WVA",
			  created: "2018-06-08T12:18:52.971",
			  displayName: "ANM name",
			  lastUpdated: "2018-06-08T12:18:52.971",
			  storedBy: "dilroop",
			  value: obj_anm_name[0],
			  valueType: "TEXT"
                };
                    var tei_value_locality=	{
              attribute: "MV4wWoZBrJS",
			  created: "2018-06-08T12:18:52.971",
			  displayName: "Locality name",
			  lastUpdated: "2018-06-08T12:18:52.971",
			  storedBy: "dilroop",
			  value: obj_locality[0],
			  valueType: "TEXT"
                };
				   var tei_value_lalternativenumber= {
              attribute: "rad0NDmyYj8",
			  created: "2018-06-08T12:18:52.971",
			  displayName: "Alternative House Number",
			  lastUpdated: "2018-06-08T12:18:52.971",
			  storedBy: "dilroop",
			  value: obj_altertivenumber[0],
			  valueType: "TEXT"
                };
			
                    var array3 = housedetailss.filter(function(obj) { return objatt.indexOf(obj) == -1; });
                    for(var t=0;t<array3.length;t++)
                        {
                        if(array3[t]=="xalnzkNfD77")
                        namee.push("NA");
                        else if(array3[t]=="nHR1zCU0maL")
                        adharnumber.push("NA");
                        else if(array3[t]=="Dnm1mq6iq2d")
                        familyuniqueid.push("NA");
                        else if(array3[t]=="PbEhJPnon0o")
                        sex.push("NA");
                        else if(array3[t]=="kelN057pfhq")
                        dateofbirth.push("NA");
                        else if(array3[t]=="zLsKdtlBCIx")
                        maritalstatus.push("NA");
                        else if(array3[t]=="yDCO4KM4WVA"){
                        //housemember_obj_anm_name.push("NA");  
						trackdata.attributes.push(tei_value_anm);
                    RegistrationService.registerOrUpdate(trackdata,$scope.optionSets, $scope.attributesById).then(function(response){
                        if (response.response.status == "SUCCESS"){  
							return;
                        } 
                    });
						}
					   else if(array3[t]=="MV4wWoZBrJS"){
                       // housemember_locality.push("NA");
					   	trackdata.attributes.push(tei_value_locality);
                    RegistrationService.registerOrUpdate(trackdata,$scope.optionSets, $scope.attributesById).then(function(response){
                        if (response.response.status == "SUCCESS"){  
							return;
                        } 
                    });
					   }
					    else if(array3[t]=="rad0NDmyYj8"){
                       // Alternative house number
					   	trackdata.attributes.push(tei_value_lalternativenumber);
                    RegistrationService.registerOrUpdate(trackdata,$scope.optionSets, $scope.attributesById).then(function(response){
                        if (response.response.status == "SUCCESS"){  
							return;
                        } 
                    });
					   }
					 else if(array3[t]=="ZmH0W6XHS9S"){
                        housemember_religion.push("NA");
					
					 }
                        }
                        
                            objatt=[];
                        
                    });
                    }
                    var tabl2="<tr style='border:1px solid black;background-color:#fff2cc;height:30px'> <td ><b>S.No</b><td>	<b>Individual Name	</b>	<td><b>	Aadhaar ID	</b></td>	<td>	<b>Individual Health ID </b></td><td><b>Sex</b></td><td><b>Date of Birth</b></td><td><b>ANM Name</b></td><td><b>Locality</b></td><td><b>Religion</b></td><tr>";
                    $(".reporthouse").append(tabl2);
                    
                    for(var p=0;p<objtrack1.length;p++)
                        {
                var group ="<tr style='border:1px solid black;background-color:white;height:30px'><td style= 'text-align:center' >"+count+"</td> <td style= 'text-align:center'>" +namee[p]+ "</td><td style= 'text-align:center'  >" +adharnumber[p] + "</td> <td style= 'text-align:center' >"+familyuniqueid[p]+" </td> <td style= 'text-align:center'>" +sex[p]+ "</td> <td style= 'text-align:center'>"+dateofbirth[p]+"</td><td style= 'text-align:center'>"+housemember_obj_anm_name[p]+"</td><td style= 'text-align:center'>"+housemember_locality[p]+"</td><td style= 'text-align:center'>"+housemember_religion[p]+"</td></tr>";
                
                
                    $(".reporthouse").append(group);
                    count++;
                    }
                    
                    $("#myModalhouse").modal();
            }
	
	
    var setRelationships = function(){
        $scope.relatedTeisTo = [];
        $scope.relatedTeisFrom = [];
        $scope.relationshipPrograms = [];
        var relationshipProgram = {};
        //Loop through all relationships.      
        angular.forEach($scope.selectedTei.relationships, function(rel){
            if(rel.to && rel.to.trackedEntityInstance && rel.to.trackedEntityInstance.trackedEntityInstance !== $scope.selectedTei.trackedEntityInstance){  
                var teiId = rel.to.trackedEntityInstance.trackedEntityInstance;
                var relName = rel.relationshipName;
                TEIService.get(teiId, $scope.optionSets, $scope.attributesById).then(function(tei){
                    relationshipProgram = $scope.relationshipTypes.find(function(relType) { return relType.id === rel.relationshipType }).toConstraint.program;
                    if(!relationshipProgram && $scope.selectedProgram) {
                        relationshipProgram = {id: $scope.selectedProgram.id};
                    }
                    var relative = {trackedEntityInstance: teiId, relName: relName, relId: rel.relationship, attributes: getRelativeAttributes(tei.attributes), relationshipProgramConstraint: relationshipProgram};            
                    $scope.relatedTeisTo.push(relative);
                });
            } else if(rel.from && rel.from.trackedEntityInstance && rel.from.trackedEntityInstance.trackedEntityInstance !== $scope.selectedTei.trackedEntityInstance){  
                var teiId = rel.from.trackedEntityInstance.trackedEntityInstance;
                var relName = rel.relationshipName;
                TEIService.get(teiId, $scope.optionSets, $scope.attributesById).then(function(tei){
                    relationshipProgram = $scope.relationshipTypes.find(function(relType) { return relType.id === rel.relationshipType }).fromConstraint.program;
                    if(!relationshipProgram && $scope.selectedProgram) {
                        relationshipProgram = {id: $scope.selectedProgram.id};
                    }
                    var relative = {trackedEntityInstance: teiId, relName: relName, relId: rel.relationship, attributes: getRelativeAttributes(tei.attributes), relationshipProgramConstraint: relationshipProgram};            
                    $scope.relatedTeisFrom.push(relative);
                });
            }
        });

        var selections = CurrentSelection.get();
        CurrentSelection.set({tei: $scope.selectedTei, te: $scope.trackedEntityType, prs: selections.prs, pr: $scope.selectedProgram, prNames: selections.prNames, prStNames: selections.prStNames, enrollments: selections.enrollments, selectedEnrollment: $scope.selectedEnrollment, optionSets: selections.optionSets, orgUnit:selections.orgUnit});
    };
    
    var getRelativeAttributes = function(teiAttributes){
        var attributes = {};
        teiAttributes.forEach(function(attr){
            if(attr.attribute && $scope.attributesById[attr.attribute]){
                attr.value = CommonUtils.formatDataValue(null, attr.value, $scope.attributesById[attr.attribute], $scope.optionSets, 'USER');
            }
            attributes[attr.attribute] = attr.value;
        });
        return attributes;
    };

    //Function for getting all attributeIDs that a specific program has.
    var getProgramAttributes = function(attributeArray) {
        var programAttributes = [];

        angular.forEach(attributeArray, function(attribute){
            programAttributes.push(attribute.trackedEntityAttribute.id);
        });

        return programAttributes;
    };
});