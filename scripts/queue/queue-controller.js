/* global trackerCapture, angular */

var trackerCapture = angular.module('trackerCapture');
trackerCapture.controller('QueueController',
                          function($rootScope,
                                   $scope,
                                   $timeout,$location,SessionStorageService,CurrentSelection
                                  ) {



                              var ouid = SessionStorageService.get('ouSelected');
                              var selections = CurrentSelection.get();
                              selection.load();

                              debugger
                              $scope.goToDashboard = function(ev){
                                  ev.clicked=true;
                                  var base = location.protocol + '//' + location.host+"/dhis";//+window.location.pathname;
                                  $location.path('/dashboard').search({tei: ev.tei,
                                                                       program: "a9cQSlDVI2n",
                                                                       //  ou: "CPtzIhyn36z",
                                                                       ou:ouid ,                        
                                                                       queue:true});
                                  // $window.open(base+'/dhis-web-tracker-capture/index.html#/dashboard?tei='+ev.tei+'&program=a9cQSlDVI2n&ou=CPtzIhyn36z'+$scope.ouId, '_blank');

                              }
                              
                              $scope.loadQueue = function(){
                                  var filtered_events = [];
                                  $.getJSON('../api/sqlViews/eUtAa9bQ0rE/data.json?var=orgunit:'+ouid,function(response){
				      
				      var events = response.rows;
                                      var sampleCollectedFlag = false;
				      console.log(response);
				      for(var i=0;i<response.rows.length;i++){
                                          sampleCollectedFlag = false;
				          events[i].tei = response.rows[i][0];
				          events[i].aesid = response.rows[i][1];
				          events[i].nid = response.rows[i][2];
				          events[i].name = response.rows[i][3];
				          events[i].age = response.rows[i][4];
				          if(response.rows[i][6]=="true"){events[i].csfc = "./images/tick.png";
                                                                         sampleCollectedFlag = true;
                                                                         }
				          else{events[i].csfc = "./images/cross.png";}
				          
				          if(response.rows[i][8]=="true"){events[i].serumc = "./images/tick.png";
                                                                          sampleCollectedFlag = true;
                                                                         }
				          else{events[i].serumc = "./images/cross.png";}
				          
				          if(response.rows[i][10]=="true"){events[i].wbc = "./images/tick.png";
                                                                           sampleCollectedFlag = true;
                                                                           
                                                                          }
				          else{events[i].wbc = "./images/cross.png";}
				          
				          if(response.rows[i][11]==""){events[i].csfwbcc = "./images/cross.png";}
				          else{events[i].csfwbcc = "./images/tick.png";}
				          
				          if(response.rows[i][12]==""){events[i].csfje = "./images/cross.png";}
				          else{events[i].csfje = "./images/tick.png";}
				          
				          if(response.rows[i][13]==""){events[i].csfg = "./images/cross.png";}
				          else{events[i].csfg = "./images/tick.png";}
				          
				          if(response.rows[i][14]==""){events[i].csfp = "./images/cross.png";}
				          else{events[i].csfp = "./images/tick.png";}
				          
				          if(response.rows[i][15]==""){events[i].csfwbcc2 = "./images/cross.png";}
				          else{events[i].csfwbcc2 = "./images/tick.png";}
				          
				          if(response.rows[i][16]==""){events[i].csfje2 = "./images/cross.png";}
				          else{events[i].csfje2 = "./images/tick.png";}
				          
				          if(response.rows[i][17]==""){events[i].serumje = "./images/cross.png";}
				          else{events[i].serumje = "./images/tick.png";}
				          
				          if(response.rows[i][18]==""){events[i].serumig = "./images/cross.png";}
				          else{events[i].serumig = "./images/tick.png";}
				          
				          if(response.rows[i][19]==""){events[i].serumsti = "./images/cross.png";}
				          else{events[i].serumsti = "./images/tick.png";}
				          
                                          if (sampleCollectedFlag){
				          filtered_events.push(events[i])
                                          }
				      }
				      
				      
                                      $timeout(function(){
                                          $scope.queueEvents = filtered_events;
                                      })
                                  });
                              }

                              $scope.loadQueue();

                              $scope.$watch('selectedOrgUnit', function() {
                                  $scope.loadQueue();


                              });
                          });
