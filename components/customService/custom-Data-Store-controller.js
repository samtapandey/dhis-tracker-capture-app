/**
 * Created by sudiksha
 */
//Controller for the header section
var trackerCapture = angular.module('trackerCapture');
trackerCapture.directive('displayForm', function ($compile) {

    return {
        //template: '<div>A Custom Directive <br> <b ng-show="directiveCtrlCalled">directiveCtrl() was called!!</b> </div>',
        restrict: 'E',
        replace: true,
        scope: { options: '=' },
        link: function (scope, element, attrs) {
            scope.directiveCtrlCalled = false;
            angular.extend(scope.options, {
                directiveFunction: function () {
                    scope.directiveCtrlCalled = true;

                    // create panel
                    var num_tabs = $("div#divhead ul li").length + 1;
                    $("div#divhead ul").append("<li><a data-toggle='tab' href=#Panel" + num_tabs + " target='_blank'>Panel" + num_tabs + "</a></li>");

                    // Clone
                    let pElement = element.find('div#Panel1'),
                        pElementCopy = $(pElement).clone(true),
                        formdata = $(pElementCopy.find('.form-group'));
                    pElementCopy[0].id = 'Panel' + num_tabs;

                    for (let i = 1; i < formdata.length - 1; i++) {
                        let str = formdata[i].innerHTML.replace(/Panel1/g, 'Panel' + num_tabs);
                        //console.log(str);
                        formdata[i].innerHTML = str;
                    }

                    // Change its content
                    pElementCopy.html(formdata)
                    element.append(pElementCopy)
                }
            });
        }
    };

})
trackerCapture.controller('CustomDataStore',
    function ($scope,
        $modalInstance,
        organism,
        tei,
        MetaDataService,
        DataStoreService,
        $compile
    ) {



        Object.assign(String.prototype, { deSum() { return (this.split(" ").filter((val) => (val == "/" || val == "-") ? false : val)).reduce((total, val) => total + "_" + val); } });
        $scope.tei = tei;
        $scope.organismName = organism;
        $scope.UniquedeNameValue = {};
        $scope.dataElementName = {};
        $scope.deNameValue = [];
        $scope.optionValue = {};
        $scope.panelselected = {};
        $scope.createClass = (key, uid, panel) => key + "-" + uid + "-" + panel;


        MetaDataService.showOptionSet().then(function (data) {
            $scope.dataElementName[data.displayName.deSum()] = { name: data.displayName, de: [] };
            for (var i = 0; i < data.options.length; i++)
                $scope.dataElementName[data.displayName.deSum()].de.push({ id: data.options[i].id, name: data.options[i].name })
        });
        MetaDataService.showdataElement().then(function (data) {
            let deElemtuids = { hVypvMfCrFy: true, ua4lNScEMe3: true, BTbb8ir12WL: true, vTi9yXbQ1Cw: true, JJuF3vE7xB9: true, tdtBR9OdXMJ: true }
            data.listGrid.rows.forEach((val) => (deElemtuids[val[4]]) ? $scope.dataElementName[val[1].deSum()] = { name: val[1], de: [] } : false)
            data.listGrid.rows.forEach((value) => (deElemtuids[value[4]]) ? $scope.dataElementName[value[1].deSum()].de.push({ name: value[2], id: value[3], key: value[1].deSum() }) : false)
            $scope.deNameValue = Object.keys($scope.dataElementName);
            $scope.deNameValue.forEach((v, i) => $scope.dataElementName[v].de.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)))
        });

        DataStoreService.getFromDataStore($scope.tei).then(function (responseDataStore) {
            // if (responseDataStore.id === tei && responseDataStore.name === organism_name) {
            //     document.getElementById("submit").style.display = "none";
            //     document.getElementById("update").style.display = "initial";
            // }
            // else if (responseDataStore.status === 404) {
            //     document.getElementById("submit").style.display = "initial";
            //     document.getElementById("update").style.display = "none";
            // }
            console.log(responseDataStore);
        });
        $(document).ready(function () {
            DataStoreService.getFromDataStore($scope.tei).then(function (res) {
                $scope.inputBox1 = ""; $scope.inputBox2 = ""; $scope.inputBox3 = ""; $scope.inputBox4 = "";
                let elementP = $(document.querySelector('display-form')), pElement, pElementCopy,
                    formdata, total_num_tabs, panelhead = [], panelAll = [];

                if (res.status != 404) {
                    total_num_tabs = Object.keys(res);
                    for (let i = 1; i < total_num_tabs.length - 1; i++) {
                        $("div#divhead ul").append("<li><a data-toggle='tab' href=#" + total_num_tabs[i] + " target='_blank'>" + total_num_tabs[i] + "</a></li>")
                        pElement = elementP.find('div#Panel1');
                        pElementCopy = $(pElement).clone(true);
                        formdata = $(pElementCopy.find('.form-group'));
                        pElementCopy[0].id = total_num_tabs[i];
                        let panelName=total_num_tabs[i]
                        for (let i = 1; i < formdata.length - 1; i++) {
                            let str = formdata[i].innerHTML.replace(/Panel1/g, panelName);
                            //console.log(str);
                            formdata[i].innerHTML = str;

                        }

                        panelAll.push(pElementCopy[0])
                    }
                    $("display-form").append(panelAll)
                    
                    $scope.UniquedeNameValue = res;

                    for (let p = 0; p < total_num_tabs.length - 1; p++) {
                        let getdatakeys = Object.keys(res[total_num_tabs[p]]);
                        for (let i = 0; i < getdatakeys.length; i++) {
                            let resdata = res[total_num_tabs[p]][getdatakeys[i]];
                            for (let j = 0; j < resdata.length; j++) {
                                let dataele = resdata[j],
                                    key = "." + getdatakeys[i] + "-" + dataele.id + "-" + total_num_tabs[p],
                                    rr = $(document).find(key),
                                    element = document.getElementsByClassName(getdatakeys[i] + "-" + dataele.id + "-" + total_num_tabs[p]);
                                element[0].checked = true;

                                if (getdatakeys[i] === "MIC" || getdatakeys[i] === "Disk_Diffusion") {
                                    element[1].value = " " || dataele.Susceptible;
                                    element[2].value = " " || dataele.Intermediate_High;
                                    element[3].value = " " || dataele.Intermediate_Low;
                                    element[4].value = " " || dataele.Resistant;
                                    for (let i = 1; i < element.length; i++) {
                                        if (dataele.display) {
                                            element[i].disabled = false;
                                        }
                                        else {
                                            element[0].checked = true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            })
        })


        $scope.deleteDataStore = function () {
            DataStoreService.deleteFromDataStore(tei).then(function (res) {
                if (res.httpStatus === 'OK' && res.httpStatusCode === 200) {
                    alert("Organism" + organismName + " -- " + res.message);
                    $modalInstance.close();
                }
            });
        };
        $(document).on("click", "input[name='checkbox']", function () {
            let ele = JSON.parse($(this).val()), innerobj,
                obj = Object.keys($scope.UniquedeNameValue);
            if (obj.length == 0) {
                $scope.UniquedeNameValue[this.form.id] = {};
                $scope.UniquedeNameValue[this.form.id][ele.key] = []
                obj = Object.keys($scope.UniquedeNameValue)
                innerobj = Object.keys($scope.UniquedeNameValue[this.form.id])
            }

            if (obj.indexOf(this.form.id) == -1)
                $scope.UniquedeNameValue[this.form.id] = {};
            innerobj = Object.keys($scope.UniquedeNameValue[this.form.id])
            if (innerobj.indexOf(ele.key) == -1)
                $scope.UniquedeNameValue[this.form.id][ele.key] = []

            for (var key in $scope.UniquedeNameValue[this.form.id]) {
                if (ele.key == key)
                    $scope.UniquedeNameValue[this.form.id][ele.key].push({ id: ele.id, name: ele.name, display: true })
            }

            if (ele.key === "MIC" || ele.key === "Disk_Diffusion") {
                var tdvalue = document.getElementsByClassName(ele.key + "-" + ele.id + "-" + this.form.id);
                if (this.checked == true) {
                    for (var i = 0; i < tdvalue.length; i++)
                        tdvalue[i].disabled = false;
                    //$scope.UniquedeNameValue[ele.key].pop()
                    for (var i = 0; i < $scope.UniquedeNameValue[this.form.id][ele.key].length; i++) {
                        if ($scope.UniquedeNameValue[this.form.id][ele.key][i].name === ele.name) {
                            $scope.UniquedeNameValue[this.form.id][ele.key][i].display = true;
                        }
                    }
                } else {
                    if (ele.key === "MIC" || ele.key === "Disk_Diffusion") {
                        for (var i = 0; i < tdvalue.length; i++)
                            tdvalue[i].disabled = true;
                        $scope.UniquedeNameValue[this.form.id][ele.key].pop()
                        for (var i = 0; i < $scope.UniquedeNameValue[this.form.id][ele.key].length; i++) {
                            if ($scope.UniquedeNameValue[this.form.id][ele.key][i].name === ele.name) {
                                $scope.UniquedeNameValue[this.form.id][ele.key][i].display = false;
                            }
                        }
                    }
                }
            }
            else if (this.checked == false) {
                for (var i = $scope.UniquedeNameValue[this.form.id][ele.key].length - 1; i > 0; i--) {
                    if ($scope.UniquedeNameValue[this.form.id][ele.key][i].name === ele.name)
                        $scope.UniquedeNameValue[this.form.id][ele.key].splice(i, 1)
                }
            }

        })
        $(document).on("keyup", "input[name='textbox']", function (e) {
            let ele = JSON.parse($(this).attr('deData'));
            $scope.UniquedeNameValue[this.form.id][ele.key].map((val, index) => {
                if (val.id == ele.id) {
                    if (this.id === "1")
                        $scope.UniquedeNameValue[this.form.id][ele.key][index].Susceptible = this.value;
                    if (this.id === "2")
                        $scope.UniquedeNameValue[this.form.id][ele.key][index].Intermediate_High = this.value;
                    if (this.id === "3")
                        $scope.UniquedeNameValue[this.form.id][ele.key][index].Intermediate_Low = this.value;
                    if (this.id === "4")
                        $scope.UniquedeNameValue[this.form.id][ele.key][index].Resistant = this.value;
                }

            })
        })

        $(document).on("click", "input[name='submit']", function (e) {
            $scope.UniquedeNameValue.id = $scope.tei;
            $scope.UniquedeNameValue.name = $scope.organism;

            DataStoreService.saveInDataStore($scope.UniquedeNameValue).then(function (response) {
                var modal = document.getElementById('myModal');
                // Get the button that opens the modal
                modal.style.display = "none";
                console.log(response);
            });

        });

        $scope.postDeUpdatedData = function () {
            $scope.UniquedeNameValue.Sample_type = optionValue.undefined
            DataStoreService.updateInDataStore($scope.UniquedeNameValue).then(function (response) {
                var modal = document.getElementById('myModal');
                modal.style.display = "none";
                console.log(response);
            });
        }

        $scope.selectAllcheckbox = function (thiz, param) {
            let dekey = param.deSum();
            var obj = Object.keys($scope.UniquedeNameValue)
            if (obj.length == 0) {
                $scope.UniquedeNameValue[dekey] = [];
                obj = Object.keys($scope.UniquedeNameValue)
            }
            if (obj.indexOf(dekey) == -1)
                $scope.UniquedeNameValue[dekey] = [];

            let dataElement = thiz.dataElementName[param];
            for (let i = 0; i < dataElement.length; i++) {
                let checkBox = document.getElementsByClassName(dataElement[i].key + '_' + dataElement[i].id);
                if (!checkBox[0].checked) {
                    checkBox[0].checked = true;
                    $scope.UniquedeNameValue[dekey].push({ id: dataElement[i].id, name: dataElement[i].name })
                }
                if (param === "MIC" || param === "Disk Diffusion") {
                    for (let i = 1; i < checkBox.length; i++) {
                        if (checkBox[i].disabled) {
                            checkBox[i].disabled = false;
                        }
                    }
                }
            }
        }
        $scope.unselectAllcheckbox = function (thiz, param) {
            let dekey = param.deSum(),
                dataElement = thiz.dataElementName[param];
            if (param === "MIC" || param === "Disk Diffusion") {
                for (let i = 0; i < $scope.UniquedeNameValue[dekey].length; i++) {
                    $scope.UniquedeNameValue[dekey][i].display = false;
                }
            }
            else { $scope.UniquedeNameValue[dekey] = []; }
            for (let i = 0; i < dataElement.length; i++) {
                let checkBox = document.getElementsByClassName(dataElement[i].key + '_' + dataElement[i].id)
                if (checkBox[0].checked)
                    checkBox[0].checked = false;
                if (param === "MIC" || param === "Disk Diffusion") {
                    for (let i = 1; i < checkBox.length; i++) {
                        if (!checkBox[i].disabled) {
                            checkBox[i].disabled = true;
                        }
                    }
                }
            }
        }
        $scope.dirOptions = {};
        $scope.addTab = function () {
            $scope.dirOptions.directiveFunction();
        };

        $scope.searchtd = (thiz) => {
            var t = thiz.getAttribute('id');
            console.log(`here is am ${thiz.getAttribute('id')}`)

        }

        // $("#search1").on("keyup", function () {
        //     var value = $(this).val().toLowerCase();
        //     $("#Sample_type tr").filter(function () {
        //         $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        //     });
        // });

        // $("#search2").on("keyup", function () {
        //     var value = $(this).val().toLowerCase();
        //     $("#Disk_Diffusion tr").filter(function () {
        //         $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        //     });
        // });

        // $("#MIC").on("keyup", function () {
        //     var value = $(this).val().toLowerCase();
        //     $("#MIC tr").filter(function () {
        //         $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        //     });
        // });

        // $("#search4").on("keyup", function () {
        //     var value = $(this).val().toLowerCase();
        //     $("#Results tr").filter(function () {
        //         $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        //     });
        // });

        // $("#search5").on("keyup", function () {
        //     var value = $(this).val().toLowerCase();
        //     $("#Genotypic_tests tr").filter(function () {
        //         $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        //     });
        // });

        // $("#search6").on("keyup", function () {
        //     var value = $(this).val().toLowerCase();
        //     $("#Phenotypic_tests tr").filter(function () {
        //         $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        //     });
        // });


        $scope.closeWindow = function () {
            $modalInstance.close();
        };

    })
