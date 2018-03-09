
///added for labour clinic graph

var graphplotter = angular.module('trackerCapture');

graphplotter.controller('graphController',
    function($rootScope,$scope,CurrentSelection){
        // console.log("Output;");
        // console.log(location.hostname);
        // console.log(document.domain);
        // alert(window.location.hostname)

        // console.log("document.URL : "+document.URL);
        // console.log("document.location.href : "+document.location.href);
        // console.log("document.location.origin : "+document.location.origin);
        // console.log("document.location.hostname : "+document.location.hostname);
        // console.log("document.location.host : "+document.location.host);
        // console.log("document.location.pathname : "+document.location.pathname);
        var selections = CurrentSelection.get();
        $scope.selectedTei = angular.copy(selections.tei);
        var attributes = {};
        angular.forEach($scope.selectedTei.attributes, function(att){
            attributes[att.attribute] = att.value;
        });

        //var attributes = CurrentSelection.getAttributesById();
        $scope.accessDataStore = function(teiid){
            var urlToSend = "../api/dataStore/partograph/"+teiid;

            $.ajax({
                type:'GET',
                encoding:"UTF-8",
                async:false,
                dataType:"json",
                url:urlToSend,
                statusCode:{
                    404: function(){
                        $scope.storeDataStore(teiid);
                    }
                },
                success : function(data,status,jqXHR){
                    $scope.smsState = data;
                }
            });

        }

        $scope.storeDataStore = function(teiid){

            var defaultVal = {}
            defaultVal[teiid] = false;

            defaultVal = JSON.stringify(defaultVal);

            var urlToSend = "../api/dataStore/partograph/"+teiid;

            $.ajax({
                type:'POST',
                encoding:"UTF-8",
                data : defaultVal,
                async:false,
                contentType : "application/json",
                url:urlToSend,
                success : function(data,status,jqXHR){
                    $scope.smsState = defaultVal;
                },
                error :function(jqXhr,status,errorThrown){
                    alert("Error Storing sms state");

                }
            });
        }

        $scope.updateStore = function(teiid,value){

            var defaultVal = {}
            defaultVal[teiid] = value;
            defaultVal = JSON.stringify(defaultVal);

            var urlToSend = "../api/dataStore/partograph/"+teiid;

            $.ajax({
                type:'PUT',
                encoding:"UTF-8",
                data : defaultVal,
                async:false,
                contentType : "application/json",
                url:urlToSend,
                success : function(data,status,jqXHR){
                    $scope.smsState = JSON.parse(defaultVal);
                    alert("SMS SENT")
                },
                error :function(jqXhr,status,errorThrown){
                    alert("Error Updating sms state");

                }
            });
        }

        $rootScope.refreshGraph = function(currentEvent,initial){
            var subtitleval = ""
            if(attributes['briL4htZesc'])
                subtitleval += "Patient "+attributes['briL4htZesc'] + ",";

            if(attributes['H3IA27KNXHb'])
                subtitleval += attributes['H3IA27KNXHb']+' years of age ,';

            subtitleval+= ' At '+selections.orgUnit['displayName'];
            $rootScope.chart = new Highcharts.chart('graphcontainer', {
                            chart:{
                                plotBackgroundColor:'#ffff1d'//'#ECD003', //yellow for alert area which is plot area background

                            },
                            exporting:{
                                enabled:true
                            },

                            title: {
                                text: 'Labour Details'
                            },
                            subtitle:{
                                text: subtitleval
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
                                data: [],
                                color: '#000000', //black for data line
                                zIndex : 5
                            },
                            {
                                type: 'arearange',
                                name: 'Safe Area',
                                data: [[0,10,4],[6,10,10]],
                                fillOpacity : 70,
                                color   : '#92d050'//'#31FF69' // green for safe zone
                            },
                            {//this series is dummy series just to show the color in legend the color should be same as ploat area background color
                                type: 'area',
                                name: 'Alert Area',
                                data: [],
                                color: '#ECD003'//color of alert area
                            },

                            {
                                type: 'area',
                                name: 'Action Area',
                                data: [[4,4],[10,10]],
                                color: '#f33333'//'#E87249 '//red for action line
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

                        //$rootScope.chart['subtitle'] = subtitle + 'At '+currentEvent.orgUnit;

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
            $scope.critical = false;
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
                    if(obj[0]>=4 && obj[1]<=obj[0]){
                        $scope.critical = true;
                    }
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




            if(initial===false){
                //check whether the data line croses the critical line
                //critical line follows the graph as y=x
                //so any value y>x where x>4 is on safe or alert zone
                //any value y<x where x>4 is on critical zone
                if($scope.smsState == null){
                    $scope.accessDataStore(currentEvent.trackedEntityInstance);
                }else if( $scope.smsState[currentEvent.trackedEntityInstance]==null){
                    $scope.accessDataStore(currentEvent.trackedEntityInstance);
                }

                if($scope.critical && $scope.smsState[currentEvent.trackedEntityInstance]==false){
                    var contentToSend = $scope.getUrl()+"ou="+currentEvent.orgUnit+"&tei="+currentEvent.trackedEntityInstance;
                    var shorterUrl = $scope.shortUrl(contentToSend);
                    if(shorterUrl!=null) contentToSend = shorterUrl;
                    if(currentEvent.patientName!=null){
                        contentToSend = "Patient : "+currentEvent.patientName+" "+contentToSend;
                    }
                    $scope.getmobile(currentEvent.orgUnit);
                    if($scope.mobile!=null){
                        $scope.sendsms(contentToSend,$scope.mobile);
                        $scope.smsState[currentEvent.trackedEntityInstance] = true;
                        $scope.updateStore(currentEvent.trackedEntityInstance,true);
                    }else{
                        alert("Mobile number for the facility not found");
                    }

                }


            }

        }

        $scope.convertMinToFrac = function(f){
            return f/6 *10;//this function changes the interval from 60 to hundred
        }

        $rootScope.refreshGraph($scope.currentEvent);

        $scope.sendsms = function (smscontent, mobile) {
            //alert("its working");
            //smscontent = "test";
            var finalcontent = encodeURIComponent(smscontent);
            var smsurl = "http://bulksms.mysmsmantra.com:8080/WebSMS/SMSAPI.jsp?username=hispindia&password=hisp1234&sendername=HSSPIN&mobileno="+mobile+"&message="+finalcontent;
            //var smsurl = "http://msdgweb.mgov.gov.in/esms/sendsmsrequest?username=PHD25PGIMER&password=sph@25&smsservicetype=unicodemsg&content=" + finalcontent + "&mobileno=" + mobile + "&senderid=PGIMER";


            $.ajax({
                type:'POST',
                encoding:"UTF-8",
                url:smsurl,
                headers:{
                    "Access-Control-Allow-Origin" : "*"

                },
                async:false,
                success : function(data,status,jqXHR){
                    //not working because of some issue
                    //$scope.storeDataStore(currentEvent.trackedEntityInstance,$scope.smsState);
                    alert("Success sending to "+mobile);
                }
            });
        }

        $scope.getmobile = function(ouid){
            var urlToSend = "../api/organisationUnits/"+ouid;
            $.ajax({
                type:'GET',
                encoding:"UTF-8",
                async:false,
                dataType:"json",
                url:urlToSend,
                success : function(data,status,jqXHR){
                    $scope.mobile = data["phoneNumber"];
                }
            });
        }

        $scope.getUrl= function(){
            var host = document.location.origin;
            var path = document.location.pathname.replace("dhis-web-tracker-capture/index.html",
            "dhis-web-reporting/generateHtmlReport.action?uid=");//zirn49Gg1vs&");
            var reportId = $scope.getReportUID();
            if(reportId!=null)
                return host+path+reportId+"&";
            else
                return null;
        }

        $scope.getReportUID = function(){
            var urlToSend = "../api/reports?filter=displayName:eq:partograph"
            var reports;
            $.ajax({
                type:'GET',
                encoding:"UTF-8",
                async:false,
                dataType:"json",
                url:urlToSend,
                success:function(data,status,jqXHR){
                    reports = data['reports'];
                }
            }

            );

            if(reports){
                for(var key in reports){
                    if(reports[key]['displayName']=='partograph'){
                        return reports[key]['id'];
                    }
                }
            }else{
                return null;
            }
        }

        $scope.shortUrl = function(Urltoshort){
            var googleApiUrl = "https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyCZlTv6vjf7FH9xqXp1vXgNCis4yiKIj6s";
            var objData = {
                longUrl : Urltoshort
            }
            var objToReturn= null;
            var jsonObjData = JSON.stringify(objData);
            var x ;
            $.ajax({
                type:'POST',
                encoding:"UTF-8",
                async:false,
                data: jsonObjData,
                contentType : "application/json",
                dataType:"json",
                url:googleApiUrl,
                success : function(data,status,jqXHR){
                    objToReturn = data["id"];
                },
                error:function(a,b,c){
                    alert("Couldn't get shorter url");
                }
            });

            return objToReturn;
        }


});
