 var app = angular.module('COPsFormApp', ['kycApp', 'kycJointSavingApp', 'kycPartnershipApp'
             , 'kycPubpvtApp', 'kycSavingCurrentApp', 'kycSoleProprietorshipApp'
             , 'kycTascApp']);
 app.controller("cont", function ($scope, $http, $timeout, $interval, kycService) {

     var protocal = window.location.protocol;
     var host = window.location.host;
     $scope.uRl = protocal + "//" + host + "/";

     $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asCOPs"));
     if (($scope.userRecord)) {
// start for COPs edit form
         $scope.requestOtpResponse = "";
         $scope.verifyOtpResponse = "";
         $scope.verifyPanResponse = "";
         $scope.isLoading = false;

         $scope.selectedAccOption;
         $scope.Record;
         $scope.kycRecord;
         $scope.forAadharDetails = false;
         $scope.formContainerVisible = true;
         var accountStatus = {
             "Silver Saving": false,
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
             debugger;
             $scope.selectedAccOption = selectedOption;
             for (var key in accountStatus) {
                 if (accountStatus.hasOwnProperty(key)) {
                     accountStatus[key] = (key === selectedOption);
                 }
             }


             $scope.updateScopeVariables();
         };

         $scope.recordData = JSON.parse(window.localStorage.getItem("Record"));
         console.log($scope.recordData);
         $scope.kycRecord = $scope.recordData;
         $scope.changeForm($scope.recordData.accountType);

// end for COPs edit form

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
                 $scope.isLoading = false;
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
                 $scope.isLoading = false;
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
                 $scope.isLoading = false;
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

         $scope.logout = function () {
             alert("Logout Successfully.");
             window.location.href = $scope.uRl + "index.html";
             $scope.list = null;
             window.localStorage.removeItem("user_asCOPs");
         };

         $scope.cancelCOPsForm = function () {
             debugger;
             kycService.kycRecordActive($scope.kycRecord.id, "0").then(function (response) {
                 location.reload();
                 $scope.kycRecord = response.data;
                 window.location.href = $scope.uRl + "user_asCOPs.html";
                 window.localStorage.removeItem("Record");
             }).catch(function (error) {
                 console.log('Error:', error);
             });
         };


     } else {
         window.location.href = $scope.uRl + "index.html";
     }

 });

 app.filter('continuousSubstringFilter', function () {
     return function (list, search, columns) {
         if (!search) {
             return list;
         }

         search = search.toLowerCase();

         return list.filter(function (record) {
             return columns.some(function (column) {
                 var columnValue = record[column] && record[column].toString().toLowerCase();
                 return columnValue && columnValue.includes(search);
             });
         });
     };
 });

// Function to convert image to base64-encoded data URI
 function getBase64Image(imageUrl) {
     var canvas = document.createElement('canvas');
     var ctx = canvas.getContext('2d');
     var img = new Image();
     img.src = imageUrl;
     ctx.drawImage(img, 0, 0);
     var dataURL = canvas.toDataURL('image/jpg'); // You can specify the image format here
     return dataURL;
 }

//silver saving controller
 app.controller('silverSavingCont', function ($scope, $http, kycSavingCurrentService, kycService) {
     var protocal = window.location.protocol;
     var host = window.location.host;
     $scope.uRl = protocal + "//" + host + "/";

     $scope.reco = null;

     $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asCOPs"));
     $scope.recordData = JSON.parse(window.localStorage.getItem("Record"));
     var accountTy = $scope.recordData.accountType;
     if (($scope.userRecord) && accountTy === "Silver Saving") {

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
             id: $scope.id,
             accountType: '',
             branchName: '',
             applicant: '',
             mobileNo: null,
             adharNo: '',
             status: '',
             remark: '',
             idProofStatus: '',
             addressProofStatus: '',
             panStatus: '',
             otherDocStatus: '',
             clientFormStatus: '',
             approvedBy: $scope.approvedBy,
             uploadedBy: $scope.uploadedBy
         };
         // Watch for changes in form fields and update dataSave accordingly
         $scope.$watch('applicant', function (newVal) {
             $scope.dataUpdate.applicant = newVal;
         });
         $scope.$watch('id', function (newVal) {
             $scope.dataUpdate.id = newVal;
         });
         $scope.$watch('branchName', function (newVal) {
             $scope.dataUpdate.branchName = newVal;
         });
         $scope.$watch('accountType', function (newVal) {
             $scope.dataUpdate.accountType = newVal;
         });
         $scope.$watch('approvedBy', function (newVal) {
             $scope.dataUpdate.approvedBy = newVal;
         });
         $scope.$watch('uploadedBy', function (newVal) {
             $scope.dataUpdate.uploadedBy = newVal;
         });
         $scope.$watch('mobileNo', function (newVal) {
             $scope.dataUpdate.mobileNo = parseInt(newVal, 10);
         });
         $scope.$watch('adharNo', function (newVal) {
             $scope.dataUpdate.adharNo = newVal;
         });
         $scope.submitUpdateForm = function () {
             kycSavingCurrentService.updateKycRecordCOPs($scope.dataUpdate).then(function (response) {
                 console.log('Response:', response.data);
                 alert("Data successfully submitted.");
                 window.location.href = $scope.uRl + "user_asCOPs.html";
             }).catch(function (error) {
                 console.log('Error:', error);
             });
         };
         //own logical code here**

         $scope.list = [];
         $scope.forAadharDetails = false;
         $scope.branchlist = [];
         $scope.urlB = "branch/getuser/" + $scope.userRecord.userName;
         $http.get($scope.uRl + $scope.urlB)
                 .then(function (response) {
                     $scope.branchlist = response.data.branchNameList;
                 }, function (error) {
                     console.log(error);
                 });

         $scope.kycDetails = function () {
             kycSavingCurrentService.getRecordByCode($scope.recordData.code).then(function (response) {
                 $scope.autoFillData(response.data);
                 $scope.Record = response.data;
                 $scope.reco = $scope.Record;
                 console.log($scope.Record);
             }).catch(function (error) {
                 console.log('Error:', error);
             });
         };

         $scope.kycDetails();
         $scope.list = [];
         $scope.forAadharDetails = false;
         $scope.branchlist = [];

         $scope.list1 = [];
         $scope.reco = null;
         $scope.idProoffile = [];
         $scope.addressProoffile = [];
         $scope.panfile = [];
         $scope.otherDocfile = [];
         $scope.clientFormfile = [];
         $scope.recoIdProof = [];
         $scope.recoAddressProof = [];
         $scope.recoPan = [];
         $scope.recoOtherDoc = [];
         $scope.recoClientForm = [];
         $scope.accout_Type = null;
//         **
         $scope.list_Adhar = [];
         $scope.idProofStatus = null;
         $scope.addressProofStatus = null;
         $scope.panStatus = null;
         $scope.otherDocStatus = null;
         $scope.clientFormStatus = null;
         $scope.notVisible_OnAccept = false;
         $scope.notVisible_OnAcceptP = false;
         $scope.visibelForAadharDetails = false;

         $scope.openImageInPopup = function (imageUrl) {
             var largeImage = document.getElementById(imageUrl);
             var newWindow = window.open();
             newWindow.document.write('<html><body style="margin:0;"><img src="' + largeImage.src + '"></img></body></html>');
         };

         $scope.dataURLtoFilefunction = function (dataurl, filename) {
             var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                     bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
             while (n--) {
                 u8arr[n] = bstr.charCodeAt(n);
             }
             return new File([u8arr], filename, {type: mime});
         };

         $scope.checkLength = function () {
             var maxLength = 4900;

             if ($scope.remark !== undefined) {

                 if ($scope.remark.length > maxLength) {
                     alert('Text length should not exceed ' + maxLength + ' characters.');
                     // You can also update $scope.inputText or take other actions as needed.
                     $scope.remark = $scope.remark.substring(0, maxLength);
                     return false;
                 } else {
                     return true;
                 }

             } else {
                 alert("Please! Put the Remark.");
                 return false;
             }


         };

         $scope.viewRemark = function (mess) {
             var messRemark = mess.split(",");
             var messLength = messRemark.length;
             alert(messRemark[messLength - 1]);
         };

         $scope.viewIdProof = function () {
             var loopsize = $scope.recoIdProof.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoIdProof[i], '_blank');
             }
         };
         $scope.viewAddressProof = function () {
             var loopsize = $scope.recoAddressProof.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoAddressProof[i], '_blank');
             }
         };
         $scope.viewPan = function () {
             var loopsize = $scope.recoPan.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoPan[i], '_blank');
             }
         };
         $scope.viewPdfClientForm = function () {
             var loopsize = $scope.recoClientForm.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoClientForm[i], '_blank');
             }
         };
         $scope.viewPdfOther = function () {
             var loopsize = $scope.recoOtherDoc.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoOtherDoc[i], '_blank');
             }
         };

         $scope.messApprove = function (messageApprove) {
             if (messageApprove === "Approved") {
                 $scope.notVisible_OnAcceptP = true;
                 $scope.notVisible_OnAccept = true;
             } else if (messageApprove === "Pending at COPs") {
                 $scope.notVisible_OnAcceptP = true;
                 $scope.notVisible_OnAccept = false;
             } else if (messageApprove === "Pending at BOM") {
                 $scope.notVisible_OnAcceptP = false;
                 $scope.notVisible_OnAccept = false;
             }
         };


//         **
         $scope.validateForm = function (mess) {

             if ($scope.accountType) {
                 return true;
             } else {
                 alert("Please! select the Account Type.");
                 return false;
             }
         };

//          **
         $scope.checkFiled = function () {
             if ($scope.idProofStatus === "Accept"
                     && $scope.addressProofStatus === "Accept"
                     && $scope.panStatus === "Accept"
                     && $scope.otherDocStatus === "Accept"
                     && $scope.clientFormStatus === "Accept") {
                 $scope.notVisible_OnAccept = true;
                 $scope.notVisible_OnAcceptP = true;
             } else {
                 $scope.notVisible_OnAccept = false;
                 $scope.notVisible_OnAcceptP = true;
             }
         };

//         **
         $scope.updateDocStatus = function (message, dynamicVar) {
             debugger;
             if (message.endsWith("AC")) {
                 var buttonId = message.slice(0, -2);
                 var buttonA = document.getElementById(message);
                 var buttonR = document.getElementById(buttonId + "RE");
                 buttonA.style.backgroundColor = "blue";
                 buttonA.style.color = "white";
                 buttonR.style.backgroundColor = "#BE4347";
                 buttonR.style.color = "white";
                 $scope[dynamicVar] = buttonA.textContent;
                 $scope.checkFiled();
             } else {
                 var buttonId = message.slice(0, -2);
                 var buttonR = document.getElementById(message);
                 var buttonA = document.getElementById(buttonId + "AC");
                 buttonR.style.backgroundColor = "blue";
                 buttonR.style.color = "white";
                 buttonA.style.backgroundColor = "#85B87E";
                 buttonA.style.color = "white";
                 $scope[dynamicVar] = buttonR.textContent;
                 $scope.checkFiled();
             }
         };

//         **
         $scope.autoFillData = function (record) {
             $scope.formContainerVisible = true;
             $scope.list1 = record;
             console.log(record);

             $scope.reco = $scope.list1;
             $scope.id = $scope.list1.id;
             $scope.adharNo = $scope.list1.adharNoFirst;
             $scope.applicant = $scope.list1.applicantFirst;
             $scope.mobileNo = $scope.list1.mobileNo;
             $scope.accountType = $scope.list1.accountType;
             $scope.branchName = $scope.list1.branchName;
             $scope.status = $scope.list1.status;
             $scope.oldRemark = $scope.list1.remark;
             $scope.approvedBy = $scope.list1.approvedBy;
             $scope.uploadedBy = $scope.list1.uploadedBy;
             $scope.messApprove($scope.list1.status);
             //**
             $scope.idProofStatus = $scope.list1.idProofStatus;
             $scope.addressProofStatus = $scope.list1.addressProofStatus;
             $scope.panStatus = $scope.list1.panStatus;
             $scope.otherDocStatus = $scope.list1.otherDocStatus;
             $scope.clientFormStatus = $scope.list1.clientFormStatus;
             $scope.checkFiled();
             var loopForIdProof = $scope.list1.idProof.length;
             for (var i = 0; i < loopForIdProof; i++) {
                 var idProoffile = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.list1.idProof[i], "idProof_" + i);
                 $scope.recoIdProof.push(URL.createObjectURL(idProoffile));
             }

             var loopForAddressProof = $scope.list1.addressProof.length;
             for (var i = 0; i < loopForAddressProof; i++) {
                 var addressProoffile = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.list1.addressProof[i], "addressProof_" + i);
                 $scope.recoAddressProof.push(URL.createObjectURL(addressProoffile));
             }

             var loopForPan = $scope.list1.pan.length;
             for (var i = 0; i < loopForPan; i++) {
                 var panfile = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.list1.pan[i], "pan_" + i);
                 $scope.recoPan.push(URL.createObjectURL(panfile));
             }
             var loopForClientForm = $scope.list1.clientForm.length;
             for (var i = 0; i < loopForClientForm; i++) {
                 var clientFormfile = $scope.dataURLtoFilefunction('data:application/pdf;base64,' + $scope.list1.clientForm[i], "clientForm_" + i);
                 $scope.recoClientForm.push(URL.createObjectURL(clientFormfile));
             }

             var loopForOtherDoc = $scope.list1.otherDoc.length;
             for (var i = 0; i < loopForOtherDoc; i++) {
                 var otherDocfile = $scope.dataURLtoFilefunction('data:application/pdf;base64,' + $scope.list1.otherDoc[i], "otherDoc_" + i);
                 $scope.recoOtherDoc.push(URL.createObjectURL(otherDocfile));
             }
         };

//         **
         $scope.formdata = function (message) {
             debugger;
             //Test
             if (message === "Pending at BOM") {
                 if ($scope.checkLength()) {
                     $scope.dataUpdate['remark'] = "COPs : " + $scope.remark;
                     $scope.dataUpdate['status'] = 'Pending at BOM';
                 } else {
                     return;
                 }

             } else if (message === "Approved") {
                 $scope.dataUpdate['remark'] = "";
                 $scope.dataUpdate['status'] = 'Approved';
                 $scope.dataUpdate['approvedBy'] = $scope.userRecord.userName + "(COPs)";
             }

             if ($scope.validateForm(message)) {
                 $scope.dataUpdate['idProofStatus'] = $scope.idProofStatus;
                 $scope.dataUpdate['addressProofStatus'] = $scope.addressProofStatus;
                 $scope.dataUpdate['panStatus'] = $scope.panStatus;
                 $scope.dataUpdate['otherDocStatus'] = $scope.otherDocStatus;
                 $scope.dataUpdate['clientFormStatus'] = $scope.clientFormStatus;
                 $scope.submitUpdateForm();
             }

         };
     }
 });


 app.controller("normalSavingCont", function ($scope, $http, kycSavingCurrentService, kycService) {
     var protocal = window.location.protocol;
     var host = window.location.host;
     $scope.uRl = protocal + "//" + host + "/";

     $scope.reco = null;

     $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asCOPs"));
     $scope.recordData = JSON.parse(window.localStorage.getItem("Record"));
     var accountTy = $scope.recordData.accountType;
     if (($scope.userRecord) && accountTy === "Normal Saving") {

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
             id: $scope.id,
             accountType: '',
             branchName: '',
             applicant: '',
             mobileNo: null,
             adharNo: '',
             status: '',
             remark: '',
             idProofStatus: '',
             addressProofStatus: '',
             panStatus: '',
             otherDocStatus: '',
             clientFormStatus: '',
             approvedBy: $scope.approvedBy,
             uploadedBy: $scope.uploadedBy
         };
         // Watch for changes in form fields and update dataSave accordingly
         $scope.$watch('applicant', function (newVal) {
             $scope.dataUpdate.applicant = newVal;
         });
         $scope.$watch('id', function (newVal) {
             $scope.dataUpdate.id = newVal;
         });
         $scope.$watch('branchName', function (newVal) {
             $scope.dataUpdate.branchName = newVal;
         });
         $scope.$watch('accountType', function (newVal) {
             $scope.dataUpdate.accountType = newVal;
         });
         $scope.$watch('approvedBy', function (newVal) {
             $scope.dataUpdate.approvedBy = newVal;
         });
         $scope.$watch('uploadedBy', function (newVal) {
             $scope.dataUpdate.uploadedBy = newVal;
         });
         $scope.$watch('mobileNo', function (newVal) {
             $scope.dataUpdate.mobileNo = parseInt(newVal, 10);
         });
         $scope.$watch('adharNo', function (newVal) {
             $scope.dataUpdate.adharNo = newVal;
         });
         $scope.submitUpdateForm = function () {
             kycSavingCurrentService.updateKycRecordCOPs($scope.dataUpdate).then(function (response) {
                 console.log('Response:', response.data);
                 alert("Data successfully submitted.");
                 window.location.href = $scope.uRl + "user_asCOPs.html";
             }).catch(function (error) {
                 console.log('Error:', error);
             });
         };
         //own logical code here**

         $scope.list = [];
         $scope.forAadharDetails = false;
         $scope.branchlist = [];
         $scope.urlB = "branch/getuser/" + $scope.userRecord.userName;
         $http.get($scope.uRl + $scope.urlB)
                 .then(function (response) {
                     $scope.branchlist = response.data.branchNameList;
                 }, function (error) {
                     console.log(error);
                 });

         $scope.kycDetails = function () {
             kycSavingCurrentService.getRecordByCode($scope.recordData.code).then(function (response) {
                 $scope.autoFillData(response.data);
                 $scope.Record = response.data;
                 $scope.reco = $scope.Record;
                 console.log($scope.Record);
             }).catch(function (error) {
                 console.log('Error:', error);
             });
         };

         $scope.kycDetails();
         $scope.list = [];
         $scope.forAadharDetails = false;
         $scope.branchlist = [];

         $scope.list1 = [];
         $scope.reco = null;
         $scope.idProoffile = [];
         $scope.addressProoffile = [];
         $scope.panfile = [];
         $scope.otherDocfile = [];
         $scope.clientFormfile = [];
         $scope.recoIdProof = [];
         $scope.recoAddressProof = [];
         $scope.recoPan = [];
         $scope.recoOtherDoc = [];
         $scope.recoClientForm = [];
         $scope.accout_Type = null;
//         **
         $scope.list_Adhar = [];
         $scope.idProofStatus = null;
         $scope.addressProofStatus = null;
         $scope.panStatus = null;
         $scope.otherDocStatus = null;
         $scope.clientFormStatus = null;
         $scope.notVisible_OnAccept = false;
         $scope.notVisible_OnAcceptP = false;
         $scope.visibelForAadharDetails = false;

         $scope.openImageInPopup = function (imageUrl) {
             var largeImage = document.getElementById(imageUrl);
             var newWindow = window.open();
             newWindow.document.write('<html><body style="margin:0;"><img src="' + largeImage.src + '"></img></body></html>');
         };

         $scope.dataURLtoFilefunction = function (dataurl, filename) {
             var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                     bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
             while (n--) {
                 u8arr[n] = bstr.charCodeAt(n);
             }
             return new File([u8arr], filename, {type: mime});
         };

         $scope.checkLength = function () {
             var maxLength = 4900;

             if ($scope.remark !== undefined) {

                 if ($scope.remark.length > maxLength) {
                     alert('Text length should not exceed ' + maxLength + ' characters.');
                     // You can also update $scope.inputText or take other actions as needed.
                     $scope.remark = $scope.remark.substring(0, maxLength);
                     return false;
                 } else {
                     return true;
                 }

             } else {
                 alert("Please! Put the Remark.");
                 return false;
             }


         };

         $scope.viewRemark = function (mess) {
             var messRemark = mess.split(",");
             var messLength = messRemark.length;
             alert(messRemark[messLength - 1]);
         };

         $scope.viewIdProof = function () {
             var loopsize = $scope.recoIdProof.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoIdProof[i], '_blank');
             }
         };
         $scope.viewAddressProof = function () {
             var loopsize = $scope.recoAddressProof.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoAddressProof[i], '_blank');
             }
         };
         $scope.viewPan = function () {
             var loopsize = $scope.recoPan.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoPan[i], '_blank');
             }
         };
         $scope.viewPdfClientForm = function () {
             var loopsize = $scope.recoClientForm.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoClientForm[i], '_blank');
             }
         };
         $scope.viewPdfOther = function () {
             var loopsize = $scope.recoOtherDoc.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoOtherDoc[i], '_blank');
             }
         };

         $scope.messApprove = function (messageApprove) {
             if (messageApprove === "Approved") {
                 $scope.notVisible_OnAcceptP = true;
                 $scope.notVisible_OnAccept = true;
             } else if (messageApprove === "Pending at COPs") {
                 $scope.notVisible_OnAcceptP = true;
                 $scope.notVisible_OnAccept = false;
             } else if (messageApprove === "Pending at BOM") {
                 $scope.notVisible_OnAcceptP = false;
                 $scope.notVisible_OnAccept = false;
             }
         };


