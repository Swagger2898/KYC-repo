var app = angular.module('mainApp', ['kycApp', 'kycJointSavingApp', 'kycPartnershipApp'
            , 'kycPubpvtApp', 'kycSavingCurrentApp', 'kycSoleProprietorshipApp'
            , 'kycTascApp']);
app.controller("formMainController", function ($scope, $http, $timeout, $interval, kycService) {

    var protocal = window.location.protocol;
    var host = window.location.host;
    $scope.uRl = protocal + "//" + host + "/";
    $scope.requestOtpResponse = "";
    $scope.verifyOtpResponse = "";
    $scope.verifyPanResponse = "";
    $scope.selectedAccOption;
    $scope.list = "";
    $scope.forAadharDetails = false;
    $scope.isLoading = false;

    var accountStatus = {
        "Silver Saving": true,
        "Normal Saving": false,
        "Joint Silver Saving": false,
        "Joint Normal Saving": false,
        "Current Wealth": false,
        "Current Gold": false,
        "Normal Current": false,
        "Sole Proprietorship": false,
        "Partnership": false,
        "Public_Private LTD Company": false,
        "TASC": false
    };
    $scope.updateScopeVariables = function () {
        $scope.showSilverSaving = accountStatus["Silver Saving"];
        $scope.showNormalSaving = accountStatus["Normal Saving"];
        $scope.showJointSilverSaving = accountStatus["Joint Silver Saving"];
        $scope.showJointNormalSaving = accountStatus["Joint Normal Saving"];
        $scope.showCurrentWealth = accountStatus["Current Wealth"];
        $scope.showCurrentGold = accountStatus["Current Gold"];
        $scope.showNormalCurrent = accountStatus["Normal Current"];
        $scope.showSoleProprietorship = accountStatus["Sole Proprietorship"];
        $scope.showPartnership = accountStatus["Partnership"];
        $scope.showPublic_Pvt = accountStatus["Public_Private LTD Company"];
        $scope.showTASC = accountStatus["TASC"];
//         $scope.accountType = selectedOption;
//         localStorage.setItem("accountTypeKey", "");
    };
    $scope.updateScopeVariables();
    $scope.changeForm = function (selectedOption) {
        $scope.selectedAccOption = selectedOption;
        for (var key in accountStatus) {
            if (accountStatus.hasOwnProperty(key)) {
                accountStatus[key] = (key === selectedOption);
            }
        }


        $scope.updateScopeVariables();
//         localStorage.setItem("accountTypeKey", selectedOption);
//         $scope.accountType = selectedOption;
//         document.getElementById("accountType").value = selectedOption;
    };

    $scope.disSendOtp = false;
    $scope.disVerify = false;
    $scope.aadhaarCardshow = false;
    $scope.showOtpModal = false;
    $scope.showTimer = false;
    $scope.timer = 0;
    $scope.showResendButton = false;
    $scope.verificationSuccess = false;
    $scope.verificationFailure = false;

    let otpTimer;
    $scope.showOKYC = function () {
        $scope.aadhaarCardshow = true;
        $('#aadharModal').modal('show'); // Show the modal

        $scope.showOtpModal = false;
        $('#otpModal').modal('hide'); // Show the modal
    };

    $scope.sendOtp = function () {
        //-->
        $scope.isLoading = true;
        $scope.disSendOtp = true;
        $scope.otp = "";
        $scope.verificationSuccess = false;
        $scope.verificationFailure = false;
        $scope.startTimer();
        var params = {
            aadhaarNumber: $scope.aadhaar
        };
        $http({
            method: 'POST',
            url: $scope.uRl + 'api/zoop/request-otp',
            params: params
        }).then(function (response) {
            console.log(response);
            $scope.requestOtpResponse = response.data;
            var responseCode = $scope.requestOtpResponse.response_code;
            if (responseCode === "101") {
                alert("No Record Found");
            } else if (responseCode === "100") {

                // Simulate OTP sending
                $timeout(function () {
                    $scope.isLoading = false;
                    $scope.showOtpModal = true;
                    $('#otpModal').modal('show'); // Show the modal
                    $('#aadharModal').modal('hide'); // Show the modal
                    $scope.startTimer();
                }, 2000); // Simulate a delay
            }
        }, function (error) {
            $scope.isLoading = false;
            alert("Zoop Server Not Responding");
            location.reload();
            console.log(error);
            $scope.requestOtpResponse = 'Error: ' + error.data;
        });
        //<--


    };
    $scope.startTimer = function () {
        $scope.showTimer = true;
        $scope.showResendButton = false;
        $scope.timer = 180; // 2 minutes in seconds

        otpTimer = $interval(function () {
            $scope.timer--;
            if ($scope.timer <= 0) {
                $scope.showTimer = false;
                $scope.showResendButton = true;
                $scope.disVerify = true;
                $interval.cancel(otpTimer);
            }
        }, 1000);
    };
    $scope.verifyOtp = function () {
        debugger;
        //-->
        $scope.isLoading = true;
        $scope.disVerify = true;
        $scope.verificationSuccess = false;
        $scope.verificationFailure = false;
        var params = {
            requestId: $scope.requestOtpResponse.request_id,
            otp: $scope.otp,
            taskId: $scope.requestOtpResponse.task_id
        };
        $http({
            method: 'POST',
            url: $scope.uRl + 'api/zoop/verify-otp',
            params: params
        }).then(function (response) {
            $scope.showOtpModal = true;
            $('#otpModal').modal('show');
            debugger;
            $scope.verifyOtpResponse = response.data;
            var mess = $scope.verifyOtpResponse.response_code;
            if (mess === "100") { // Example condition for successful OTP verification
                $scope.showTimer = false;
                $interval.cancel(otpTimer);
                $scope.verificationSuccess = true;
                $scope.verificationFailure = false;
//                 $('#otpModal').modal('show');
            } else if (mess === "101") {
                $scope.showTimer = false;
                $interval.cancel(otpTimer);
                alert("otp not correct.");
                $scope.verificationSuccess = false;
                $scope.verificationFailure = true;
            }
            console.log(response);
        }, function (error) {
            $interval.cancel(otpTimer);
            $scope.showTimer = false;
            $scope.isLoading = false;
            alert("Zoop Server not reponding.");
            location.reload();
            $scope.verificationSuccess = false;
            $scope.verificationFailure = true;
            $scope.showResendButton = true;
            console.log(error);
            $scope.verifyOtpResponse = 'Error: ' + error.data;
        });
        //<--


        // Simulate OTP verification
        $timeout(function () {
            $scope.isLoading = false;
            $interval.cancel(otpTimer);
        }, 2000); // Simulate a delay
    };
//  Pan Verification code is here

//     pan
    $scope.panCardshow = false;
    $scope.showRetryButton = false;
    $scope.verificationPanSuccess = false;
    $scope.verificationPanFailure = false;
    //     pan Cancel
    $scope.resendPan = function () {
        $scope.disPanVerify = false;
        $scope.showRetryButton = false;
        $scope.verifyPan();
    };

    $scope.cancelPan = function () {
        $scope.panCardshow = false;
        $('#panModal').modal('hide'); // Hide the modal
        $scope.showRetryButton = false;
        location.reload();
    };

    $scope.showPanKYC = function () {
        $scope.panCardshow = true;
        $('#panModal').modal('show'); // Show the modal

    };


//     panverifyPanverify
    $scope.verifyPan = function () {
        debugger;
        //-->
        $scope.isLoading = true;
        $scope.disPanVerify = true;
        $scope.verificationPanSuccess = false;
        $scope.verificationPanFailure = false;
        var params = {
            panNumber: $scope.panNumber,
            panHolderName: $scope.panHolderName
        };
        $http({
            method: 'POST',
            url: $scope.uRl + 'api/zoop/verifyPan',
            params: params
        }).then(function (response) {
            $scope.panCardshow = true;
            $('#panModal').modal('show');
            debugger;
            $scope.verifyPanResponse = response.data;
            var mess = $scope.verifyPanResponse.response_code;
            if (mess === "100") { // Example condition for successful OTP verification
                $scope.showTimer = false;
//                 $interval.cancel(otpTimer);
                $scope.verificationPanSuccess = true;
                $scope.verificationPanFailure = false;
//                 $('#otpModal').modal('show');
            } else if (mess === "101") {
//                 $scope.showTimer = false;
//                 $interval.cancel(otpTimer);
                alert("Pan not correct.");
                $scope.verificationPanSuccess = false;
                $scope.verificationPanFailure = true;
            }
            console.log(response);
        }, function (error) {
//             $interval.cancel(otpTimer);
//             $scope.showTimer = false;
            $scope.isLoading = false;
            alert("Zoop Server not reponding.");
            location.reload();
            $scope.verificationPanSuccess = false;
            $scope.verificationPanFailure = true;
            $scope.showRetryButton = true;
            console.log(error);
            $scope.verifyPanResponse = 'Error: ' + error.data;
        });
        //<--


        // Simulate OTP verification
        $timeout(function () {
            $scope.isLoading = false;
            $interval.cancel(otpTimer);
        }, 2000); // Simulate a delay
    };


//    Pan Verification code is end
    $scope.resendOtp = function () {
        $scope.disVerify = false;
        $scope.showResendButton = false;
        $scope.sendOtp();
    };
    $scope.cancel = function () {
        $scope.showOtpModal = false;
        $('#otpModal').modal('hide'); // Hide the modal
        $scope.showTimer = false;
        $scope.showResendButton = false;
        $interval.cancel(otpTimer);
        location.reload();
    };

    //
    $scope.formatTime = function (seconds) {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };
    $scope.check = function (maxFiles, maxTotalSizeKB, input) {
//         var files = event.target.files;
        var files = input.files;
        var maxTotalSizeBytes = maxTotalSizeKB * 1024; // Convert KB to Bytes

        if (files.length > maxFiles) {
            alert(`You can only upload a maximum of ${maxFiles} files.`);
            event.target.value = ""; // Reset the file input
            return;
        }

        var totalSize = 0;
        for (var i = 0; i < files.length; i++) {
            totalSize += files[i].size;
        }

        if (totalSize > maxTotalSizeBytes) {
            alert(`Total file size exceeds the limit of ${maxTotalSizeKB} KB.`);
            event.target.value = ""; // Reset the file input
            return;
        }

        alert("Files are valid for upload.");
    };
    $scope.aadharcheck = function (adharNo) {
        debugger;
        if (!(adharNo)) {
            alert("                        Please enter the Aadhar Number! \n\
                                                OR \n\
                        Check the enter digit is 12 or not.");
            $scope.forAadharDetails = false;
            $scope.list = null;
        } else {
            $scope.forAadharDetails = false;
            $scope.list = null;
            kycService.getKycRecordsByAadharNo(adharNo).then(function (response) {
                debugger;
                $scope.list = response.data;
                console.log($scope.list);
                if ($scope.list.length > 0) {
                    console.log($scope.list);
                    $scope.forAadharDetails = true;
                } else {
                    $scope.list = null;
                    $scope.forAadharDetails = false;
                    alert("Aadhar not present in KYC.");
                }
            }).catch(function (error) {
                console.log('Error:', error);
            });
        }
    };
    $scope.closeAadharDetails = function () {
        $scope.forAadharDetails = false;
    };
    //Popup
    $scope.isHovered = false;
    $scope.documents = [];
    $scope.popupStyle = {};
    $scope.popupHeading = '';
    $scope.activePopup = '';

    // Define document lists for each key
    var documentLists = {
        idProof: ['Passport', 'Driving license', 'Aadhaar Card', 'Voter’s Identity Card'],
        addressProof: ['Aadhaar Card', 'Driving license', 'Voter’s Identity Card',
            'Letter Issued by Foreign Embassies', 'Municipal Tax Receipt',
            'Electricity Bill', 'Water Bill', 'Landline telephone Bill'],
        pan: ['Pan', 'FORM-60/61', 'FORM-49A'],
        otherDoc: ['Additional Documents for Account Opening'],
        clientForm: ['Account Opening Form'],
        partnershipDoc: ['Registration certificate', 'Partnership deed',
            'Any one of the OVDs and PAN/ FORM60 of the person holding an Attorney to transact on its behalf with his/ her photograph'],
        companyDoc: ['Resolution of the Board of Directors', 'Power of Attorney', 'The Certificate of Commencement of Business'],
        entityProof: ['Registration Certificate', 'Certificate/ license issued by the municipal authorities under Shop & Establishment Act',
            'CST/ VAT/GST Certificate (Provisional/Final)', 'IEC (Importer Exporter Code) issued to the proprietary concern by the office of DGFT or License/ certificate of practice issued in the name of proprietary concern by any professional body incorporated under statute.'],
        tascDoc: ['Registration Certificate', 'Resolution of the Board of Directors', 'Partnership Deed/ Trust Deed/ Bye Laws*', ' Any one of the OVDs and PAN/ FORM60 of the Office bearers / Signatories and persons holding Power of Attorney, if any with his/her photograph in respect of the person holding an Attorney to transact on its behalf']
    };

    // Show popup with documents for a specific key
    $scope.showPopup = function (key, labelText, event) {
        var docs = documentLists[key] || [];
        $scope.isHovered = true;
        $scope.activePopup = key;
        $scope.documents = docs; // Display as a comma-separated string
        $scope.popupHeading = labelText; // Set the popup heading to the label text
        $scope.popupStyle = {
            top: (event.target.offsetTop + 20) + 'px', // Position below the label
            left: (event.target.offsetLeft) + 'px'  // Position to the right of the label
        };
    };

    // Hide popup
    $scope.hidePopup = function () {
        $scope.isHovered = false;
        $scope.activePopup = '';
        $scope.popupHeading = '';
    };
    //end

});
//silver saving controller
app.controller("silverSavingCont", function ($scope, $http, kycSavingCurrentService, kycService) {

    var protocal = window.location.protocol;
    var host = window.location.host;
    $scope.uRl = protocal + "//" + host + "/";
    $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asBOM"));
    if (($scope.userRecord)) {
        $scope.kycRecord;
        $scope.bomList;
        $scope.copsList;
        // Initialize dataSave object
        $scope.dataSave = {
            idProof: [],
            addressProof: [],
            pan: [],
            otherDoc: [],
            clientForm: [],
            accountType: '',
            branchName: '',
            applicant: '',
            mobileNo: null,
            adharNo: '',
            status: 'Pending at COPs',
            remark: '',
            idProofStatus: '',
            addressProofStatus: '',
            panStatus: '',
            otherDocStatus: '',
            clientFormStatus: '',
            approvedBy: '',
            uploadedBy: $scope.userRecord.userName + "(BOM)"
        };
        // Watch for changes in form fields and update dataSave accordingly
        $scope.$watch('selectedAccOption', function (newVal) {
            $scope.dataSave.accountType = newVal;
        });
        $scope.$watch('branchName', function (newVal) {
            $scope.dataSave.branchName = newVal;
        });
        $scope.$watch('applicant', function (newVal) {
            $scope.dataSave.applicant = newVal;
        });
        $scope.$watch('mobileNo', function (newVal) {
            $scope.dataSave.mobileNo = parseInt(newVal, 10);
        });
        $scope.$watch('adharNo', function (newVal) {
            $scope.dataSave.adharNo = newVal;
        });
        // Function to upload files and update dataSave
        $scope.uploadFilesSave = function (files, type) {
            $scope.dataSave[type] = files;
            console.log('Files uploaded:', $scope.dataSave);
        };
        $scope.submitForm = function () {
            kycSavingCurrentService.save($scope.dataSave).then(function (response) {
                debugger;
                console.log('Response:', response.data);
                if ("" === response.data || null === response.data) {
                    $scope.disableSubmit = false;
                    alert("Already have an Account Type for this Aadhar number !");
                } else {
                    var Ack = response.data.code;
                    alert("Data successfully submitted. Ack_No( " + Ack + " )");
                    window.location.href = $scope.uRl + "user_asBOM.html";
                }
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getAllBranchListOfCOPs = function (userName) {
            kycSavingCurrentService.getAllBranchListOfCOPs(userName).then(function (response) {
                $scope.copsList = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getAllBranchListOfBOM = function (userName) {
            kycSavingCurrentService.getAllBranchListOfBOM(userName).then(function (response) {
                $scope.bomList = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getKycRecordById = function (id) {
            kycSavingCurrentService.getKycRecordById(id).then(function (response) {
                $scope.kycRecord = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.deleteKycRecord = function (id) {
            kycSavingCurrentService.deleteKycRecord(id).then(function (response) {
                console.log('Record deleted successfully');
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getAllKycRecordInJson = function () {
            kycSavingCurrentService.getAllKycRecordInJson().then(function (response) {
                $scope.jsonData = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getKycRecordsByAadharNo = function (adharNo) {
            debugger;
            kycSavingCurrentService.getKycRecordsByAadharNo(adharNo).then(function (response) {
                $scope.kycRecord = response.data;
            }).catch(function (error) {
                $scope.kycRecord = error;
                console.log('Error:', error);
            });
        };
        $scope.dataUpdate = {
            idProof: [],
            addressProof: [],
            pan: [],
            otherDoc: [],
            clientForm: [],
            id: '',
            accountType: '',
            branchName: '',
            applicant: '',
            mobileNo: '',
            adharNo: '',
            status: '',
            remark: '',
            idProofStatus: '',
            addressProofStatus: '',
            panStatus: '',
            otherDocStatus: '',
            clientFormStatus: '',
            approvedBy: '',
            uploadedBy: ''
        };
        $scope.uploadFilesUpdate = function (files, type) {
            $scope.dataUpdate[type] = files;
        };
        $scope.submitUpdateForm = function () {
            kycSavingCurrentService.updateKycRecord($scope.dataUpdate).then(function (response) {
                console.log('Response:', response.data);
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        //own logical code here**

        $scope.list = [];
        $scope.forAadharDetails = false;
        $scope.branchlist = [];
        $scope.branchName = $scope.userRecord.branchName;
        $scope.urlB = "branch/getuser/" + $scope.userRecord.userName;
        $http.get($scope.uRl + $scope.urlB)
                .then(function (response) {
                    $scope.branchlist = response.data.branchNameList;
                }, function (error) {
                    console.log(error);
                });
        $scope.validateForm = function () {
            if ($scope.accountType) {
                return true;
            } else {
                alert("Please! select the Account Type.");
                return false;
            }
        };

        $scope.formdata = function () {
            $scope.disableSubmit = true;
            debugger;
            kycService.getKycRecordsByAadharNo($scope.adharNo).then(function (response) {
                debugger;
                $scope.list = response.data;
                if ($scope.list.length === 0) {
                    $scope.forAadharDetails = false;
                } else {
                    $scope.list = null;
                    $scope.forAadharDetails = false;
                }

                if ($scope.validateForm()) {
                    debugger;
                    if (response.data.length === 0) {
                        $scope.dataSave['remark'] = "BOM : Data Submitted";
                    } else {
                        $scope.dataSave['remark'] = "BOM : Existing Customer KYC Verification for " + $scope.accountType + "";
                    }
                    $scope.submitForm();
                }
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
    } else {
        window.location.href = $scope.uRl + "index.html";
    }
});
app.controller("normalSavingCont", function ($scope, $http, kycSavingCurrentService, kycService) {

    var protocal = window.location.protocol;
    var host = window.location.host;
    $scope.uRl = protocal + "//" + host + "/";
    $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asBOM"));
    if (($scope.userRecord)) {
        $scope.kycRecord;
        $scope.bomList;
        $scope.copsList;
        // Initialize dataSave object
        $scope.dataSave = {
            idProof: [],
            addressProof: [],
            pan: [],
            otherDoc: [],
            clientForm: [],
            accountType: '',
            branchName: '',
            applicant: '',
            mobileNo: null,
            adharNo: '',
            status: 'Pending at COPs',
            remark: '',
            idProofStatus: '',
            addressProofStatus: '',
            panStatus: '',
            otherDocStatus: '',
            clientFormStatus: '',
            approvedBy: '',
            uploadedBy: $scope.userRecord.userName + "(BOM)"
        };
        // Watch for changes in form fields and update dataSave accordingly
        $scope.$watch('selectedAccOption', function (newVal) {
            $scope.dataSave.accountType = newVal;
        });
        $scope.$watch('branchName', function (newVal) {
            $scope.dataSave.branchName = newVal;
        });
        $scope.$watch('applicant', function (newVal) {
            $scope.dataSave.applicant = newVal;
        });
        $scope.$watch('mobileNo', function (newVal) {
            $scope.dataSave.mobileNo = parseInt(newVal, 10);
        });
        $scope.$watch('adharNo', function (newVal) {
            $scope.dataSave.adharNo = newVal;
        });
        // Function to upload files and update dataSave
        $scope.uploadFilesSave = function (files, type) {
            $scope.dataSave[type] = files;
            console.log('Files uploaded:', $scope.dataSave);
        };
        $scope.submitForm = function () {
            kycSavingCurrentService.save($scope.dataSave).then(function (response) {
                debugger;
                console.log('Response:', response.data);
                if ("" === response.data || null === response.data) {
                    $scope.disableSubmit = false;
                    alert("Already have an Account Type for this Aadhar number !");
                } else {
                    var Ack = response.data.code;
                    alert("Data successfully submitted. Ack_No( " + Ack + " )");
                    window.location.href = $scope.uRl + "user_asBOM.html";
                }
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getAllBranchListOfCOPs = function (userName) {
            kycSavingCurrentService.getAllBranchListOfCOPs(userName).then(function (response) {
                $scope.copsList = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getAllBranchListOfBOM = function (userName) {
            kycSavingCurrentService.getAllBranchListOfBOM(userName).then(function (response) {
                $scope.bomList = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getKycRecordById = function (id) {
            kycSavingCurrentService.getKycRecordById(id).then(function (response) {
                $scope.kycRecord = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.deleteKycRecord = function (id) {
            kycSavingCurrentService.deleteKycRecord(id).then(function (response) {
                console.log('Record deleted successfully');
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getAllKycRecordInJson = function () {
            kycSavingCurrentService.getAllKycRecordInJson().then(function (response) {
                $scope.jsonData = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getKycRecordsByAadharNo = function (adharNo) {
            debugger;
            kycSavingCurrentService.getKycRecordsByAadharNo(adharNo).then(function (response) {
                $scope.kycRecord = response.data;
            }).catch(function (error) {
                $scope.kycRecord = error;
                console.log('Error:', error);
            });
        };
        $scope.dataUpdate = {
            idProof: [],
            addressProof: [],
            pan: [],
            otherDoc: [],
            clientForm: [],
            id: '',
            accountType: '',
            branchName: '',
            applicant: '',
            mobileNo: '',
            adharNo: '',
            status: '',
            remark: '',
            idProofStatus: '',
            addressProofStatus: '',
            panStatus: '',
            otherDocStatus: '',
            clientFormStatus: '',
            approvedBy: '',
            uploadedBy: ''
        };
        $scope.uploadFilesUpdate = function (files, type) {
            $scope.dataUpdate[type] = files;
        };
        $scope.submitUpdateForm = function () {
            kycSavingCurrentService.updateKycRecord($scope.dataUpdate).then(function (response) {
                console.log('Response:', response.data);
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        //own logical code here**

        $scope.list = [];
        $scope.forAadharDetails = false;
        $scope.branchlist = [];
        $scope.branchName = $scope.userRecord.branchName;
        $scope.urlB = "branch/getuser/" + $scope.userRecord.userName;
        $http.get($scope.uRl + $scope.urlB)
                .then(function (response) {
                    $scope.branchlist = response.data.branchNameList;
                }, function (error) {
                    console.log(error);
                });
        $scope.validateForm = function () {
            if ($scope.accountType) {
                return true;
            } else {
                alert("Please! select the Account Type.");
                return false;
            }
        };
        $scope.formdata = function () {
            $scope.disableSubmit = true;
            debugger;
            kycService.getKycRecordsByAadharNo($scope.adharNo).then(function (response) {
                debugger;
                $scope.list = response.data;
                if ($scope.list.length === 0) {
                    $scope.forAadharDetails = false;
                } else {
                    $scope.list = null;
                    $scope.forAadharDetails = false;
                }

                if ($scope.validateForm()) {
                    debugger;
                    if (response.data.length === 0) {
                        $scope.dataSave['remark'] = "BOM : Data Submitted";
                    } else {
                        $scope.dataSave['remark'] = "BOM : Existing Customer KYC Verification for " + $scope.accountType + "";
                    }
                    $scope.submitForm();
                }
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
    } else {
        window.location.href = $scope.uRl + "index.html";
    }
});
//joint silver saving
app.controller("jointSilverSavingCont", function ($scope, $http, kycJointSavingService, kycService) {

    var protocal = window.location.protocol;
    var host = window.location.host;
    $scope.uRl = protocal + "//" + host + "/";
    $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asBOM"));
    if (($scope.userRecord)) {
//       form button for add applicant and aadhar

        $scope.showApp3 = false;

        $scope.addApplicant = function () {
            $scope.showApp3 = true;
        };

        $scope.removeApplicant = function () {
            $scope.showApp3 = false;
        };

        $scope.kycRecord;
        $scope.bomList;
        $scope.copsList;
        // Initialize dataSave object
        $scope.dataSave = {
            idProof: [],
            addressProof: [],
            pan: [],
            otherDoc: [],
            clientForm: [],
            accountType: '',
            branchName: '',
            applicantFirst: '',
            applicantSecond: '',
            applicantThird: '',
            mobileNo: null,
            adharNoFirst: '',
            adharNoSecond: '',
            adharNoThird: '',
            status: 'Pending at COPs',
            remark: '',
            idProofStatus: '',
            addressProofStatus: '',
            panStatus: '',
            otherDocStatus: '',
            clientFormStatus: '',
            approvedBy: '',
            uploadedBy: $scope.userRecord.userName + "(BOM)"
        };
        // Watch for changes in form fields and update dataSave accordingly
        $scope.$watch('selectedAccOption', function (newVal) {
            $scope.dataSave.accountType = newVal;
        });
        $scope.$watch('branchName', function (newVal) {
            $scope.dataSave.branchName = newVal;
        });
        $scope.$watch('applicantFirst', function (newVal) {
            $scope.dataSave.applicantFirst = newVal;
        });
        $scope.$watch('applicantSecond', function (newVal) {
            $scope.dataSave.applicantSecond = newVal;
        });
        $scope.$watch('applicantThird', function (newVal) {
            $scope.dataSave.applicantThird = newVal;
        });
        $scope.$watch('mobileNo', function (newVal) {
            $scope.dataSave.mobileNo = parseInt(newVal, 10);
        });
        $scope.$watch('adharNoFirst', function (newVal) {
            $scope.dataSave.adharNoFirst = newVal;
        });
        $scope.$watch('adharNoSecond', function (newVal) {
            $scope.dataSave.adharNoSecond = newVal;
        });
        $scope.$watch('adharNoThird', function (newVal) {
            $scope.dataSave.adharNoThird = newVal;
        });
        // Function to upload files and update dataSave
        $scope.uploadFilesSave = function (files, type) {
            $scope.dataSave[type] = files;
            console.log('Files uploaded:', $scope.dataSave);
        };
        $scope.submitForm = function () {
            kycJointSavingService.save($scope.dataSave).then(function (response) {
                debugger;
                console.log('Response:', response.data);
                if ("" === response.data || null === response.data) {
                    $scope.disableSubmit = false;
                    alert("Already have an Account Type for this Aadhar number !");
                } else {
                    var Ack = response.data.code;
                    alert("Data successfully submitted. Ack_No( " + Ack + " )");
                    window.location.href = $scope.uRl + "user_asBOM.html";
                }
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getAllBranchListOfCOPs = function (userName) {
            kycJointSavingService.getAllBranchListOfCOPs(userName).then(function (response) {
                $scope.copsList = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getAllBranchListOfBOM = function (userName) {
            kycJointSavingService.getAllBranchListOfBOM(userName).then(function (response) {
                $scope.bomList = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getKycRecordById = function (id) {
            kycJointSavingService.getKycRecordById(id).then(function (response) {
                $scope.kycRecord = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.deleteKycRecord = function (id) {
            kycJointSavingService.deleteKycRecord(id).then(function (response) {
                console.log('Record deleted successfully');
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getAllKycRecordInJson = function () {
            kycJointSavingService.getAllKycRecordInJson().then(function (response) {
                $scope.jsonData = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getKycRecordsByAadharNo = function (adharNo) {
            debugger;
            kycJointSavingService.getKycRecordsByAadharNo(adharNo).then(function (response) {
                $scope.kycRecord = response.data;
            }).catch(function (error) {
                $scope.kycRecord = error;
                console.log('Error:', error);
            });
        };
        $scope.dataUpdate = {
            idProof: [],
            addressProof: [],
            pan: [],
            otherDoc: [],
            clientForm: [],
            id: '',
            accountType: '',
            branchName: '',
            applicantFirst: '',
            applicantSecond: '',
            applicantThird: '',
            mobileNo: null,
            adharNoFirst: '',
            adharNoSecond: '',
            adharNoThird: '',
            status: 'Pending at COPs',
            remark: '',
            idProofStatus: '',
            addressProofStatus: '',
            panStatus: '',
            otherDocStatus: '',
            clientFormStatus: '',
            approvedBy: '',
            uploadedBy: $scope.userRecord.userName + "(BOM)"
        };
        $scope.uploadFilesUpdate = function (files, type) {
            $scope.dataUpdate[type] = files;
        };
        $scope.submitUpdateForm = function () {
            kycJointSavingService.updateKycRecord($scope.dataUpdate).then(function (response) {
                console.log('Response:', response.data);
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        //own logical code here**

        $scope.list = [];
        $scope.forAadharDetails = false;
        $scope.branchlist = [];
        $scope.branchName = $scope.userRecord.branchName;
        $scope.urlB = "branch/getuser/" + $scope.userRecord.userName;
        $http.get($scope.uRl + $scope.urlB)
                .then(function (response) {
                    $scope.branchlist = response.data.branchNameList;
                }, function (error) {
                    console.log(error);
                });
        $scope.validateForm = function () {
            if ($scope.showApp3 === true) {
                if (!$scope.applicantThird) {
                    alert("Please enter third applicant name.");
                    return false;
                }
                if (!$scope.adharNoThird) {
                    alert("Please enter third applicant Aadhar.");
                    return false;
                }
            } else if ($scope.showApp3 === false) {
                $scope.dataSave['applicantThird'] = "";
                $scope.dataSave['adharNoThird'] = "";
            }

            if ($scope.accountType) {
                return true;
            } else if (!$scope.accountType) {
                alert("Please! select the Account Type.");
                return false;
            }
        };
        $scope.formdata = function () {
            $scope.disableSubmit = true;
            debugger;
            kycService.getKycRecordsByAadharNo($scope.adharNoFirst).then(function (response) {
                debugger;
                $scope.list = response.data;
                if ($scope.list.length === 0) {
                    $scope.forAadharDetails = false;
                } else {
                    $scope.list = null;
                    $scope.forAadharDetails = false;
                }

                if ($scope.validateForm()) {
                    debugger;
                    if (response.data.length === 0) {
                        $scope.dataSave['remark'] = "BOM : Data Submitted";
                    } else {
                        $scope.dataSave['remark'] = "BOM : Existing Customer KYC Verification for " + $scope.accountType + "";
                    }
                    $scope.submitForm();
                }
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
    } else {
        window.location.href = $scope.uRl + "index.html";
    }
});
app.controller("jointNormalSavingCont", function ($scope, $http, kycJointSavingService, kycService) {

    var protocal = window.location.protocol;
    var host = window.location.host;
    $scope.uRl = protocal + "//" + host + "/";
    $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asBOM"));
    if (($scope.userRecord)) {
//       form button for add applicant and aadhar

        $scope.showApp3 = false;

        $scope.addApplicant = function () {
            $scope.showApp3 = true;
        };

        $scope.removeApplicant = function () {
            $scope.showApp3 = false;
        };

        $scope.kycRecord;
        $scope.bomList;
        $scope.copsList;
        // Initialize dataSave object
        $scope.dataSave = {
            idProof: [],
            addressProof: [],
            pan: [],
            otherDoc: [],
            clientForm: [],
            accountType: '',
            branchName: '',
            applicantFirst: '',
            applicantSecond: '',
            applicantThird: '',
            mobileNo: null,
            adharNoFirst: '',
            adharNoSecond: '',
            adharNoThird: '',
            status: 'Pending at COPs',
            remark: '',
            idProofStatus: '',
            addressProofStatus: '',
            panStatus: '',
            otherDocStatus: '',
            clientFormStatus: '',
            approvedBy: '',
            uploadedBy: $scope.userRecord.userName + "(BOM)"
        };
        // Watch for changes in form fields and update dataSave accordingly
        $scope.$watch('selectedAccOption', function (newVal) {
            $scope.dataSave.accountType = newVal;
        });
        $scope.$watch('branchName', function (newVal) {
            $scope.dataSave.branchName = newVal;
        });
        $scope.$watch('applicantFirst', function (newVal) {
            $scope.dataSave.applicantFirst = newVal;
        });
        $scope.$watch('applicantSecond', function (newVal) {
            $scope.dataSave.applicantSecond = newVal;
        });
        $scope.$watch('applicantThird', function (newVal) {
            $scope.dataSave.applicantThird = newVal;
        });
        $scope.$watch('mobileNo', function (newVal) {
            $scope.dataSave.mobileNo = parseInt(newVal, 10);
        });
        $scope.$watch('adharNoFirst', function (newVal) {
            $scope.dataSave.adharNoFirst = newVal;
        });
        $scope.$watch('adharNoSecond', function (newVal) {
            $scope.dataSave.adharNoSecond = newVal;
        });
        $scope.$watch('adharNoThird', function (newVal) {
            $scope.dataSave.adharNoThird = newVal;
        });
        // Function to upload files and update dataSave
        $scope.uploadFilesSave = function (files, type) {
            $scope.dataSave[type] = files;
            console.log('Files uploaded:', $scope.dataSave);
        };
        $scope.submitForm = function () {
            kycJointSavingService.save($scope.dataSave).then(function (response) {
                debugger;
                console.log('Response:', response.data);
                if ("" === response.data || null === response.data) {
                    $scope.disableSubmit = false;
                    alert("Already have an Account Type for this Aadhar number !");
                } else {
                    var Ack = response.data.code;
                    alert("Data successfully submitted. Ack_No( " + Ack + " )");
                    window.location.href = $scope.uRl + "user_asBOM.html";
                }
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getAllBranchListOfCOPs = function (userName) {
            kycJointSavingService.getAllBranchListOfCOPs(userName).then(function (response) {
                $scope.copsList = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getAllBranchListOfBOM = function (userName) {
            kycJointSavingService.getAllBranchListOfBOM(userName).then(function (response) {
                $scope.bomList = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getKycRecordById = function (id) {
            kycJointSavingService.getKycRecordById(id).then(function (response) {
                $scope.kycRecord = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.deleteKycRecord = function (id) {
            kycJointSavingService.deleteKycRecord(id).then(function (response) {
                console.log('Record deleted successfully');
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getAllKycRecordInJson = function () {
            kycJointSavingService.getAllKycRecordInJson().then(function (response) {
                $scope.jsonData = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getKycRecordsByAadharNo = function (adharNo) {
            debugger;
            kycJointSavingService.getKycRecordsByAadharNo(adharNo).then(function (response) {
                $scope.kycRecord = response.data;
            }).catch(function (error) {
                $scope.kycRecord = error;
                console.log('Error:', error);
            });
        };
        $scope.dataUpdate = {
            idProof: [],
            addressProof: [],
            pan: [],
            otherDoc: [],
            clientForm: [],
            id: '',
            accountType: '',
            branchName: '',
            applicantFirst: '',
            applicantSecond: '',
            applicantThird: '',
            mobileNo: null,
            adharNoFirst: '',
            adharNoSecond: '',
            adharNoThird: '',
            status: 'Pending at COPs',
            remark: '',
            idProofStatus: '',
            addressProofStatus: '',
            panStatus: '',
            otherDocStatus: '',
            clientFormStatus: '',
            approvedBy: '',
            uploadedBy: $scope.userRecord.userName + "(BOM)"
        };
        $scope.uploadFilesUpdate = function (files, type) {
            $scope.dataUpdate[type] = files;
        };
        $scope.submitUpdateForm = function () {
            kycJointSavingService.updateKycRecord($scope.dataUpdate).then(function (response) {
                console.log('Response:', response.data);
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        //own logical code here**

        $scope.list = [];
        $scope.forAadharDetails = false;
        $scope.branchlist = [];
        $scope.branchName = $scope.userRecord.branchName;
        $scope.urlB = "branch/getuser/" + $scope.userRecord.userName;
        $http.get($scope.uRl + $scope.urlB)
                .then(function (response) {
                    $scope.branchlist = response.data.branchNameList;
                }, function (error) {
                    console.log(error);
                });
        $scope.validateForm = function () {
            if ($scope.showApp3 === true) {
                if (!$scope.applicantThird) {
                    alert("Please enter third applicant name.");
                    return false;
                }
                if (!$scope.adharNoThird) {
                    alert("Please enter third applicant Aadhar.");
                    return false;
                }
            } else if ($scope.showApp3 === false) {
                $scope.dataSave['applicantThird'] = "";
                $scope.dataSave['adharNoThird'] = "";
            }

            if ($scope.accountType) {
                return true;
            } else if (!$scope.accountType) {
                alert("Please! select the Account Type.");
                return false;
            }
        };
        $scope.formdata = function () {
            $scope.disableSubmit = true;
            debugger;
            kycService.getKycRecordsByAadharNo($scope.adharNoFirst).then(function (response) {
                debugger;
                $scope.list = response.data;
                if ($scope.list.length === 0) {
                    $scope.forAadharDetails = false;
                } else {
                    $scope.list = null;
                    $scope.forAadharDetails = false;
                }

                if ($scope.validateForm()) {
                    debugger;
                    if (response.data.length === 0) {
                        $scope.dataSave['remark'] = "BOM : Data Submitted";
                    } else {
                        $scope.dataSave['remark'] = "BOM : Existing Customer KYC Verification for " + $scope.accountType + "";
                    }
                    $scope.submitForm();
                }
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
    } else {
        window.location.href = $scope.uRl + "index.html";
    }
});
app.controller("normalCurrentCont", function ($scope, $http, kycSavingCurrentService, kycService) {

    var protocal = window.location.protocol;
    var host = window.location.host;
    $scope.uRl = protocal + "//" + host + "/";
    $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asBOM"));
    if (($scope.userRecord)) {
        $scope.kycRecord;
        $scope.bomList;
        $scope.copsList;
        // Initialize dataSave object
        $scope.dataSave = {
            idProof: [],
            addressProof: [],
            pan: [],
            otherDoc: [],
            clientForm: [],
            accountType: '',
            branchName: '',
            applicant: '',
            mobileNo: null,
            adharNo: '',
            status: 'Pending at COPs',
            remark: '',
            idProofStatus: '',
            addressProofStatus: '',
            panStatus: '',
            otherDocStatus: '',
            clientFormStatus: '',
            approvedBy: '',
            uploadedBy: $scope.userRecord.userName + "(BOM)"
        };
        // Watch for changes in form fields and update dataSave accordingly
        $scope.$watch('selectedAccOption', function (newVal) {
            $scope.dataSave.accountType = newVal;
        });
        $scope.$watch('branchName', function (newVal) {
            $scope.dataSave.branchName = newVal;
        });
        $scope.$watch('applicant', function (newVal) {
            $scope.dataSave.applicant = newVal;
        });
        $scope.$watch('mobileNo', function (newVal) {
            $scope.dataSave.mobileNo = parseInt(newVal, 10);
        });
        $scope.$watch('adharNo', function (newVal) {
            $scope.dataSave.adharNo = newVal;
        });
        // Function to upload files and update dataSave
        $scope.uploadFilesSave = function (files, type) {
            $scope.dataSave[type] = files;
            console.log('Files uploaded:', $scope.dataSave);
        };
        $scope.submitForm = function () {
            kycSavingCurrentService.save($scope.dataSave).then(function (response) {
                debugger;
                console.log('Response:', response.data);
                if ("" === response.data || null === response.data) {
                    $scope.disableSubmit = false;
                    alert("Already have an Account Type for this Aadhar number !");
                } else {
                    var Ack = response.data.code;
                    alert("Data successfully submitted. Ack_No( " + Ack + " )");
                    window.location.href = $scope.uRl + "user_asBOM.html";
                }
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getAllBranchListOfCOPs = function (userName) {
            kycSavingCurrentService.getAllBranchListOfCOPs(userName).then(function (response) {
                $scope.copsList = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getAllBranchListOfBOM = function (userName) {
            kycSavingCurrentService.getAllBranchListOfBOM(userName).then(function (response) {
                $scope.bomList = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getKycRecordById = function (id) {
            kycSavingCurrentService.getKycRecordById(id).then(function (response) {
                $scope.kycRecord = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.deleteKycRecord = function (id) {
            kycSavingCurrentService.deleteKycRecord(id).then(function (response) {
                console.log('Record deleted successfully');
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getAllKycRecordInJson = function () {
            kycSavingCurrentService.getAllKycRecordInJson().then(function (response) {
                $scope.jsonData = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getKycRecordsByAadharNo = function (adharNo) {
            debugger;
            kycSavingCurrentService.getKycRecordsByAadharNo(adharNo).then(function (response) {
                $scope.kycRecord = response.data;
            }).catch(function (error) {
                $scope.kycRecord = error;
                console.log('Error:', error);
            });
        };
        $scope.dataUpdate = {
            idProof: [],
            addressProof: [],
            pan: [],
            otherDoc: [],
            clientForm: [],
            id: '',
            accountType: '',
            branchName: '',
            applicant: '',
            mobileNo: '',
            adharNo: '',
            status: '',
            remark: '',
            idProofStatus: '',
            addressProofStatus: '',
            panStatus: '',
            otherDocStatus: '',
            clientFormStatus: '',
            approvedBy: '',
            uploadedBy: ''
        };
        $scope.uploadFilesUpdate = function (files, type) {
            $scope.dataUpdate[type] = files;
        };
        $scope.submitUpdateForm = function () {
            kycSavingCurrentService.updateKycRecord($scope.dataUpdate).then(function (response) {
                console.log('Response:', response.data);
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        //own logical code here**

        $scope.list = [];
        $scope.forAadharDetails = false;
        $scope.branchlist = [];
        $scope.branchName = $scope.userRecord.branchName;
        $scope.urlB = "branch/getuser/" + $scope.userRecord.userName;
        $http.get($scope.uRl + $scope.urlB)
                .then(function (response) {
                    $scope.branchlist = response.data.branchNameList;
                }, function (error) {
                    console.log(error);
                });
        $scope.validateForm = function () {
            if ($scope.accountType) {
                return true;
            } else {
                alert("Please! select the Account Type.");
                return false;
            }
        };
        $scope.formdata = function () {
            $scope.disableSubmit = true;
            debugger;
            kycService.getKycRecordsByAadharNo($scope.adharNo).then(function (response) {
                debugger;
                $scope.list = response.data;
                if ($scope.list.length === 0) {
                    $scope.forAadharDetails = false;
                } else {
                    $scope.list = null;
                    $scope.forAadharDetails = false;
                }

                if ($scope.validateForm()) {
                    debugger;
                    if (response.data.length === 0) {
                        $scope.dataSave['remark'] = "BOM : Data Submitted";
                    } else {
                        $scope.dataSave['remark'] = "BOM : Existing Customer KYC Verification for " + $scope.accountType + "";
                    }
                    $scope.submitForm();
                }
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
    } else {
        window.location.href = $scope.uRl + "index.html";
    }

});
app.controller("currentGoldCont", function ($scope, $http, kycSavingCurrentService, kycService) {

    var protocal = window.location.protocol;
    var host = window.location.host;
    $scope.uRl = protocal + "//" + host + "/";
    $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asBOM"));
    if (($scope.userRecord)) {
        $scope.kycRecord;
        $scope.bomList;
        $scope.copsList;
        // Initialize dataSave object
        $scope.dataSave = {
            idProof: [],
            addressProof: [],
            pan: [],
            otherDoc: [],
            clientForm: [],
            accountType: '',
            branchName: '',
            applicant: '',
            mobileNo: null,
            adharNo: '',
            status: 'Pending at COPs',
            remark: '',
            idProofStatus: '',
            addressProofStatus: '',
            panStatus: '',
            otherDocStatus: '',
            clientFormStatus: '',
            approvedBy: '',
            uploadedBy: $scope.userRecord.userName + "(BOM)"
        };
        // Watch for changes in form fields and update dataSave accordingly
        $scope.$watch('selectedAccOption', function (newVal) {
            $scope.dataSave.accountType = newVal;
        });
        $scope.$watch('branchName', function (newVal) {
            $scope.dataSave.branchName = newVal;
        });
        $scope.$watch('applicant', function (newVal) {
            $scope.dataSave.applicant = newVal;
        });
        $scope.$watch('mobileNo', function (newVal) {
            $scope.dataSave.mobileNo = parseInt(newVal, 10);
        });
        $scope.$watch('adharNo', function (newVal) {
            $scope.dataSave.adharNo = newVal;
        });
        // Function to upload files and update dataSave
        $scope.uploadFilesSave = function (files, type) {
            $scope.dataSave[type] = files;
            console.log('Files uploaded:', $scope.dataSave);
        };
        $scope.submitForm = function () {
            kycSavingCurrentService.save($scope.dataSave).then(function (response) {
                debugger;
                console.log('Response:', response.data);
                if ("" === response.data || null === response.data) {
                    $scope.disableSubmit = false;
                    alert("Already have an Account Type for this Aadhar number !");
                } else {
                    var Ack = response.data.code;
                    alert("Data successfully submitted. Ack_No( " + Ack + " )");
                    window.location.href = $scope.uRl + "user_asBOM.html";
                }
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getAllBranchListOfCOPs = function (userName) {
            kycSavingCurrentService.getAllBranchListOfCOPs(userName).then(function (response) {
                $scope.copsList = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getAllBranchListOfBOM = function (userName) {
            kycSavingCurrentService.getAllBranchListOfBOM(userName).then(function (response) {
                $scope.bomList = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getKycRecordById = function (id) {
            kycSavingCurrentService.getKycRecordById(id).then(function (response) {
                $scope.kycRecord = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.deleteKycRecord = function (id) {
            kycSavingCurrentService.deleteKycRecord(id).then(function (response) {
                console.log('Record deleted successfully');
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getAllKycRecordInJson = function () {
            kycSavingCurrentService.getAllKycRecordInJson().then(function (response) {
                $scope.jsonData = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getKycRecordsByAadharNo = function (adharNo) {
            debugger;
            kycSavingCurrentService.getKycRecordsByAadharNo(adharNo).then(function (response) {
                $scope.kycRecord = response.data;
            }).catch(function (error) {
                $scope.kycRecord = error;
                console.log('Error:', error);
            });
        };
        $scope.dataUpdate = {
            idProof: [],
            addressProof: [],
            pan: [],
            otherDoc: [],
            clientForm: [],
            id: '',
            accountType: '',
            branchName: '',
            applicant: '',
            mobileNo: '',
            adharNo: '',
            status: '',
            remark: '',
            idProofStatus: '',
            addressProofStatus: '',
            panStatus: '',
            otherDocStatus: '',
            clientFormStatus: '',
            approvedBy: '',
            uploadedBy: ''
        };
        $scope.uploadFilesUpdate = function (files, type) {
            $scope.dataUpdate[type] = files;
        };
        $scope.submitUpdateForm = function () {
            kycSavingCurrentService.updateKycRecord($scope.dataUpdate).then(function (response) {
                console.log('Response:', response.data);
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        //own logical code here**

        $scope.list = [];
        $scope.forAadharDetails = false;
        $scope.branchlist = [];
        $scope.branchName = $scope.userRecord.branchName;
        $scope.urlB = "branch/getuser/" + $scope.userRecord.userName;
        $http.get($scope.uRl + $scope.urlB)
                .then(function (response) {
                    $scope.branchlist = response.data.branchNameList;
                }, function (error) {
                    console.log(error);
                });
        $scope.validateForm = function () {
            if ($scope.accountType) {
                return true;
            } else {
                alert("Please! select the Account Type.");
                return false;
            }
        };
        $scope.formdata = function () {
            $scope.disableSubmit = true;
            debugger;
            kycService.getKycRecordsByAadharNo($scope.adharNo).then(function (response) {
                debugger;
                $scope.list = response.data;
                if ($scope.list.length === 0) {
                    $scope.forAadharDetails = false;
                } else {
                    $scope.list = null;
                    $scope.forAadharDetails = false;
                }

                if ($scope.validateForm()) {
                    debugger;
                    if (response.data.length === 0) {
                        $scope.dataSave['remark'] = "BOM : Data Submitted";
                    } else {
                        $scope.dataSave['remark'] = "BOM : Existing Customer KYC Verification for " + $scope.accountType + "";
                    }
                    $scope.submitForm();
                }
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
    } else {
        window.location.href = $scope.uRl + "index.html";
    }

});
app.controller("currentWealthCont", function ($scope, $http, kycSavingCurrentService, kycService) {

    var protocal = window.location.protocol;
    var host = window.location.host;
    $scope.uRl = protocal + "//" + host + "/";
    $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asBOM"));
    if (($scope.userRecord)) {
        $scope.kycRecord;
        $scope.bomList;
        $scope.copsList;
        // Initialize dataSave object
        $scope.dataSave = {
            idProof: [],
            addressProof: [],
            pan: [],
            otherDoc: [],
            clientForm: [],
            accountType: '',
            branchName: '',
            applicant: '',
            mobileNo: null,
            adharNo: '',
            status: 'Pending at COPs',
            remark: '',
            idProofStatus: '',
            addressProofStatus: '',
            panStatus: '',
            otherDocStatus: '',
            clientFormStatus: '',
            approvedBy: '',
            uploadedBy: $scope.userRecord.userName + "(BOM)"
        };
        // Watch for changes in form fields and update dataSave accordingly
        $scope.$watch('selectedAccOption', function (newVal) {
            $scope.dataSave.accountType = newVal;
        });
        $scope.$watch('branchName', function (newVal) {
            $scope.dataSave.branchName = newVal;
        });
        $scope.$watch('applicant', function (newVal) {
            $scope.dataSave.applicant = newVal;
        });
        $scope.$watch('mobileNo', function (newVal) {
            $scope.dataSave.mobileNo = parseInt(newVal, 10);
        });
        $scope.$watch('adharNo', function (newVal) {
            $scope.dataSave.adharNo = newVal;
        });
        // Function to upload files and update dataSave
        $scope.uploadFilesSave = function (files, type) {
            $scope.dataSave[type] = files;
            console.log('Files uploaded:', $scope.dataSave);
        };
        $scope.submitForm = function () {
            kycSavingCurrentService.save($scope.dataSave).then(function (response) {
                debugger;
                console.log('Response:', response.data);
                if ("" === response.data || null === response.data) {
                    $scope.disableSubmit = false;
                    alert("Already have an Account Type for this Aadhar number !");
                } else {
                    var Ack = response.data.code;
                    alert("Data successfully submitted. Ack_No( " + Ack + " )");
                    window.location.href = $scope.uRl + "user_asBOM.html";
                }
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getAllBranchListOfCOPs = function (userName) {
            kycSavingCurrentService.getAllBranchListOfCOPs(userName).then(function (response) {
                $scope.copsList = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getAllBranchListOfBOM = function (userName) {
            kycSavingCurrentService.getAllBranchListOfBOM(userName).then(function (response) {
                $scope.bomList = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getKycRecordById = function (id) {
            kycSavingCurrentService.getKycRecordById(id).then(function (response) {
                $scope.kycRecord = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.deleteKycRecord = function (id) {
            kycSavingCurrentService.deleteKycRecord(id).then(function (response) {
                console.log('Record deleted successfully');
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getAllKycRecordInJson = function () {
            kycSavingCurrentService.getAllKycRecordInJson().then(function (response) {
                $scope.jsonData = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getKycRecordsByAadharNo = function (adharNo) {
            debugger;
            kycSavingCurrentService.getKycRecordsByAadharNo(adharNo).then(function (response) {
                $scope.kycRecord = response.data;
            }).catch(function (error) {
                $scope.kycRecord = error;
                console.log('Error:', error);
            });
        };
        $scope.dataUpdate = {
            idProof: [],
            addressProof: [],
            pan: [],
            otherDoc: [],
            clientForm: [],
            id: '',
            accountType: '',
            branchName: '',
            applicant: '',
            mobileNo: '',
            adharNo: '',
            status: '',
            remark: '',
            idProofStatus: '',
            addressProofStatus: '',
            panStatus: '',
            otherDocStatus: '',
            clientFormStatus: '',
            approvedBy: '',
            uploadedBy: ''
        };
        $scope.uploadFilesUpdate = function (files, type) {
            $scope.dataUpdate[type] = files;
        };
        $scope.submitUpdateForm = function () {
            kycSavingCurrentService.updateKycRecord($scope.dataUpdate).then(function (response) {
                console.log('Response:', response.data);
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        //own logical code here**

        $scope.list = [];
        $scope.forAadharDetails = false;
        $scope.branchlist = [];
        $scope.branchName = $scope.userRecord.branchName;
        $scope.urlB = "branch/getuser/" + $scope.userRecord.userName;
        $http.get($scope.uRl + $scope.urlB)
                .then(function (response) {
                    $scope.branchlist = response.data.branchNameList;
                }, function (error) {
                    console.log(error);
                });
        $scope.validateForm = function () {
            if ($scope.accountType) {
                return true;
            } else {
                alert("Please! select the Account Type.");
                return false;
            }
        };
        $scope.formdata = function () {
            $scope.disableSubmit = true;
            debugger;
            kycService.getKycRecordsByAadharNo($scope.adharNo).then(function (response) {
                debugger;
                $scope.list = response.data;
                if ($scope.list.length === 0) {
                    $scope.forAadharDetails = false;
                } else {
                    $scope.list = null;
                    $scope.forAadharDetails = false;
                }

                if ($scope.validateForm()) {
                    debugger;
                    if (response.data.length === 0) {
                        $scope.dataSave['remark'] = "BOM : Data Submitted";
                    } else {
                        $scope.dataSave['remark'] = "BOM : Existing Customer KYC Verification for " + $scope.accountType + "";
                    }
                    $scope.submitForm();
                }
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
    } else {
        window.location.href = $scope.uRl + "index.html";
    }

});
app.controller("soleProprietorshipCont", function ($scope, $http, kycSoleProprietorshipService, kycService) {

    var protocal = window.location.protocol;
    var host = window.location.host;
    $scope.uRl = protocal + "//" + host + "/";
    $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asBOM"));
    if (($scope.userRecord)) {
        $scope.kycRecord;
        $scope.bomList;
        $scope.copsList;
        // Initialize dataSave object
        $scope.dataSave = {
            idProof: [],
            addressProof: [],
            pan: [],
            entityProof: [],
            otherDoc: [],
            clientForm: [],
            accountType: '',
            branchName: '',
            entity: '',
            applicant: '',
            mobileNo: null,
            adharNo: '',
            status: 'Pending at COPs',
            remark: '',
            idProofStatus: '',
            addressProofStatus: '',
            panStatus: '',
            entityProofStatus: '',
            otherDocStatus: '',
            clientFormStatus: '',
            approvedBy: '',
            uploadedBy: $scope.userRecord.userName + "(BOM)"
        };
        // Watch for changes in form fields and update dataSave accordingly
        $scope.$watch('selectedAccOption', function (newVal) {
            $scope.dataSave.accountType = newVal;
        });
        $scope.$watch('branchName', function (newVal) {
            $scope.dataSave.branchName = newVal;
        });
        $scope.$watch('applicant', function (newVal) {
            $scope.dataSave.applicant = newVal;
        });
        $scope.$watch('entity', function (newVal) {
            $scope.dataSave.entity = newVal;
        });
        $scope.$watch('mobileNo', function (newVal) {
            $scope.dataSave.mobileNo = parseInt(newVal, 10);
        });
        $scope.$watch('adharNo', function (newVal) {
            $scope.dataSave.adharNo = newVal;
        });
        // Function to upload files and update dataSave
        $scope.uploadFilesSave = function (files, type) {
            $scope.dataSave[type] = files;
            console.log('Files uploaded:', $scope.dataSave);
        };
        $scope.submitForm = function () {
            kycSoleProprietorshipService.save($scope.dataSave).then(function (response) {
                debugger;
                console.log('Response:', response.data);
                if ("" === response.data || null === response.data) {
                    $scope.disableSubmit = false;
                    alert("Already have an Account Type for this Aadhar number !");
                } else {
                    var Ack = response.data.code;
                    alert("Data successfully submitted. Ack_No( " + Ack + " )");
                    window.location.href = $scope.uRl + "user_asBOM.html";
                }
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getAllBranchListOfCOPs = function (userName) {
            kycSoleProprietorshipService.getAllBranchListOfCOPs(userName).then(function (response) {
                $scope.copsList = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getAllBranchListOfBOM = function (userName) {
            kycSoleProprietorshipService.getAllBranchListOfBOM(userName).then(function (response) {
                $scope.bomList = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getKycRecordById = function (id) {
            kycSoleProprietorshipService.getKycRecordById(id).then(function (response) {
                $scope.kycRecord = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.deleteKycRecord = function (id) {
            kycSoleProprietorshipService.deleteKycRecord(id).then(function (response) {
                console.log('Record deleted successfully');
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getAllKycRecordInJson = function () {
            kycSoleProprietorshipService.getAllKycRecordInJson().then(function (response) {
                $scope.jsonData = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getKycRecordsByAadharNo = function (adharNo) {
            debugger;
            kycSoleProprietorshipService.getKycRecordsByAadharNo(adharNo).then(function (response) {
                $scope.kycRecord = response.data;
            }).catch(function (error) {
                $scope.kycRecord = error;
                console.log('Error:', error);
            });
        };
        $scope.dataUpdate = {
            idProof: [],
            addressProof: [],
            pan: [],
            entityProof: [],
            otherDoc: [],
            clientForm: [],
            id: '',
            accountType: '',
            branchName: '',
            entity: '',
            applicant: '',
            mobileNo: '',
            adharNo: '',
            status: '',
            remark: '',
            idProofStatus: '',
            addressProofStatus: '',
            panStatus: '',
            entityProofStatus: '',
            otherDocStatus: '',
            clientFormStatus: '',
            approvedBy: '',
            uploadedBy: ''
        };
        $scope.uploadFilesUpdate = function (files, type) {
            $scope.dataUpdate[type] = files;
        };
        $scope.submitUpdateForm = function () {
            kycSoleProprietorshipService.updateKycRecord($scope.dataUpdate).then(function (response) {
                console.log('Response:', response.data);
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        //own logical code here**

        $scope.list = [];
        $scope.forAadharDetails = false;
        $scope.branchlist = [];
        $scope.branchName = $scope.userRecord.branchName;
        $scope.urlB = "branch/getuser/" + $scope.userRecord.userName;
        $http.get($scope.uRl + $scope.urlB)
                .then(function (response) {
                    $scope.branchlist = response.data.branchNameList;
                }, function (error) {
                    console.log(error);
                });
        $scope.validateForm = function () {
            if ($scope.accountType) {
                return true;
            } else {
                alert("Please! select the Account Type.");
                return false;
            }
        };
        $scope.formdata = function () {
            $scope.disableSubmit = true;
            debugger;
            kycService.getKycRecordsByAadharNo($scope.adharNo).then(function (response) {
                debugger;
                $scope.list = response.data;
                if ($scope.list.length === 0) {
                    $scope.forAadharDetails = false;
                } else {
                    $scope.list = null;
                    $scope.forAadharDetails = false;
                }

                if ($scope.validateForm()) {
                    debugger;
                    if (response.data.length === 0) {
                        $scope.dataSave['remark'] = "BOM : Data Submitted";
                    } else {
                        $scope.dataSave['remark'] = "BOM : Existing Customer KYC Verification for " + $scope.accountType + "";
                    }
                    $scope.submitForm();
                }
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
    } else {
        window.location.href = $scope.uRl + "index.html";
    }
});
app.controller("partnershipCont", function ($scope, $http, kycPartnershipService, kycService) {

    var protocal = window.location.protocol;
    var host = window.location.host;
    $scope.uRl = protocal + "//" + host + "/";
    $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asBOM"));
    if (($scope.userRecord)) {
//       form button for add applicant and aadhar

        $scope.showApp3 = false;

        $scope.addApplicant = function () {
            $scope.showApp3 = true;
        };

        $scope.removeApplicant = function () {
            $scope.showApp3 = false;
        };

        $scope.kycRecord;
        $scope.bomList;
        $scope.copsList;
        // Initialize dataSave object
        $scope.dataSave = {
            idProof: [],
            addressProof: [],
            pan: [],
            partnershipDoc: [],
            otherDoc: [],
            clientForm: [],
            accountType: '',
            branchName: '',
            entity: '',
            applicantFirst: '',
            applicantSecond: '',
            applicantThird: '',
            mobileNo: null,
            adharNoFirst: '',
            adharNoSecond: '',
            adharNoThird: '',
            status: 'Pending at COPs',
            remark: '',
            idProofStatus: '',
            addressProofStatus: '',
            panStatus: '',
            partnershipDocStatus: '',
            otherDocStatus: '',
            clientFormStatus: '',
            approvedBy: '',
            uploadedBy: $scope.userRecord.userName + "(BOM)"
        };
        // Watch for changes in form fields and update dataSave accordingly
        $scope.$watch('selectedAccOption', function (newVal) {
            $scope.dataSave.accountType = newVal;
        });
        $scope.$watch('branchName', function (newVal) {
            $scope.dataSave.branchName = newVal;
        });
        $scope.$watch('entity', function (newVal) {
            $scope.dataSave.entity = newVal;
        });
        $scope.$watch('applicantFirst', function (newVal) {
            $scope.dataSave.applicantFirst = newVal;
        });
        $scope.$watch('applicantSecond', function (newVal) {
            $scope.dataSave.applicantSecond = newVal;
        });
        $scope.$watch('applicantThird', function (newVal) {
            $scope.dataSave.applicantThird = newVal;
        });
        $scope.$watch('mobileNo', function (newVal) {
            $scope.dataSave.mobileNo = parseInt(newVal, 10);
        });
        $scope.$watch('adharNoFirst', function (newVal) {
            $scope.dataSave.adharNoFirst = newVal;
        });
        $scope.$watch('adharNoSecond', function (newVal) {
            $scope.dataSave.adharNoSecond = newVal;
        });
        $scope.$watch('adharNoThird', function (newVal) {
            $scope.dataSave.adharNoThird = newVal;
        });
        // Function to upload files and update dataSave
        $scope.uploadFilesSave = function (files, type) {
            $scope.dataSave[type] = files;
        };
        $scope.submitForm = function () {
            kycPartnershipService.save($scope.dataSave).then(function (response) {
                debugger;
                console.log('Response:', response.data);
                if ("" === response.data || null === response.data) {
                    $scope.disableSubmit = false;
                    alert("Already have an Account Type for this Aadhar number !");
                } else {
                    var Ack = response.data.code;
                    alert("Data successfully submitted. Ack_No( " + Ack + " )");
                    window.location.href = $scope.uRl + "user_asBOM.html";
                }
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getAllBranchListOfCOPs = function (userName) {
            kycPartnershipService.getAllBranchListOfCOPs(userName).then(function (response) {
                $scope.copsList = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getAllBranchListOfBOM = function (userName) {
            kycPartnershipService.getAllBranchListOfBOM(userName).then(function (response) {
                $scope.bomList = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getKycRecordById = function (id) {
            kycPartnershipService.getKycRecordById(id).then(function (response) {
                $scope.kycRecord = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.deleteKycRecord = function (id) {
            kycPartnershipService.deleteKycRecord(id).then(function (response) {
                console.log('Record deleted successfully');
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getAllKycRecordInJson = function () {
            kycPartnershipService.getAllKycRecordInJson().then(function (response) {
                $scope.jsonData = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getKycRecordsByAadharNo = function (adharNo) {
            debugger;
            kycPartnershipService.getKycRecordsByAadharNo(adharNo).then(function (response) {
                $scope.kycRecord = response.data;
            }).catch(function (error) {
                $scope.kycRecord = error;
                console.log('Error:', error);
            });
        };
        $scope.dataUpdate = {
            idProof: [],
            addressProof: [],
            pan: [],
            partnershipDoc: [],
            otherDoc: [],
            clientForm: [],
            id: '',
            accountType: '',
            branchName: '',
            entity: '',
            applicantFirst: '',
            applicantSecond: '',
            applicantThird: '',
            mobileNo: null,
            adharNoFirst: '',
            adharNoSecond: '',
            adharNoThird: '',
            status: '',
            remark: '',
            idProofStatus: '',
            addressProofStatus: '',
            panStatus: '',
            partnershipDocStatus: '',
            otherDocStatus: '',
            clientFormStatus: '',
            approvedBy: '',
            uploadedBy: ''
        };
        $scope.uploadFilesUpdate = function (files, type) {
            $scope.dataUpdate[type] = files;
        };
        $scope.submitUpdateForm = function () {
            kycPartnershipService.updateKycRecord($scope.dataUpdate).then(function (response) {
                console.log('Response:', response.data);
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        //own logical code here**

        $scope.list = [];
        $scope.forAadharDetails = false;
        $scope.branchlist = [];
        $scope.branchName = $scope.userRecord.branchName;
        $scope.urlB = "branch/getuser/" + $scope.userRecord.userName;
        $http.get($scope.uRl + $scope.urlB)
                .then(function (response) {
                    $scope.branchlist = response.data.branchNameList;
                }, function (error) {
                    console.log(error);
                });
        $scope.validateForm = function () {
            if ($scope.showApp3 === true) {
                if (!$scope.applicantThird) {
                    alert("Please enter third applicant name.");
                    return false;
                }
                if (!$scope.adharNoThird) {
                    alert("Please enter third applicant Aadhar.");
                    return false;
                }
            } else if ($scope.showApp3 === false) {
                $scope.dataSave['applicantThird'] = "";
                $scope.dataSave['adharNoThird'] = "";
            }

            if ($scope.accountType) {
                return true;
            } else if (!$scope.accountType) {
                alert("Please! select the Account Type.");
                return false;
            }
        };
        $scope.formdata = function () {
            $scope.disableSubmit = true;
            debugger;
            kycService.getKycRecordsByAadharNo($scope.adharNoFirst).then(function (response) {
                debugger;
                $scope.list = response.data;
                if ($scope.list.length === 0) {
                    $scope.forAadharDetails = false;
                } else {
                    $scope.list = null;
                    $scope.forAadharDetails = false;
                }

                if ($scope.validateForm()) {
                    debugger;
                    if (response.data.length === 0) {
                        $scope.dataSave['remark'] = "BOM : Data Submitted";
                    } else {
                        $scope.dataSave['remark'] = "BOM : Existing Customer KYC Verification for " + $scope.accountType + "";
                    }
                    $scope.submitForm();
                }
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
    } else {
        window.location.href = $scope.uRl + "index.html";
    }
});
app.controller("public_PvtCont", function ($scope, $http, kycPubpvtService, kycService) {

    var protocal = window.location.protocol;
    var host = window.location.host;
    $scope.uRl = protocal + "//" + host + "/";
    $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asBOM"));
    if (($scope.userRecord)) {
//       form button for add applicant and aadhar

        $scope.showApp3 = false;

        $scope.addApplicant = function () {
            $scope.showApp3 = true;
        };

        $scope.removeApplicant = function () {
            $scope.showApp3 = false;
        };

        $scope.kycRecord;
        $scope.bomList;
        $scope.copsList;
        // Initialize dataSave object
        $scope.dataSave = {
            idProof: [],
            addressProof: [],
            pan: [],
            companyDoc: [],
            otherDoc: [],
            clientForm: [],
            accountType: '',
            branchName: '',
            entity: '',
            applicantFirst: '',
            applicantSecond: '',
            applicantThird: '',
            mobileNo: null,
            adharNoFirst: '',
            adharNoSecond: '',
            adharNoThird: '',
            status: 'Pending at COPs',
            remark: '',
            idProofStatus: '',
            addressProofStatus: '',
            panStatus: '',
            companyDocStatus: '',
            otherDocStatus: '',
            clientFormStatus: '',
            approvedBy: '',
            uploadedBy: $scope.userRecord.userName + "(BOM)"
        };
        // Watch for changes in form fields and update dataSave accordingly
        $scope.$watch('selectedAccOption', function (newVal) {
            $scope.dataSave.accountType = newVal;
        });
        $scope.$watch('branchName', function (newVal) {
            $scope.dataSave.branchName = newVal;
        });
        $scope.$watch('entity', function (newVal) {
            $scope.dataSave.entity = newVal;
        });
        $scope.$watch('applicantFirst', function (newVal) {
            $scope.dataSave.applicantFirst = newVal;
        });
        $scope.$watch('applicantSecond', function (newVal) {
            $scope.dataSave.applicantSecond = newVal;
        });
        $scope.$watch('applicantThird', function (newVal) {
            $scope.dataSave.applicantThird = newVal;
        });
        $scope.$watch('mobileNo', function (newVal) {
            $scope.dataSave.mobileNo = parseInt(newVal, 10);
        });
        $scope.$watch('adharNoFirst', function (newVal) {
            $scope.dataSave.adharNoFirst = newVal;
        });
        $scope.$watch('adharNoSecond', function (newVal) {
            $scope.dataSave.adharNoSecond = newVal;
        });
        $scope.$watch('adharNoThird', function (newVal) {
            $scope.dataSave.adharNoThird = newVal;
        });
        // Function to upload files and update dataSave
        $scope.uploadFilesSave = function (files, type) {
            $scope.dataSave[type] = files;
            console.log('Files uploaded:', $scope.dataSave);
        };
        $scope.submitForm = function () {
            kycPubpvtService.save($scope.dataSave).then(function (response) {
                debugger;
                console.log('Response:', response.data);
                if ("" === response.data || null === response.data) {
                    $scope.disableSubmit = false;
                    alert("Already have an Account Type for this Aadhar number !");
                } else {
                    var Ack = response.data.code;
                    alert("Data successfully submitted. Ack_No( " + Ack + " )");
                    window.location.href = $scope.uRl + "user_asBOM.html";
                }
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getAllBranchListOfCOPs = function (userName) {
            kycPubpvtService.getAllBranchListOfCOPs(userName).then(function (response) {
                $scope.copsList = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getAllBranchListOfBOM = function (userName) {
            kycPubpvtService.getAllBranchListOfBOM(userName).then(function (response) {
                $scope.bomList = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getKycRecordById = function (id) {
            kycPubpvtService.getKycRecordById(id).then(function (response) {
                $scope.kycRecord = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.deleteKycRecord = function (id) {
            kycPubpvtService.deleteKycRecord(id).then(function (response) {
                console.log('Record deleted successfully');
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getAllKycRecordInJson = function () {
            kycPubpvtService.getAllKycRecordInJson().then(function (response) {
                $scope.jsonData = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getKycRecordsByAadharNo = function (adharNo) {
            debugger;
            kycPubpvtService.getKycRecordsByAadharNo(adharNo).then(function (response) {
                $scope.kycRecord = response.data;
            }).catch(function (error) {
                $scope.kycRecord = error;
                console.log('Error:', error);
            });
        };
        $scope.dataUpdate = {
            idProof: [],
            addressProof: [],
            pan: [],
            partnershipDoc: [],
            otherDoc: [],
            clientForm: [],
            id: '',
            accountType: '',
            branchName: '',
            entity: '',
            applicantFirst: '',
            applicantSecond: '',
            applicantThird: '',
            mobileNo: null,
            adharNoFirst: '',
            adharNoSecond: '',
            adharNoThird: '',
            status: '',
            remark: '',
            idProofStatus: '',
            addressProofStatus: '',
            panStatus: '',
            partnershipDocStatus: '',
            otherDocStatus: '',
            clientFormStatus: '',
            approvedBy: '',
            uploadedBy: ''
        };
        $scope.uploadFilesUpdate = function (files, type) {
            $scope.dataUpdate[type] = files;
        };
        $scope.submitUpdateForm = function () {
            kycPubpvtService.updateKycRecord($scope.dataUpdate).then(function (response) {
                console.log('Response:', response.data);
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        //own logical code here**

        $scope.list = [];
        $scope.forAadharDetails = false;
        $scope.branchlist = [];
        $scope.branchName = $scope.userRecord.branchName;
        $scope.urlB = "branch/getuser/" + $scope.userRecord.userName;
        $http.get($scope.uRl + $scope.urlB)
                .then(function (response) {
                    $scope.branchlist = response.data.branchNameList;
                }, function (error) {
                    console.log(error);
                });
        $scope.validateForm = function () {
            if ($scope.showApp3 === true) {
                if (!$scope.applicantThird) {
                    alert("Please enter third applicant name.");
                    return false;
                }
                if (!$scope.adharNoThird) {
                    alert("Please enter third applicant Aadhar.");
                    return false;
                }
            } else if ($scope.showApp3 === false) {
                $scope.dataSave['applicantThird'] = "";
                $scope.dataSave['adharNoThird'] = "";
            }

            if ($scope.accountType) {
                return true;
            } else if (!$scope.accountType) {
                alert("Please! select the Account Type.");
                return false;
            }
        };
        $scope.formdata = function () {
            $scope.disableSubmit = true;
            debugger;
            kycService.getKycRecordsByAadharNo($scope.adharNoFirst).then(function (response) {
                debugger;
                $scope.list = response.data;
                if ($scope.list.length === 0) {
                    $scope.forAadharDetails = false;
                } else {
                    $scope.list = null;
                    $scope.forAadharDetails = false;
                }

                if ($scope.validateForm()) {
                    debugger;
                    if (response.data.length === 0) {
                        $scope.dataSave['remark'] = "BOM : Data Submitted";
                    } else {
                        $scope.dataSave['remark'] = "BOM : Existing Customer KYC Verification for " + $scope.accountType + "";
                    }
                    $scope.submitForm();
                }
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
    } else {
        window.location.href = $scope.uRl + "index.html";
    }
});
app.controller("tascCont", function ($scope, $http, kycTascService, kycService) {

    var protocal = window.location.protocol;
    var host = window.location.host;
    $scope.uRl = protocal + "//" + host + "/";
    $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asBOM"));
    if (($scope.userRecord)) {

//applicants


        $scope.appStatus = {
            "app2": false,
            "app3": false,
            "app4": false,
            "app5": false

        };
        $scope.updateAppStatus = function () {
            debugger;
            $scope.showApp2 = $scope.appStatus["app2"];
            $scope.showApp3 = $scope.appStatus["app3"];
            $scope.showApp4 = $scope.appStatus["app4"];
            $scope.showApp5 = $scope.appStatus["app5"];
        };
        var keys = Object.keys($scope.appStatus);
        var currentIndex = 0;
        $scope.addApplicantTasc = function () {
            debugger;
            if (currentIndex < keys.length) {
                $scope.appStatus[keys[currentIndex]] = true;
                currentIndex++;
            }

            $scope.updateAppStatus();
        };
        $scope.removeApplicantTask = function () {
            debugger;
            if (currentIndex > 0) {
                currentIndex--;
                $scope.appStatus[keys[currentIndex]] = false;
            }

            $scope.updateAppStatus();
        };

        $scope.kycRecord;
        $scope.bomList;
        $scope.copsList;
        // Initialize dataSave object
        $scope.dataSave = {
            idProof: [],
            addressProof: [],
            pan: [],
            tascDoc: [],
            otherDoc: [],
            clientForm: [],
            accountType: '',
            branchName: '',
            entity: '',
            applicantFirst: '',
            applicantSecond: '',
            applicantThird: '',
            applicantFourth: '',
            applicantFifth: '',
            mobileNo: null,
            adharNoFirst: '',
            adharNoSecond: '',
            adharNoThird: '',
            adharNoFourth: '',
            adharNoFifth: '',
            status: 'Pending at COPs',
            remark: '',
            idProofStatus: '',
            addressProofStatus: '',
            panStatus: '',
            tascDocStatus: '',
            otherDocStatus: '',
            clientFormStatus: '',
            approvedBy: '',
            uploadedBy: $scope.userRecord.userName + "(BOM)"
        };
        // Watch for changes in form fields and update dataSave accordingly
        $scope.$watch('selectedAccOption', function (newVal) {
            $scope.dataSave.accountType = newVal;
        });
        $scope.$watch('branchName', function (newVal) {
            $scope.dataSave.branchName = newVal;
        });
        $scope.$watch('entity', function (newVal) {
            $scope.dataSave.entity = newVal;
        });
        $scope.$watch('applicantFirst', function (newVal) {
            $scope.dataSave.applicantFirst = newVal;
        });
        $scope.$watch('applicantSecond', function (newVal) {
            $scope.dataSave.applicantSecond = newVal;
        });
        $scope.$watch('applicantThird', function (newVal) {
            $scope.dataSave.applicantThird = newVal;
        });
        $scope.$watch('applicantFourth', function (newVal) {
            $scope.dataSave.applicantFourth = newVal;
        });
        $scope.$watch('applicantFifth', function (newVal) {
            $scope.dataSave.applicantFifth = newVal;
        });
        $scope.$watch('mobileNo', function (newVal) {
            $scope.dataSave.mobileNo = parseInt(newVal, 10);
        });
        $scope.$watch('adharNoFirst', function (newVal) {
            $scope.dataSave.adharNoFirst = newVal;
        });
        $scope.$watch('adharNoSecond', function (newVal) {
            $scope.dataSave.adharNoSecond = newVal;
        });
        $scope.$watch('adharNoThird', function (newVal) {
            $scope.dataSave.adharNoThird = newVal;
        });
        $scope.$watch('adharNoFourth', function (newVal) {
            $scope.dataSave.adharNoFourth = newVal;
        });
        $scope.$watch('adharNoFifth', function (newVal) {
            $scope.dataSave.adharNoFifth = newVal;
        });
        // Function to upload files and update dataSave
        $scope.uploadFilesSave = function (files, type) {
            $scope.dataSave[type] = files;
            console.log('Files uploaded:', $scope.dataSave);
        };

        $scope.submitForm = function () {
            kycTascService.save($scope.dataSave).then(function (response) {
                debugger;
                console.log('Response:', response.data);
                if ("" === response.data || null === response.data) {
                    $scope.disableSubmit = false;
                    alert("Already have an Account Type for this Aadhar number !");
                } else {
                    var Ack = response.data.code;
                    alert("Data successfully submitted. Ack_No( " + Ack + " )");
                    window.location.href = $scope.uRl + "user_asBOM.html";
                }
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getAllBranchListOfCOPs = function (userName) {
            kycTascService.getAllBranchListOfCOPs(userName).then(function (response) {
                $scope.copsList = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getAllBranchListOfBOM = function (userName) {
            kycTascService.getAllBranchListOfBOM(userName).then(function (response) {
                $scope.bomList = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getKycRecordById = function (id) {
            kycTascService.getKycRecordById(id).then(function (response) {
                $scope.kycRecord = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.deleteKycRecord = function (id) {
            kycTascService.deleteKycRecord(id).then(function (response) {
                console.log('Record deleted successfully');
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getAllKycRecordInJson = function () {
            kycTascService.getAllKycRecordInJson().then(function (response) {
                $scope.jsonData = response.data;
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        $scope.getKycRecordsByAadharNo = function (adharNo) {
            debugger;
            kycTascService.getKycRecordsByAadharNo(adharNo).then(function (response) {
                $scope.kycRecord = response.data;
            }).catch(function (error) {
                $scope.kycRecord = error;
                console.log('Error:', error);
            });
        };


        $scope.dataUpdate = {
            idProof: [],
            addressProof: [],
            pan: [],
            tascDoc: [],
            otherDoc: [],
            clientForm: [],
            id: '',
            accountType: '',
            branchName: '',
            entity: '',
            applicantFirst: '',
            applicantSecond: '',
            applicantThird: '',
            applicantFourth: '',
            applicantFifth: '',
            mobileNo: null,
            adharNoFirst: '',
            adharNoSecond: '',
            adharNoThird: '',
            adharNoFourth: '',
            adharNoFifth: '',
            status: '',
            remark: '',
            idProofStatus: '',
            addressProofStatus: '',
            panStatus: '',
            tascDocStatus: '',
            otherDocStatus: '',
            clientFormStatus: '',
            approvedBy: '',
            uploadedBy: ''
        };
        $scope.uploadFilesUpdate = function (files, type) {
            $scope.dataUpdate[type] = files;
        };
        $scope.submitUpdateForm = function () {
            kycTascService.updateKycRecord($scope.dataUpdate).then(function (response) {
                console.log('Response:', response.data);
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
        //own logical code here**

        $scope.list = [];
        $scope.forAadharDetails = false;
        $scope.branchlist = [];
        $scope.branchName = $scope.userRecord.branchName;
        $scope.urlB = "branch/getuser/" + $scope.userRecord.userName;
        $http.get($scope.uRl + $scope.urlB)
                .then(function (response) {
                    $scope.branchlist = response.data.branchNameList;
                }, function (error) {
                    console.log(error);
                });
//         $scope.validateForm = function () {
//             if ($scope.showApp2 === true) {
//                 if (!$scope.applicantSecond) {
//                     alert("Please enter Second applicant name.");
//                     return false;
//                 }
//                 if (!$scope.adharNoSecond) {
//                     alert("Please enter Second applicant Aadhar.");
//                     return false;
//                 }
//             }
//             if ($scope.showApp3 === true) {
//                 if (!$scope.applicantThird) {
//                     alert("Please enter third applicant name.");
//                     return false;
//                 }
//                 if (!$scope.adharNoThird) {
//                     alert("Please enter third applicant Aadhar.");
//                     return false;
//                 }
//             }
//             if ($scope.showApp4 === true) {
//                 if (!$scope.applicantFourth) {
//                     alert("Please enter Fourth applicant name.");
//                     return false;
//                 }
//                 if (!$scope.adharNoFourth) {
//                     alert("Please enter Fourth applicant Aadhar.");
//                     return false;
//                 }
//             }
//             if ($scope.showApp5 === true) {
//                 if (!$scope.applicantFifth) {
//                     alert("Please enter Fifth applicant name.");
//                     return false;
//                 }
//                 if (!$scope.adharNoFifth) {
//                     alert("Please enter Fifth applicant Aadhar.");
//                     return false;
//                 }
//             }
//             if ($scope.accountType) {
//                 return true;
//             } else {
//                 alert("Please! select the Account Type.");
//                 return false;
//             }
//         };

        $scope.validateForm = function () {
            debugger;
            const applicants = [
                {show: $scope.showApp2, name: $scope.applicantSecond, aadhar: $scope.adharNoSecond, label: 'Second'},
                {show: $scope.showApp3, name: $scope.applicantThird, aadhar: $scope.adharNoThird, label: 'Third'},
                {show: $scope.showApp4, name: $scope.applicantFourth, aadhar: $scope.adharNoFourth, label: 'Fourth'},
                {show: $scope.showApp5, name: $scope.applicantFifth, aadhar: $scope.adharNoFifth, label: 'Fifth'}
            ];

            for (let i = 0; i < applicants.length; i++) {
                if (applicants[i].show) {
                    if (!applicants[i].name) {
                        alert(`Please enter the ${applicants[i].label} applicant's name.`);
                        return false;
                    }
                    if (!applicants[i].aadhar) {
                        alert(`Please enter the ${applicants[i].label} applicant's Aadhar.`);
                        return false;
                    }
                } else if (!applicants[i].show) {
                    $scope.dataSave['applicant' + applicants[i].label] = "";
                    $scope.dataSave['adharNo' + applicants[i].label] = "";
                }
            }

            if ($scope.accountType) {
                return true;
            } else {
                alert("Please select the Account Type.");
                return false;
            }
        };

        $scope.formdata = function () {
            $scope.disableSubmit = true;
            debugger;
            kycService.getKycRecordsByAadharNo($scope.adharNoFirst).then(function (response) {
                debugger;
                $scope.list = response.data;
                if ($scope.list.length === 0) {
                    $scope.forAadharDetails = false;
                } else {
                    $scope.list = null;
                    $scope.forAadharDetails = false;
                }

                if ($scope.validateForm()) {
                    debugger;
                    if (response.data.length === 0) {
                        $scope.dataSave['remark'] = "BOM : Data Submitted";
                    } else {
                        $scope.dataSave['remark'] = "BOM : Existing Customer KYC Verification for " + $scope.accountType + "";
                    }
                    $scope.submitForm();
                }
            }).catch(function (error) {
                console.log('Error:', error);
            });
        };
    } else {
        window.location.href = $scope.uRl + "index.html";
    }
});
app.directive('ngFiles', ['$parse', function ($parse) {
        return {
            link: function (scope, element, attrs) {
                var onChange = $parse(attrs.ngFiles);
                element.on('change', function (event) {
                    onChange(scope, {$files: event.target.files});
                });
            }
        };
    }]);