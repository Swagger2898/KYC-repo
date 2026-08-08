 var app = angular.module('BOMFormApp', ['kycApp', 'kycJointSavingApp', 'kycPartnershipApp'
             , 'kycPubpvtApp', 'kycSavingCurrentApp', 'kycSoleProprietorshipApp'
             , 'kycTascApp']);
 app.controller("cont", function ($scope, $http, $interval, kycService) {

     var protocal = window.location.protocol;
     var host = window.location.host;
     $scope.uRl = protocal + "//" + host + "/";

     $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asBOM"));
     if (($scope.userRecord)) {

         $scope.disSendOtp = false;
         $scope.disVerify = false;
         $scope.aadhaarCardshow = false;
         $scope.showOtpModal = false;
         $scope.isLoading = true;
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

                     $scope.isLoading = true;
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
                 alert("Server Not Responding");
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
                 alert("Server not reponding.");
                 $scope.verificationSuccess = false;
                 $scope.verificationFailure = true;
                 $scope.showResendButton = true;
                 console.log(error);
                 $scope.verifyOtpResponse = 'Error: ' + error.data;
             });
             //<--


             $scope.isLoading = true;
             // Simulate OTP verification
             $timeout(function () {
                 $scope.isLoading = false;
                 $interval.cancel(otpTimer);
             }, 2000); // Simulate a delay
         };
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
                 alert("     Please enter the Aadhar Number! \n\
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
             window.localStorage.removeItem("user_asBOM");
         };

         $scope.kycRecordInactive = function (id) {
             debugger;
             kycService.kycRecordInActive(id).then(function (response) {
                 $scope.kycRecord = response.data;
             }).catch(function (error) {
                 console.log('Error:', error);
             });
         };

         $scope.kycRecordActive = function (id) {
             debugger;
             kycService.kycRecordActive(id).then(function (response) {
                 $scope.kycRecord = response.data;
             }).catch(function (error) {
                 console.log('Error:', error);
             });
         };

         $scope.cancelBOMForm = function () {
             debugger;
             kycService.kycRecordActive($scope.kycRecord.id).then(function (response) {
                 location.reload();
                 $scope.kycRecord = response.data;
                 window.location.href = $scope.uRl + "user_asBOM.html";
             }).catch(function (error) {
                 console.log('Error:', error);
             });
         };


     } else {
         window.location.href = $scope.uRl + "index.html";
     }

 });
 
  app.controller("public_PvtCont", function ($scope, $http, $timeout) {

     var protocal = window.location.protocol;
     var host = window.location.host;
     $scope.uRl = protocal + "//" + host + "/";

     $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asBOM"));
     if (($scope.userRecord)) {
         $scope.list = [];
         $scope.forAadharDetails = false;
         $scope.branchlist = [];

//       form button for add applicant and aadhar

         $scope.addApplicantButton = false;
         $scope.showApp3 = false;
         $scope.showAadhar3 = false;
         $scope.showAdharforjoint = false;



         $scope.branchName = $scope.userRecord.branchName;
         $scope.url = "branch/getuser/" + $scope.userRecord.userName;
         $http.get($scope.uRl + $scope.url)
                 .then(function (response) {
                     $scope.branchlist = response.data.branchNameList;
                 }, function (error) {
                     console.log(error);
                 });

         $scope.validateForm = function () {
//             var accountTypeElement = document.getElementById("accountType").value;
             if ($scope.accountType) {
                 return true;
             } else {
                 alert("Please! select the Account Type.");
                 return false;
             }
         };

         $scope.closeAadharDetails = function () {
             $scope.forAadharDetails = false;
         };

         $scope.addApplicant = function () {

             $scope.showApp3 = true;
             $scope.showAadhar3 = true;
         };



         $scope.formdata = function () {

             if ($scope.showApp3 === true) {

                 if ($scope.adharNo1) {
                     $scope.url = "kyc/getAadhar/" + $scope.adharNo1;
                 } else {
                     alert("Please enter Aadhar No.");
                     return;
                 }

             } else {

                 if ($scope.adharNo1) {
                     $scope.url = "kyc/getAadhar/" + $scope.adharNo1;
                 } else {
                     alert("Please enter Aadhar No.");
                     return;
                 }
             }


             $http.get($scope.uRl + $scope.url)
                     .then(function (response) {
                         debugger;
                         $scope.list = response.data;
                         if ($scope.list.length === 0) {
                             $scope.forAadharDetails = false;
                         } else {
                             $scope.list = null;
                             $scope.forAadharDetails = false;
                         }

                         if ($scope.validateForm()) {

                             var form = new FormData();
                             var loopForIdProof = document.getElementById("idProof").files.length;
                             for (let i = 0; i < loopForIdProof; i++) {
                                 form.append("idProof", document.getElementById("idProof").files[i], document.getElementById("idProof").localName);
                             }


                             var form = new FormData();
                             var loopForAddProof = document.getElementById("addProof").files.length;
                             for (let i = 0; i < loopForAddProof; i++) {
                                 form.append("addProof", document.getElementById("addProof").files[i], document.getElementById("addProof").localName);
                             }



                             var form = new FormData();
                             var loopForPan = document.getElementById("pan").files.length;
                             for (let i = 0; i < loopForPan; i++) {
                                 form.append("pan", document.getElementById("pan").files[i], document.getElementById("pan").localName);
                             }

                             var loopForCompDoc = document.getElementById("compDoc").files.length;
                             for (let i = 0; i < loopForCompDoc; i++) {
                                 form.append("compDoc", document.getElementById("compDoc").files[i], document.getElementById("compDoc").localName);
                             }

                             var loopForApplicationForm = document.getElementById("applicationForm").files.length;
                             for (let i = 0; i < loopForApplicationForm; i++) {
                                 form.append("applicationForm", document.getElementById("applicationForm").files[i], document.getElementById("applicationForm").localName);
                             }

                             var loopForOtherDoc = document.getElementById("otherDoc").files.length;
                             for (let i = 0; i < loopForOtherDoc; i++) {
                                 form.append("otherDoc", document.getElementById("otherDoc").files[i], document.getElementById("otherDoc").localName);
                             }


                             if ($scope.showApp3 === true) {
                                 if ($scope.entity) {
                                     form.append("entity", $scope.entity);
                                 }

                                 if (($scope.applicant1) && ($scope.applicant2) && ($scope.applicant3)) {
                                     form.append("applicant", $scope.applicant1);
                                     form.append("applicant", $scope.applicant2);
                                     form.append("applicant", $scope.applicant3);
                                 } else {
                                     alert("Please enter all applicant name.");
                                     return;
                                 }
                                 if (($scope.adharNo1) && ($scope.adharNo2) && ($scope.adharNo3)) {
                                     form.append("adharNo", $scope.adharNo1);
                                     form.append("adharNo", $scope.adharNo2);
                                     form.append("adharNo", $scope.adharNo3);
                                 } else {
                                     alert("Please enter all Aadhar No.");
                                     return;
                                 }
                             } else {

                                 if ($scope.entity) {
                                     form.append("entity", $scope.entity);
                                 }

                                 if (($scope.applicant1) && ($scope.applicant2)) {
                                     form.append("applicant", $scope.applicant1);
                                     form.append("applicant", $scope.applicant2);
                                 } else {
                                     alert("Please enter all applicant name.");
                                     return;
                                 }
                                 if (($scope.adharNo1) && ($scope.adharNo2)) {
                                     form.append("adharNo", $scope.adharNo1);
                                     form.append("adharNo", $scope.adharNo2);
                                 } else {
                                     alert("Please enter all Aadhar No.");
                                     return;
                                 }
                             }


//                            var jointType = $scope.accountType.startsWith("Joint");


                             form.append("mobileNo", $scope.mobileNo);
                             form.append("accountType", $scope.accountType);
                             form.append("branchName", $scope.branchName);
                             form.append("status", "Pending at COPs");

                             if (response.data.length === 0) {
                                 form.append("remark", "BOM : Data Submitted");
                             } else {
                                 form.append("remark", "BOM : Existing Customer KYC Verification for " + $scope.accountType + "");
                             }

                             form.append("idProofStatus", "");
                             form.append("addProofStatus", "");
                             form.append("panStatus", "");
                             form.append("compDocStatus", "");
                             form.append("otherDocStatus", "");
                             form.append("applicationFormStatus", "");
                             form.append("approvedBy", "");
                             form.append("uploadedBy", $scope.userRecord.userName + "(BOM)");
                             console.log(form);
                             var settings = {
                                 "url": $scope.uRl + "kyc/save",
                                 "method": "POST",
                                 "timeout": 0,
                                 "processData": false,
                                 "mimeType": "multipart/form-data",
                                 "contentType": false,
                                 "data": form
                             };

                             $.ajax(settings).done(function (response) {
                                 debugger;
                                 console.log("Response:", response);  // Log the raw response
                                 console.log("Response Length:", response.length);  // Log the length of the response
                                 console.log("Response Type:", typeof response);  // Log the type of the response

                                 if (!response) {
                                     alert("Empty response from server. Please try again later.");
                                     return;
                                 }

                                 try {
                                     var responseData = JSON.parse(response);  // Try to parse the response
                                 } catch (e) {
                                     console.error("Error parsing JSON response:", e);
                                     alert("There was an error processing your request. Please try again.");
                                     return;  // Exit the function if JSON parsing fails
                                 }

                                 // Continue with your logic if JSON parsing succeeds
                                 var Ack = responseData.code;
                                 if ("" === response) {
                                     alert("Already have an Account Type for this Aadhar number !");
                                 } else {
                                     alert("Data successfully submitted. Ack_No( " + Ack.substring(6) + " )");
                                     window.location.href = $scope.uRl + "user_asBOM.html";
                                 }
                             }).fail(function (jqXHR, textStatus, errorThrown) {
                                 // Handle AJAX errors
                                 console.error("AJAX error:", textStatus, errorThrown);
                                 alert("There was an error processing your request. Please try again.");
                             });
                         }
                     }, function (error) {
                         console.log(error);
                     });

         };


     } else {
         window.location.href = $scope.uRl + "index.html";
     }



 });