//         **
         $scope.validateForm = function (mess) {

             if ($scope.accountType) {
                 return true;
             } else {
                 alert("Please! select the Account Type.");
                 return false;
             }
         };

//          **
         $scope.checkFiled = function () {
             if ($scope.idProofStatus === "Accept"
                     && $scope.addressProofStatus === "Accept"
                     && $scope.panStatus === "Accept"
                     && $scope.otherDocStatus === "Accept"
                     && $scope.clientFormStatus === "Accept") {
                 $scope.notVisible_OnAccept = true;
                 $scope.notVisible_OnAcceptP = true;
             } else {
                 $scope.notVisible_OnAccept = false;
                 $scope.notVisible_OnAcceptP = true;
             }
         };

//         **
         $scope.updateDocStatus = function (message, dynamicVar) {
             debugger;
             if (message.endsWith("AC")) {
                 var buttonId = message.slice(0, -2);
                 var buttonA = document.getElementById(message);
                 var buttonR = document.getElementById(buttonId + "RE");
                 buttonA.style.backgroundColor = "blue";
                 buttonA.style.color = "white";
                 buttonR.style.backgroundColor = "#BE4347";
                 buttonR.style.color = "white";
                 $scope[dynamicVar] = buttonA.textContent;
                 $scope.checkFiled();
             } else {
                 var buttonId = message.slice(0, -2);
                 var buttonR = document.getElementById(message);
                 var buttonA = document.getElementById(buttonId + "AC");
                 buttonR.style.backgroundColor = "blue";
                 buttonR.style.color = "white";
                 buttonA.style.backgroundColor = "#85B87E";
                 buttonA.style.color = "white";
                 $scope[dynamicVar] = buttonR.textContent;
                 $scope.checkFiled();
             }
         };

//         **
         $scope.autoFillData = function (record) {
             $scope.formContainerVisible = true;
             $scope.list1 = record;
             console.log(record);

             $scope.reco = $scope.list1;
             $scope.id = $scope.list1.id;
             $scope.adharNo = $scope.list1.adharNoFirst;
             $scope.applicant = $scope.list1.applicantFirst;
             $scope.mobileNo = $scope.list1.mobileNo;
             $scope.accountType = $scope.list1.accountType;
             $scope.branchName = $scope.list1.branchName;
             $scope.status = $scope.list1.status;
             $scope.oldRemark = $scope.list1.remark;
             $scope.approvedBy = $scope.list1.approvedBy;
             $scope.uploadedBy = $scope.list1.uploadedBy;
             $scope.messApprove($scope.list1.status);
             //**
             $scope.idProofStatus = $scope.list1.idProofStatus;
             $scope.addressProofStatus = $scope.list1.addressProofStatus;
             $scope.panStatus = $scope.list1.panStatus;
             $scope.otherDocStatus = $scope.list1.otherDocStatus;
             $scope.clientFormStatus = $scope.list1.clientFormStatus;
             $scope.checkFiled();
             var loopForIdProof = $scope.list1.idProof.length;
             for (var i = 0; i < loopForIdProof; i++) {
                 var idProoffile = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.list1.idProof[i], "idProof_" + i);
                 $scope.recoIdProof.push(URL.createObjectURL(idProoffile));
             }

             var loopForAddressProof = $scope.list1.addressProof.length;
             for (var i = 0; i < loopForAddressProof; i++) {
                 var addressProoffile = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.list1.addressProof[i], "addressProof_" + i);
                 $scope.recoAddressProof.push(URL.createObjectURL(addressProoffile));
             }

             var loopForPan = $scope.list1.pan.length;
             for (var i = 0; i < loopForPan; i++) {
                 var panfile = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.list1.pan[i], "pan_" + i);
                 $scope.recoPan.push(URL.createObjectURL(panfile));
             }
             var loopForClientForm = $scope.list1.clientForm.length;
             for (var i = 0; i < loopForClientForm; i++) {
                 var clientFormfile = $scope.dataURLtoFilefunction('data:application/pdf;base64,' + $scope.list1.clientForm[i], "clientForm_" + i);
                 $scope.recoClientForm.push(URL.createObjectURL(clientFormfile));
             }

             var loopForOtherDoc = $scope.list1.otherDoc.length;
             for (var i = 0; i < loopForOtherDoc; i++) {
                 var otherDocfile = $scope.dataURLtoFilefunction('data:application/pdf;base64,' + $scope.list1.otherDoc[i], "otherDoc_" + i);
                 $scope.recoOtherDoc.push(URL.createObjectURL(otherDocfile));
             }
         };

//         **
         $scope.formdata = function (message) {
             debugger;
             //Test
             if (message === "Pending at BOM") {
                 if ($scope.checkLength()) {
                     $scope.dataUpdate['remark'] = "COPs : " + $scope.remark;
                     $scope.dataUpdate['status'] = 'Pending at BOM';
                 } else {
                     return;
                 }

             } else if (message === "Approved") {
                 $scope.dataUpdate['remark'] = "";
                 $scope.dataUpdate['status'] = 'Approved';
                 $scope.dataUpdate['approvedBy'] = $scope.userRecord.userName + "(COPs)";
             }

             if ($scope.validateForm(message)) {
                 $scope.dataUpdate['idProofStatus'] = $scope.idProofStatus;
                 $scope.dataUpdate['addressProofStatus'] = $scope.addressProofStatus;
                 $scope.dataUpdate['panStatus'] = $scope.panStatus;
                 $scope.dataUpdate['otherDocStatus'] = $scope.otherDocStatus;
                 $scope.dataUpdate['clientFormStatus'] = $scope.clientFormStatus;
                 $scope.submitUpdateForm();
             }

         };
     }
 });





//joint silver saving
 app.controller("jointSilverSavingCont", function ($scope, $http, kycJointSavingService) {

     var protocal = window.location.protocol;
     var host = window.location.host;
     $scope.uRl = protocal + "//" + host + "/";

     $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asCOPs"));
     $scope.recordData = JSON.parse(window.localStorage.getItem("Record"));
     var accountTy = $scope.recordData.accountType;
     if (($scope.userRecord) && accountTy === "Joint Silver Saving") {

//       form button for add applicant and aadhar

         $scope.showApp3 = false;

         $scope.addApplicant = function () {
             $scope.showApp3 = true;
         };

         $scope.removeApplicant = function () {
             $scope.showApp3 = false;
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
//             entityProof: [],
             otherDoc: [],
             clientForm: [],
             id: '',
             accountType: '',
             branchName: '',
//             entity: '',
             applicantFirst: '',
             applicantSecond: '',
             applicantThird: '',
             mobileNo: '',
             adharNoFirst: '',
             adharNoSecond: '',
             adharNoThird: '',
             status: 'Pending at COPs',
             remark: '',
             idProofStatus: '',
             addressProofStatus: '',
             panStatus: '',
//             entityProofStatus: '',
             otherDocStatus: '',
             clientFormStatus: '',
             approvedBy: $scope.approvedBy,
             uploadedBy: $scope.uploadedBy
         };
         // Watch for changes in form fields and update dataSave accordingly
         $scope.$watch('id', function (newVal) {
             $scope.dataUpdate.id = newVal;
         });
         $scope.$watch('accountType', function (newVal) {
             $scope.dataUpdate.accountType = newVal;
         });
         $scope.$watch('branchName', function (newVal) {
             $scope.dataUpdate.branchName = newVal;
         });
//         $scope.$watch('entity', function (newVal) {
//             $scope.dataUpdate.entity = newVal;
//         });
         $scope.$watch('applicantFirst', function (newVal) {
             $scope.dataUpdate.applicantFirst = newVal;
         });
         $scope.$watch('applicantSecond', function (newVal) {
             $scope.dataUpdate.applicantSecond = newVal;
         });
         $scope.$watch('applicantThird', function (newVal) {
             $scope.dataUpdate.applicantThird = newVal;
         });
         $scope.$watch('mobileNo', function (newVal) {
             $scope.dataUpdate.mobileNo = parseInt(newVal, 10);
         });
         $scope.$watch('adharNoFirst', function (newVal) {
             $scope.dataUpdate.adharNoFirst = newVal;
         });
         $scope.$watch('adharNoSecond', function (newVal) {
             $scope.dataUpdate.adharNoSecond = newVal;
         });
         $scope.$watch('adharNoThird', function (newVal) {
             $scope.dataUpdate.adharNoThird = newVal;
         });
         $scope.$watch('remark', function (newVal) {
             $scope.dataUpdate.remark = newVal;
         });
         $scope.$watch('approvedBy', function (newVal) {
             $scope.dataUpdate.approvedBy = newVal;
         });
         $scope.$watch('uploadedBy', function (newVal) {
             $scope.dataUpdate.uploadedBy = newVal;
         });
         $scope.uploadFilesUpdate = function (files, type) {
             $scope.dataUpdate[type] = files;
         };
         $scope.submitUpdateForm = function () {
             kycJointSavingService.updateCOPs($scope.dataUpdate).then(function (response) {
                 console.log('Response:', response.data);
                 alert("Data successfully submitted.");
                 window.location.href = $scope.uRl + "user_asCOPs.html";
             }).catch(function (error) {
                 console.log('Error:', error);
             });
         };
         //own logical code here**

         $scope.list = [];
         $scope.forAadharDetails = false;
         $scope.branchlist = [];
         $scope.urlB = "branch/getuser/" + $scope.userRecord.userName;
         $http.get($scope.uRl + $scope.urlB)
                 .then(function (response) {
                     $scope.branchlist = response.data.branchNameList;
                 }, function (error) {
                     console.log(error);
                 });

         $scope.kycDetails = function () {
             kycJointSavingService.getRecordByCode($scope.recordData.code).then(function (response) {
                 $scope.autoFillData(response.data);
                 $scope.Record = response.data;
                 $scope.reco = $scope.Record;
                 console.log($scope.Record);
             }).catch(function (error) {
                 console.log('Error:', error);
             });
         };

         $scope.kycDetails();
         $scope.list = [];
         $scope.forAadharDetails = false;
         $scope.branchlist = [];

         $scope.list1 = [];
         $scope.reco = null;
         $scope.idProoffile = [];
         $scope.addressProoffile = [];
         $scope.panfile = [];
//         $scope.entityProoffile = [];
         $scope.otherDocfile = [];
         $scope.clientFormfile = [];
         $scope.recoIdProof = [];
         $scope.recoAddressProof = [];
         $scope.recoPan = [];
//         $scope.recoEntityProof = [];
         $scope.recoOtherDoc = [];
         $scope.recoClientForm = [];
         $scope.accout_Type = null;
//         **
         $scope.list_Adhar = [];
         $scope.idProofStatus = null;
         $scope.addressProofStatus = null;
         $scope.panStatus = null;
         $scope.otherDocStatus = null;
         $scope.clientFormStatus = null;
         $scope.notVisible_OnAccept = false;
         $scope.notVisible_OnAcceptP = false;
         $scope.formContainerVisible = false;
         $scope.listContainerVisible = true;
         $scope.visibelForAadharDetails = false;

         $scope.openImageInPopup = function (imageUrl) {
             var largeImage = document.getElementById(imageUrl);
             var newWindow = window.open();
             newWindow.document.write('<html><body style="margin:0;"><img src="' + largeImage.src + '"></img></body></html>');
         };

         $scope.dataURLtoFilefunction = function (dataurl, filename) {
             var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                     bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
             while (n--) {
                 u8arr[n] = bstr.charCodeAt(n);
             }
             return new File([u8arr], filename, {type: mime});
         };

         $scope.isRemarkTooLong = false;

//         **
         $scope.checkLength = function () {
             var maxLength = 4900;
             if ($scope.remark !== undefined) {

                 if ($scope.remark.length > maxLength) {
                     alert('Text length should not exceed ' + maxLength + ' characters.');
                     // You can also update $scope.inputText or take other actions as needed.
                     $scope.remark = $scope.remark.substring(0, maxLength);
                     return false;
                 } else {
                     return true;
                 }
             } else {
                 alert("Please! Put the Remark.");
                 return false;
             }
         };

         $scope.viewRemark = function (mess) {
             var messRemark = mess.split(",");
             var messLength = messRemark.length;
             alert(messRemark[messLength - 1]);
         };

         $scope.viewIdProof = function () {
             var loopsize = $scope.recoIdProof.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoIdProof[i], '_blank');
             }
         };
         $scope.viewAddressProof = function () {
             var loopsize = $scope.recoAddressProof.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoAddressProof[i], '_blank');
             }
         };
         $scope.viewPan = function () {
             var loopsize = $scope.recoPan.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoPan[i], '_blank');
             }
         };
//         $scope.viewEntityProof = function () {
//             var loopsize = $scope.recoEntityProof.length;
//             for (var i = 0; i < loopsize; i++) {
//                 window.open($scope.recoEntityProof[i], '_blank');
//             }
//         };
         $scope.viewPdfClientForm = function () {
             var loopsize = $scope.recoClientForm.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoClientForm[i], '_blank');
             }
         };
         $scope.viewPdfOther = function () {
             var loopsize = $scope.recoOtherDoc.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoOtherDoc[i], '_blank');
             }
         };

         $scope.messApprove = function (messageApprove) {
             if (messageApprove === "Approved") {
                 $scope.notVisible_OnAcceptP = true;
                 $scope.notVisible_OnAccept = true;
             } else if (messageApprove === "Pending at COPs") {
                 $scope.notVisible_OnAcceptP = true;
                 $scope.notVisible_OnAccept = false;
             } else if (messageApprove === "Pending at BOM") {
                 $scope.notVisible_OnAcceptP = false;
                 $scope.notVisible_OnAccept = false;
             }
         };

//         **
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
                 $scope.dataUpdate['applicantThird'] = "";
                 $scope.dataUpdate['adharNoThird'] = "";
             }

             if ($scope.accountType) {
                 return true;
             } else if (!$scope.accountType) {
                 alert("Please! select the Account Type.");
                 return false;
             }
         };

         $scope.showApplicantAgainstForm = function () {
             if (!($scope.list1.adharNoThird) || $scope.list1.adharNoThird === 'undefined') {
                 $scope.removeApplicant();
             } else if (($scope.list1.adharNoThird)) {
                 $scope.addApplicant();
             }

         };

//          **
         $scope.checkFiled = function () {
             if ($scope.idProofStatus === "Accept"
                     && $scope.addressProofStatus === "Accept"
                     && $scope.panStatus === "Accept"
                     && $scope.otherDocStatus === "Accept"
                     && $scope.clientFormStatus === "Accept") {
                 $scope.notVisible_OnAccept = true;
                 $scope.notVisible_OnAcceptP = true;
             } else {
                 $scope.notVisible_OnAccept = false;
                 $scope.notVisible_OnAcceptP = true;
             }
         };

//         **
         $scope.updateDocStatus = function (message, dynamicVar) {
             debugger;
             if (message.endsWith("AC")) {
                 var buttonId = message.slice(0, -2);
                 var buttonA = document.getElementById(message);
                 var buttonR = document.getElementById(buttonId + "RE");
                 buttonA.style.backgroundColor = "blue";
                 buttonA.style.color = "white";
                 buttonR.style.backgroundColor = "#BE4347";
                 buttonR.style.color = "white";
                 $scope[dynamicVar] = buttonA.textContent;
                 $scope.checkFiled();
             } else {
                 var buttonId = message.slice(0, -2);
                 var buttonR = document.getElementById(message);
                 var buttonA = document.getElementById(buttonId + "AC");
                 buttonR.style.backgroundColor = "blue";
                 buttonR.style.color = "white";
                 buttonA.style.backgroundColor = "#85B87E";
                 buttonA.style.color = "white";
                 $scope[dynamicVar] = buttonR.textContent;
                 $scope.checkFiled();
             }
         };

//         **
         $scope.autoFillData = function (record) {
             $scope.formContainerVisible = true;
             $scope.list1 = record;
             console.log(record);

             $scope.reco = $scope.list1;
             $scope.showApplicantAgainstForm();
             $scope.status = $scope.list1.status;
             $scope.id = $scope.list1.id;

             $scope.accountType = $scope.list1.accountType;
             $scope.branchName = $scope.list1.branchName;
//             $scope.entity = $scope.list1.entity; 

             $scope.applicantFirst = $scope.list1.applicantFirst;
             $scope.applicantSecond = $scope.list1.applicantSecond;
             $scope.applicantThird = $scope.list1.applicantThird;
             $scope.mobileNo = $scope.list1.mobileNo;
             $scope.adharNoFirst = $scope.list1.adharNoFirst;
             $scope.adharNoSecond = $scope.list1.adharNoSecond;
             $scope.adharNoThird = $scope.list1.adharNoThird;
             $scope.oldRemark = $scope.list1.remark;
             $scope.approvedBy = $scope.list1.approvedBy;
             $scope.uploadedBy = $scope.list1.uploadedBy;
             $scope.messApprove($scope.list1.status);
             //**
             $scope.idProofStatus = $scope.list1.idProofStatus;
             $scope.addressProofStatus = $scope.list1.addressProofStatus;
             $scope.panStatus = $scope.list1.panStatus;
             $scope.otherDocStatus = $scope.list1.otherDocStatus;
             $scope.clientFormStatus = $scope.list1.clientFormStatus;
             $scope.checkFiled();

             var loopForIdProof = $scope.list1.idProof.length;
             for (var i = 0; i < loopForIdProof; i++) {
                 var idProoffile = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.list1.idProof[i], "idProof_" + i);
                 $scope.recoIdProof.push(URL.createObjectURL(idProoffile));
             }

             var loopForAddressProof = $scope.list1.addressProof.length;
             for (var i = 0; i < loopForAddressProof; i++) {
                 var addressProoffile = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.list1.addressProof[i], "addressProof_" + i);
                 $scope.recoAddressProof.push(URL.createObjectURL(addressProoffile));
             }

             var loopForPan = $scope.list1.pan.length;
             for (var i = 0; i < loopForPan; i++) {
                 var panfile = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.list1.pan[i], "pan_" + i);
                 $scope.recoPan.push(URL.createObjectURL(panfile));
             }
