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

     $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asBOM"));
     $scope.recordData = JSON.parse(window.localStorage.getItem("Record"));
     if (($scope.userRecord)) {
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
//         $scope.$watch('applicant', function (newVal) {
//             $scope.dataSave.applicant = newVal;
//         });
//         $scope.$watch('mobileNo', function (newVal) {
//             $scope.dataSave.mobileNo = parseInt(newVal, 10);
//         });
//         $scope.$watch('adharNo', function (newVal) {
//             $scope.dataSave.adharNo = newVal;
//         });
//         $scope.$watch('remark', function (newVal) {
//             $scope.dataSave.remark = newVal;
//         });
         // Function to upload files and update dataSave
         $scope.uploadFilesSave = function (files, type) {
             $scope.dataSave[type] = files;
         };
         $scope.submitForm = function () {
             kycSavingCurrentService.save($scope.dataSave).then(function (response) {
                 debugger;
                 console.log('Response:', response.data);
                 if ("" === response.data || null === response.data) {
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
             id: $scope.id,
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
         $scope.$watch('remark', function (newVal) {
             $scope.dataUpdate.remark = newVal;
         });
         $scope.uploadFilesUpdate = function (files, type) {
             debugger;
             $scope.dataUpdate[type] = files;
             console.log('Files uploaded:', $scope.dataUpdate);
         };
         $scope.submitUpdateForm = function () {
             kycSavingCurrentService.updateKycRecord($scope.dataUpdate).then(function (response) {
                 console.log('Response:', response.data);
                 alert("Data successfully submitted.");
                 window.location.href = $scope.uRl + "user_asBOM.html";
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

         $scope.list_Adhar = [];
         $scope.panstatus = null;
         $scope.adharstatus = null;
         $scope.otherDocstatus = null;
         $scope.applicationFormstatus = null;
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


         $scope.checkLength = function () {
             var maxLength = 4900;

             if ($scope.remark !== undefined) {

                 if ($scope.remark.length > maxLength) {
                     alert('Text length should not exceed ' + maxLength + ' characters.');
                     // You can also update $scope.inputText or take other actions as needed.
                     $scope.remark = $scope.remark.substring(0, maxLength);
                     $scope.isRemarkTooLong = false;
                 } else {
                     $scope.isRemarkTooLong = true;
                 }

             } else {
                 alert('Text length should not exceed ' + maxLength + ' characters.');
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
             if (messageApprove.endsWith("Approved")) {
                 $scope.notVisible_OnApproval = false;
                 $scope.Visible_OnApproval = true;
             } else if (messageApprove.endsWith("Pending at COPs")) {
                 $scope.notVisible_OnApproval = false;
                 $scope.Visible_OnApproval = false;
             } else if (messageApprove.endsWith("Pending at BOM")) {
                 $scope.notVisible_OnApproval = true;
                 $scope.Visible_OnApproval = false;
             }
         };
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
             //

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

         $scope.validateForm = function () {
             if ($scope.accountType) {
                 return true;
             } else {
                 alert("Please! select the Account Type.");
                 return false;
             }
         };

         $scope.formdata = function () {
             debugger;
             //Test
             $scope.checkLength();
             if ($scope.validateForm() && $scope.isRemarkTooLong) {
                 // Adding Files
                 if (document.getElementById("idProofSS").files.length === 0) {
                     var loopsize = $scope.reco.idProof.length;
                     var dataTransfer = new DataTransfer();  // Create a DataTransfer object
                     for (var i = 0; i < loopsize; i++) {
                         var file = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.reco.idProof[i], "idProof_" + i);
                         dataTransfer.items.add(file);  // Add each file to the DataTransfer object
                     }
                     $scope.dataUpdate['idProof'] = dataTransfer.files;  // Assign the FileList
                     $scope.dataUpdate['idProofStatus'] = $scope.reco.idProofStatus;
                 } else {
                     $scope.dataUpdate['idProofStatus'] = "";
                 }
                 //
                 //
                 if (document.getElementById("addressProofSS").files.length === 0) {
                     var loopsize = $scope.reco.addressProof.length;
                     var dataTransfer = new DataTransfer();  // Create a DataTransfer object
                     for (var i = 0; i < loopsize; i++) {
                         var file = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.reco.addressProof[i], "addressProof_" + i);
                         dataTransfer.items.add(file);  // Add each file to the DataTransfer object
                     }
                     $scope.dataUpdate['addressProof'] = dataTransfer.files;  // Assign the FileList
                     $scope.dataUpdate['addressProofStatus'] = $scope.reco.addressProofStatus;
                 } else {
                     $scope.dataUpdate['addressProofStatus'] = "";
                 }
                 //
                 //
                 if (document.getElementById("panSS").files.length === 0) {
                     var loopsize = $scope.reco.pan.length;
                     var dataTransfer = new DataTransfer();  // Create a DataTransfer object
                     for (var i = 0; i < loopsize; i++) {
                         var file = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.reco.pan[i], "pan_" + i);
                         dataTransfer.items.add(file);  // Add each file to the DataTransfer object
                     }
                     $scope.dataUpdate['pan'] = dataTransfer.files;  // Assign the FileList
                     $scope.dataUpdate['panStatus'] = $scope.reco.panStatus;
                 } else {
                     $scope.dataUpdate['panStatus'] = "";
                 }
                 //
                 //
                 if (document.getElementById("otherDocSS").files.length === 0) {
                     var loopsize = $scope.reco.otherDoc.length;
                     var dataTransfer = new DataTransfer();  // Create a DataTransfer object
                     for (var i = 0; i < loopsize; i++) {
                         var file = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.reco.otherDoc[i], "otherDoc_" + i);
                         dataTransfer.items.add(file);  // Add each file to the DataTransfer object
                     }
                     $scope.dataUpdate['otherDoc'] = dataTransfer.files;  // Assign the FileList
                     $scope.dataUpdate['otherDocStatus'] = $scope.reco.otherDocStatus;
                 } else {
                     $scope.dataUpdate['otherDocStatus'] = "";

                 }
                 //
                 //
                 if (document.getElementById("clientFormSS").files.length === 0) {
                     var loopsize = $scope.reco.clientForm.length;
                     var dataTransfer = new DataTransfer();  // Create a DataTransfer object
                     for (var i = 0; i < loopsize; i++) {
                         var file = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.reco.clientForm[i], "otherDoc_" + i);
                         dataTransfer.items.add(file);  // Add each file to the DataTransfer object
                     }
                     $scope.dataUpdate['clientForm'] = dataTransfer.files;  // Assign the FileList
                     $scope.dataUpdate['clientFormStatus'] = $scope.reco.clientFormStatus;
                 } else {
                     $scope.dataUpdate['clientFormStatus'] = "";
                 }
                 //
                 $scope.submitUpdateForm();
             }

         };


     } else {
         window.location.href = $scope.uRl + "index.html";
     }
 });


 app.controller("normalSavingCont", function ($scope, $http, kycSavingCurrentService, kycService) {
     var protocal = window.location.protocol;
     var host = window.location.host;
     $scope.uRl = protocal + "//" + host + "/";

     $scope.reco = null;

     $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asBOM"));
     $scope.recordData = JSON.parse(window.localStorage.getItem("Record"));
     if (($scope.userRecord)) {
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
//         $scope.$watch('applicant', function (newVal) {
//             $scope.dataSave.applicant = newVal;
//         });
//         $scope.$watch('mobileNo', function (newVal) {
//             $scope.dataSave.mobileNo = parseInt(newVal, 10);
//         });
//         $scope.$watch('adharNo', function (newVal) {
//             $scope.dataSave.adharNo = newVal;
//         });
//         $scope.$watch('remark', function (newVal) {
//             $scope.dataSave.remark = newVal;
//         });
         // Function to upload files and update dataSave
         $scope.uploadFilesSave = function (files, type) {
             $scope.dataSave[type] = files;
         };
         $scope.submitForm = function () {
             kycSavingCurrentService.save($scope.dataSave).then(function (response) {
                 debugger;
                 console.log('Response:', response.data);
                 if ("" === response.data || null === response.data) {
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
             id: $scope.id,
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
         $scope.$watch('remark', function (newVal) {
             $scope.dataUpdate.remark = newVal;
         });
         $scope.uploadFilesUpdate = function (files, type) {
             debugger;
             $scope.dataUpdate[type] = files;
             console.log('Files uploaded:', $scope.dataUpdate);
         };
         $scope.submitUpdateForm = function () {
             kycSavingCurrentService.updateKycRecord($scope.dataUpdate).then(function (response) {
                 console.log('Response:', response.data);
                 alert("Data successfully submitted.");
                 window.location.href = $scope.uRl + "user_asBOM.html";
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

         $scope.list_Adhar = [];
         $scope.panstatus = null;
         $scope.adharstatus = null;
         $scope.otherDocstatus = null;
         $scope.applicationFormstatus = null;
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


         $scope.checkLength = function () {
             var maxLength = 4900;

             if ($scope.remark !== undefined) {

                 if ($scope.remark.length > maxLength) {
                     alert('Text length should not exceed ' + maxLength + ' characters.');
                     // You can also update $scope.inputText or take other actions as needed.
                     $scope.remark = $scope.remark.substring(0, maxLength);
                     $scope.isRemarkTooLong = false;
                 } else {
                     $scope.isRemarkTooLong = true;
                 }

             } else {
                 alert('Text length should not exceed ' + maxLength + ' characters.');
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
             if (messageApprove.endsWith("Approved")) {
                 $scope.notVisible_OnApproval = false;
                 $scope.Visible_OnApproval = true;
             } else if (messageApprove.endsWith("Pending at COPs")) {
                 $scope.notVisible_OnApproval = false;
                 $scope.Visible_OnApproval = false;
             } else if (messageApprove.endsWith("Pending at BOM")) {
                 $scope.notVisible_OnApproval = true;
                 $scope.Visible_OnApproval = false;
             }
         };
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
             //

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

         $scope.validateForm = function () {
             if ($scope.accountType) {
                 return true;
             } else {
                 alert("Please! select the Account Type.");
                 return false;
             }
         };

         $scope.formdata = function () {
             debugger;
             //Test
             $scope.checkLength();
             if ($scope.validateForm() && $scope.isRemarkTooLong) {
                 // Adding Files
                 if (document.getElementById("idProofNS").files.length === 0) {
                     var loopsize = $scope.reco.idProof.length;
                     var dataTransfer = new DataTransfer();  // Create a DataTransfer object
                     for (var i = 0; i < loopsize; i++) {
                         var file = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.reco.idProof[i], "idProof_" + i);
                         dataTransfer.items.add(file);  // Add each file to the DataTransfer object
                     }
                     $scope.dataUpdate['idProof'] = dataTransfer.files;  // Assign the FileList
                     $scope.dataUpdate['idProofStatus'] = $scope.reco.idProofStatus;
                 } else {
                     $scope.dataUpdate['idProofStatus'] = "";
                 }
                 //
                 //
                 if (document.getElementById("addressProofNS").files.length === 0) {
                     var loopsize = $scope.reco.addressProof.length;
                     var dataTransfer = new DataTransfer();  // Create a DataTransfer object
                     for (var i = 0; i < loopsize; i++) {
                         var file = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.reco.addressProof[i], "addressProof_" + i);
                         dataTransfer.items.add(file);  // Add each file to the DataTransfer object
                     }
                     $scope.dataUpdate['addressProof'] = dataTransfer.files;  // Assign the FileList
                     $scope.dataUpdate['addressProofStatus'] = $scope.reco.addressProofStatus;
                 } else {
                     $scope.dataUpdate['addressProofStatus'] = "";
                 }
                 //
                 //
                 if (document.getElementById("panNS").files.length === 0) {
                     var loopsize = $scope.reco.pan.length;
                     var dataTransfer = new DataTransfer();  // Create a DataTransfer object
                     for (var i = 0; i < loopsize; i++) {
                         var file = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.reco.pan[i], "pan_" + i);
                         dataTransfer.items.add(file);  // Add each file to the DataTransfer object
                     }
                     $scope.dataUpdate['pan'] = dataTransfer.files;  // Assign the FileList
                     $scope.dataUpdate['panStatus'] = $scope.reco.panStatus;
                 } else {
                     $scope.dataUpdate['panStatus'] = "";
                 }
                 //
                 //
                 if (document.getElementById("otherDocNS").files.length === 0) {
                     var loopsize = $scope.reco.otherDoc.length;
                     var dataTransfer = new DataTransfer();  // Create a DataTransfer object
                     for (var i = 0; i < loopsize; i++) {
                         var file = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.reco.otherDoc[i], "otherDoc_" + i);
                         dataTransfer.items.add(file);  // Add each file to the DataTransfer object
                     }
                     $scope.dataUpdate['otherDoc'] = dataTransfer.files;  // Assign the FileList
                     $scope.dataUpdate['otherDocStatus'] = $scope.reco.otherDocStatus;
                 } else {
                     $scope.dataUpdate['otherDocStatus'] = "";

                 }
                 //
                 //
                 if (document.getElementById("clientFormNS").files.length === 0) {
                     var loopsize = $scope.reco.clientForm.length;
                     var dataTransfer = new DataTransfer();  // Create a DataTransfer object
                     for (var i = 0; i < loopsize; i++) {
                         var file = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.reco.clientForm[i], "otherDoc_" + i);
                         dataTransfer.items.add(file);  // Add each file to the DataTransfer object
                     }
                     $scope.dataUpdate['clientForm'] = dataTransfer.files;  // Assign the FileList
                     $scope.dataUpdate['clientFormStatus'] = $scope.reco.clientFormStatus;
                 } else {
                     $scope.dataUpdate['clientFormStatus'] = "";
                 }
                 //
                 $scope.submitUpdateForm();
             }

         };


     } else {
         window.location.href = $scope.uRl + "index.html";
     }
 });


 app.controller("normalCurrentCont", function ($scope, $http, kycSavingCurrentService, kycService) {
     var protocal = window.location.protocol;
     var host = window.location.host;
     $scope.uRl = protocal + "//" + host + "/";

     $scope.reco = null;

     $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asBOM"));
     $scope.recordData = JSON.parse(window.localStorage.getItem("Record"));
     if (($scope.userRecord)) {
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
//         $scope.$watch('applicant', function (newVal) {
//             $scope.dataSave.applicant = newVal;
//         });
//         $scope.$watch('mobileNo', function (newVal) {
//             $scope.dataSave.mobileNo = parseInt(newVal, 10);
//         });
//         $scope.$watch('adharNo', function (newVal) {
//             $scope.dataSave.adharNo = newVal;
//         });
//         $scope.$watch('remark', function (newVal) {
//             $scope.dataSave.remark = newVal;
//         });
         // Function to upload files and update dataSave
         $scope.uploadFilesSave = function (files, type) {
             $scope.dataSave[type] = files;
         };
         $scope.submitForm = function () {
             kycSavingCurrentService.save($scope.dataSave).then(function (response) {
                 debugger;
                 console.log('Response:', response.data);
                 if ("" === response.data || null === response.data) {
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
             id: $scope.id,
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
         $scope.$watch('remark', function (newVal) {
             $scope.dataUpdate.remark = newVal;
         });
         $scope.uploadFilesUpdate = function (files, type) {
             debugger;
             $scope.dataUpdate[type] = files;
             console.log('Files uploaded:', $scope.dataUpdate);
         };
         $scope.submitUpdateForm = function () {
             kycSavingCurrentService.updateKycRecord($scope.dataUpdate).then(function (response) {
                 console.log('Response:', response.data);
                 alert("Data successfully submitted.");
                 window.location.href = $scope.uRl + "user_asBOM.html";
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

         $scope.list_Adhar = [];
         $scope.panstatus = null;
         $scope.adharstatus = null;
         $scope.otherDocstatus = null;
         $scope.applicationFormstatus = null;
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


         $scope.checkLength = function () {
             var maxLength = 4900;

             if ($scope.remark !== undefined) {

                 if ($scope.remark.length > maxLength) {
                     alert('Text length should not exceed ' + maxLength + ' characters.');
                     // You can also update $scope.inputText or take other actions as needed.
                     $scope.remark = $scope.remark.substring(0, maxLength);
                     $scope.isRemarkTooLong = false;
                 } else {
                     $scope.isRemarkTooLong = true;
                 }

             } else {
                 alert('Text length should not exceed ' + maxLength + ' characters.');
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
             if (messageApprove.endsWith("Approved")) {
                 $scope.notVisible_OnApproval = false;
                 $scope.Visible_OnApproval = true;
             } else if (messageApprove.endsWith("Pending at COPs")) {
                 $scope.notVisible_OnApproval = false;
                 $scope.Visible_OnApproval = false;
             } else if (messageApprove.endsWith("Pending at BOM")) {
                 $scope.notVisible_OnApproval = true;
                 $scope.Visible_OnApproval = false;
             }
         };
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
             //

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

         $scope.validateForm = function () {
             if ($scope.accountType) {
                 return true;
             } else {
                 alert("Please! select the Account Type.");
                 return false;
             }
         };

         $scope.formdata = function () {
             debugger;
             //Test
             $scope.checkLength();
             if ($scope.validateForm() && $scope.isRemarkTooLong) {
                 // Adding Files
                 if (document.getElementById("idProofNC").files.length === 0) {
                     var loopsize = $scope.reco.idProof.length;
                     var dataTransfer = new DataTransfer();  // Create a DataTransfer object
                     for (var i = 0; i < loopsize; i++) {
                         var file = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.reco.idProof[i], "idProof_" + i);
                         dataTransfer.items.add(file);  // Add each file to the DataTransfer object
                     }
                     $scope.dataUpdate['idProof'] = dataTransfer.files;  // Assign the FileList
                     $scope.dataUpdate['idProofStatus'] = $scope.reco.idProofStatus;
                 } else {
                     $scope.dataUpdate['idProofStatus'] = "";
                 }
                 //
                 //
                 if (document.getElementById("addressProofNC").files.length === 0) {
                     var loopsize = $scope.reco.addressProof.length;
                     var dataTransfer = new DataTransfer();  // Create a DataTransfer object
                     for (var i = 0; i < loopsize; i++) {
                         var file = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.reco.addressProof[i], "addressProof_" + i);
                         dataTransfer.items.add(file);  // Add each file to the DataTransfer object
                     }
                     $scope.dataUpdate['addressProof'] = dataTransfer.files;  // Assign the FileList
                     $scope.dataUpdate['addressProofStatus'] = $scope.reco.addressProofStatus;
                 } else {
                     $scope.dataUpdate['addressProofStatus'] = "";
                 }
                 //
                 //
                 if (document.getElementById("panNC").files.length === 0) {
                     var loopsize = $scope.reco.pan.length;
                     var dataTransfer = new DataTransfer();  // Create a DataTransfer object
                     for (var i = 0; i < loopsize; i++) {
                         var file = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.reco.pan[i], "pan_" + i);
                         dataTransfer.items.add(file);  // Add each file to the DataTransfer object
                     }
                     $scope.dataUpdate['pan'] = dataTransfer.files;  // Assign the FileList
                     $scope.dataUpdate['panStatus'] = $scope.reco.panStatus;
                 } else {
                     $scope.dataUpdate['panStatus'] = "";
                 }
                 //
                 //
                 if (document.getElementById("otherDocNC").files.length === 0) {
                     var loopsize = $scope.reco.otherDoc.length;
                     var dataTransfer = new DataTransfer();  // Create a DataTransfer object
                     for (var i = 0; i < loopsize; i++) {
                         var file = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.reco.otherDoc[i], "otherDoc_" + i);
                         dataTransfer.items.add(file);  // Add each file to the DataTransfer object
                     }
                     $scope.dataUpdate['otherDoc'] = dataTransfer.files;  // Assign the FileList
                     $scope.dataUpdate['otherDocStatus'] = $scope.reco.otherDocStatus;
                 } else {
                     $scope.dataUpdate['otherDocStatus'] = "";

                 }
                 //
                 //
                 if (document.getElementById("clientFormNC").files.length === 0) {
                     var loopsize = $scope.reco.clientForm.length;
                     var dataTransfer = new DataTransfer();  // Create a DataTransfer object
                     for (var i = 0; i < loopsize; i++) {
                         var file = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.reco.clientForm[i], "otherDoc_" + i);
                         dataTransfer.items.add(file);  // Add each file to the DataTransfer object
                     }
                     $scope.dataUpdate['clientForm'] = dataTransfer.files;  // Assign the FileList
                     $scope.dataUpdate['clientFormStatus'] = $scope.reco.clientFormStatus;
                 } else {
                     $scope.dataUpdate['clientFormStatus'] = "";
                 }
                 //
                 $scope.submitUpdateForm();
             }

         };


     } else {
         window.location.href = $scope.uRl + "index.html";
     }
 });


 app.controller("currentGoldCont", function ($scope, $http, kycSavingCurrentService, kycService) {
     var protocal = window.location.protocol;
     var host = window.location.host;
     $scope.uRl = protocal + "//" + host + "/";

     $scope.reco = null;

     $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asBOM"));
     $scope.recordData = JSON.parse(window.localStorage.getItem("Record"));
     if (($scope.userRecord)) {
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
//         $scope.$watch('applicant', function (newVal) {
//             $scope.dataSave.applicant = newVal;
//         });
//         $scope.$watch('mobileNo', function (newVal) {
//             $scope.dataSave.mobileNo = parseInt(newVal, 10);
//         });
//         $scope.$watch('adharNo', function (newVal) {
//             $scope.dataSave.adharNo = newVal;
//         });
//         $scope.$watch('remark', function (newVal) {
//             $scope.dataSave.remark = newVal;
//         });
         // Function to upload files and update dataSave
         $scope.uploadFilesSave = function (files, type) {
             $scope.dataSave[type] = files;
         };
         $scope.submitForm = function () {
             kycSavingCurrentService.save($scope.dataSave).then(function (response) {
                 debugger;
                 console.log('Response:', response.data);
                 if ("" === response.data || null === response.data) {
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
             id: $scope.id,
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
         $scope.$watch('remark', function (newVal) {
             $scope.dataUpdate.remark = newVal;
         });
         $scope.uploadFilesUpdate = function (files, type) {
             debugger;
             $scope.dataUpdate[type] = files;
             console.log('Files uploaded:', $scope.dataUpdate);
         };
         $scope.submitUpdateForm = function () {
             kycSavingCurrentService.updateKycRecord($scope.dataUpdate).then(function (response) {
                 console.log('Response:', response.data);
                 alert("Data successfully submitted.");
                 window.location.href = $scope.uRl + "user_asBOM.html";
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

         $scope.list_Adhar = [];
         $scope.panstatus = null;
         $scope.adharstatus = null;
         $scope.otherDocstatus = null;
         $scope.applicationFormstatus = null;
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


         $scope.checkLength = function () {
             var maxLength = 4900;

             if ($scope.remark !== undefined) {

                 if ($scope.remark.length > maxLength) {
                     alert('Text length should not exceed ' + maxLength + ' characters.');
                     // You can also update $scope.inputText or take other actions as needed.
                     $scope.remark = $scope.remark.substring(0, maxLength);
                     $scope.isRemarkTooLong = false;
                 } else {
                     $scope.isRemarkTooLong = true;
                 }

             } else {
                 alert('Text length should not exceed ' + maxLength + ' characters.');
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
             if (messageApprove.endsWith("Approved")) {
                 $scope.notVisible_OnApproval = false;
                 $scope.Visible_OnApproval = true;
             } else if (messageApprove.endsWith("Pending at COPs")) {
                 $scope.notVisible_OnApproval = false;
                 $scope.Visible_OnApproval = false;
             } else if (messageApprove.endsWith("Pending at BOM")) {
                 $scope.notVisible_OnApproval = true;
                 $scope.Visible_OnApproval = false;
             }
         };
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
             //

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

         $scope.validateForm = function () {
             if ($scope.accountType) {
                 return true;
             } else {
                 alert("Please! select the Account Type.");
                 return false;
             }
         };

         $scope.formdata = function () {
             debugger;
             //Test
             $scope.checkLength();
             if ($scope.validateForm() && $scope.isRemarkTooLong) {
                 // Adding Files
                 if (document.getElementById("idProofCG").files.length === 0) {
                     var loopsize = $scope.reco.idProof.length;
                     var dataTransfer = new DataTransfer();  // Create a DataTransfer object
                     for (var i = 0; i < loopsize; i++) {
                         var file = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.reco.idProof[i], "idProof_" + i);
                         dataTransfer.items.add(file);  // Add each file to the DataTransfer object
                     }
                     $scope.dataUpdate['idProof'] = dataTransfer.files;  // Assign the FileList
                     $scope.dataUpdate['idProofStatus'] = $scope.reco.idProofStatus;
                 } else {
                     $scope.dataUpdate['idProofStatus'] = "";
                 }
                 //
                 //
                 if (document.getElementById("addressProofCG").files.length === 0) {
                     var loopsize = $scope.reco.addressProof.length;
                     var dataTransfer = new DataTransfer();  // Create a DataTransfer object
                     for (var i = 0; i < loopsize; i++) {
                         var file = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.reco.addressProof[i], "addressProof_" + i);
                         dataTransfer.items.add(file);  // Add each file to the DataTransfer object
                     }
                     $scope.dataUpdate['addressProof'] = dataTransfer.files;  // Assign the FileList
                     $scope.dataUpdate['addressProofStatus'] = $scope.reco.addressProofStatus;
                 } else {
                     $scope.dataUpdate['addressProofStatus'] = "";
                 }
                 //
                 //
                 if (document.getElementById("panCG").files.length === 0) {
                     var loopsize = $scope.reco.pan.length;
                     var dataTransfer = new DataTransfer();  // Create a DataTransfer object
                     for (var i = 0; i < loopsize; i++) {
                         var file = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.reco.pan[i], "pan_" + i);
                         dataTransfer.items.add(file);  // Add each file to the DataTransfer object
                     }
                     $scope.dataUpdate['pan'] = dataTransfer.files;  // Assign the FileList
                     $scope.dataUpdate['panStatus'] = $scope.reco.panStatus;
                 } else {
                     $scope.dataUpdate['panStatus'] = "";
                 }
                 //
                 //
                 if (document.getElementById("otherDocCG").files.length === 0) {
                     var loopsize = $scope.reco.otherDoc.length;
                     var dataTransfer = new DataTransfer();  // Create a DataTransfer object
                     for (var i = 0; i < loopsize; i++) {
                         var file = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.reco.otherDoc[i], "otherDoc_" + i);
                         dataTransfer.items.add(file);  // Add each file to the DataTransfer object
                     }
                     $scope.dataUpdate['otherDoc'] = dataTransfer.files;  // Assign the FileList
                     $scope.dataUpdate['otherDocStatus'] = $scope.reco.otherDocStatus;
                 } else {
                     $scope.dataUpdate['otherDocStatus'] = "";

                 }
                 //
                 //
                 if (document.getElementById("clientFormCG").files.length === 0) {
                     var loopsize = $scope.reco.clientForm.length;
                     var dataTransfer = new DataTransfer();  // Create a DataTransfer object
                     for (var i = 0; i < loopsize; i++) {
                         var file = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.reco.clientForm[i], "otherDoc_" + i);
                         dataTransfer.items.add(file);  // Add each file to the DataTransfer object
                     }
                     $scope.dataUpdate['clientForm'] = dataTransfer.files;  // Assign the FileList
                     $scope.dataUpdate['clientFormStatus'] = $scope.reco.clientFormStatus;
                 } else {
                     $scope.dataUpdate['clientFormStatus'] = "";
                 }
                 //
                 $scope.submitUpdateForm();
             }

         };


     } else {
         window.location.href = $scope.uRl + "index.html";
     }
 });


 app.controller("currentWealthCont", function ($scope, $http, kycSavingCurrentService, kycService) {
     var protocal = window.location.protocol;
     var host = window.location.host;
     $scope.uRl = protocal + "//" + host + "/";

     $scope.reco = null;

     $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asBOM"));
     $scope.recordData = JSON.parse(window.localStorage.getItem("Record"));
     if (($scope.userRecord)) {
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
//         $scope.$watch('applicant', function (newVal) {
//             $scope.dataSave.applicant = newVal;
//         });
//         $scope.$watch('mobileNo', function (newVal) {
//             $scope.dataSave.mobileNo = parseInt(newVal, 10);
//         });
//         $scope.$watch('adharNo', function (newVal) {
//             $scope.dataSave.adharNo = newVal;
//         });
//         $scope.$watch('remark', function (newVal) {
//             $scope.dataSave.remark = newVal;
//         });
         // Function to upload files and update dataSave
         $scope.uploadFilesSave = function (files, type) {
             $scope.dataSave[type] = files;
         };
         $scope.submitForm = function () {
             kycSavingCurrentService.save($scope.dataSave).then(function (response) {
                 debugger;
                 console.log('Response:', response.data);
                 if ("" === response.data || null === response.data) {
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
             id: $scope.id,
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
         $scope.$watch('remark', function (newVal) {
             $scope.dataUpdate.remark = newVal;
         });
         $scope.uploadFilesUpdate = function (files, type) {
             debugger;
             $scope.dataUpdate[type] = files;
             console.log('Files uploaded:', $scope.dataUpdate);
         };
         $scope.submitUpdateForm = function () {
             kycSavingCurrentService.updateKycRecord($scope.dataUpdate).then(function (response) {
                 console.log('Response:', response.data);
                 alert("Data successfully submitted.");
                 window.location.href = $scope.uRl + "user_asBOM.html";
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

         $scope.list_Adhar = [];
         $scope.panstatus = null;
         $scope.adharstatus = null;
         $scope.otherDocstatus = null;
         $scope.applicationFormstatus = null;
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


         $scope.checkLength = function () {
             var maxLength = 4900;

             if ($scope.remark !== undefined) {

                 if ($scope.remark.length > maxLength) {
                     alert('Text length should not exceed ' + maxLength + ' characters.');
                     // You can also update $scope.inputText or take other actions as needed.
                     $scope.remark = $scope.remark.substring(0, maxLength);
                     $scope.isRemarkTooLong = false;
                 } else {
                     $scope.isRemarkTooLong = true;
                 }

             } else {
                 alert('Text length should not exceed ' + maxLength + ' characters.');
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
             if (messageApprove.endsWith("Approved")) {
                 $scope.notVisible_OnApproval = false;
                 $scope.Visible_OnApproval = true;
             } else if (messageApprove.endsWith("Pending at COPs")) {
                 $scope.notVisible_OnApproval = false;
                 $scope.Visible_OnApproval = false;
             } else if (messageApprove.endsWith("Pending at BOM")) {
                 $scope.notVisible_OnApproval = true;
                 $scope.Visible_OnApproval = false;
             }
         };
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
             //

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

         $scope.validateForm = function () {
             if ($scope.accountType) {
                 return true;
             } else {
                 alert("Please! select the Account Type.");
                 return false;
             }
         };

         $scope.formdata = function () {
             debugger;
             //Test
             $scope.checkLength();
             if ($scope.validateForm() && $scope.isRemarkTooLong) {
                 // Adding Files
                 if (document.getElementById("idProofCW").files.length === 0) {
                     var loopsize = $scope.reco.idProof.length;
                     var dataTransfer = new DataTransfer();  // Create a DataTransfer object
                     for (var i = 0; i < loopsize; i++) {
                         var file = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.reco.idProof[i], "idProof_" + i);
                         dataTransfer.items.add(file);  // Add each file to the DataTransfer object
                     }
                     $scope.dataUpdate['idProof'] = dataTransfer.files;  // Assign the FileList
                     $scope.dataUpdate['idProofStatus'] = $scope.reco.idProofStatus;
                 } else {
                     $scope.dataUpdate['idProofStatus'] = "";
                 }
                 //
                 //
                 if (document.getElementById("addressProofCW").files.length === 0) {
                     var loopsize = $scope.reco.addressProof.length;
                     var dataTransfer = new DataTransfer();  // Create a DataTransfer object
                     for (var i = 0; i < loopsize; i++) {
                         var file = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.reco.addressProof[i], "addressProof_" + i);
                         dataTransfer.items.add(file);  // Add each file to the DataTransfer object
                     }
                     $scope.dataUpdate['addressProof'] = dataTransfer.files;  // Assign the FileList
                     $scope.dataUpdate['addressProofStatus'] = $scope.reco.addressProofStatus;
                 } else {
                     $scope.dataUpdate['addressProofStatus'] = "";
                 }
                 //
                 //
                 if (document.getElementById("panCW").files.length === 0) {
                     var loopsize = $scope.reco.pan.length;
                     var dataTransfer = new DataTransfer();  // Create a DataTransfer object
                     for (var i = 0; i < loopsize; i++) {
                         var file = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.reco.pan[i], "pan_" + i);
                         dataTransfer.items.add(file);  // Add each file to the DataTransfer object
                     }
                     $scope.dataUpdate['pan'] = dataTransfer.files;  // Assign the FileList
                     $scope.dataUpdate['panStatus'] = $scope.reco.panStatus;
                 } else {
                     $scope.dataUpdate['panStatus'] = "";
                 }
                 //
                 //
                 if (document.getElementById("otherDocCW").files.length === 0) {
                     var loopsize = $scope.reco.otherDoc.length;
                     var dataTransfer = new DataTransfer();  // Create a DataTransfer object
                     for (var i = 0; i < loopsize; i++) {
                         var file = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.reco.otherDoc[i], "otherDoc_" + i);
                         dataTransfer.items.add(file);  // Add each file to the DataTransfer object
                     }
                     $scope.dataUpdate['otherDoc'] = dataTransfer.files;  // Assign the FileList
                     $scope.dataUpdate['otherDocStatus'] = $scope.reco.otherDocStatus;
                 } else {
                     $scope.dataUpdate['otherDocStatus'] = "";

                 }
                 //
                 //
                 if (document.getElementById("clientFormCW").files.length === 0) {
                     var loopsize = $scope.reco.clientForm.length;
                     var dataTransfer = new DataTransfer();  // Create a DataTransfer object
                     for (var i = 0; i < loopsize; i++) {
                         var file = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.reco.clientForm[i], "otherDoc_" + i);
                         dataTransfer.items.add(file);  // Add each file to the DataTransfer object
                     }
                     $scope.dataUpdate['clientForm'] = dataTransfer.files;  // Assign the FileList
                     $scope.dataUpdate['clientFormStatus'] = $scope.reco.clientFormStatus;
                 } else {
                     $scope.dataUpdate['clientFormStatus'] = "";
                 }
                 //
                 $scope.submitUpdateForm();
             }

         };


     } else {
         window.location.href = $scope.uRl + "index.html";
     }
 });
