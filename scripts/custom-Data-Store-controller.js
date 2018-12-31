/**
 * Created by Wasib
 */
//Controller for the header section
var trackerCapture = angular.module('trackerCapture');
trackerCapture.controller('CustomDataStore',
    function ($scope, MetaDataFactory,
        DateUtils,
        OrgUnitFactory,
        ProgramFactory,
        AttributesFactory,
        $location,
        $window,
        AMRCustomService,
        dataStoreService,
        $timeout) {

        $.ajaxSetup({
            async: false
        });

        var apprURL1 = window.location.href;
        apprURL1 = apprURL1.replace(/%20/g, " ");
        if (apprURL1.indexOf("tei") >= 0) {
            var apprURL2 = apprURL1.split('=');
            var apprURL3 = apprURL2[apprURL2.length - 2];
            var apprURL4 = apprURL3.split('&');
            var tei = apprURL4[0];
        }
        if (apprURL1.indexOf("organismName") >= 0) {
            var apprURL2 = apprURL1.split('=');
            var organismName = apprURL2[apprURL2.length - 1];
        }
        console.log(tei, organismName);

        var data = {
                    "id": tei,
                    "name": organismName,
                    "SampleType":
                        [{
                            "code": "Abdominal fluid",
                            "name": "Abdominal fluid"
                        },
                        {
                            "code": "Abscess aspirate",
                            "name": "Abscess aspirate"
                        }],
                    "MIC": [{
                        "id": "GYNpOJWcNx2",
                        "name": "Amikacin_MIC_CLSI_Human"
                    },
                    {
                        "id": "qKy76L49kQ5",
                        "name": "Ampicillin_MIC_CLSI_Human"
                    }],
                    "Disk Diffusion": [{
                        "id": "VGdJnkTlNyK",
                        "name": "Amikacin_Disk diffusion_CLSI_30_Human"
                    },
                    {
                        "id": "O3Z3ACXAJ5x",
                        "name": "Ampicillin_Disk diffusion_CLSI_10_Human"
                    }],
                    "Results": [{
                        "id": "KmgWX65h0iM",
                        "name": "Amikacin_Result"
                    },
                    {
                        "id": "GB0gugeqeG9",
                        "name": "Amphotericin B_Result"
                    }]
        }

        dataStoreService.saveInDataStore(data).then(function (response) {
            console.log(response);
        });

    });