//             var loopForEntityProof = $scope.list1.entityProof.length;
//             for (var i = 0; i < loopForEntityProof; i++) {
//                 var entityProoffile = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.list1.entityProof[i], "entityProof_" + i);
//                 $scope.recoEntityProof.push(URL.createObjectURL(entityProoffile));
//             }
             var loopForClientForm = $scope.list1.clientForm.length;
             for (var i = 0; i < loopForClientForm; i++) {
                 var clientFormfile = $scope.dataURLtoFilefunction('data:application/pdf;base64,' + $scope.list1.clientForm[i], "clientForm_" + i);
                 $scope.recoClientForm.push(URL.createObjectURL(clientFormfile));
             }

             var loopForOtherDoc = $scope.list1.otherDoc.length;
             for (var i = 0; i < loopForOtherDoc; i++) {
                 var otherDocfile = $scope.dataURLtoFilefunction('data:application/pdf;base64,' + $scope.list1.otherDoc[i], "otherDoc_" + i);
                 $scope.recoOtherDoc.push(URL.createObjectURL(otherDocfile));
             }
         };


         $scope.formdata = function (message) {
             debugger;
             //Test
             if (message === "Pending at BOM") {
                 if ($scope.checkLength()) {
                     $scope.dataUpdate['remark'] = "COPs : " + $scope.remark;
                     $scope.dataUpdate['status'] = 'Pending at BOM';
                 } else {
                     return;
                 }

             } else if (message === "Approved") {
                 $scope.dataUpdate['remark'] = "";
                 $scope.dataUpdate['status'] = 'Approved';
                 $scope.dataUpdate['approvedBy'] = $scope.userRecord.userName + "(COPs)";
             }
             if ($scope.validateForm()) {
                 $scope.dataUpdate['idProofStatus'] = $scope.idProofStatus;
                 $scope.dataUpdate['addressProofStatus'] = $scope.addressProofStatus;
                 $scope.dataUpdate['panStatus'] = $scope.panStatus;
                 $scope.dataUpdate['otherDocStatus'] = $scope.otherDocStatus;
                 $scope.dataUpdate['clientFormStatus'] = $scope.clientFormStatus;
                 $scope.submitUpdateForm();
             }

         };
     }

 });


 app.controller("jointNormalSavingCont", function ($scope, $http, kycJointSavingService) {

     var protocal = window.location.protocol;
     var host = window.location.host;
     $scope.uRl = protocal + "//" + host + "/";

     $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asCOPs"));
     $scope.recordData = JSON.parse(window.localStorage.getItem("Record"));
     var accountTy = $scope.recordData.accountType;
     if (($scope.userRecord) && accountTy === "Joint Normal Saving") {

//       form button for add applicant and aadhar

         $scope.showApp3 = false;

         $scope.addApplicant = function () {
             $scope.showApp3 = true;
         };

         $scope.removeApplicant = function () {
             $scope.showApp3 = false;
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
//             entityProof: [],
             otherDoc: [],
             clientForm: [],
             id: '',
             accountType: '',
             branchName: '',
//             entity: '',
             applicantFirst: '',
             applicantSecond: '',
             applicantThird: '',
             mobileNo: '',
             adharNoFirst: '',
             adharNoSecond: '',
             adharNoThird: '',
             status: 'Pending at COPs',
             remark: '',
             idProofStatus: '',
             addressProofStatus: '',
             panStatus: '',
//             entityProofStatus: '',
             otherDocStatus: '',
             clientFormStatus: '',
             approvedBy: $scope.approvedBy,
             uploadedBy: $scope.uploadedBy
         };
         // Watch for changes in form fields and update dataSave accordingly
         $scope.$watch('id', function (newVal) {
             $scope.dataUpdate.id = newVal;
         });
         $scope.$watch('accountType', function (newVal) {
             $scope.dataUpdate.accountType = newVal;
         });
         $scope.$watch('branchName', function (newVal) {
             $scope.dataUpdate.branchName = newVal;
         });
//         $scope.$watch('entity', function (newVal) {
//             $scope.dataUpdate.entity = newVal;
//         });
         $scope.$watch('applicantFirst', function (newVal) {
             $scope.dataUpdate.applicantFirst = newVal;
         });
         $scope.$watch('applicantSecond', function (newVal) {
             $scope.dataUpdate.applicantSecond = newVal;
         });
         $scope.$watch('applicantThird', function (newVal) {
             $scope.dataUpdate.applicantThird = newVal;
         });
         $scope.$watch('mobileNo', function (newVal) {
             $scope.dataUpdate.mobileNo = parseInt(newVal, 10);
         });
         $scope.$watch('adharNoFirst', function (newVal) {
             $scope.dataUpdate.adharNoFirst = newVal;
         });
         $scope.$watch('adharNoSecond', function (newVal) {
             $scope.dataUpdate.adharNoSecond = newVal;
         });
         $scope.$watch('adharNoThird', function (newVal) {
             $scope.dataUpdate.adharNoThird = newVal;
         });
         $scope.$watch('remark', function (newVal) {
             $scope.dataUpdate.remark = newVal;
         });
         $scope.$watch('approvedBy', function (newVal) {
             $scope.dataUpdate.approvedBy = newVal;
         });
         $scope.$watch('uploadedBy', function (newVal) {
             $scope.dataUpdate.uploadedBy = newVal;
         });
         $scope.uploadFilesUpdate = function (files, type) {
             $scope.dataUpdate[type] = files;
         };
         $scope.submitUpdateForm = function () {
             kycJointSavingService.updateCOPs($scope.dataUpdate).then(function (response) {
                 console.log('Response:', response.data);
                 alert("Data successfully submitted.");
                 window.location.href = $scope.uRl + "user_asCOPs.html";
             }).catch(function (error) {
                 console.log('Error:', error);
             });
         };
         //own logical code here**

         $scope.list = [];
         $scope.forAadharDetails = false;
         $scope.branchlist = [];
         $scope.urlB = "branch/getuser/" + $scope.userRecord.userName;
         $http.get($scope.uRl + $scope.urlB)
                 .then(function (response) {
                     $scope.branchlist = response.data.branchNameList;
                 }, function (error) {
                     console.log(error);
                 });

         $scope.kycDetails = function () {
             kycJointSavingService.getRecordByCode($scope.recordData.code).then(function (response) {
                 $scope.autoFillData(response.data);
                 $scope.Record = response.data;
                 $scope.reco = $scope.Record;
                 console.log($scope.Record);
             }).catch(function (error) {
                 console.log('Error:', error);
             });
         };

         $scope.kycDetails();
         $scope.list = [];
         $scope.forAadharDetails = false;
         $scope.branchlist = [];

         $scope.list1 = [];
         $scope.reco = null;
         $scope.idProoffile = [];
         $scope.addressProoffile = [];
         $scope.panfile = [];
//         $scope.entityProoffile = [];
         $scope.otherDocfile = [];
         $scope.clientFormfile = [];
         $scope.recoIdProof = [];
         $scope.recoAddressProof = [];
         $scope.recoPan = [];
//         $scope.recoEntityProof = [];
         $scope.recoOtherDoc = [];
         $scope.recoClientForm = [];
         $scope.accout_Type = null;
//         **
         $scope.list_Adhar = [];
         $scope.idProofStatus = null;
         $scope.addressProofStatus = null;
         $scope.panStatus = null;
         $scope.otherDocStatus = null;
         $scope.clientFormStatus = null;
         $scope.notVisible_OnAccept = false;
         $scope.notVisible_OnAcceptP = false;
         $scope.formContainerVisible = false;
         $scope.listContainerVisible = true;
         $scope.visibelForAadharDetails = false;

         $scope.openImageInPopup = function (imageUrl) {
             var largeImage = document.getElementById(imageUrl);
             var newWindow = window.open();
             newWindow.document.write('<html><body style="margin:0;"><img src="' + largeImage.src + '"></img></body></html>');
         };

         $scope.dataURLtoFilefunction = function (dataurl, filename) {
             var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                     bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
             while (n--) {
                 u8arr[n] = bstr.charCodeAt(n);
             }
             return new File([u8arr], filename, {type: mime});
         };

         $scope.isRemarkTooLong = false;

//         **
         $scope.checkLength = function () {
             var maxLength = 4900;
             if ($scope.remark !== undefined) {

                 if ($scope.remark.length > maxLength) {
                     alert('Text length should not exceed ' + maxLength + ' characters.');
                     // You can also update $scope.inputText or take other actions as needed.
                     $scope.remark = $scope.remark.substring(0, maxLength);
                     return false;
                 } else {
                     return true;
                 }
             } else {
                 alert("Please! Put the Remark.");
                 return false;
             }
         };

         $scope.viewRemark = function (mess) {
             var messRemark = mess.split(",");
             var messLength = messRemark.length;
             alert(messRemark[messLength - 1]);
         };

         $scope.viewIdProof = function () {
             var loopsize = $scope.recoIdProof.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoIdProof[i], '_blank');
             }
         };
         $scope.viewAddressProof = function () {
             var loopsize = $scope.recoAddressProof.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoAddressProof[i], '_blank');
             }
         };
         $scope.viewPan = function () {
             var loopsize = $scope.recoPan.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoPan[i], '_blank');
             }
         };
//         $scope.viewEntityProof = function () {
//             var loopsize = $scope.recoEntityProof.length;
//             for (var i = 0; i < loopsize; i++) {
//                 window.open($scope.recoEntityProof[i], '_blank');
//             }
//         };
         $scope.viewPdfClientForm = function () {
             var loopsize = $scope.recoClientForm.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoClientForm[i], '_blank');
             }
         };
         $scope.viewPdfOther = function () {
             var loopsize = $scope.recoOtherDoc.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoOtherDoc[i], '_blank');
             }
         };

         $scope.messApprove = function (messageApprove) {
             if (messageApprove === "Approved") {
                 $scope.notVisible_OnAcceptP = true;
                 $scope.notVisible_OnAccept = true;
             } else if (messageApprove === "Pending at COPs") {
                 $scope.notVisible_OnAcceptP = true;
                 $scope.notVisible_OnAccept = false;
             } else if (messageApprove === "Pending at BOM") {
                 $scope.notVisible_OnAcceptP = false;
                 $scope.notVisible_OnAccept = false;
             }
         };

//         **
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
                 $scope.dataUpdate['applicantThird'] = "";
                 $scope.dataUpdate['adharNoThird'] = "";
             }

             if ($scope.accountType) {
                 return true;
             } else if (!$scope.accountType) {
                 alert("Please! select the Account Type.");
                 return false;
             }
         };

         $scope.showApplicantAgainstForm = function () {
             if (!($scope.list1.adharNoThird) || $scope.list1.adharNoThird === 'undefined') {
                 $scope.removeApplicant();
             } else if (($scope.list1.adharNoThird)) {
                 $scope.addApplicant();
             }

         };

//          **
         $scope.checkFiled = function () {
             if ($scope.idProofStatus === "Accept"
                     && $scope.addressProofStatus === "Accept"
                     && $scope.panStatus === "Accept"
                     && $scope.otherDocStatus === "Accept"
                     && $scope.clientFormStatus === "Accept") {
                 $scope.notVisible_OnAccept = true;
                 $scope.notVisible_OnAcceptP = true;
             } else {
                 $scope.notVisible_OnAccept = false;
                 $scope.notVisible_OnAcceptP = true;
             }
         };

//         **
         $scope.updateDocStatus = function (message, dynamicVar) {
             debugger;
             if (message.endsWith("AC")) {
                 var buttonId = message.slice(0, -2);
                 var buttonA = document.getElementById(message);
                 var buttonR = document.getElementById(buttonId + "RE");
                 buttonA.style.backgroundColor = "blue";
                 buttonA.style.color = "white";
                 buttonR.style.backgroundColor = "#BE4347";
                 buttonR.style.color = "white";
                 $scope[dynamicVar] = buttonA.textContent;
                 $scope.checkFiled();
             } else {
                 var buttonId = message.slice(0, -2);
                 var buttonR = document.getElementById(message);
                 var buttonA = document.getElementById(buttonId + "AC");
                 buttonR.style.backgroundColor = "blue";
                 buttonR.style.color = "white";
                 buttonA.style.backgroundColor = "#85B87E";
                 buttonA.style.color = "white";
                 $scope[dynamicVar] = buttonR.textContent;
                 $scope.checkFiled();
             }
         };

//         **
         $scope.autoFillData = function (record) {
             $scope.formContainerVisible = true;
             $scope.list1 = record;
             console.log(record);

             $scope.reco = $scope.list1;
             $scope.showApplicantAgainstForm();
             $scope.status = $scope.list1.status;
             $scope.id = $scope.list1.id;

             $scope.accountType = $scope.list1.accountType;
             $scope.branchName = $scope.list1.branchName;
//             $scope.entity = $scope.list1.entity; 

             $scope.applicantFirst = $scope.list1.applicantFirst;
             $scope.applicantSecond = $scope.list1.applicantSecond;
             $scope.applicantThird = $scope.list1.applicantThird;
             $scope.mobileNo = $scope.list1.mobileNo;
             $scope.adharNoFirst = $scope.list1.adharNoFirst;
             $scope.adharNoSecond = $scope.list1.adharNoSecond;
             $scope.adharNoThird = $scope.list1.adharNoThird;
             $scope.oldRemark = $scope.list1.remark;
             $scope.approvedBy = $scope.list1.approvedBy;
             $scope.uploadedBy = $scope.list1.uploadedBy;
             $scope.messApprove($scope.list1.status);
             //**
             $scope.idProofStatus = $scope.list1.idProofStatus;
             $scope.addressProofStatus = $scope.list1.addressProofStatus;
             $scope.panStatus = $scope.list1.panStatus;
             $scope.otherDocStatus = $scope.list1.otherDocStatus;
             $scope.clientFormStatus = $scope.list1.clientFormStatus;
             $scope.checkFiled();

             var loopForIdProof = $scope.list1.idProof.length;
             for (var i = 0; i < loopForIdProof; i++) {
                 var idProoffile = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.list1.idProof[i], "idProof_" + i);
                 $scope.recoIdProof.push(URL.createObjectURL(idProoffile));
             }

             var loopForAddressProof = $scope.list1.addressProof.length;
             for (var i = 0; i < loopForAddressProof; i++) {
                 var addressProoffile = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.list1.addressProof[i], "addressProof_" + i);
                 $scope.recoAddressProof.push(URL.createObjectURL(addressProoffile));
             }

             var loopForPan = $scope.list1.pan.length;
             for (var i = 0; i < loopForPan; i++) {
                 var panfile = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.list1.pan[i], "pan_" + i);
                 $scope.recoPan.push(URL.createObjectURL(panfile));
             }
