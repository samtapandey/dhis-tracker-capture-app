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
                ModalService,
                CommonUtils) {
    $rootScope.showAddRelationshipDiv = false;
    $scope.relatedProgramRelationship = false;
    
    //listen for the selected entity       
    $scope.$on('dashboardWidgets', function(event, args) { 
        $scope.relationshipTypes = []; 
        $scope.relationships = [];
        $scope.relatedTeis = [];
        $scope.selections = CurrentSelection.get();
        $scope.optionSets = $scope.selections.optionSets;
        $scope.selectedTei = angular.copy($scope.selections.tei);        
        $scope.attributesById = CurrentSelection.getAttributesById();
        
        $scope.attributes = [];
        for(var key in $scope.attributesById){
            if($scope.attributesById.hasOwnProperty(key)){
                $scope.attributes.push($scope.attributesById[key]);
            }            
        }
        
        $scope.trackedEntity = $scope.selections.te;
        $scope.selectedEnrollment = $scope.selections.selectedEnrollment;
        $scope.selectedProgram = $scope.selections.pr;
        $scope.programs = $scope.selections.pr;
        
        RelationshipFactory.getAll().then(function(rels){
            $scope.relationshipTypes = rels;    
            angular.forEach(rels, function(rel){
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
    
    $scope.showDashboard = function(teiId, relId){
        
        var dashboardProgram = null;
        
        if($scope.selectedProgram && $scope.selectedProgram.relationshipType){
            if($scope.selectedProgram.relationshipType.id === relId && $scope.selectedProgram.relatedProgram ){
                dashboardProgram = $scope.selectedProgram.relatedProgram.id;
            }
        }        
    
        $location.path('/dashboard').search({tei: teiId, program: dashboardProgram, ou: $scope.selectedOrgUnit.id}); 
    };
	// modal creation for household members...
     $scope.householdmembers = function (){
		  	 $.ajaxSetup({
        async: false
    });
		var Table = document.getElementById("tablehouse");
        Table.innerHTML = "";
var objhouse=[];
var objattribute=[];
var objtrack1=[];
 var count=1;
 var objatt=[];
	    var namee=[];
		var adharnumber=[];
		var familyuniqueid=[];
		var sex=[];
		var dateofbirth=[];
		var maritalstatus=[];
		var housedetailss=["xalnzkNfD77","nHR1zCU0maL","Dnm1mq6iq2d","PbEhJPnon0o","kelN057pfhq","zLsKdtlBCIx"];
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
				  }		      
				  

				   }); 
				   
		$.get("../api/trackedEntityInstances.json?ou=lZtSBQjZCaX&program=TcaMMqHJxK5&filter=YFjB0zhySP6:EQ:"+objhouse[0]+"&skipPaging=true", function (data1) {
	
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
				if(trackdata.attributes[q].attribute=="nHR1zCU0maL")  //adhar number
				{
				
				var aa=trackdata.attributes[q].value;
				adharnumber.push(aa);
				
				}
				if(trackdata.attributes[q].attribute=="Dnm1mq6iq2d")//family unique id
				{
				
				var aa=trackdata.attributes[q].value;
				familyuniqueid.push(aa);
				
				}
				if(trackdata.attributes[q].attribute=="PbEhJPnon0o")//sex
				{
				
				var aa=trackdata.attributes[q].value;
				sex.push(aa);
				
				}
				if(trackdata.attributes[q].attribute=="kelN057pfhq")//date of birth
				{
				
				var aa=trackdata.attributes[q].value;
			         dateofbirth.push(aa);
				
				}
				if(trackdata.attributes[q].attribute=="zLsKdtlBCIx")//marital status
				{
				
				var aa=trackdata.attributes[q].value;
				maritalstatus.push(aa);
				
				}
				
			
					 

				 }
				 
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
					
					}
					
				 		objatt=[];
				   
				  });
				  }
				  var tabl2="<tr style='border:1px solid black;background-color:#fff2cc;height:30px'> <td ><b>S.No</b><td>	<b>Individual Name	</b>	<td><b>	Aadhaar ID	</b></td>	<td>	<b>Individual Health ID </b></td><td><b>Sex</b></td><td><b>Date of Birth</b></td><tr>";
				 $(".reporthouse").append(tabl2);
				 
				 for(var p=0;p<objtrack1.length;p++)
					{
			var group ="<tr style='border:1px solid black;background-color:white;height:30px'><td style= 'text-align:center' >"+count+"</td> <td style= 'text-align:center'>" +namee[p]+ "</td><td style= 'text-align:center'  >" +adharnumber[p] + "</td> <td style= 'text-align:center' >"+familyuniqueid[p]+" </td> <td style= 'text-align:center'>" +sex[p]+ "</td> <td style= 'text-align:center'>"+dateofbirth[p]+"</td></tr>";
             
			
			    $(".reporthouse").append(group);
				count++;
				}
				
				$("#myModalhouse").modal();
			 
		 
		 
		 
		 
	 }
    var setRelationships = function(){
        $scope.relatedTeis = [];
        angular.forEach($scope.selectedTei.relationships, function(rel){
            var teiId = rel.trackedEntityInstanceA;
            var relName = $scope.relationships[rel.relationship].aIsToB;
            if($scope.selectedTei.trackedEntityInstance === rel.trackedEntityInstanceA){
                teiId = rel.trackedEntityInstanceB;
                relName = $scope.relationships[rel.relationship].bIsToA;
            }
            var relative = {trackedEntityInstance: teiId, relName: relName, relId: rel.relationship, attributes: getRelativeAttributes(rel)};            
            $scope.relatedTeis.push(relative);
        });
        
        var selections = CurrentSelection.get();
        CurrentSelection.set({tei: $scope.selectedTei, te: $scope.selectedTei.trackedEntity, prs: selections.prs, pr: $scope.selectedProgram, prNames: selections.prNames, prStNames: selections.prStNames, enrollments: selections.enrollments, selectedEnrollment: $scope.selectedEnrollment, optionSets: selections.optionSets, orgUnit:selections.orgUnit});       
    };
    
    var getRelativeAttributes = function(tei){
        
        var attributes = {};
        
        if(tei && tei.relative && tei.relative.attributes && !tei.relative.processed){
            angular.forEach(tei.relative.attributes, function(att){                
                if( att.attribute && $scope.attributesById[att.attribute] ){
                    att.value = CommonUtils.formatDataValue(null, att.value, $scope.attributesById[att.attribute], $scope.optionSets, 'USER');                
                }                
                attributes[att.attribute] = att.value;
            });
        }
        
        if(tei && tei.relative && tei.relative.processed){
            attributes = tei.relative.attributes;
        }
        
        return attributes;
    };
});