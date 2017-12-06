
///added for labour clinic graph 

var graphplotter = angular.module('trackerCapture');

graphplotter.controller('graphController',
    function($rootScope,$scope){
        

         $rootScope.refreshGraph = function(currentEvent){
            
            $rootScope.chart = new Highcharts.chart('graphcontainer', {
                
                
                            title: {
                            text: 'Labour Details'
                            },
                            tooltip:{
                                formatter: function() {
                                    return 'The value is <b>' + this.y + '</b>, in series '+ this.series.name;
                                }
                            },  
                            yAxis: {
                                title: {
                                    text: 'Cervical dilation (cm)'
                                },
                                min : 4,
                                max : 10
                            },
                            xAxis: {
                                title: {
                                    text: 'Duration (in hrs)'
                                },
                                min : 0,
                                max : 10
                            },
                            legend: {
                                layout: 'vertical',
                                align: 'right',
                                verticalAlign: 'middle'
                            },
                
                            plotOptions: {
                                series: {
                                    label: {
                                        connectorAllowed: false
                                    },
                                    pointStart: 0
                                }
                            },
                
                            series: [
                            {
                                name: 'Data',
                                data: []
                            },
                            {
                                type: 'arearange',
                                name: 'Alert Line',
                                data: [[0,10,4],[4,10,10]],
                                
                            },
                             
                            {
                                type: 'area',
                                name: 'Action Line',
                                data: [[4,4],[10,10]]
                            }
                            ],
                
                            responsive: {
                            rules: [{
                                condition: {
                                    maxWidth: 500
                                },
                                chartOptions: {
                                    legend: {
                                        layout: 'horizontal',
                                        align: 'center',
                                        verticalAlign: 'bottom'
                                    }
                                }
                            }]
                            }
                        });
            
            // var dataElementsInOrder = ['FmVJzYVDVcz','pVowz22vGbF','AXFTeswZfLi','WBgaNvjJYrE'
            // ,'J2MElelRH9p','HNpSco5aovr','ThVQ8cJuMw5','AMS7Bj0pVX9'
            // ,'c6F35sCSFV3','Aqr0MvXJ0Zz']

            var dataElementsInOrder = [
                ['VEBl8LyIilQ', 'FmVJzYVDVcz'],
                ['epVofEFHmRZ', 'pVowz22vGbF'],
                ['LSGPziwH7yq',	'AXFTeswZfLi'],
                ['jX947N9qqXB',	'WBgaNvjJYrE'],
                ['SzVB5GT6prJ',	'HNpSco5aovr'],
                ['MAH4sUdMP3t',	'ThVQ8cJuMw5'],
                ['fFtRXroQja2', 'AMS7Bj0pVX9'],
                ['Ctu2UFjMSYC', 'c6F35sCSFV3'],
                ['Rjg6ET2Odna', 'J2MElelRH9p'],
                ['Peq77iP5YTW', 'Aqr0MvXJ0Zz']
            ];
            $rootScope.dataforGraph = []; 
            $scope.startingvalue = 0;
            for(var elementIdKey in dataElementsInOrder){
                var mappedobject = dataElementsInOrder[elementIdKey];
                if(currentEvent[mappedobject[0]] && currentEvent[mappedobject[1]]){
                    var obj = [];
                    var time = currentEvent[mappedobject[0]];
                    time = time.replace(/:/g,'.');
                    var d = parseInt(time);
                    var f = $scope.convertMinToFrac(parseFloat(time)%1);
                    var f = f+d;
                    
                    if(mappedobject[1]=='FmVJzYVDVcz'){
                        $scope.startingvalue = f;
                    } 
                    obj.push(f-$scope.startingvalue);
                    obj.push(parseInt(currentEvent[mappedobject[1]]));
                    $rootScope.dataforGraph.push(obj)
                }

                // working without time element starts
                // for(var key in currentEvent.dataValues){
                //     var prStDe = currentEvent.dataValues[key];
                //     if(prStDe.dataElement==elementId){
                //         // if(currentEvent[elementId]==undefined){
                //         //     $rootScope.dataforGraph.push(parseInt(prStDe.value));
                //         //     break;
                //         // }else{
                //             $rootScope.dataforGraph.push(parseInt(currentEvent[elementId]));
                //         //     break;
                //         // }
            
                        
                //     }
                // }    working without time element ends
            }                        
                                 
            $rootScope.chart.series[0].setData($rootScope.dataforGraph,true);
           
        }

        $scope.convertMinToFrac = function(f){
            return f/6 *10;//this function changes the interval from 60 to hundred 
        }
        
        $rootScope.refreshGraph($scope.currentEvent);
});