//             var loopForEntityProof = $scope.list1.entityProof.length;
//             for (var i = 0; i < loopForEntityProof; i++) {
//                 var entityProoffile = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.list1.entityProof[i], "entityProof_" + i);
//                 $scope.recoEntityProof.push(URL.createObjectURL(entityProoffile));
//             }
             var loopForClientForm = $scope.list1.clientForm.length;
             for (var i = 0; i < loopForClientForm; i++) {
                 var clientFormfile = $scope.dataURLtoFilefunction('data:application/pdf;base64,' + $scope.list1.clientForm[i], "clientForm_" + i);
                 $scope.recoClientForm.push(URL.createObjectURL(clientFormfile));
             }

             var loopForOtherDoc = $scope.list1.otherDoc.length;
             for (var i = 0; i < loopForOtherDoc; i++) {
                 var otherDocfile = $scope.dataURLtoFilefunction('data:application/pdf;base64,' + $scope.list1.otherDoc[i], "otherDoc_" + i);
                 $scope.recoOtherDoc.push(URL.createObjectURL(otherDocfile));
             }
         };


         $scope.formdata = function (message) {
             debugger;
             //Test
             if (message === "Pending at BOM") {
                 if ($scope.checkLength()) {
                     $scope.dataUpdate['remark'] = "COPs : " + $scope.remark;
                     $scope.dataUpdate['status'] = 'Pending at BOM';
                 } else {
                     return;
                 }

             } else if (message === "Approved") {
                 $scope.dataUpdate['remark'] = "";
                 $scope.dataUpdate['status'] = 'Approved';
                 $scope.dataUpdate['approvedBy'] = $scope.userRecord.userName + "(COPs)";
             }
             if ($scope.validateForm()) {
                 $scope.dataUpdate['idProofStatus'] = $scope.idProofStatus;
                 $scope.dataUpdate['addressProofStatus'] = $scope.addressProofStatus;
                 $scope.dataUpdate['panStatus'] = $scope.panStatus;
                 $scope.dataUpdate['otherDocStatus'] = $scope.otherDocStatus;
                 $scope.dataUpdate['clientFormStatus'] = $scope.clientFormStatus;
                 $scope.submitUpdateForm();
             }

         };
     }

 });


 app.controller("normalCurrentCont", function ($scope, $http, kycSavingCurrentService, kycService) {
     var protocal = window.location.protocol;
     var host = window.location.host;
     $scope.uRl = protocal + "//" + host + "/";

     $scope.reco = null;

     $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asCOPs"));
     $scope.recordData = JSON.parse(window.localStorage.getItem("Record"));
     var accountTy = $scope.recordData.accountType;
     if (($scope.userRecord) && accountTy === "Normal Current") {

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
             id: $scope.id,
             accountType: '',
             branchName: '',
             applicant: '',
             mobileNo: null,
             adharNo: '',
             status: '',
             remark: '',
             idProofStatus: '',
             addressProofStatus: '',
             panStatus: '',
             otherDocStatus: '',
             clientFormStatus: '',
             approvedBy: $scope.approvedBy,
             uploadedBy: $scope.uploadedBy
         };
         // Watch for changes in form fields and update dataSave accordingly
         $scope.$watch('applicant', function (newVal) {
             $scope.dataUpdate.applicant = newVal;
         });
         $scope.$watch('id', function (newVal) {
             $scope.dataUpdate.id = newVal;
         });
         $scope.$watch('branchName', function (newVal) {
             $scope.dataUpdate.branchName = newVal;
         });
         $scope.$watch('accountType', function (newVal) {
             $scope.dataUpdate.accountType = newVal;
         });
         $scope.$watch('approvedBy', function (newVal) {
             $scope.dataUpdate.approvedBy = newVal;
         });
         $scope.$watch('uploadedBy', function (newVal) {
             $scope.dataUpdate.uploadedBy = newVal;
         });
         $scope.$watch('mobileNo', function (newVal) {
             $scope.dataUpdate.mobileNo = parseInt(newVal, 10);
         });
         $scope.$watch('adharNo', function (newVal) {
             $scope.dataUpdate.adharNo = newVal;
         });
         $scope.submitUpdateForm = function () {
             kycSavingCurrentService.updateKycRecordCOPs($scope.dataUpdate).then(function (response) {
                 console.log('Response:', response.data);
                 alert("Data successfully submitted.");
                 window.location.href = $scope.uRl + "user_asCOPs.html";
             }).catch(function (error) {
                 console.log('Error:', error);
             });
         };
         //own logical code here**

         $scope.list = [];
         $scope.forAadharDetails = false;
         $scope.branchlist = [];
         $scope.urlB = "branch/getuser/" + $scope.userRecord.userName;
         $http.get($scope.uRl + $scope.urlB)
                 .then(function (response) {
                     $scope.branchlist = response.data.branchNameList;
                 }, function (error) {
                     console.log(error);
                 });

         $scope.kycDetails = function () {
             kycSavingCurrentService.getRecordByCode($scope.recordData.code).then(function (response) {
                 $scope.autoFillData(response.data);
                 $scope.Record = response.data;
                 $scope.reco = $scope.Record;
                 console.log($scope.Record);
             }).catch(function (error) {
                 console.log('Error:', error);
             });
         };

         $scope.kycDetails();
         $scope.list = [];
         $scope.forAadharDetails = false;
         $scope.branchlist = [];

         $scope.list1 = [];
         $scope.reco = null;
         $scope.idProoffile = [];
         $scope.addressProoffile = [];
         $scope.panfile = [];
         $scope.otherDocfile = [];
         $scope.clientFormfile = [];
         $scope.recoIdProof = [];
         $scope.recoAddressProof = [];
         $scope.recoPan = [];
         $scope.recoOtherDoc = [];
         $scope.recoClientForm = [];
         $scope.accout_Type = null;
//         **
         $scope.list_Adhar = [];
         $scope.idProofStatus = null;
         $scope.addressProofStatus = null;
         $scope.panStatus = null;
         $scope.otherDocStatus = null;
         $scope.clientFormStatus = null;
         $scope.notVisible_OnAccept = false;
         $scope.notVisible_OnAcceptP = false;
         $scope.visibelForAadharDetails = false;

         $scope.openImageInPopup = function (imageUrl) {
             var largeImage = document.getElementById(imageUrl);
             var newWindow = window.open();
             newWindow.document.write('<html><body style="margin:0;"><img src="' + largeImage.src + '"></img></body></html>');
         };

         $scope.dataURLtoFilefunction = function (dataurl, filename) {
             var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                     bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
             while (n--) {
                 u8arr[n] = bstr.charCodeAt(n);
             }
             return new File([u8arr], filename, {type: mime});
         };

         $scope.checkLength = function () {
             var maxLength = 4900;

             if ($scope.remark !== undefined) {

                 if ($scope.remark.length > maxLength) {
                     alert('Text length should not exceed ' + maxLength + ' characters.');
                     // You can also update $scope.inputText or take other actions as needed.
                     $scope.remark = $scope.remark.substring(0, maxLength);
                     return false;
                 } else {
                     return true;
                 }

             } else {
                 alert("Please! Put the Remark.");
                 return false;
             }


         };

         $scope.viewRemark = function (mess) {
             var messRemark = mess.split(",");
             var messLength = messRemark.length;
             alert(messRemark[messLength - 1]);
         };

         $scope.viewIdProof = function () {
             var loopsize = $scope.recoIdProof.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoIdProof[i], '_blank');
             }
         };
         $scope.viewAddressProof = function () {
             var loopsize = $scope.recoAddressProof.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoAddressProof[i], '_blank');
             }
         };
         $scope.viewPan = function () {
             var loopsize = $scope.recoPan.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoPan[i], '_blank');
             }
         };
         $scope.viewPdfClientForm = function () {
             var loopsize = $scope.recoClientForm.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoClientForm[i], '_blank');
             }
         };
         $scope.viewPdfOther = function () {
             var loopsize = $scope.recoOtherDoc.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoOtherDoc[i], '_blank');
             }
         };

         $scope.messApprove = function (messageApprove) {
             if (messageApprove === "Approved") {
                 $scope.notVisible_OnAcceptP = true;
                 $scope.notVisible_OnAccept = true;
             } else if (messageApprove === "Pending at COPs") {
                 $scope.notVisible_OnAcceptP = true;
                 $scope.notVisible_OnAccept = false;
             } else if (messageApprove === "Pending at BOM") {
                 $scope.notVisible_OnAcceptP = false;
                 $scope.notVisible_OnAccept = false;
             }
         };


//         **
         $scope.validateForm = function (mess) {

             if ($scope.accountType) {
                 return true;
             } else {
                 alert("Please! select the Account Type.");
                 return false;
             }
         };

//          **
         $scope.checkFiled = function () {
             if ($scope.idProofStatus === "Accept"
                     && $scope.addressProofStatus === "Accept"
                     && $scope.panStatus === "Accept"
                     && $scope.otherDocStatus === "Accept"
                     && $scope.clientFormStatus === "Accept") {
                 $scope.notVisible_OnAccept = true;
                 $scope.notVisible_OnAcceptP = true;
             } else {
                 $scope.notVisible_OnAccept = false;
                 $scope.notVisible_OnAcceptP = true;
             }
         };

//         **
         $scope.updateDocStatus = function (message, dynamicVar) {
             debugger;
             if (message.endsWith("AC")) {
                 var buttonId = message.slice(0, -2);
                 var buttonA = document.getElementById(message);
                 var buttonR = document.getElementById(buttonId + "RE");
                 buttonA.style.backgroundColor = "blue";
                 buttonA.style.color = "white";
                 buttonR.style.backgroundColor = "#BE4347";
                 buttonR.style.color = "white";
                 $scope[dynamicVar] = buttonA.textContent;
                 $scope.checkFiled();
             } else {
                 var buttonId = message.slice(0, -2);
                 var buttonR = document.getElementById(message);
                 var buttonA = document.getElementById(buttonId + "AC");
                 buttonR.style.backgroundColor = "blue";
                 buttonR.style.color = "white";
                 buttonA.style.backgroundColor = "#85B87E";
                 buttonA.style.color = "white";
                 $scope[dynamicVar] = buttonR.textContent;
                 $scope.checkFiled();
             }
         };

//         **
         $scope.autoFillData = function (record) {
             $scope.formContainerVisible = true;
             $scope.list1 = record;
             console.log(record);

             $scope.reco = $scope.list1;
             $scope.id = $scope.list1.id;
             $scope.adharNo = $scope.list1.adharNoFirst;
             $scope.applicant = $scope.list1.applicantFirst;
             $scope.mobileNo = $scope.list1.mobileNo;
             $scope.accountType = $scope.list1.accountType;
             $scope.branchName = $scope.list1.branchName;
             $scope.status = $scope.list1.status;
             $scope.oldRemark = $scope.list1.remark;
             $scope.approvedBy = $scope.list1.approvedBy;
             $scope.uploadedBy = $scope.list1.uploadedBy;
             $scope.messApprove($scope.list1.status);
             //**
             $scope.idProofStatus = $scope.list1.idProofStatus;
             $scope.addressProofStatus = $scope.list1.addressProofStatus;
             $scope.panStatus = $scope.list1.panStatus;
             $scope.otherDocStatus = $scope.list1.otherDocStatus;
             $scope.clientFormStatus = $scope.list1.clientFormStatus;
             $scope.checkFiled();
             var loopForIdProof = $scope.list1.idProof.length;
             for (var i = 0; i < loopForIdProof; i++) {
                 var idProoffile = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.list1.idProof[i], "idProof_" + i);
                 $scope.recoIdProof.push(URL.createObjectURL(idProoffile));
             }

             var loopForAddressProof = $scope.list1.addressProof.length;
             for (var i = 0; i < loopForAddressProof; i++) {
                 var addressProoffile = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.list1.addressProof[i], "addressProof_" + i);
                 $scope.recoAddressProof.push(URL.createObjectURL(addressProoffile));
             }

             var loopForPan = $scope.list1.pan.length;
             for (var i = 0; i < loopForPan; i++) {
                 var panfile = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.list1.pan[i], "pan_" + i);
                 $scope.recoPan.push(URL.createObjectURL(panfile));
             }
             var loopForClientForm = $scope.list1.clientForm.length;
             for (var i = 0; i < loopForClientForm; i++) {
                 var clientFormfile = $scope.dataURLtoFilefunction('data:application/pdf;base64,' + $scope.list1.clientForm[i], "clientForm_" + i);
                 $scope.recoClientForm.push(URL.createObjectURL(clientFormfile));
             }

             var loopForOtherDoc = $scope.list1.otherDoc.length;
             for (var i = 0; i < loopForOtherDoc; i++) {
                 var otherDocfile = $scope.dataURLtoFilefunction('data:application/pdf;base64,' + $scope.list1.otherDoc[i], "otherDoc_" + i);
                 $scope.recoOtherDoc.push(URL.createObjectURL(otherDocfile));
             }
         };

//         **
         $scope.formdata = function (message) {
             debugger;
             //Test
             if (message === "Pending at BOM") {
                 if ($scope.checkLength()) {
                     $scope.dataUpdate['remark'] = "COPs : " + $scope.remark;
                     $scope.dataUpdate['status'] = 'Pending at BOM';
                 } else {
                     return;
                 }

             } else if (message === "Approved") {
                 $scope.dataUpdate['remark'] = "";
                 $scope.dataUpdate['status'] = 'Approved';
                 $scope.dataUpdate['approvedBy'] = $scope.userRecord.userName + "(COPs)";
             }

             if ($scope.validateForm(message)) {
                 $scope.dataUpdate['idProofStatus'] = $scope.idProofStatus;
                 $scope.dataUpdate['addressProofStatus'] = $scope.addressProofStatus;
                 $scope.dataUpdate['panStatus'] = $scope.panStatus;
                 $scope.dataUpdate['otherDocStatus'] = $scope.otherDocStatus;
                 $scope.dataUpdate['clientFormStatus'] = $scope.clientFormStatus;
                 $scope.submitUpdateForm();
             }

         };
     }
 });


 app.controller("currentGoldCont", function ($scope, $http, kycSavingCurrentService, kycService) {
     var protocal = window.location.protocol;
     var host = window.location.host;
     $scope.uRl = protocal + "//" + host + "/";

     $scope.reco = null;

     $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asCOPs"));
     $scope.recordData = JSON.parse(window.localStorage.getItem("Record"));
     var accountTy = $scope.recordData.accountType;
     if (($scope.userRecord) && accountTy === "Current Gold") {

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
             id: $scope.id,
             accountType: '',
             branchName: '',
             applicant: '',
             mobileNo: null,
             adharNo: '',
             status: '',
             remark: '',
             idProofStatus: '',
             addressProofStatus: '',
             panStatus: '',
             otherDocStatus: '',
             clientFormStatus: '',
             approvedBy: $scope.approvedBy,
             uploadedBy: $scope.uploadedBy
         };
         // Watch for changes in form fields and update dataSave accordingly
         $scope.$watch('applicant', function (newVal) {
             $scope.dataUpdate.applicant = newVal;
         });
         $scope.$watch('id', function (newVal) {
             $scope.dataUpdate.id = newVal;
         });
         $scope.$watch('branchName', function (newVal) {
             $scope.dataUpdate.branchName = newVal;
         });
         $scope.$watch('accountType', function (newVal) {
             $scope.dataUpdate.accountType = newVal;
         });
         $scope.$watch('approvedBy', function (newVal) {
             $scope.dataUpdate.approvedBy = newVal;
         });
         $scope.$watch('uploadedBy', function (newVal) {
             $scope.dataUpdate.uploadedBy = newVal;
         });
         $scope.$watch('mobileNo', function (newVal) {
             $scope.dataUpdate.mobileNo = parseInt(newVal, 10);
         });
         $scope.$watch('adharNo', function (newVal) {
             $scope.dataUpdate.adharNo = newVal;
         });
         $scope.submitUpdateForm = function () {
             kycSavingCurrentService.updateKycRecordCOPs($scope.dataUpdate).then(function (response) {
                 console.log('Response:', response.data);
                 alert("Data successfully submitted.");
                 window.location.href = $scope.uRl + "user_asCOPs.html";
             }).catch(function (error) {
                 console.log('Error:', error);
             });
         };
         //own logical code here**

         $scope.list = [];
         $scope.forAadharDetails = false;
         $scope.branchlist = [];
         $scope.urlB = "branch/getuser/" + $scope.userRecord.userName;
         $http.get($scope.uRl + $scope.urlB)
                 .then(function (response) {
                     $scope.branchlist = response.data.branchNameList;
                 }, function (error) {
                     console.log(error);
                 });

         $scope.kycDetails = function () {
             kycSavingCurrentService.getRecordByCode($scope.recordData.code).then(function (response) {
                 $scope.autoFillData(response.data);
                 $scope.Record = response.data;
                 $scope.reco = $scope.Record;
                 console.log($scope.Record);
             }).catch(function (error) {
                 console.log('Error:', error);
             });
         };

         $scope.kycDetails();
         $scope.list = [];
         $scope.forAadharDetails = false;
         $scope.branchlist = [];

         $scope.list1 = [];
         $scope.reco = null;
         $scope.idProoffile = [];
         $scope.addressProoffile = [];
         $scope.panfile = [];
         $scope.otherDocfile = [];
         $scope.clientFormfile = [];
         $scope.recoIdProof = [];
         $scope.recoAddressProof = [];
         $scope.recoPan = [];
         $scope.recoOtherDoc = [];
         $scope.recoClientForm = [];
         $scope.accout_Type = null;
//         **
         $scope.list_Adhar = [];
         $scope.idProofStatus = null;
         $scope.addressProofStatus = null;
         $scope.panStatus = null;
         $scope.otherDocStatus = null;
         $scope.clientFormStatus = null;
         $scope.notVisible_OnAccept = false;
         $scope.notVisible_OnAcceptP = false;
         $scope.visibelForAadharDetails = false;

         $scope.openImageInPopup = function (imageUrl) {
             var largeImage = document.getElementById(imageUrl);
             var newWindow = window.open();
             newWindow.document.write('<html><body style="margin:0;"><img src="' + largeImage.src + '"></img></body></html>');
         };

         $scope.dataURLtoFilefunction = function (dataurl, filename) {
             var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                     bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
             while (n--) {
                 u8arr[n] = bstr.charCodeAt(n);
             }
             return new File([u8arr], filename, {type: mime});
         };

         $scope.checkLength = function () {
             var maxLength = 4900;

             if ($scope.remark !== undefined) {

                 if ($scope.remark.length > maxLength) {
                     alert('Text length should not exceed ' + maxLength + ' characters.');
                     // You can also update $scope.inputText or take other actions as needed.
                     $scope.remark = $scope.remark.substring(0, maxLength);
                     return false;
                 } else {
                     return true;
                 }

             } else {
                 alert("Please! Put the Remark.");
                 return false;
             }


         };

         $scope.viewRemark = function (mess) {
             var messRemark = mess.split(",");
             var messLength = messRemark.length;
             alert(messRemark[messLength - 1]);
         };

         $scope.viewIdProof = function () {
             var loopsize = $scope.recoIdProof.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoIdProof[i], '_blank');
             }
         };
         $scope.viewAddressProof = function () {
             var loopsize = $scope.recoAddressProof.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoAddressProof[i], '_blank');
             }
         };
         $scope.viewPan = function () {
             var loopsize = $scope.recoPan.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoPan[i], '_blank');
             }
         };
         $scope.viewPdfClientForm = function () {
             var loopsize = $scope.recoClientForm.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoClientForm[i], '_blank');
             }
         };
         $scope.viewPdfOther = function () {
             var loopsize = $scope.recoOtherDoc.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoOtherDoc[i], '_blank');
             }
         };

         $scope.messApprove = function (messageApprove) {
             if (messageApprove === "Approved") {
                 $scope.notVisible_OnAcceptP = true;
                 $scope.notVisible_OnAccept = true;
             } else if (messageApprove === "Pending at COPs") {
                 $scope.notVisible_OnAcceptP = true;
                 $scope.notVisible_OnAccept = false;
             } else if (messageApprove === "Pending at BOM") {
                 $scope.notVisible_OnAcceptP = false;
                 $scope.notVisible_OnAccept = false;
             }
         };


//         **
         $scope.validateForm = function (mess) {

             if ($scope.accountType) {
                 return true;
             } else {
                 alert("Please! select the Account Type.");
                 return false;
             }
         };

//          **
         $scope.checkFiled = function () {
             if ($scope.idProofStatus === "Accept"
                     && $scope.addressProofStatus === "Accept"
                     && $scope.panStatus === "Accept"
                     && $scope.otherDocStatus === "Accept"
                     && $scope.clientFormStatus === "Accept") {
                 $scope.notVisible_OnAccept = true;
                 $scope.notVisible_OnAcceptP = true;
             } else {
                 $scope.notVisible_OnAccept = false;
                 $scope.notVisible_OnAcceptP = true;
             }
         };

//         **
         $scope.updateDocStatus = function (message, dynamicVar) {
             debugger;
             if (message.endsWith("AC")) {
                 var buttonId = message.slice(0, -2);
                 var buttonA = document.getElementById(message);
                 var buttonR = document.getElementById(buttonId + "RE");
                 buttonA.style.backgroundColor = "blue";
                 buttonA.style.color = "white";
                 buttonR.style.backgroundColor = "#BE4347";
                 buttonR.style.color = "white";
                 $scope[dynamicVar] = buttonA.textContent;
                 $scope.checkFiled();
             } else {
                 var buttonId = message.slice(0, -2);
                 var buttonR = document.getElementById(message);
                 var buttonA = document.getElementById(buttonId + "AC");
                 buttonR.style.backgroundColor = "blue";
                 buttonR.style.color = "white";
                 buttonA.style.backgroundColor = "#85B87E";
                 buttonA.style.color = "white";
                 $scope[dynamicVar] = buttonR.textContent;
                 $scope.checkFiled();
             }
         };

//         **
         $scope.autoFillData = function (record) {
             $scope.formContainerVisible = true;
             $scope.list1 = record;
             console.log(record);

             $scope.reco = $scope.list1;
             $scope.id = $scope.list1.id;
             $scope.adharNo = $scope.list1.adharNoFirst;
             $scope.applicant = $scope.list1.applicantFirst;
             $scope.mobileNo = $scope.list1.mobileNo;
             $scope.accountType = $scope.list1.accountType;
             $scope.branchName = $scope.list1.branchName;
             $scope.status = $scope.list1.status;
             $scope.oldRemark = $scope.list1.remark;
             $scope.approvedBy = $scope.list1.approvedBy;
             $scope.uploadedBy = $scope.list1.uploadedBy;
             $scope.messApprove($scope.list1.status);
             //**
             $scope.idProofStatus = $scope.list1.idProofStatus;
             $scope.addressProofStatus = $scope.list1.addressProofStatus;
             $scope.panStatus = $scope.list1.panStatus;
             $scope.otherDocStatus = $scope.list1.otherDocStatus;
             $scope.clientFormStatus = $scope.list1.clientFormStatus;
             $scope.checkFiled();
             var loopForIdProof = $scope.list1.idProof.length;
             for (var i = 0; i < loopForIdProof; i++) {
                 var idProoffile = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.list1.idProof[i], "idProof_" + i);
                 $scope.recoIdProof.push(URL.createObjectURL(idProoffile));
             }

             var loopForAddressProof = $scope.list1.addressProof.length;
             for (var i = 0; i < loopForAddressProof; i++) {
                 var addressProoffile = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.list1.addressProof[i], "addressProof_" + i);
                 $scope.recoAddressProof.push(URL.createObjectURL(addressProoffile));
             }

             var loopForPan = $scope.list1.pan.length;
             for (var i = 0; i < loopForPan; i++) {
                 var panfile = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.list1.pan[i], "pan_" + i);
                 $scope.recoPan.push(URL.createObjectURL(panfile));
             }
             var loopForClientForm = $scope.list1.clientForm.length;
             for (var i = 0; i < loopForClientForm; i++) {
                 var clientFormfile = $scope.dataURLtoFilefunction('data:application/pdf;base64,' + $scope.list1.clientForm[i], "clientForm_" + i);
                 $scope.recoClientForm.push(URL.createObjectURL(clientFormfile));
             }

             var loopForOtherDoc = $scope.list1.otherDoc.length;
             for (var i = 0; i < loopForOtherDoc; i++) {
                 var otherDocfile = $scope.dataURLtoFilefunction('data:application/pdf;base64,' + $scope.list1.otherDoc[i], "otherDoc_" + i);
                 $scope.recoOtherDoc.push(URL.createObjectURL(otherDocfile));
             }
         };

//         **
         $scope.formdata = function (message) {
             debugger;
             //Test
             if (message === "Pending at BOM") {
                 if ($scope.checkLength()) {
                     $scope.dataUpdate['remark'] = "COPs : " + $scope.remark;
                     $scope.dataUpdate['status'] = 'Pending at BOM';
                 } else {
                     return;
                 }

             } else if (message === "Approved") {
                 $scope.dataUpdate['remark'] = "";
                 $scope.dataUpdate['status'] = 'Approved';
                 $scope.dataUpdate['approvedBy'] = $scope.userRecord.userName + "(COPs)";
             }

             if ($scope.validateForm(message)) {
                 $scope.dataUpdate['idProofStatus'] = $scope.idProofStatus;
                 $scope.dataUpdate['addressProofStatus'] = $scope.addressProofStatus;
                 $scope.dataUpdate['panStatus'] = $scope.panStatus;
                 $scope.dataUpdate['otherDocStatus'] = $scope.otherDocStatus;
                 $scope.dataUpdate['clientFormStatus'] = $scope.clientFormStatus;
                 $scope.submitUpdateForm();
             }

         };
     }
 });


 app.controller("currentWealthCont", function ($scope, $http, kycSavingCurrentService, kycService) {
     var protocal = window.location.protocol;
     var host = window.location.host;
     $scope.uRl = protocal + "//" + host + "/";

     $scope.reco = null;

     $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asCOPs"));
     $scope.recordData = JSON.parse(window.localStorage.getItem("Record"));
     var accountTy = $scope.recordData.accountType;
     if (($scope.userRecord) && accountTy === "Current Wealth") {

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
             id: $scope.id,
             accountType: '',
             branchName: '',
             applicant: '',
             mobileNo: null,
             adharNo: '',
             status: '',
             remark: '',
             idProofStatus: '',
             addressProofStatus: '',
             panStatus: '',
             otherDocStatus: '',
             clientFormStatus: '',
             approvedBy: $scope.approvedBy,
             uploadedBy: $scope.uploadedBy
         };
         // Watch for changes in form fields and update dataSave accordingly
         $scope.$watch('applicant', function (newVal) {
             $scope.dataUpdate.applicant = newVal;
         });
         $scope.$watch('id', function (newVal) {
             $scope.dataUpdate.id = newVal;
         });
         $scope.$watch('branchName', function (newVal) {
             $scope.dataUpdate.branchName = newVal;
         });
         $scope.$watch('accountType', function (newVal) {
             $scope.dataUpdate.accountType = newVal;
         });
         $scope.$watch('approvedBy', function (newVal) {
             $scope.dataUpdate.approvedBy = newVal;
         });
         $scope.$watch('uploadedBy', function (newVal) {
             $scope.dataUpdate.uploadedBy = newVal;
         });
         $scope.$watch('mobileNo', function (newVal) {
             $scope.dataUpdate.mobileNo = parseInt(newVal, 10);
         });
         $scope.$watch('adharNo', function (newVal) {
             $scope.dataUpdate.adharNo = newVal;
         });
         $scope.submitUpdateForm = function () {
             kycSavingCurrentService.updateKycRecordCOPs($scope.dataUpdate).then(function (response) {
                 console.log('Response:', response.data);
                 alert("Data successfully submitted.");
                 window.location.href = $scope.uRl + "user_asCOPs.html";
             }).catch(function (error) {
                 console.log('Error:', error);
             });
         };
         //own logical code here**

         $scope.list = [];
         $scope.forAadharDetails = false;
         $scope.branchlist = [];
         $scope.urlB = "branch/getuser/" + $scope.userRecord.userName;
         $http.get($scope.uRl + $scope.urlB)
                 .then(function (response) {
                     $scope.branchlist = response.data.branchNameList;
                 }, function (error) {
                     console.log(error);
                 });

         $scope.kycDetails = function () {
             kycSavingCurrentService.getRecordByCode($scope.recordData.code).then(function (response) {
                 $scope.autoFillData(response.data);
                 $scope.Record = response.data;
                 $scope.reco = $scope.Record;
                 console.log($scope.Record);
             }).catch(function (error) {
                 console.log('Error:', error);
             });
         };

         $scope.kycDetails();
         $scope.list = [];
         $scope.forAadharDetails = false;
         $scope.branchlist = [];

         $scope.list1 = [];
         $scope.reco = null;
         $scope.idProoffile = [];
         $scope.addressProoffile = [];
         $scope.panfile = [];
         $scope.otherDocfile = [];
         $scope.clientFormfile = [];
         $scope.recoIdProof = [];
         $scope.recoAddressProof = [];
         $scope.recoPan = [];
         $scope.recoOtherDoc = [];
         $scope.recoClientForm = [];
         $scope.accout_Type = null;
//         **
         $scope.list_Adhar = [];
         $scope.idProofStatus = null;
         $scope.addressProofStatus = null;
         $scope.panStatus = null;
         $scope.otherDocStatus = null;
         $scope.clientFormStatus = null;
         $scope.notVisible_OnAccept = false;
         $scope.notVisible_OnAcceptP = false;
         $scope.visibelForAadharDetails = false;

         $scope.openImageInPopup = function (imageUrl) {
             var largeImage = document.getElementById(imageUrl);
             var newWindow = window.open();
             newWindow.document.write('<html><body style="margin:0;"><img src="' + largeImage.src + '"></img></body></html>');
         };

         $scope.dataURLtoFilefunction = function (dataurl, filename) {
             var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                     bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
             while (n--) {
                 u8arr[n] = bstr.charCodeAt(n);
             }
             return new File([u8arr], filename, {type: mime});
         };

         $scope.checkLength = function () {
             var maxLength = 4900;

             if ($scope.remark !== undefined) {

                 if ($scope.remark.length > maxLength) {
                     alert('Text length should not exceed ' + maxLength + ' characters.');
                     // You can also update $scope.inputText or take other actions as needed.
                     $scope.remark = $scope.remark.substring(0, maxLength);
                     return false;
                 } else {
                     return true;
                 }

             } else {
                 alert("Please! Put the Remark.");
                 return false;
             }


         };

         $scope.viewRemark = function (mess) {
             var messRemark = mess.split(",");
             var messLength = messRemark.length;
             alert(messRemark[messLength - 1]);
         };

         $scope.viewIdProof = function () {
             var loopsize = $scope.recoIdProof.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoIdProof[i], '_blank');
             }
         };
         $scope.viewAddressProof = function () {
             var loopsize = $scope.recoAddressProof.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoAddressProof[i], '_blank');
             }
         };
         $scope.viewPan = function () {
             var loopsize = $scope.recoPan.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoPan[i], '_blank');
             }
         };
         $scope.viewPdfClientForm = function () {
             var loopsize = $scope.recoClientForm.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoClientForm[i], '_blank');
             }
         };
         $scope.viewPdfOther = function () {
             var loopsize = $scope.recoOtherDoc.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoOtherDoc[i], '_blank');
             }
         };

         $scope.messApprove = function (messageApprove) {
             if (messageApprove === "Approved") {
                 $scope.notVisible_OnAcceptP = true;
                 $scope.notVisible_OnAccept = true;
             } else if (messageApprove === "Pending at COPs") {
                 $scope.notVisible_OnAcceptP = true;
                 $scope.notVisible_OnAccept = false;
             } else if (messageApprove === "Pending at BOM") {
                 $scope.notVisible_OnAcceptP = false;
                 $scope.notVisible_OnAccept = false;
             }
         };


//         **
         $scope.validateForm = function (mess) {

             if ($scope.accountType) {
                 return true;
             } else {
                 alert("Please! select the Account Type.");
                 return false;
             }
         };

//          **
         $scope.checkFiled = function () {
             if ($scope.idProofStatus === "Accept"
                     && $scope.addressProofStatus === "Accept"
                     && $scope.panStatus === "Accept"
                     && $scope.otherDocStatus === "Accept"
                     && $scope.clientFormStatus === "Accept") {
                 $scope.notVisible_OnAccept = true;
                 $scope.notVisible_OnAcceptP = true;
             } else {
                 $scope.notVisible_OnAccept = false;
                 $scope.notVisible_OnAcceptP = true;
             }
         };

//         **
         $scope.updateDocStatus = function (message, dynamicVar) {
             debugger;
             if (message.endsWith("AC")) {
                 var buttonId = message.slice(0, -2);
                 var buttonA = document.getElementById(message);
                 var buttonR = document.getElementById(buttonId + "RE");
                 buttonA.style.backgroundColor = "blue";
                 buttonA.style.color = "white";
                 buttonR.style.backgroundColor = "#BE4347";
                 buttonR.style.color = "white";
                 $scope[dynamicVar] = buttonA.textContent;
                 $scope.checkFiled();
             } else {
                 var buttonId = message.slice(0, -2);
                 var buttonR = document.getElementById(message);
                 var buttonA = document.getElementById(buttonId + "AC");
                 buttonR.style.backgroundColor = "blue";
                 buttonR.style.color = "white";
                 buttonA.style.backgroundColor = "#85B87E";
                 buttonA.style.color = "white";
                 $scope[dynamicVar] = buttonR.textContent;
                 $scope.checkFiled();
             }
         };

//         **
         $scope.autoFillData = function (record) {
             $scope.formContainerVisible = true;
             $scope.list1 = record;
             console.log(record);

             $scope.reco = $scope.list1;
             $scope.id = $scope.list1.id;
             $scope.adharNo = $scope.list1.adharNoFirst;
             $scope.applicant = $scope.list1.applicantFirst;
             $scope.mobileNo = $scope.list1.mobileNo;
             $scope.accountType = $scope.list1.accountType;
             $scope.branchName = $scope.list1.branchName;
             $scope.status = $scope.list1.status;
             $scope.oldRemark = $scope.list1.remark;
             $scope.approvedBy = $scope.list1.approvedBy;
             $scope.uploadedBy = $scope.list1.uploadedBy;
             $scope.messApprove($scope.list1.status);
             //**
             $scope.idProofStatus = $scope.list1.idProofStatus;
             $scope.addressProofStatus = $scope.list1.addressProofStatus;
             $scope.panStatus = $scope.list1.panStatus;
             $scope.otherDocStatus = $scope.list1.otherDocStatus;
             $scope.clientFormStatus = $scope.list1.clientFormStatus;
             $scope.checkFiled();
             var loopForIdProof = $scope.list1.idProof.length;
             for (var i = 0; i < loopForIdProof; i++) {
                 var idProoffile = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.list1.idProof[i], "idProof_" + i);
                 $scope.recoIdProof.push(URL.createObjectURL(idProoffile));
             }

             var loopForAddressProof = $scope.list1.addressProof.length;
             for (var i = 0; i < loopForAddressProof; i++) {
                 var addressProoffile = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.list1.addressProof[i], "addressProof_" + i);
                 $scope.recoAddressProof.push(URL.createObjectURL(addressProoffile));
             }

             var loopForPan = $scope.list1.pan.length;
             for (var i = 0; i < loopForPan; i++) {
                 var panfile = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.list1.pan[i], "pan_" + i);
                 $scope.recoPan.push(URL.createObjectURL(panfile));
             }
             var loopForClientForm = $scope.list1.clientForm.length;
             for (var i = 0; i < loopForClientForm; i++) {
                 var clientFormfile = $scope.dataURLtoFilefunction('data:application/pdf;base64,' + $scope.list1.clientForm[i], "clientForm_" + i);
                 $scope.recoClientForm.push(URL.createObjectURL(clientFormfile));
             }

             var loopForOtherDoc = $scope.list1.otherDoc.length;
             for (var i = 0; i < loopForOtherDoc; i++) {
                 var otherDocfile = $scope.dataURLtoFilefunction('data:application/pdf;base64,' + $scope.list1.otherDoc[i], "otherDoc_" + i);
                 $scope.recoOtherDoc.push(URL.createObjectURL(otherDocfile));
             }
         };

//         **
         $scope.formdata = function (message) {
             debugger;
             //Test
             if (message === "Pending at BOM") {
                 if ($scope.checkLength()) {
                     $scope.dataUpdate['remark'] = "COPs : " + $scope.remark;
                     $scope.dataUpdate['status'] = 'Pending at BOM';
                 } else {
                     return;
                 }

             } else if (message === "Approved") {
                 $scope.dataUpdate['remark'] = "";
                 $scope.dataUpdate['status'] = 'Approved';
                 $scope.dataUpdate['approvedBy'] = $scope.userRecord.userName + "(COPs)";
             }

             if ($scope.validateForm(message)) {
                 $scope.dataUpdate['idProofStatus'] = $scope.idProofStatus;
                 $scope.dataUpdate['addressProofStatus'] = $scope.addressProofStatus;
                 $scope.dataUpdate['panStatus'] = $scope.panStatus;
                 $scope.dataUpdate['otherDocStatus'] = $scope.otherDocStatus;
                 $scope.dataUpdate['clientFormStatus'] = $scope.clientFormStatus;
                 $scope.submitUpdateForm();
             }

         };
     }
 });


 app.controller("soleProprietorshipCont", function ($scope, $http, kycSoleProprietorshipService) {
     var protocal = window.location.protocol;
     var host = window.location.host;
     $scope.uRl = protocal + "//" + host + "/";

     $scope.reco = null;

     $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asCOPs"));
     $scope.recordData = JSON.parse(window.localStorage.getItem("Record"));
     var accountTy = $scope.recordData.accountType;
     if (($scope.userRecord) && accountTy === "Sole Proprietorship") {

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
             status: 'Pending at COPs',
             remark: '',
             idProofStatus: '',
             addressProofStatus: '',
             panStatus: '',
             entityProofStatus: '',
             otherDocStatus: '',
             clientFormStatus: '',
             approvedBy: $scope.approvedBy,
             uploadedBy: $scope.uploadedBy
         };
         // Watch for changes in form fields and update dataSave accordingly
         $scope.$watch('id', function (newVal) {
             $scope.dataUpdate.id = newVal;
         });
         $scope.$watch('accountType', function (newVal) {
             $scope.dataUpdate.accountType = newVal;
         });
         $scope.$watch('branchName', function (newVal) {
             $scope.dataUpdate.branchName = newVal;
         });
         $scope.$watch('entity', function (newVal) {
             $scope.dataUpdate.entity = newVal;
         });
         $scope.$watch('applicant', function (newVal) {
             $scope.dataUpdate.applicant = newVal;
         });
         $scope.$watch('mobileNo', function (newVal) {
             $scope.dataUpdate.mobileNo = parseInt(newVal, 10);
         });
         $scope.$watch('adharNo', function (newVal) {
             $scope.dataUpdate.adharNo = newVal;
         });
         $scope.$watch('remark', function (newVal) {
             $scope.dataUpdate.remark = newVal;
         });
         $scope.$watch('approvedBy', function (newVal) {
             $scope.dataUpdate.approvedBy = newVal;
         });
         $scope.$watch('uploadedBy', function (newVal) {
             $scope.dataUpdate.uploadedBy = newVal;
         });
         $scope.uploadFilesUpdate = function (files, type) {
             $scope.dataUpdate[type] = files;
         };
         $scope.submitUpdateForm = function () {
             kycSoleProprietorshipService.updateCOPs($scope.dataUpdate).then(function (response) {
                 console.log('Response:', response.data);
                 alert("Data successfully submitted.");
                 window.location.href = $scope.uRl + "user_asCOPs.html";
             }).catch(function (error) {
                 console.log('Error:', error);
             });
         };
         //own logical code here**

         $scope.list = [];
         $scope.forAadharDetails = false;
         $scope.branchlist = [];
         $scope.urlB = "branch/getuser/" + $scope.userRecord.userName;
         $http.get($scope.uRl + $scope.urlB)
                 .then(function (response) {
                     $scope.branchlist = response.data.branchNameList;
                 }, function (error) {
                     console.log(error);
                 });

         $scope.kycDetails = function () {
             kycSoleProprietorshipService.getRecordByCode($scope.recordData.code).then(function (response) {
                 $scope.autoFillData(response.data);
                 $scope.Record = response.data;
                 $scope.reco = $scope.Record;
                 console.log($scope.Record);
             }).catch(function (error) {
                 console.log('Error:', error);
             });
         };

         $scope.kycDetails();
         $scope.list = [];
         $scope.forAadharDetails = false;
         $scope.branchlist = [];

         $scope.list1 = [];
         $scope.reco = null;
         $scope.idProoffile = [];
         $scope.addressProoffile = [];
         $scope.panfile = [];
         $scope.entityProoffile = [];
         $scope.otherDocfile = [];
         $scope.clientFormfile = [];
         $scope.recoIdProof = [];
         $scope.recoAddressProof = [];
         $scope.recoPan = [];
         $scope.recoEntityProof = [];
         $scope.recoOtherDoc = [];
         $scope.recoClientForm = [];
         $scope.accout_Type = null;
//         **
         $scope.list_Adhar = [];
         $scope.idProofStatus = null;
         $scope.addressProofStatus = null;
         $scope.panStatus = null;
         $scope.entityProofStatus = null;
         $scope.otherDocStatus = null;
         $scope.clientFormStatus = null;
         $scope.notVisible_OnAccept = false;
         $scope.notVisible_OnAcceptP = false;
         $scope.formContainerVisible = false;
         $scope.listContainerVisible = true;
         $scope.visibelForAadharDetails = false;

         $scope.openImageInPopup = function (imageUrl) {
             var largeImage = document.getElementById(imageUrl);
             var newWindow = window.open();
             newWindow.document.write('<html><body style="margin:0;"><img src="' + largeImage.src + '"></img></body></html>');
         };

         $scope.dataURLtoFilefunction = function (dataurl, filename) {
             var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                     bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
             while (n--) {
                 u8arr[n] = bstr.charCodeAt(n);
             }
             return new File([u8arr], filename, {type: mime});
         };

         $scope.isRemarkTooLong = false;

//         **
         $scope.checkLength = function () {
             var maxLength = 4900;

             if ($scope.remark !== undefined) {

                 if ($scope.remark.length > maxLength) {
                     alert('Text length should not exceed ' + maxLength + ' characters.');
                     // You can also update $scope.inputText or take other actions as needed.
                     $scope.remark = $scope.remark.substring(0, maxLength);
                     return false;
                 } else {
                     return true;
                 }

             } else {
                 alert("Please! Put the Remark.");
                 return false;
             }


         };

         $scope.viewRemark = function (mess) {
             var messRemark = mess.split(",");
             var messLength = messRemark.length;
             alert(messRemark[messLength - 1]);
         };

         $scope.viewIdProof = function () {
             var loopsize = $scope.recoIdProof.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoIdProof[i], '_blank');
             }
         };
         $scope.viewAddressProof = function () {
             var loopsize = $scope.recoAddressProof.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoAddressProof[i], '_blank');
             }
         };
         $scope.viewPan = function () {
             var loopsize = $scope.recoPan.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoPan[i], '_blank');
             }
         };
         $scope.viewEntityProof = function () {
             var loopsize = $scope.recoEntityProof.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoEntityProof[i], '_blank');
             }
         };
         $scope.viewPdfClientForm = function () {
             var loopsize = $scope.recoClientForm.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoClientForm[i], '_blank');
             }
         };
         $scope.viewPdfOther = function () {
             var loopsize = $scope.recoOtherDoc.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoOtherDoc[i], '_blank');
             }
         };

         $scope.messApprove = function (messageApprove) {
             if (messageApprove === "Approved") {
                 $scope.notVisible_OnAcceptP = true;
                 $scope.notVisible_OnAccept = true;
             } else if (messageApprove === "Pending at COPs") {
                 $scope.notVisible_OnAcceptP = true;
                 $scope.notVisible_OnAccept = false;
             } else if (messageApprove === "Pending at BOM") {
                 $scope.notVisible_OnAcceptP = false;
                 $scope.notVisible_OnAccept = false;
             }
         };

         $scope.validateForm = function () {
             if ($scope.accountType) {
                 return true;
             } else {
                 alert("Please! select the Account Type.");
                 return false;
             }
         };

//          **
         $scope.checkFiled = function () {
             if ($scope.idProofStatus === "Accept"
                     && $scope.addressProofStatus === "Accept"
                     && $scope.panStatus === "Accept"
                     && $scope.entityProofStatus === "Accept"
                     && $scope.otherDocStatus === "Accept"
                     && $scope.clientFormStatus === "Accept") {
                 $scope.notVisible_OnAccept = true;
                 $scope.notVisible_OnAcceptP = true;
             } else {
                 $scope.notVisible_OnAccept = false;
                 $scope.notVisible_OnAcceptP = true;
             }
         };

//         **
         $scope.updateDocStatus = function (message, dynamicVar) {
             debugger;
             if (message.endsWith("AC")) {
                 var buttonId = message.slice(0, -2);
                 var buttonA = document.getElementById(message);
                 var buttonR = document.getElementById(buttonId + "RE");
                 buttonA.style.backgroundColor = "blue";
                 buttonA.style.color = "white";
                 buttonR.style.backgroundColor = "#BE4347";
                 buttonR.style.color = "white";
                 $scope[dynamicVar] = buttonA.textContent;
                 $scope.checkFiled();
             } else {
                 var buttonId = message.slice(0, -2);
                 var buttonR = document.getElementById(message);
                 var buttonA = document.getElementById(buttonId + "AC");
                 buttonR.style.backgroundColor = "blue";
                 buttonR.style.color = "white";
                 buttonA.style.backgroundColor = "#85B87E";
                 buttonA.style.color = "white";
                 $scope[dynamicVar] = buttonR.textContent;
                 $scope.checkFiled();
             }
         };

//         **         
         $scope.autoFillData = function (record) {
             $scope.formContainerVisible = true;
             $scope.list1 = record;
             console.log(record);

             $scope.reco = $scope.list1;

             $scope.status = $scope.list1.status;
             $scope.id = $scope.list1.id;

             $scope.accountType = $scope.list1.accountType;
             $scope.branchName = $scope.list1.branchName;
             $scope.entity = $scope.list1.entity;
             $scope.applicant = $scope.list1.applicantFirst;
             $scope.mobileNo = $scope.list1.mobileNo;
             $scope.adharNo = $scope.list1.adharNoFirst;
             $scope.oldRemark = $scope.list1.remark;
             $scope.approvedBy = $scope.list1.approvedBy;
             $scope.uploadedBy = $scope.list1.uploadedBy;
             $scope.messApprove($scope.list1.status);
             //**
             $scope.idProofStatus = $scope.list1.idProofStatus;
             $scope.addressProofStatus = $scope.list1.addressProofStatus;
             $scope.panStatus = $scope.list1.panStatus;
             $scope.entityProofStatus = $scope.list1.entityProofStatus;
             $scope.otherDocStatus = $scope.list1.otherDocStatus;
             $scope.clientFormStatus = $scope.list1.clientFormStatus;
             $scope.checkFiled();

             var loopForIdProof = $scope.list1.idProof.length;
             for (var i = 0; i < loopForIdProof; i++) {
                 var idProoffile = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.list1.idProof[i], "idProof_" + i);
                 $scope.recoIdProof.push(URL.createObjectURL(idProoffile));
             }

             var loopForAddressProof = $scope.list1.addressProof.length;
             for (var i = 0; i < loopForAddressProof; i++) {
                 var addressProoffile = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.list1.addressProof[i], "addressProof_" + i);
                 $scope.recoAddressProof.push(URL.createObjectURL(addressProoffile));
             }

             var loopForPan = $scope.list1.pan.length;
             for (var i = 0; i < loopForPan; i++) {
                 var panfile = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.list1.pan[i], "pan_" + i);
                 $scope.recoPan.push(URL.createObjectURL(panfile));
             }
             var loopForEntityProof = $scope.list1.entityProof.length;
             for (var i = 0; i < loopForEntityProof; i++) {
                 var entityProoffile = $scope.dataURLtoFilefunction('data:application/pdf;base64,' + $scope.list1.entityProof[i], "entityProof_" + i);
                 $scope.recoEntityProof.push(URL.createObjectURL(entityProoffile));
             }
             var loopForClientForm = $scope.list1.clientForm.length;
             for (var i = 0; i < loopForClientForm; i++) {
                 var clientFormfile = $scope.dataURLtoFilefunction('data:application/pdf;base64,' + $scope.list1.clientForm[i], "clientForm_" + i);
                 $scope.recoClientForm.push(URL.createObjectURL(clientFormfile));
             }

             var loopForOtherDoc = $scope.list1.otherDoc.length;
             for (var i = 0; i < loopForOtherDoc; i++) {
                 var otherDocfile = $scope.dataURLtoFilefunction('data:application/pdf;base64,' + $scope.list1.otherDoc[i], "otherDoc_" + i);
                 $scope.recoOtherDoc.push(URL.createObjectURL(otherDocfile));
             }
         };
         $scope.formdata = function (message) {
             debugger;
             //Test
             if (message === "Pending at BOM") {
                 if ($scope.checkLength()) {
                     $scope.dataUpdate['remark'] = "COPs : " + $scope.remark;
                     $scope.dataUpdate['status'] = 'Pending at BOM';
                 } else {
                     return;
                 }

             } else if (message === "Approved") {
                 $scope.dataUpdate['remark'] = "";
                 $scope.dataUpdate['status'] = 'Approved';
                 $scope.dataUpdate['approvedBy'] = $scope.userRecord.userName + "(COPs)";
             }

             if ($scope.validateForm()) {
                 $scope.dataUpdate['idProofStatus'] = $scope.idProofStatus;
                 $scope.dataUpdate['addressProofStatus'] = $scope.addressProofStatus;
                 $scope.dataUpdate['panStatus'] = $scope.panStatus;
                 $scope.dataUpdate['entityProofStatus'] = $scope.entityProofStatus;
                 $scope.dataUpdate['otherDocStatus'] = $scope.otherDocStatus;
                 $scope.dataUpdate['clientFormStatus'] = $scope.clientFormStatus;
                 $scope.submitUpdateForm();
             }

         };
     }
 });


 app.controller("partnershipCont", function ($scope, $http, kycPartnershipService) {
     var protocal = window.location.protocol;
     var host = window.location.host;
     $scope.uRl = protocal + "//" + host + "/";

     $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asCOPs"));
     $scope.recordData = JSON.parse(window.localStorage.getItem("Record"));
     var accountTy = $scope.recordData.accountType;
     if (($scope.userRecord) && accountTy === "Partnership") {

         //       form button for add applicant and aadhar

         $scope.showApp3 = false;

         $scope.addApplicant = function () {
             $scope.showApp3 = true;
         };

         $scope.removeApplicant = function () {
             $scope.showApp3 = false;
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
             mobileNo: '',
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
             approvedBy: $scope.approvedBy,
             uploadedBy: $scope.uploadedBy
         };
         // Watch for changes in form fields and update dataSave accordingly
         $scope.$watch('id', function (newVal) {
             $scope.dataUpdate.id = newVal;
         });
         $scope.$watch('accountType', function (newVal) {
             $scope.dataUpdate.accountType = newVal;
         });
         $scope.$watch('branchName', function (newVal) {
             $scope.dataUpdate.branchName = newVal;
         });
         $scope.$watch('entity', function (newVal) {
             $scope.dataUpdate.entity = newVal;
         });
         $scope.$watch('applicantFirst', function (newVal) {
             $scope.dataUpdate.applicantFirst = newVal;
         });
         $scope.$watch('applicantSecond', function (newVal) {
             $scope.dataUpdate.applicantSecond = newVal;
         });
         $scope.$watch('applicantThird', function (newVal) {
             $scope.dataUpdate.applicantThird = newVal;
         });
         $scope.$watch('mobileNo', function (newVal) {
             $scope.dataUpdate.mobileNo = parseInt(newVal, 10);
         });
         $scope.$watch('adharNoFirst', function (newVal) {
             $scope.dataUpdate.adharNoFirst = newVal;
         });
         $scope.$watch('adharNoSecond', function (newVal) {
             $scope.dataUpdate.adharNoSecond = newVal;
         });
         $scope.$watch('adharNoThird', function (newVal) {
             $scope.dataUpdate.adharNoThird = newVal;
         });
         $scope.$watch('remark', function (newVal) {
             $scope.dataUpdate.remark = newVal;
         });
         $scope.$watch('approvedBy', function (newVal) {
             $scope.dataUpdate.approvedBy = newVal;
         });
         $scope.$watch('uploadedBy', function (newVal) {
             $scope.dataUpdate.uploadedBy = newVal;
         });
         $scope.uploadFilesUpdate = function (files, type) {
             $scope.dataUpdate[type] = files;
         };
         $scope.submitUpdateForm = function () {
             kycPartnershipService.updateCOPs($scope.dataUpdate).then(function (response) {
                 console.log('Response:', response.data);
                 alert("Data successfully submitted.");
                 window.location.href = $scope.uRl + "user_asCOPs.html";
             }).catch(function (error) {
                 console.log('Error:', error);
             });
         };
         //own logical code here**

         $scope.list = [];
         $scope.forAadharDetails = false;
         $scope.branchlist = [];
         $scope.urlB = "branch/getuser/" + $scope.userRecord.userName;
         $http.get($scope.uRl + $scope.urlB)
                 .then(function (response) {
                     $scope.branchlist = response.data.branchNameList;
                 }, function (error) {
                     console.log(error);
                 });

         $scope.kycDetails = function () {
             kycPartnershipService.getRecordByCode($scope.recordData.code).then(function (response) {
                 $scope.autoFillData(response.data);
                 $scope.Record = response.data;
                 $scope.reco = $scope.Record;
                 console.log($scope.Record);
             }).catch(function (error) {
                 console.log('Error:', error);
             });
         };

         $scope.kycDetails();
         $scope.list = [];
         $scope.forAadharDetails = false;
         $scope.branchlist = [];

         $scope.list1 = [];
         $scope.reco = null;
         $scope.idProoffile = [];
         $scope.addressProoffile = [];
         $scope.panfile = [];
         $scope.partnershipDocfile = [];
         $scope.otherDocfile = [];
         $scope.clientFormfile = [];
         $scope.recoIdProof = [];
         $scope.recoAddressProof = [];
         $scope.recoPan = [];
         $scope.recoPartnershipDoc = [];
         $scope.recoOtherDoc = [];
         $scope.recoClientForm = [];
         $scope.accout_Type = null;
//         **
         $scope.list_Adhar = [];
         $scope.idProofStatus = null;
         $scope.addressProofStatus = null;
         $scope.panStatus = null;
         $scope.partnershipDocStatus = null;
         $scope.otherDocStatus = null;
         $scope.clientFormStatus = null;
         $scope.notVisible_OnAccept = false;
         $scope.notVisible_OnAcceptP = false;
         $scope.formContainerVisible = false;
         $scope.listContainerVisible = true;
         $scope.visibelForAadharDetails = false;

         $scope.openImageInPopup = function (imageUrl) {
             var largeImage = document.getElementById(imageUrl);
             var newWindow = window.open();
             newWindow.document.write('<html><body style="margin:0;"><img src="' + largeImage.src + '"></img></body></html>');
         };

         $scope.dataURLtoFilefunction = function (dataurl, filename) {
             var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                     bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
             while (n--) {
                 u8arr[n] = bstr.charCodeAt(n);
             }
             return new File([u8arr], filename, {type: mime});
         };


//         **
         $scope.checkLength = function () {
             var maxLength = 4900;

             if ($scope.remark !== undefined) {

                 if ($scope.remark.length > maxLength) {
                     alert('Text length should not exceed ' + maxLength + ' characters.');
                     // You can also update $scope.inputText or take other actions as needed.
                     $scope.remark = $scope.remark.substring(0, maxLength);
                     return false;
                 } else {
                     return true;
                 }

             } else {
                 alert("Please! Put the Remark.");
                 return false;
             }


         };

         $scope.viewRemark = function (mess) {
             var messRemark = mess.split(",");
             var messLength = messRemark.length;
             alert(messRemark[messLength - 1]);
         };

         $scope.viewIdProof = function () {
             var loopsize = $scope.recoIdProof.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoIdProof[i], '_blank');
             }
         };
         $scope.viewAddressProof = function () {
             var loopsize = $scope.recoAddressProof.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoAddressProof[i], '_blank');
             }
         };
         $scope.viewPan = function () {
             var loopsize = $scope.recoPan.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoPan[i], '_blank');
             }
         };
         $scope.viewPartnershipDoc = function () {
             var loopsize = $scope.recoPartnershipDoc.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoPartnershipDoc[i], '_blank');
             }
         };
         $scope.viewPdfClientForm = function () {
             var loopsize = $scope.recoClientForm.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoClientForm[i], '_blank');
             }
         };
         $scope.viewPdfOther = function () {
             var loopsize = $scope.recoOtherDoc.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoOtherDoc[i], '_blank');
             }
         };

         $scope.showApplicantAgainstForm = function () {
             if (!($scope.list1.adharNoThird) || $scope.list1.adharNoThird === 'undefined') {
                 $scope.removeApplicant();
             } else if (($scope.list1.adharNoThird)) {
                 $scope.addApplicant();
             }

         };

         $scope.messApprove = function (messageApprove) {
             if (messageApprove === "Approved") {
                 $scope.notVisible_OnAcceptP = true;
                 $scope.notVisible_OnAccept = true;
             } else if (messageApprove === "Pending at COPs") {
                 $scope.notVisible_OnAcceptP = true;
                 $scope.notVisible_OnAccept = false;
             } else if (messageApprove === "Pending at BOM") {
                 $scope.notVisible_OnAcceptP = false;
                 $scope.notVisible_OnAccept = false;
             }
         };

//         **
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
                 $scope.dataUpdate['applicantThird'] = "";
                 $scope.dataUpdate['adharNoThird'] = "";
             }

             if ($scope.accountType) {
                 return true;
             } else {
                 alert("Please! select the Account Type.");
                 return false;
             }
         };
//          **
         $scope.checkFiled = function () {
             if ($scope.idProofStatus === "Accept"
                     && $scope.addressProofStatus === "Accept"
                     && $scope.panStatus === "Accept"
                     && $scope.partnershipDocStatus === "Accept"
                     && $scope.otherDocStatus === "Accept"
                     && $scope.clientFormStatus === "Accept") {
                 $scope.notVisible_OnAccept = true;
                 $scope.notVisible_OnAcceptP = true;
             } else {
                 $scope.notVisible_OnAccept = false;
                 $scope.notVisible_OnAcceptP = true;
             }
         };

//         **
         $scope.updateDocStatus = function (message, dynamicVar) {
             debugger;
             if (message.endsWith("AC")) {
                 var buttonId = message.slice(0, -2);
                 var buttonA = document.getElementById(message);
                 var buttonR = document.getElementById(buttonId + "RE");
                 buttonA.style.backgroundColor = "blue";
                 buttonA.style.color = "white";
                 buttonR.style.backgroundColor = "#BE4347";
                 buttonR.style.color = "white";
                 $scope[dynamicVar] = buttonA.textContent;
                 $scope.checkFiled();
             } else {
                 var buttonId = message.slice(0, -2);
                 var buttonR = document.getElementById(message);
                 var buttonA = document.getElementById(buttonId + "AC");
                 buttonR.style.backgroundColor = "blue";
                 buttonR.style.color = "white";
                 buttonA.style.backgroundColor = "#85B87E";
                 buttonA.style.color = "white";
                 $scope[dynamicVar] = buttonR.textContent;
                 $scope.checkFiled();
             }
         };

//         **         
         $scope.autoFillData = function (record) {
             $scope.formContainerVisible = true;
             $scope.list1 = record;
             console.log(record);

             $scope.reco = $scope.list1;

             $scope.status = $scope.list1.status;
             $scope.id = $scope.list1.id;
             $scope.showApplicantAgainstForm();
             $scope.accountType = $scope.list1.accountType;
             $scope.branchName = $scope.list1.branchName;
             $scope.entity = $scope.list1.entity;
             $scope.applicantFirst = $scope.list1.applicantFirst;
             $scope.applicantSecond = $scope.list1.applicantSecond;
             $scope.applicantThird = $scope.list1.applicantThird;
             $scope.mobileNo = $scope.list1.mobileNo;
             $scope.adharNoFirst = $scope.list1.adharNoFirst;
             $scope.adharNoSecond = $scope.list1.adharNoSecond;
             $scope.adharNoThird = $scope.list1.adharNoThird;
             $scope.oldRemark = $scope.list1.remark;
             $scope.approvedBy = $scope.list1.approvedBy;
             $scope.uploadedBy = $scope.list1.uploadedBy;
             $scope.messApprove($scope.list1.status);
             //**
             $scope.idProofStatus = $scope.list1.idProofStatus;
             $scope.addressProofStatus = $scope.list1.addressProofStatus;
             $scope.panStatus = $scope.list1.panStatus;
             $scope.partnershipDocStatus = $scope.list1.partnershipDocStatus;
             $scope.otherDocStatus = $scope.list1.otherDocStatus;
             $scope.clientFormStatus = $scope.list1.clientFormStatus;
             $scope.checkFiled();

             var loopForIdProof = $scope.list1.idProof.length;
             for (var i = 0; i < loopForIdProof; i++) {
                 var idProoffile = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.list1.idProof[i], "idProof_" + i);
                 $scope.recoIdProof.push(URL.createObjectURL(idProoffile));
             }

             var loopForAddressProof = $scope.list1.addressProof.length;
             for (var i = 0; i < loopForAddressProof; i++) {
                 var addressProoffile = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.list1.addressProof[i], "addressProof_" + i);
                 $scope.recoAddressProof.push(URL.createObjectURL(addressProoffile));
             }

             var loopForPan = $scope.list1.pan.length;
             for (var i = 0; i < loopForPan; i++) {
                 var panfile = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.list1.pan[i], "pan_" + i);
                 $scope.recoPan.push(URL.createObjectURL(panfile));
             }
             var loopForPartnershipDoc = $scope.list1.partnershipDoc.length;
             for (var i = 0; i < loopForPartnershipDoc; i++) {
                 var partnershipDocfile = $scope.dataURLtoFilefunction('data:application/pdf;base64,' + $scope.list1.partnershipDoc[i], "partnershipDoc_" + i);
                 $scope.recoPartnershipDoc.push(URL.createObjectURL(partnershipDocfile));
             }
             var loopForClientForm = $scope.list1.clientForm.length;
             for (var i = 0; i < loopForClientForm; i++) {
                 var clientFormfile = $scope.dataURLtoFilefunction('data:application/pdf;base64,' + $scope.list1.clientForm[i], "clientForm_" + i);
                 $scope.recoClientForm.push(URL.createObjectURL(clientFormfile));
             }

             var loopForOtherDoc = $scope.list1.otherDoc.length;
             for (var i = 0; i < loopForOtherDoc; i++) {
                 var otherDocfile = $scope.dataURLtoFilefunction('data:application/pdf;base64,' + $scope.list1.otherDoc[i], "otherDoc_" + i);
                 $scope.recoOtherDoc.push(URL.createObjectURL(otherDocfile));
             }
         };

         $scope.formdata = function (message) {

             debugger;
             //Test
             if (message === "Pending at BOM") {
                 if ($scope.checkLength()) {
                     $scope.dataUpdate['remark'] = "COPs : " + $scope.remark;
                     $scope.dataUpdate['status'] = 'Pending at BOM';
                 } else {
                     return;
                 }

             } else if (message === "Approved") {
                 $scope.dataUpdate['remark'] = "";
                 $scope.dataUpdate['status'] = 'Approved';
                 $scope.dataUpdate['approvedBy'] = $scope.userRecord.userName + "(COPs)";
             }

             if ($scope.validateForm(message)) {
                 $scope.dataUpdate['idProofStatus'] = $scope.idProofStatus;
                 $scope.dataUpdate['addressProofStatus'] = $scope.addressProofStatus;
                 $scope.dataUpdate['panStatus'] = $scope.panStatus;
                 $scope.dataUpdate['partnershipDocStatus'] = $scope.partnershipDocStatus;
                 $scope.dataUpdate['otherDocStatus'] = $scope.otherDocStatus;
                 $scope.dataUpdate['clientFormStatus'] = $scope.clientFormStatus;
                 $scope.submitUpdateForm();
             }

//             debugger;
//             //Test
//             $scope.checkLength();
//             if ($scope.validateForm() && $scope.isRemarkTooLong) {
//                 // Adding Files
//                 if (document.getElementById("idProofP").files.length === 0) {
//                     var loopsize = $scope.reco.idProof.length;
//                     var dataTransfer = new DataTransfer();  // Create a DataTransfer object
//                     for (var i = 0; i < loopsize; i++) {
//                         var file = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.reco.idProof[i], "idProof_" + i);
//                         dataTransfer.items.add(file);  // Add each file to the DataTransfer object
//                     }
//                     $scope.dataUpdate['idProof'] = dataTransfer.files;  // Assign the FileList
//                     $scope.dataUpdate['idProofStatus'] = $scope.reco.idProofStatus;
//                 } else {
//                     $scope.dataUpdate['idProofStatus'] = "";
//                 }
//                 //
//                 //
//                 if (document.getElementById("addressProofP").files.length === 0) {
//                     var loopsize = $scope.reco.addressProof.length;
//                     var dataTransfer = new DataTransfer();  // Create a DataTransfer object
//                     for (var i = 0; i < loopsize; i++) {
//                         var file = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.reco.addressProof[i], "addressProof_" + i);
//                         dataTransfer.items.add(file);  // Add each file to the DataTransfer object
//                     }
//                     $scope.dataUpdate['addressProof'] = dataTransfer.files;  // Assign the FileList
//                     $scope.dataUpdate['addressProofStatus'] = $scope.reco.addressProofStatus;
//                 } else {
//                     $scope.dataUpdate['addressProofStatus'] = "";
//                 }
//                 //
//                 //
//                 if (document.getElementById("panP").files.length === 0) {
//                     var loopsize = $scope.reco.pan.length;
//                     var dataTransfer = new DataTransfer();  // Create a DataTransfer object
//                     for (var i = 0; i < loopsize; i++) {
//                         var file = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.reco.pan[i], "pan_" + i);
//                         dataTransfer.items.add(file);  // Add each file to the DataTransfer object
//                     }
//                     $scope.dataUpdate['pan'] = dataTransfer.files;  // Assign the FileList
//                     $scope.dataUpdate['panStatus'] = $scope.reco.panStatus;
//                 } else {
//                     $scope.dataUpdate['panStatus'] = "";
//                 }
//                 //
//                 //
//                 if (document.getElementById("partnershipDocP").files.length === 0) {
//                     var loopsize = $scope.reco.partnershipDoc.length;
//                     var dataTransfer = new DataTransfer();  // Create a DataTransfer object
//                     for (var i = 0; i < loopsize; i++) {
//                         var file = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.reco.partnershipDoc[i], "partnershipDoc_" + i);
//                         dataTransfer.items.add(file);  // Add each file to the DataTransfer object
//                     }
//                     $scope.dataUpdate['partnershipDoc'] = dataTransfer.files;  // Assign the FileList
//                     $scope.dataUpdate['partnershipDocStatus'] = $scope.reco.partnershipDocStatus;
//                 } else {
//                     $scope.dataUpdate['partnershipDocStatus'] = "";
//                 }
//                 //
//                 //
//                 if (document.getElementById("otherDocP").files.length === 0) {
//                     var loopsize = $scope.reco.otherDoc.length;
//                     var dataTransfer = new DataTransfer();  // Create a DataTransfer object
//                     for (var i = 0; i < loopsize; i++) {
//                         var file = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.reco.otherDoc[i], "otherDoc_" + i);
//                         dataTransfer.items.add(file);  // Add each file to the DataTransfer object
//                     }
//                     $scope.dataUpdate['otherDoc'] = dataTransfer.files;  // Assign the FileList
//                     $scope.dataUpdate['otherDocStatus'] = $scope.reco.otherDocStatus;
//                 } else {
//                     $scope.dataUpdate['otherDocStatus'] = "";
//
//                 }
//                 //
//                 //
//                 if (document.getElementById("clientFormP").files.length === 0) {
//                     var loopsize = $scope.reco.clientForm.length;
//                     var dataTransfer = new DataTransfer();  // Create a DataTransfer object
//                     for (var i = 0; i < loopsize; i++) {
//                         var file = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.reco.clientForm[i], "otherDoc_" + i);
//                         dataTransfer.items.add(file);  // Add each file to the DataTransfer object
//                     }
//                     $scope.dataUpdate['clientForm'] = dataTransfer.files;  // Assign the FileList
//                     $scope.dataUpdate['clientFormStatus'] = $scope.reco.clientFormStatus;
//                 } else {
//                     $scope.dataUpdate['clientFormStatus'] = "";
//                 }
//                 //
//                 $scope.submitUpdateForm();
//             }

         };
     }


 });

 app.controller("public_PvtCont", function ($scope, $http, kycPubpvtService) {

     var protocal = window.location.protocol;
     var host = window.location.host;
     $scope.uRl = protocal + "//" + host + "/";

     $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asCOPs"));
     $scope.recordData = JSON.parse(window.localStorage.getItem("Record"));
     var accountTy = $scope.recordData.accountType;
     if (($scope.userRecord) && accountTy === "Public_Private LTD Company") {

         //       form button for add applicant and aadhar

         $scope.showApp3 = false;

         $scope.addApplicant = function () {
             $scope.showApp3 = true;
         };

         $scope.removeApplicant = function () {
             $scope.showApp3 = false;
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
             companyDoc: [],
             otherDoc: [],
             clientForm: [],
             id: '',
             accountType: '',
             branchName: '',
             entity: '',
             applicantFirst: '',
             applicantSecond: '',
             applicantThird: '',
             mobileNo: '',
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
             approvedBy: $scope.approvedBy,
             uploadedBy: $scope.uploadedBy
         };
         // Watch for changes in form fields and update dataSave accordingly
         $scope.$watch('id', function (newVal) {
             $scope.dataUpdate.id = newVal;
         });
         $scope.$watch('accountType', function (newVal) {
             $scope.dataUpdate.accountType = newVal;
         });
         $scope.$watch('branchName', function (newVal) {
             $scope.dataUpdate.branchName = newVal;
         });
         $scope.$watch('entity', function (newVal) {
             $scope.dataUpdate.entity = newVal;
         });
         $scope.$watch('applicantFirst', function (newVal) {
             $scope.dataUpdate.applicantFirst = newVal;
         });
         $scope.$watch('applicantSecond', function (newVal) {
             $scope.dataUpdate.applicantSecond = newVal;
         });
         $scope.$watch('applicantThird', function (newVal) {
             $scope.dataUpdate.applicantThird = newVal;
         });
         $scope.$watch('mobileNo', function (newVal) {
             $scope.dataUpdate.mobileNo = parseInt(newVal, 10);
         });
         $scope.$watch('adharNoFirst', function (newVal) {
             $scope.dataUpdate.adharNoFirst = newVal;
         });
         $scope.$watch('adharNoSecond', function (newVal) {
             $scope.dataUpdate.adharNoSecond = newVal;
         });
         $scope.$watch('adharNoThird', function (newVal) {
             $scope.dataUpdate.adharNoThird = newVal;
         });
         $scope.$watch('remark', function (newVal) {
             $scope.dataUpdate.remark = newVal;
         });
         $scope.$watch('approvedBy', function (newVal) {
             $scope.dataUpdate.approvedBy = newVal;
         });
         $scope.$watch('uploadedBy', function (newVal) {
             $scope.dataUpdate.uploadedBy = newVal;
         });
         $scope.uploadFilesUpdate = function (files, type) {
             $scope.dataUpdate[type] = files;
         };
         $scope.submitUpdateForm = function () {
             kycPubpvtService.updateCOPs($scope.dataUpdate).then(function (response) {
                 console.log('Response:', response.data);
                 alert("Data successfully submitted.");
                 window.location.href = $scope.uRl + "user_asCOPs.html";
             }).catch(function (error) {
                 console.log('Error:', error);
             });
         };
         //own logical code here**

         $scope.list = [];
         $scope.forAadharDetails = false;
         $scope.branchlist = [];
         $scope.urlB = "branch/getuser/" + $scope.userRecord.userName;
         $http.get($scope.uRl + $scope.urlB)
                 .then(function (response) {
                     $scope.branchlist = response.data.branchNameList;
                 }, function (error) {
                     console.log(error);
                 });

         $scope.kycDetails = function () {
             kycPubpvtService.getRecordByCode($scope.recordData.code).then(function (response) {
                 $scope.autoFillData(response.data);
                 $scope.Record = response.data;
                 $scope.reco = $scope.Record;
                 console.log($scope.Record);
             }).catch(function (error) {
                 console.log('Error:', error);
             });
         };

         $scope.kycDetails();
         $scope.list = [];
         $scope.forAadharDetails = false;
         $scope.branchlist = [];

         $scope.list1 = [];
         $scope.reco = null;
         $scope.idProoffile = [];
         $scope.addressProoffile = [];
         $scope.panfile = [];
         $scope.companyDocfile = [];
         $scope.otherDocfile = [];
         $scope.clientFormfile = [];
         $scope.recoIdProof = [];
         $scope.recoAddressProof = [];
         $scope.recoPan = [];
         $scope.recoCompanyDoc = [];
         $scope.recoOtherDoc = [];
         $scope.recoClientForm = [];
         $scope.accout_Type = null;
//         **
         $scope.list_Adhar = [];
         $scope.idProofStatus = null;
         $scope.addressProofStatus = null;
         $scope.panStatus = null;
         $scope.companyDocStatus = null;
         $scope.otherDocStatus = null;
         $scope.clientFormStatus = null;
         $scope.notVisible_OnAccept = false;
         $scope.notVisible_OnAcceptP = false;
         $scope.formContainerVisible = false;
         $scope.listContainerVisible = true;
         $scope.visibelForAadharDetails = false;

         $scope.openImageInPopup = function (imageUrl) {
             var largeImage = document.getElementById(imageUrl);
             var newWindow = window.open();
             newWindow.document.write('<html><body style="margin:0;"><img src="' + largeImage.src + '"></img></body></html>');
         };

         $scope.dataURLtoFilefunction = function (dataurl, filename) {
             var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                     bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
             while (n--) {
                 u8arr[n] = bstr.charCodeAt(n);
             }
             return new File([u8arr], filename, {type: mime});
         };

//         **
         $scope.checkLength = function () {
             var maxLength = 4900;

             if ($scope.remark !== undefined) {

                 if ($scope.remark.length > maxLength) {
                     alert('Text length should not exceed ' + maxLength + ' characters.');
                     // You can also update $scope.inputText or take other actions as needed.
                     $scope.remark = $scope.remark.substring(0, maxLength);
                     return false;
                 } else {
                     return true;
                 }

             } else {
                 alert("Please! Put the Remark.");
                 return false;
             }


         };

         $scope.viewRemark = function (mess) {
             var messRemark = mess.split(",");
             var messLength = messRemark.length;
             alert(messRemark[messLength - 1]);
         };

         $scope.viewIdProof = function () {
             var loopsize = $scope.recoIdProof.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoIdProof[i], '_blank');
             }
         };
         $scope.viewAddressProof = function () {
             var loopsize = $scope.recoAddressProof.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoAddressProof[i], '_blank');
             }
         };
         $scope.viewPan = function () {
             var loopsize = $scope.recoPan.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoPan[i], '_blank');
             }
         };
         $scope.viewCompanyDoc = function () {
             var loopsize = $scope.recoCompanyDoc.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoCompanyDoc[i], '_blank');
             }
         };
         $scope.viewPdfClientForm = function () {
             var loopsize = $scope.recoClientForm.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoClientForm[i], '_blank');
             }
         };
         $scope.viewPdfOther = function () {
             var loopsize = $scope.recoOtherDoc.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoOtherDoc[i], '_blank');
             }
         };

         $scope.showApplicantAgainstForm = function () {
             if (!($scope.list1.adharNoThird) || $scope.list1.adharNoThird === 'undefined') {
                 $scope.removeApplicant();
             } else if (($scope.list1.adharNoThird)) {
                 $scope.addApplicant();
             }

         };


//         **
         $scope.messApprove = function (messageApprove) {
             if (messageApprove === "Approved") {
                 $scope.notVisible_OnAcceptP = true;
                 $scope.notVisible_OnAccept = true;
             } else if (messageApprove === "Pending at COPs") {
                 $scope.notVisible_OnAcceptP = true;
                 $scope.notVisible_OnAccept = false;
             } else if (messageApprove === "Pending at BOM") {
                 $scope.notVisible_OnAcceptP = false;
                 $scope.notVisible_OnAccept = false;
             }
         };


//         **
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
                 $scope.dataUpdate['applicantThird'] = "";
                 $scope.dataUpdate['adharNoThird'] = "";
             }

             if ($scope.accountType) {
                 return true;
             } else {
                 alert("Please! select the Account Type.");
                 return false;
             }
         };
//          **
         $scope.checkFiled = function () {
             if ($scope.idProofStatus === "Accept"
                     && $scope.addressProofStatus === "Accept"
                     && $scope.panStatus === "Accept"
                     && $scope.companyDocStatus === "Accept"
                     && $scope.otherDocStatus === "Accept"
                     && $scope.clientFormStatus === "Accept") {
                 $scope.notVisible_OnAccept = true;
                 $scope.notVisible_OnAcceptP = true;
             } else {
                 $scope.notVisible_OnAccept = false;
                 $scope.notVisible_OnAcceptP = true;
             }
         };

//         **
         $scope.updateDocStatus = function (message, dynamicVar) {
             debugger;
             if (message.endsWith("AC")) {
                 var buttonId = message.slice(0, -2);
                 var buttonA = document.getElementById(message);
                 var buttonR = document.getElementById(buttonId + "RE");
                 buttonA.style.backgroundColor = "blue";
                 buttonA.style.color = "white";
                 buttonR.style.backgroundColor = "#BE4347";
                 buttonR.style.color = "white";
                 $scope[dynamicVar] = buttonA.textContent;
                 $scope.checkFiled();
             } else {
                 var buttonId = message.slice(0, -2);
                 var buttonR = document.getElementById(message);
                 var buttonA = document.getElementById(buttonId + "AC");
                 buttonR.style.backgroundColor = "blue";
                 buttonR.style.color = "white";
                 buttonA.style.backgroundColor = "#85B87E";
                 buttonA.style.color = "white";
                 $scope[dynamicVar] = buttonR.textContent;
                 $scope.checkFiled();
             }
         };

//         **
         $scope.autoFillData = function (record) {
             $scope.formContainerVisible = true;
             $scope.list1 = record;
             console.log(record);

             $scope.reco = $scope.list1;

             $scope.status = $scope.list1.status;
             $scope.id = $scope.list1.id;
             $scope.showApplicantAgainstForm();
             $scope.accountType = $scope.list1.accountType;
             $scope.branchName = $scope.list1.branchName;
             $scope.entity = $scope.list1.entity;
             $scope.applicantFirst = $scope.list1.applicantFirst;
             $scope.applicantSecond = $scope.list1.applicantSecond;
             $scope.applicantThird = $scope.list1.applicantThird;
             $scope.mobileNo = $scope.list1.mobileNo;
             $scope.adharNoFirst = $scope.list1.adharNoFirst;
             $scope.adharNoSecond = $scope.list1.adharNoSecond;
             $scope.adharNoThird = $scope.list1.adharNoThird;
             $scope.oldRemark = $scope.list1.remark;
             $scope.approvedBy = $scope.list1.approvedBy;
             $scope.uploadedBy = $scope.list1.uploadedBy;
             $scope.messApprove($scope.list1.status);
             //**
             $scope.idProofStatus = $scope.list1.idProofStatus;
             $scope.addressProofStatus = $scope.list1.addressProofStatus;
             $scope.panStatus = $scope.list1.panStatus;
             $scope.companyDocStatus = $scope.list1.companyDocStatus;
             $scope.otherDocStatus = $scope.list1.otherDocStatus;
             $scope.clientFormStatus = $scope.list1.clientFormStatus;
             $scope.checkFiled();

             var loopForIdProof = $scope.list1.idProof.length;
             for (var i = 0; i < loopForIdProof; i++) {
                 var idProoffile = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.list1.idProof[i], "idProof_" + i);
                 $scope.recoIdProof.push(URL.createObjectURL(idProoffile));
             }

             var loopForAddressProof = $scope.list1.addressProof.length;
             for (var i = 0; i < loopForAddressProof; i++) {
                 var addressProoffile = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.list1.addressProof[i], "addressProof_" + i);
                 $scope.recoAddressProof.push(URL.createObjectURL(addressProoffile));
             }

             var loopForPan = $scope.list1.pan.length;
             for (var i = 0; i < loopForPan; i++) {
                 var panfile = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.list1.pan[i], "pan_" + i);
                 $scope.recoPan.push(URL.createObjectURL(panfile));
             }
             var loopForCompanyDoc = $scope.list1.companyDoc.length;
             for (var i = 0; i < loopForCompanyDoc; i++) {
                 var companyDocfile = $scope.dataURLtoFilefunction('data:application/pdf;base64,' + $scope.list1.companyDoc[i], "companyDoc_" + i);
                 $scope.recoCompanyDoc.push(URL.createObjectURL(companyDocfile));
             }
             var loopForClientForm = $scope.list1.clientForm.length;
             for (var i = 0; i < loopForClientForm; i++) {
                 var clientFormfile = $scope.dataURLtoFilefunction('data:application/pdf;base64,' + $scope.list1.clientForm[i], "clientForm_" + i);
                 $scope.recoClientForm.push(URL.createObjectURL(clientFormfile));
             }

             var loopForOtherDoc = $scope.list1.otherDoc.length;
             for (var i = 0; i < loopForOtherDoc; i++) {
                 var otherDocfile = $scope.dataURLtoFilefunction('data:application/pdf;base64,' + $scope.list1.otherDoc[i], "otherDoc_" + i);
                 $scope.recoOtherDoc.push(URL.createObjectURL(otherDocfile));
             }
         };

//         **
         $scope.formdata = function (message) {
             debugger;
             //Test
             if (message === "Pending at BOM") {
                 if ($scope.checkLength()) {
                     $scope.dataUpdate['remark'] = "COPs : " + $scope.remark;
                     $scope.dataUpdate['status'] = 'Pending at BOM';
                 } else {
                     return;
                 }

             } else if (message === "Approved") {
                 $scope.dataUpdate['remark'] = "";
                 $scope.dataUpdate['status'] = 'Approved';
                 $scope.dataUpdate['approvedBy'] = $scope.userRecord.userName + "(COPs)";
             }

             if ($scope.validateForm(message)) {
                 $scope.dataUpdate['idProofStatus'] = $scope.idProofStatus;
                 $scope.dataUpdate['addressProofStatus'] = $scope.addressProofStatus;
                 $scope.dataUpdate['panStatus'] = $scope.panStatus;
                 $scope.dataUpdate['companyDocStatus'] = $scope.companyDocStatus;
                 $scope.dataUpdate['otherDocStatus'] = $scope.otherDocStatus;
                 $scope.dataUpdate['clientFormStatus'] = $scope.clientFormStatus;
                 $scope.submitUpdateForm();
             }

         };
     }
 });


 app.controller("tascCont", function ($scope, $http, kycTascService) {
     var protocal = window.location.protocol;
     var host = window.location.host;
     $scope.uRl = protocal + "//" + host + "/";

     $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asCOPs"));
     $scope.recordData = JSON.parse(window.localStorage.getItem("Record"));
     var accountTy = $scope.recordData.accountType;
     if (($scope.userRecord) && accountTy === "TASC") {
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
             mobileNo: '',
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
             approvedBy: $scope.approvedBy,
             uploadedBy: $scope.uploadedBy
         };
         // Watch for changes in form fields and update dataSave accordingly
         $scope.$watch('id', function (newVal) {
             $scope.dataUpdate.id = newVal;
         });
         $scope.$watch('accountType', function (newVal) {
             $scope.dataUpdate.accountType = newVal;
         });
         $scope.$watch('branchName', function (newVal) {
             $scope.dataUpdate.branchName = newVal;
         });
         $scope.$watch('entity', function (newVal) {
             $scope.dataUpdate.entity = newVal;
         });
         $scope.$watch('applicantFirst', function (newVal) {
             $scope.dataUpdate.applicantFirst = newVal;
         });
         $scope.$watch('applicantSecond', function (newVal) {
             $scope.dataUpdate.applicantSecond = newVal;
         });
         $scope.$watch('applicantThird', function (newVal) {
             $scope.dataUpdate.applicantThird = newVal;
         });
         $scope.$watch('applicantFourth', function (newVal) {
             $scope.dataUpdate.applicantFourth = newVal;
         });
         $scope.$watch('applicantFifth', function (newVal) {
             $scope.dataUpdate.applicantFifth = newVal;
         });
         $scope.$watch('mobileNo', function (newVal) {
             $scope.dataUpdate.mobileNo = parseInt(newVal, 10);
         });
         $scope.$watch('adharNoFirst', function (newVal) {
             $scope.dataUpdate.adharNoFirst = newVal;
         });
         $scope.$watch('adharNoSecond', function (newVal) {
             $scope.dataUpdate.adharNoSecond = newVal;
         });
         $scope.$watch('adharNoThird', function (newVal) {
             $scope.dataUpdate.adharNoThird = newVal;
         });
         $scope.$watch('adharNoFourth', function (newVal) {
             $scope.dataUpdate.adharNoFourth = newVal;
         });
         $scope.$watch('adharNoFifth', function (newVal) {
             $scope.dataUpdate.adharNoFifth = newVal;
         });
         $scope.$watch('remark', function (newVal) {
             $scope.dataUpdate.remark = newVal;
         });
         $scope.$watch('approvedBy', function (newVal) {
             $scope.dataUpdate.approvedBy = newVal;
         });
         $scope.$watch('uploadedBy', function (newVal) {
             $scope.dataUpdate.uploadedBy = newVal;
         });
         $scope.uploadFilesUpdate = function (files, type) {
             $scope.dataUpdate[type] = files;
         };
         $scope.submitUpdateForm = function () {
             kycTascService.updateCOPs($scope.dataUpdate).then(function (response) {
                 console.log('Response:', response.data);
                 alert("Data successfully submitted.");
                 window.location.href = $scope.uRl + "user_asCOPs.html";
             }).catch(function (error) {
                 console.log('Error:', error);
             });
         };
         //own logical code here**

         $scope.list = [];
         $scope.forAadharDetails = false;
         $scope.branchlist = [];
         $scope.urlB = "branch/getuser/" + $scope.userRecord.userName;
         $http.get($scope.uRl + $scope.urlB)
                 .then(function (response) {
                     $scope.branchlist = response.data.branchNameList;
                 }, function (error) {
                     console.log(error);
                 });

         $scope.kycDetails = function () {
             kycTascService.getRecordByCode($scope.recordData.code).then(function (response) {
                 $scope.autoFillData(response.data);
                 $scope.Record = response.data;
                 $scope.reco = $scope.Record;
                 console.log($scope.Record);
             }).catch(function (error) {
                 console.log('Error:', error);
             });
         };

         $scope.kycDetails();
         $scope.list = [];
         $scope.forAadharDetails = false;
         $scope.branchlist = [];

         $scope.list1 = [];
         $scope.reco = null;
         $scope.idProoffile = [];
         $scope.addressProoffile = [];
         $scope.panfile = [];
         $scope.tascDocfile = [];
         $scope.otherDocfile = [];
         $scope.clientFormfile = [];
         $scope.recoIdProof = [];
         $scope.recoAddressProof = [];
         $scope.recoPan = [];
         $scope.recoTascDoc = [];
         $scope.recoOtherDoc = [];
         $scope.recoClientForm = [];
         $scope.accout_Type = null;
//         **
         $scope.list_Adhar = [];
         $scope.idProofStatus = null;
         $scope.addressProofStatus = null;
         $scope.panStatus = null;
         $scope.tascDocStatus = null;
         $scope.otherDocStatus = null;
         $scope.clientFormStatus = null;
         $scope.notVisible_OnAccept = false;
         $scope.notVisible_OnAcceptP = false;
         $scope.formContainerVisible = false;
         $scope.listContainerVisible = true;
         $scope.visibelForAadharDetails = false;

         $scope.openImageInPopup = function (imageUrl) {
             var largeImage = document.getElementById(imageUrl);
             var newWindow = window.open();
             newWindow.document.write('<html><body style="margin:0;"><img src="' + largeImage.src + '"></img></body></html>');
         };

         $scope.dataURLtoFilefunction = function (dataurl, filename) {
             var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                     bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
             while (n--) {
                 u8arr[n] = bstr.charCodeAt(n);
             }
             return new File([u8arr], filename, {type: mime});
         };

//         **
         $scope.checkLength = function () {
             var maxLength = 4900;

             if ($scope.remark !== undefined) {

                 if ($scope.remark.length > maxLength) {
                     alert('Text length should not exceed ' + maxLength + ' characters.');
                     // You can also update $scope.inputText or take other actions as needed.
                     $scope.remark = $scope.remark.substring(0, maxLength);
                     return false;
                 } else {
                     return true;
                 }

             } else {
                 alert("Please! Put the Remark.");
                 return false;
             }


         };

         $scope.viewRemark = function (mess) {
             var messRemark = mess.split(",");
             var messLength = messRemark.length;
             alert(messRemark[messLength - 1]);
         };

         $scope.viewIdProof = function () {
             var loopsize = $scope.recoIdProof.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoIdProof[i], '_blank');
             }
         };
         $scope.viewAddressProof = function () {
             var loopsize = $scope.recoAddressProof.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoAddressProof[i], '_blank');
             }
         };
         $scope.viewPan = function () {
             var loopsize = $scope.recoPan.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoPan[i], '_blank');
             }
         };
         $scope.viewTascDoc = function () {
             var loopsize = $scope.recoTascDoc.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoTascDoc[i], '_blank');
             }
         };
         $scope.viewPdfClientForm = function () {
             var loopsize = $scope.recoClientForm.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoClientForm[i], '_blank');
             }
         };
         $scope.viewPdfOther = function () {
             var loopsize = $scope.recoOtherDoc.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoOtherDoc[i], '_blank');
             }
         };

         $scope.showApplicantAgainstForm = function () {
             debugger;
             if (!($scope.list1.applicantSecond) || $scope.list1.applicantSecond === 'undefined') {
//                 $scope.removeApplicantTask();
             } else if (($scope.list1.applicantSecond)) {
                 $scope.addApplicantTasc();
             }
             if (!($scope.list1.applicantThird) || $scope.list1.applicantThird === 'undefined') {
//                 $scope.removeApplicantTask();
             } else if (($scope.list1.applicantThird)) {
                 $scope.addApplicantTasc();
             }
             if (!($scope.list1.applicantFourth) || $scope.list1.applicantFourth === 'undefined') {
//                 $scope.removeApplicantTask();
             } else if (($scope.list1.applicantFourth)) {
                 $scope.addApplicantTasc();
             }
             if (!($scope.list1.applicantFifth) || $scope.list1.applicantFifth === 'undefined') {
//                 $scope.removeApplicantTask();
             } else if (($scope.list1.applicantFifth)) {
                 $scope.addApplicantTasc();
             }

         };

         $scope.messApprove = function (messageApprove) {
             if (messageApprove === "Approved") {
                 $scope.notVisible_OnAcceptP = true;
                 $scope.notVisible_OnAccept = true;
             } else if (messageApprove === "Pending at COPs") {
                 $scope.notVisible_OnAcceptP = true;
                 $scope.notVisible_OnAccept = false;
             } else if (messageApprove === "Pending at BOM") {
                 $scope.notVisible_OnAcceptP = false;
                 $scope.notVisible_OnAccept = false;
             }
         };


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
                     $scope.dataUpdate['applicant' + applicants[i].label] = "";
                     $scope.dataUpdate['adharNo' + applicants[i].label] = "";
                 }

             }

             if ($scope.accountType) {
                 return true;
             } else {
                 alert("Please select the Account Type.");
                 return false;
             }
         };

         //          **
         $scope.checkFiled = function () {
             if ($scope.idProofStatus === "Accept"
                     && $scope.addressProofStatus === "Accept"
                     && $scope.panStatus === "Accept"
                     && $scope.tascDocStatus === "Accept"
                     && $scope.otherDocStatus === "Accept"
                     && $scope.clientFormStatus === "Accept") {
                 $scope.notVisible_OnAccept = true;
                 $scope.notVisible_OnAcceptP = true;
             } else {
                 $scope.notVisible_OnAccept = false;
                 $scope.notVisible_OnAcceptP = true;
             }
         };

//         **
         $scope.updateDocStatus = function (message, dynamicVar) {
             debugger;
             if (message.endsWith("AC")) {
                 var buttonId = message.slice(0, -2);
                 var buttonA = document.getElementById(message);
                 var buttonR = document.getElementById(buttonId + "RE");
                 buttonA.style.backgroundColor = "blue";
                 buttonA.style.color = "white";
                 buttonR.style.backgroundColor = "#BE4347";
                 buttonR.style.color = "white";
                 $scope[dynamicVar] = buttonA.textContent;
                 $scope.checkFiled();
             } else {
                 var buttonId = message.slice(0, -2);
                 var buttonR = document.getElementById(message);
                 var buttonA = document.getElementById(buttonId + "AC");
                 buttonR.style.backgroundColor = "blue";
                 buttonR.style.color = "white";
                 buttonA.style.backgroundColor = "#85B87E";
                 buttonA.style.color = "white";
                 $scope[dynamicVar] = buttonR.textContent;
                 $scope.checkFiled();
             }
         };

//         **         
         $scope.autoFillData = function (record) {
             $scope.formContainerVisible = true;
             $scope.list1 = record;
             console.log(record);

             $scope.reco = $scope.list1;

             $scope.status = $scope.list1.status;
             $scope.id = $scope.list1.id;
             $scope.showApplicantAgainstForm();
             $scope.accountType = $scope.list1.accountType;
             $scope.branchName = $scope.list1.branchName;
             $scope.entity = $scope.list1.entity;
             $scope.applicantFirst = $scope.list1.applicantFirst;
             $scope.applicantSecond = $scope.list1.applicantSecond;
             $scope.applicantThird = $scope.list1.applicantThird;
             $scope.applicantFourth = $scope.list1.applicantFourth;
             $scope.applicantFifth = $scope.list1.applicantFifth;
             $scope.mobileNo = $scope.list1.mobileNo;
             $scope.adharNoFirst = $scope.list1.adharNoFirst;
             $scope.adharNoSecond = $scope.list1.adharNoSecond;
             $scope.adharNoThird = $scope.list1.adharNoThird;
             $scope.adharNoFourth = $scope.list1.adharNoFourth;
             $scope.adharNoFifth = $scope.list1.adharNoFifth;
             $scope.oldRemark = $scope.list1.remark;
             $scope.approvedBy = $scope.list1.approvedBy;
             $scope.uploadedBy = $scope.list1.uploadedBy;
             $scope.messApprove($scope.list1.status);
             //**
             $scope.idProofStatus = $scope.list1.idProofStatus;
             $scope.addressProofStatus = $scope.list1.addressProofStatus;
             $scope.panStatus = $scope.list1.panStatus;
             $scope.tascDocStatus = $scope.list1.tascDocStatus;
             $scope.otherDocStatus = $scope.list1.otherDocStatus;
             $scope.clientFormStatus = $scope.list1.clientFormStatus;
             $scope.checkFiled();

             var loopForIdProof = $scope.list1.idProof.length;
             for (var i = 0; i < loopForIdProof; i++) {
                 var idProoffile = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.list1.idProof[i], "idProof_" + i);
                 $scope.recoIdProof.push(URL.createObjectURL(idProoffile));
             }

             var loopForAddressProof = $scope.list1.addressProof.length;
             for (var i = 0; i < loopForAddressProof; i++) {
                 var addressProoffile = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.list1.addressProof[i], "addressProof_" + i);
                 $scope.recoAddressProof.push(URL.createObjectURL(addressProoffile));
             }

             var loopForPan = $scope.list1.pan.length;
             for (var i = 0; i < loopForPan; i++) {
                 var panfile = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.list1.pan[i], "pan_" + i);
                 $scope.recoPan.push(URL.createObjectURL(panfile));
             }
             var loopForTascDoc = $scope.list1.tascDoc.length;
             for (var i = 0; i < loopForTascDoc; i++) {
                 var tascDocfile = $scope.dataURLtoFilefunction('data:application/pdf;base64,' + $scope.list1.tascDoc[i], "tascDoc_" + i);
                 $scope.recoTascDoc.push(URL.createObjectURL(tascDocfile));
             }
             var loopForClientForm = $scope.list1.clientForm.length;
             for (var i = 0; i < loopForClientForm; i++) {
                 var clientFormfile = $scope.dataURLtoFilefunction('data:application/pdf;base64,' + $scope.list1.clientForm[i], "clientForm_" + i);
                 $scope.recoClientForm.push(URL.createObjectURL(clientFormfile));
             }

             var loopForOtherDoc = $scope.list1.otherDoc.length;
             for (var i = 0; i < loopForOtherDoc; i++) {
                 var otherDocfile = $scope.dataURLtoFilefunction('data:application/pdf;base64,' + $scope.list1.otherDoc[i], "otherDoc_" + i);
                 $scope.recoOtherDoc.push(URL.createObjectURL(otherDocfile));
             }
         };

//         **
         $scope.formdata = function (message) {
             debugger;
             //Test
             if (message === "Pending at BOM") {
                 if ($scope.checkLength()) {
                     $scope.dataUpdate['remark'] = "COPs : " + $scope.remark;
                     $scope.dataUpdate['status'] = 'Pending at BOM';
                 } else {
                     return;
                 }

             } else if (message === "Approved") {
                 $scope.dataUpdate['remark'] = "";
                 $scope.dataUpdate['status'] = 'Approved';
                 $scope.dataUpdate['approvedBy'] = $scope.userRecord.userName + "(COPs)";
             }

             if ($scope.validateForm(message)) {
                 $scope.dataUpdate['idProofStatus'] = $scope.idProofStatus;
                 $scope.dataUpdate['addressProofStatus'] = $scope.addressProofStatus;
                 $scope.dataUpdate['panStatus'] = $scope.panStatus;
                 $scope.dataUpdate['tascDocStatus'] = $scope.tascDocStatus;
                 $scope.dataUpdate['otherDocStatus'] = $scope.otherDocStatus;
                 $scope.dataUpdate['clientFormStatus'] = $scope.clientFormStatus;
                 $scope.submitUpdateForm();
             }

         };

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