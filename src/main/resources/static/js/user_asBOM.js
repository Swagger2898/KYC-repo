 var app = angular.module('myApp', ['kycApp', 'kycJointSavingApp', 'kycPartnershipApp'
             , 'kycPubpvtApp', 'kycSavingCurrentApp', 'kycSoleProprietorshipApp'
             , 'kycTascApp']);
 app.controller("cont", function ($q, $scope, $http, $interval, kycService,
         kycJointSavingService, kycPartnershipService, kycPubpvtService,
         kycSavingCurrentService, kycSoleProprietorshipService,
         kycTascService, $window) {

     var protocal = window.location.protocol;
     var host = window.location.host;
     $scope.uRl = protocal + "//" + host + "/";

     $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asBOM"));
     if (($scope.userRecord)) {
// start for BOM edit form
         $scope.selectedAccOption;
         $scope.Record = null;
         $scope.kycRecord = null;
         $scope.listContainerVisible = true;
         $scope.forAadharDetails = false;
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
// end for BOM edit form
         $scope.masterKycRecordList = [];
         $scope.jointSavingRecordList = [];
         $scope.partnershipRecordList = [];
         $scope.pubpvtRecordList = [];
         $scope.savingCurrentRecordList = [];
         $scope.soleProprietorshipRecordList = [];
         $scope.tascRecordList = [];

         $scope.refresh = function () {
             kycService.getAllKYCRecords($scope.userRecord.userName).then(function (response) {
                 $scope.masterKycRecordList = response.data;
             }).catch(function (error) {
                 console.log('Error:', error);
             });
         };

         $scope.refresh();
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

         $scope.kycRecordInactive = function (id, accessingId) {
             debugger;
             kycService.kycRecordInActive(id, accessingId).then(function (response) {
                 $scope.kycRecord = response.data;
             }).catch(function (error) {
                 console.log('Error:', error);
             });
         };

         $scope.kycRecordActive = function (id, accessingId) {
             debugger;
             kycService.kycRecordActive(id, accessingId).then(function (response) {
                 debugger;
                 $scope.kycRecord = response.data;
             }).catch(function (error) {
                 console.log('Error:', error);
             });
         };

//         $scope.cancelBOMForm = function () {
//             debugger;
//             kycService.kycRecordActive($scope.kycRecord.id, "").then(function (response) {
//                 location.reload();
//                 $scope.kycRecord = response.data;
//             }).catch(function (error) {
//                 console.log('Error:', error);
//             });
//         };


         $scope.showEditFormAlert = false;
//         $scope.showConfrmEditFormAlert = false;

         $scope.showEditFormAlertBox = function () {
             $scope.showEditFormAlert = true;
//             $scope.showConfrmEditFormAlert = false;
         };

         $scope.closeAlert = function () {
             $scope.showEditFormAlert = false;
             location.reload();
//             $scope.showConfrmEditFormAlert = false;
         };

//         $scope.showCnformAlert = function () {
//             $scope.showConfrmEditFormAlert = true;
//             $scope.showEditFormAlert = false;
//         };

//         $scope.openEditForm = function () {
//             debugger;
//             debugger;
//             // call the edit form function here
//             $scope.showEditFormAlert = false;
//             $scope.showConfrmEditFormAlert = false;
//             var id = $scope.Record.id;
//             kycService.kycRecordActive(id, $scope.userRecord.userName).then(function (response) {
//                 debugger;
//                 $scope.kycRecord = response.data;
//                 $scope.editRecord($scope.kycRecord);
//             }).catch(function (error) {
//                 console.log('Error:', error);
//             });
//         };

         $scope.editRecord = function (record) {
             debugger;

             $scope.Record = record;
             localStorage.setItem("Record", JSON.stringify(record));
//             if (record.accessingId === $scope.userRecord.userName) {
//                 if (record.activeStatus === true) {
//                     kycService.kycRecordInActive(record.id, $scope.userRecord.userName).then(function (response) {
//                         $scope.changeForm(record.accountType);
//                         $scope.formContainerVisible = true;
//                         $scope.listContainerVisible = false;
//                         window.location.href = $scope.uRl + "user_asBOM_Form.html";
//                     }).catch(function (error) {
//                         console.log('Error:', error);
//                     });
//                 }
//                 if (record.activeStatus === false) {
//                     $scope.changeForm(record.accountType);
//                     $scope.formContainerVisible = true;
//                     $scope.listContainerVisible = false;
//                     window.location.href = $scope.uRl + "user_asBOM_Form.html";
//                 }
//             }
//             if (record.activeStatus === true) {
//                 kycService.kycRecordInActive(record.id, $scope.userRecord.userName).then(function (response) {
//                     $scope.kycRecord = response.data;
//                     $scope.changeForm(record.accountType);
//                     $scope.formContainerVisible = true;
//                     $scope.listContainerVisible = false;
//                     window.location.href = $scope.uRl + "user_asBOM_Form.html";
//                 }).catch(function (error) {
//                     console.log('Error:', error);
//                 });
//             } else {
//                 $scope.showEditFormAlertBox();
////                 alert(record.accessingId + " is already accessing the form.");
////                 location.reload();
//             }

             //new code as per client requirement
             $scope.changeForm(record.accountType);
             $scope.formContainerVisible = true;
             $scope.listContainerVisible = false;
             window.location.href = $scope.uRl + "user_asBOM_Form.html";
             //close 
         };

//         $scope.accessCheking = function () {
//             debugger;
//             // call the edit form function here
//         };

         $scope.viewPan = function () {
             var loopsize = $scope.recoPan.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoPan[i], '_blank');
             }
         };
         $scope.viewAadhar = function () {


             var loopsize = $scope.recoAdhar.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoAdhar[i], '_blank');
             }

         };
         $scope.viewPdfApp = function () {
             var loopsize = $scope.recoApplicationForm.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoApplicationForm[i], '_blank');
             }
         };
         $scope.viewPdfOther = function () {


             var loopsize = $scope.recoOtherDoc.length;
             for (var i = 0; i < loopsize; i++) {
                 window.open($scope.recoOtherDoc[i], '_blank');
             }

         };
         $scope.deleterecord = function (id) {
             $http.get($scope.uRl + "kyc/delete/" + id)
                     .then(function (response) {
                         alert("Data succesfully deleted");
                     }, function (error) {
                         console.log(error);
                     });
         };
         $scope.searchByFiled = function (message) {
             $scope.search = message;
         };

         // exportToExcel code start

         $scope.loadSheet = function () {
             // Create an array of promises for all the service calls
             var kycRecordsPromises = [
                 kycService.getAllKYCRecords($scope.userRecord.userName),
                 kycJointSavingService.getAllBranchListOfBOM($scope.userRecord.userName),
                 kycPartnershipService.getAllBranchListOfBOM($scope.userRecord.userName),
                 kycPubpvtService.getAllBranchListOfBOM($scope.userRecord.userName),
                 kycSavingCurrentService.getAllBranchListOfBOM($scope.userRecord.userName),
                 kycSoleProprietorshipService.getAllBranchListOfBOM($scope.userRecord.userName),
                 kycTascService.getAllBranchListOfBOM($scope.userRecord.userName)
             ];

             // Use $q.all to wait for all promises to resolve
             return $q.all(kycRecordsPromises).then(function (responses) {
                 // Responses is an array of response objects from each service call
                 $scope.masterKycRecordList = responses[0].data;
                 $scope.jointSavingRecordList = responses[1].data;
                 $scope.partnershipRecordList = responses[2].data;
                 $scope.pubpvtRecordList = responses[3].data;
                 $scope.savingCurrentRecordList = responses[4].data;
                 $scope.soleProprietorshipRecordList = responses[5].data;
                 $scope.tascRecordList = responses[6].data;
             }).catch(function (error) {
                 console.log('Error:', error);
             });
         };

         $scope.exportToExcelMaster = function () {
             var jsonData = $scope.masterKycRecordList;

             function formatDate(date) {
                 var options = {
                     day: '2-digit',
                     month: '2-digit',
                     year: 'numeric'
                 };
                 var datePart = date.toLocaleDateString('en-IN', options);

                 options = {
                     hour: '2-digit',
                     minute: '2-digit',
                     second: '2-digit',
                     hour12: true
                 };
                 var timePart = date.toLocaleTimeString('en-IN', options);

                 return `${datePart} ${timePart.replace(/\b(?:am|pm)\b/g, match => match.toUpperCase())}`;
             }

             // Format the date and timestamp columns
             jsonData.forEach(function (item) {
                 if (item.date instanceof Array) {
                     item.date = item.date.map(d => formatDate(new Date(d))).join(', ');
                 } else if (typeof item.date === 'string') {
                     item.date = formatDate(new Date(item.date));
                 }
                 item.timeStam = item.timeStam.join(', ');
             });



             var filteredData = jsonData.map(function (item) {
                 debugger;

                 var dateOfArray = item.date.split(",");
                 var dateLength = dateOfArray.length;
                 var noOfCycle = dateLength / 2;
                 var start = moment(dateOfArray[0], "DD/MM/YYYY hh:mm:ss A");
                 var end = moment(dateOfArray[dateLength - 1], "DD/MM/YYYY hh:mm:ss A");

                 var diff = moment.duration(end.diff(start));

                 var days = Math.floor(diff.asDays());
                 var hours = diff.hours();
                 var minutes = diff.minutes();
                 var seconds = diff.seconds();

                 var duration = `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;
                 var finalStatusCondition = item.status.endsWith("Approved");
                 var finalStatus = "";
                 var ApprovedDate = "";
                 if (true === finalStatusCondition) {
                     finalStatus = "Approved";
                     ApprovedDate = dateOfArray[dateLength - 1].substring(1, 11);
                 } else {
                     finalStatus = "Pending";
                 }

                 return {
                     'Code': item.code,
                     'Applicant': item.applicantFirst,
                     'Mobile No': item.mobileNo,
                     'Status': item.status,
                     'Remark': item.remark,
                     'Date': item.date,
                     'Account Type': item.accountType,
                     'Branch Name': item.branchName,
                     'Form Filled Date': dateOfArray[0].substring(0, 10),
                     'Time Stamp': item.timeStam,
                     'Approved By': item.approvedBy,
                     'Uploaded By': item.uploadedBy,
                     'No Of Cycle': noOfCycle,
                     'Duration': duration,
                     'Final Status': finalStatus,
                     'Approved Date': ApprovedDate
                 };
             });

             var ws = XLSX.utils.json_to_sheet(filteredData);

             // Initialize ws['!cols'] as an array
             ws['!cols'] = [];

             // Auto-detect column lengths
             var range = XLSX.utils.decode_range(ws['!ref']);
             for (var C = range.s.c; C <= range.e.c; ++C) {
                 var maxLength = filteredData.reduce((max, row) => {
                     var cell = row[XLSX.utils.encode_col(C)];
                     return cell ? Math.max(max, cell.length) : max;
                 }, 10);
                 ws['!cols'][C] = {width: maxLength};
             }

             // Adding auto filter and styling
             ws['!autofilter'] = {ref: XLSX.utils.encode_range(range)};

             var wb = XLSX.utils.book_new();
             XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

             // Save the Excel file
             XLSX.writeFile(wb, $scope.userRecord.userName + '_Master KYC Records Report.xlsx');

             location.reload();
         };

         $scope.exportToExcelJointSaving = function () {
             var jsonData = $scope.jointSavingRecordList;

             function formatDate(date) {
                 var options = {
                     day: '2-digit',
                     month: '2-digit',
                     year: 'numeric'
                 };
                 var datePart = date.toLocaleDateString('en-IN', options);

                 options = {
                     hour: '2-digit',
                     minute: '2-digit',
                     second: '2-digit',
                     hour12: true
                 };
                 var timePart = date.toLocaleTimeString('en-IN', options);

                 return `${datePart} ${timePart.replace(/\b(?:am|pm)\b/g, match => match.toUpperCase())}`;
             }

             // Format the date and timestamp columns
             jsonData.forEach(function (item) {
                 if (item.date instanceof Array) {
                     item.date = item.date.map(d => formatDate(new Date(d))).join(', ');
                 } else if (typeof item.date === 'string') {
                     item.date = formatDate(new Date(item.date));
                 }
                 item.timeStam = item.timeStam.join(', ');
             });



             var filteredData = jsonData.map(function (item) {
                 debugger;

                 var dateOfArray = item.date.split(",");
                 var dateLength = dateOfArray.length;
                 var noOfCycle = dateLength / 2;
                 var start = moment(dateOfArray[0], "DD/MM/YYYY hh:mm:ss A");
                 var end = moment(dateOfArray[dateLength - 1], "DD/MM/YYYY hh:mm:ss A");

                 var diff = moment.duration(end.diff(start));

                 var days = Math.floor(diff.asDays());
                 var hours = diff.hours();
                 var minutes = diff.minutes();
                 var seconds = diff.seconds();

                 var duration = `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;
                 var finalStatusCondition = item.status.endsWith("Approved");
                 var finalStatus = "";
                 var ApprovedDate = "";
                 if (true === finalStatusCondition) {
                     finalStatus = "Approved";
                     ApprovedDate = dateOfArray[dateLength - 1].substring(1, 11);
                 } else {
                     finalStatus = "Pending";
                 }

                 return {
                     'Code': item.code,
                     'Applicant_1': item.applicantFirst,
                     'Applicant_2': item.applicantSecond,
                     'Applicant_3': item.applicantThird,
                     'Aadhar No_1': item.adharNoFirst,
                     'Aadhar No_2': item.adharNoSecond,
                     'Aadhar No_3': item.adharNoThird,
                     'Mobile No': item.mobileNo,
                     'Account Type': item.accountType,
                     'Branch Name': item.branchName,
                     'Status': item.status,
                     'Remark': item.remark,
                     'Form Filled Date': dateOfArray[0].substring(0, 10),
                     'Date': item.date,
                     'IdProof Status': item.idProofStatus,
                     'AddressProof Status': item.addressProofStatus,
                     'Pan Status': item.panStatus,
                     'OtherDoc Status': item.otherDocStatus,
                     'ClientForm Status': item.clientFormStatus,
                     'Time Stamp': item.timeStam,
                     'Approved By': item.approvedBy,
                     'Uploaded By': item.uploadedBy,
                     'No Of Cycle': noOfCycle,
                     'Duration': duration,
                     'Final Status': finalStatus,
                     'Approved Date': ApprovedDate
                 };
             });

             var ws = XLSX.utils.json_to_sheet(filteredData);

             // Initialize ws['!cols'] as an array
             ws['!cols'] = [];

             // Auto-detect column lengths
             var range = XLSX.utils.decode_range(ws['!ref']);
             for (var C = range.s.c; C <= range.e.c; ++C) {
                 var maxLength = filteredData.reduce((max, row) => {
                     var cell = row[XLSX.utils.encode_col(C)];
                     return cell ? Math.max(max, cell.length) : max;
                 }, 10);
                 ws['!cols'][C] = {width: maxLength};
             }

             // Adding auto filter and styling
             ws['!autofilter'] = {ref: XLSX.utils.encode_range(range)};

             var wb = XLSX.utils.book_new();
             XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

             // Save the Excel file
             XLSX.writeFile(wb, $scope.userRecord.userName + '_JointSaving KYC Records Report.xlsx');

             location.reload();
         };

         $scope.exportToExcelPartnership = function () {
             var jsonData = $scope.partnershipRecordList;

             function formatDate(date) {
                 var options = {
                     day: '2-digit',
                     month: '2-digit',
                     year: 'numeric'
                 };
                 var datePart = date.toLocaleDateString('en-IN', options);

                 options = {
                     hour: '2-digit',
                     minute: '2-digit',
                     second: '2-digit',
                     hour12: true
                 };
                 var timePart = date.toLocaleTimeString('en-IN', options);

                 return `${datePart} ${timePart.replace(/\b(?:am|pm)\b/g, match => match.toUpperCase())}`;
             }

             // Format the date and timestamp columns
             jsonData.forEach(function (item) {
                 if (item.date instanceof Array) {
                     item.date = item.date.map(d => formatDate(new Date(d))).join(', ');
                 } else if (typeof item.date === 'string') {
                     item.date = formatDate(new Date(item.date));
                 }
                 item.timeStam = item.timeStam.join(', ');
             });



             var filteredData = jsonData.map(function (item) {
                 debugger;

                 var dateOfArray = item.date.split(",");
                 var dateLength = dateOfArray.length;
                 var noOfCycle = dateLength / 2;
                 var start = moment(dateOfArray[0], "DD/MM/YYYY hh:mm:ss A");
                 var end = moment(dateOfArray[dateLength - 1], "DD/MM/YYYY hh:mm:ss A");

                 var diff = moment.duration(end.diff(start));

                 var days = Math.floor(diff.asDays());
                 var hours = diff.hours();
                 var minutes = diff.minutes();
                 var seconds = diff.seconds();

                 var duration = `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;
                 var finalStatusCondition = item.status.endsWith("Approved");
                 var finalStatus = "";
                 var ApprovedDate = "";
                 if (true === finalStatusCondition) {
                     finalStatus = "Approved";
                     ApprovedDate = dateOfArray[dateLength - 1].substring(1, 11);
                 } else {
                     finalStatus = "Pending";
                 }

                 return {
                     'Code': item.code,
                     'Entity': item.entity,
                     'Applicant_1': item.applicantFirst,
                     'Applicant_2': item.applicantSecond,
                     'Applicant_3': item.applicantThird,
                     'Aadhar No_1': item.adharNoFirst,
                     'Aadhar No_2': item.adharNoSecond,
                     'Aadhar No_3': item.adharNoThird,
                     'Mobile No': item.mobileNo,
                     'Account Type': item.accountType,
                     'Branch Name': item.branchName,
                     'Status': item.status,
                     'Remark': item.remark,
                     'Form Filled Date': dateOfArray[0].substring(0, 10),
                     'Date': item.date,
                     'IdProof Status': item.idProofStatus,
                     'AddressProof Status': item.addressProofStatus,
                     'Pan Status': item.panStatus,
                     'PartnershipDoc Status': item.partnershipDocStatus,
                     'OtherDoc Status': item.otherDocStatus,
                     'ClientForm Status': item.clientFormStatus,
                     'Time Stamp': item.timeStam,
                     'Approved By': item.approvedBy,
                     'Uploaded By': item.uploadedBy,
                     'No Of Cycle': noOfCycle,
                     'Duration': duration,
                     'Final Status': finalStatus,
                     'Approved Date': ApprovedDate
                 };
             });

             var ws = XLSX.utils.json_to_sheet(filteredData);

             // Initialize ws['!cols'] as an array
             ws['!cols'] = [];

             // Auto-detect column lengths
             var range = XLSX.utils.decode_range(ws['!ref']);
             for (var C = range.s.c; C <= range.e.c; ++C) {
                 var maxLength = filteredData.reduce((max, row) => {
                     var cell = row[XLSX.utils.encode_col(C)];
                     return cell ? Math.max(max, cell.length) : max;
                 }, 10);
                 ws['!cols'][C] = {width: maxLength};
             }

             // Adding auto filter and styling
             ws['!autofilter'] = {ref: XLSX.utils.encode_range(range)};

             var wb = XLSX.utils.book_new();
             XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

             // Save the Excel file
             XLSX.writeFile(wb, $scope.userRecord.userName + '_Partnership KYC Records Report.xlsx');

             location.reload();
         };

         $scope.exportToExcelPubpvt = function () {
             var jsonData = $scope.pubpvtRecordList;

             function formatDate(date) {
                 var options = {
                     day: '2-digit',
                     month: '2-digit',
                     year: 'numeric'
                 };
                 var datePart = date.toLocaleDateString('en-IN', options);

                 options = {
                     hour: '2-digit',
                     minute: '2-digit',
                     second: '2-digit',
                     hour12: true
                 };
                 var timePart = date.toLocaleTimeString('en-IN', options);

                 return `${datePart} ${timePart.replace(/\b(?:am|pm)\b/g, match => match.toUpperCase())}`;
             }

             // Format the date and timestamp columns
             jsonData.forEach(function (item) {
                 if (item.date instanceof Array) {
                     item.date = item.date.map(d => formatDate(new Date(d))).join(', ');
                 } else if (typeof item.date === 'string') {
                     item.date = formatDate(new Date(item.date));
                 }
                 item.timeStam = item.timeStam.join(', ');
             });



             var filteredData = jsonData.map(function (item) {
                 debugger;

                 var dateOfArray = item.date.split(",");
                 var dateLength = dateOfArray.length;
                 var noOfCycle = dateLength / 2;
                 var start = moment(dateOfArray[0], "DD/MM/YYYY hh:mm:ss A");
                 var end = moment(dateOfArray[dateLength - 1], "DD/MM/YYYY hh:mm:ss A");

                 var diff = moment.duration(end.diff(start));

                 var days = Math.floor(diff.asDays());
                 var hours = diff.hours();
                 var minutes = diff.minutes();
                 var seconds = diff.seconds();

                 var duration = `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;
                 var finalStatusCondition = item.status.endsWith("Approved");
                 var finalStatus = "";
                 var ApprovedDate = "";
                 if (true === finalStatusCondition) {
                     finalStatus = "Approved";
                     ApprovedDate = dateOfArray[dateLength - 1].substring(1, 11);
                 } else {
                     finalStatus = "Pending";
                 }

                 return {
                     'Code': item.code,
                     'Entity': item.entity,
                     'Applicant_1': item.applicantFirst,
                     'Applicant_2': item.applicantSecond,
                     'Applicant_3': item.applicantThird,
                     'Aadhar No_1': item.adharNoFirst,
                     'Aadhar No_2': item.adharNoSecond,
                     'Aadhar No_3': item.adharNoThird,
                     'Mobile No': item.mobileNo,
                     'Account Type': item.accountType,
                     'Branch Name': item.branchName,
                     'Status': item.status,
                     'Remark': item.remark,
                     'Form Filled Date': dateOfArray[0].substring(0, 10),
                     'Date': item.date,
                     'IdProof Status': item.idProofStatus,
                     'AddressProof Status': item.addressProofStatus,
                     'Pan Status': item.panStatus,
                     'CompanyDoc Status': item.companyDocStatus,
                     'OtherDoc Status': item.otherDocStatus,
                     'ClientForm Status': item.clientFormStatus,
                     'Time Stamp': item.timeStam,
                     'Approved By': item.approvedBy,
                     'Uploaded By': item.uploadedBy,
                     'No Of Cycle': noOfCycle,
                     'Duration': duration,
                     'Final Status': finalStatus,
                     'Approved Date': ApprovedDate
                 };
             });

             var ws = XLSX.utils.json_to_sheet(filteredData);

             // Initialize ws['!cols'] as an array
             ws['!cols'] = [];

             // Auto-detect column lengths
             var range = XLSX.utils.decode_range(ws['!ref']);
             for (var C = range.s.c; C <= range.e.c; ++C) {
                 var maxLength = filteredData.reduce((max, row) => {
                     var cell = row[XLSX.utils.encode_col(C)];
                     return cell ? Math.max(max, cell.length) : max;
                 }, 10);
                 ws['!cols'][C] = {width: maxLength};
             }

             // Adding auto filter and styling
             ws['!autofilter'] = {ref: XLSX.utils.encode_range(range)};

             var wb = XLSX.utils.book_new();
             XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

             // Save the Excel file
             XLSX.writeFile(wb, $scope.userRecord.userName + '_PubPvt KYC Records Report.xlsx');

             location.reload();
         };

         $scope.exportToExcelSavingCurrent = function () {
             var jsonData = $scope.savingCurrentRecordList;

             function formatDate(date) {
                 var options = {
                     day: '2-digit',
                     month: '2-digit',
                     year: 'numeric'
                 };
                 var datePart = date.toLocaleDateString('en-IN', options);

                 options = {
                     hour: '2-digit',
                     minute: '2-digit',
                     second: '2-digit',
                     hour12: true
                 };
                 var timePart = date.toLocaleTimeString('en-IN', options);

                 return `${datePart} ${timePart.replace(/\b(?:am|pm)\b/g, match => match.toUpperCase())}`;
             }

             // Format the date and timestamp columns
             jsonData.forEach(function (item) {
                 if (item.date instanceof Array) {
                     item.date = item.date.map(d => formatDate(new Date(d))).join(', ');
                 } else if (typeof item.date === 'string') {
                     item.date = formatDate(new Date(item.date));
                 }
                 item.timeStam = item.timeStam.join(', ');
             });



             var filteredData = jsonData.map(function (item) {
                 debugger;

                 var dateOfArray = item.date.split(",");
                 var dateLength = dateOfArray.length;
                 var noOfCycle = dateLength / 2;
                 var start = moment(dateOfArray[0], "DD/MM/YYYY hh:mm:ss A");
                 var end = moment(dateOfArray[dateLength - 1], "DD/MM/YYYY hh:mm:ss A");

                 var diff = moment.duration(end.diff(start));

                 var days = Math.floor(diff.asDays());
                 var hours = diff.hours();
                 var minutes = diff.minutes();
                 var seconds = diff.seconds();

                 var duration = `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;
                 var finalStatusCondition = item.status.endsWith("Approved");
                 var finalStatus = "";
                 var ApprovedDate = "";
                 if (true === finalStatusCondition) {
                     finalStatus = "Approved";
                     ApprovedDate = dateOfArray[dateLength - 1].substring(1, 11);
                 } else {
                     finalStatus = "Pending";
                 }

                 return {
                     'Code': item.code,
                     'Applicant': item.applicantFirst,
                     'Aadhar Number': item.adharNoFirst,
                     'Mobile No': item.mobileNo,
                     'Account Type': item.accountType,
                     'Branch Name': item.branchName,
                     'Status': item.status,
                     'Remark': item.remark,
                     'Form Filled Date': dateOfArray[0].substring(0, 10),
                     'Date': item.date,
                     'IdProof Status': item.idProofStatus,
                     'AddressProof Status': item.addressProofStatus,
                     'Pan Status': item.panStatus,
                     'OtherDoc Status': item.otherDocStatus,
                     'ClientForm Status': item.clientFormStatus,
                     'Time Stamp': item.timeStam,
                     'Approved By': item.approvedBy,
                     'Uploaded By': item.uploadedBy,
                     'No Of Cycle': noOfCycle,
                     'Duration': duration,
                     'Final Status': finalStatus,
                     'Approved Date': ApprovedDate
                 };
             });

             var ws = XLSX.utils.json_to_sheet(filteredData);

             // Initialize ws['!cols'] as an array
             ws['!cols'] = [];

             // Auto-detect column lengths
             var range = XLSX.utils.decode_range(ws['!ref']);
             for (var C = range.s.c; C <= range.e.c; ++C) {
                 var maxLength = filteredData.reduce((max, row) => {
                     var cell = row[XLSX.utils.encode_col(C)];
                     return cell ? Math.max(max, cell.length) : max;
                 }, 10);
                 ws['!cols'][C] = {width: maxLength};
             }

             // Adding auto filter and styling
             ws['!autofilter'] = {ref: XLSX.utils.encode_range(range)};

             var wb = XLSX.utils.book_new();
             XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

             // Save the Excel file
             XLSX.writeFile(wb, $scope.userRecord.userName + '_SavingAndCurrent KYC Records Report.xlsx');

             location.reload();
         };

         $scope.exportToExcelSoleProprietorship = function () {
             var jsonData = $scope.soleProprietorshipRecordList;

             function formatDate(date) {
                 var options = {
                     day: '2-digit',
                     month: '2-digit',
                     year: 'numeric'
                 };
                 var datePart = date.toLocaleDateString('en-IN', options);

                 options = {
                     hour: '2-digit',
                     minute: '2-digit',
                     second: '2-digit',
                     hour12: true
                 };
                 var timePart = date.toLocaleTimeString('en-IN', options);

                 return `${datePart} ${timePart.replace(/\b(?:am|pm)\b/g, match => match.toUpperCase())}`;
             }

             // Format the date and timestamp columns
             jsonData.forEach(function (item) {
                 if (item.date instanceof Array) {
                     item.date = item.date.map(d => formatDate(new Date(d))).join(', ');
                 } else if (typeof item.date === 'string') {
                     item.date = formatDate(new Date(item.date));
                 }
                 item.timeStam = item.timeStam.join(', ');
             });



             var filteredData = jsonData.map(function (item) {
                 debugger;

                 var dateOfArray = item.date.split(",");
                 var dateLength = dateOfArray.length;
                 var noOfCycle = dateLength / 2;
                 var start = moment(dateOfArray[0], "DD/MM/YYYY hh:mm:ss A");
                 var end = moment(dateOfArray[dateLength - 1], "DD/MM/YYYY hh:mm:ss A");

                 var diff = moment.duration(end.diff(start));

                 var days = Math.floor(diff.asDays());
                 var hours = diff.hours();
                 var minutes = diff.minutes();
                 var seconds = diff.seconds();

                 var duration = `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;
                 var finalStatusCondition = item.status.endsWith("Approved");
                 var finalStatus = "";
                 var ApprovedDate = "";
                 if (true === finalStatusCondition) {
                     finalStatus = "Approved";
                     ApprovedDate = dateOfArray[dateLength - 1].substring(1, 11);
                 } else {
                     finalStatus = "Pending";
                 }

                 return {
                     'Code': item.code,
                     'Entity': item.entity,
                     'Applicant': item.applicantFirst,
                     'Aadhar Number': item.adharNoFirst,
                     'Mobile No': item.mobileNo,
                     'Account Type': item.accountType,
                     'Branch Name': item.branchName,
                     'Status': item.status,
                     'Remark': item.remark,
                     'Form Filled Date': dateOfArray[0].substring(0, 10),
                     'Date': item.date,
                     'IdProof Status': item.idProofStatus,
                     'AddressProof Status': item.addressProofStatus,
                     'Pan Status': item.panStatus,
                     'EntityProof Status': item.entityProofStatus,
                     'OtherDoc Status': item.otherDocStatus,
                     'ClientForm Status': item.clientFormStatus,
                     'Time Stamp': item.timeStam,
                     'Approved By': item.approvedBy,
                     'Uploaded By': item.uploadedBy,
                     'No Of Cycle': noOfCycle,
                     'Duration': duration,
                     'Final Status': finalStatus,
                     'Approved Date': ApprovedDate
                 };
             });

             var ws = XLSX.utils.json_to_sheet(filteredData);

             // Initialize ws['!cols'] as an array
             ws['!cols'] = [];

             // Auto-detect column lengths
             var range = XLSX.utils.decode_range(ws['!ref']);
             for (var C = range.s.c; C <= range.e.c; ++C) {
                 var maxLength = filteredData.reduce((max, row) => {
                     var cell = row[XLSX.utils.encode_col(C)];
                     return cell ? Math.max(max, cell.length) : max;
                 }, 10);
                 ws['!cols'][C] = {width: maxLength};
             }

             // Adding auto filter and styling
             ws['!autofilter'] = {ref: XLSX.utils.encode_range(range)};

             var wb = XLSX.utils.book_new();
             XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

             // Save the Excel file
             XLSX.writeFile(wb, $scope.userRecord.userName + '_SoleProprietorship KYC Records Report.xlsx');

             location.reload();
         };

         $scope.exportToExcelTasc = function () {
             var jsonData = $scope.tascRecordList;

             function formatDate(date) {
                 var options = {
                     day: '2-digit',
                     month: '2-digit',
                     year: 'numeric'
                 };
                 var datePart = date.toLocaleDateString('en-IN', options);

                 options = {
                     hour: '2-digit',
                     minute: '2-digit',
                     second: '2-digit',
                     hour12: true
                 };
                 var timePart = date.toLocaleTimeString('en-IN', options);

                 return `${datePart} ${timePart.replace(/\b(?:am|pm)\b/g, match => match.toUpperCase())}`;
             }

             // Format the date and timestamp columns
             jsonData.forEach(function (item) {
                 if (item.date instanceof Array) {
                     item.date = item.date.map(d => formatDate(new Date(d))).join(', ');
                 } else if (typeof item.date === 'string') {
                     item.date = formatDate(new Date(item.date));
                 }
                 item.timeStam = item.timeStam.join(', ');
             });



             var filteredData = jsonData.map(function (item) {
                 debugger;

                 var dateOfArray = item.date.split(",");
                 var dateLength = dateOfArray.length;
                 var noOfCycle = dateLength / 2;
                 var start = moment(dateOfArray[0], "DD/MM/YYYY hh:mm:ss A");
                 var end = moment(dateOfArray[dateLength - 1], "DD/MM/YYYY hh:mm:ss A");

                 var diff = moment.duration(end.diff(start));

                 var days = Math.floor(diff.asDays());
                 var hours = diff.hours();
                 var minutes = diff.minutes();
                 var seconds = diff.seconds();

                 var duration = `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;
                 var finalStatusCondition = item.status.endsWith("Approved");
                 var finalStatus = "";
                 var ApprovedDate = "";
                 if (true === finalStatusCondition) {
                     finalStatus = "Approved";
                     ApprovedDate = dateOfArray[dateLength - 1].substring(1, 11);
                 } else {
                     finalStatus = "Pending";
                 }

                 return {
                     'Code': item.code,
                     'Entity': item.entity,
                     'Applicant_1': item.applicantFirst,
                     'Applicant_2': item.applicantSecond,
                     'Applicant_3': item.applicantThird,
                     'Applicant_4': item.applicantFourth,
                     'Applicant_5': item.applicantFifth,
                     'Aadhar No_1': item.adharNoFirst,
                     'Aadhar No_2': item.adharNoSecond,
                     'Aadhar No_3': item.adharNoThird,
                     'Aadhar No_4': item.adharNoFourth,
                     'Aadhar No_5': item.adharNoFifth,
                     'Mobile No': item.mobileNo,
                     'Account Type': item.accountType,
                     'Branch Name': item.branchName,
                     'Status': item.status,
                     'Remark': item.remark,
                     'Form Filled Date': dateOfArray[0].substring(0, 10),
                     'Date': item.date,
                     'IdProof Status': item.idProofStatus,
                     'AddressProof Status': item.addressProofStatus,
                     'Pan Status': item.panStatus,
                     'TascDoc Status': item.tascDocStatus,
                     'OtherDoc Status': item.otherDocStatus,
                     'ClientForm Status': item.clientFormStatus,
                     'Time Stamp': item.timeStam,
                     'Approved By': item.approvedBy,
                     'Uploaded By': item.uploadedBy,
                     'No Of Cycle': noOfCycle,
                     'Duration': duration,
                     'Final Status': finalStatus,
                     'Approved Date': ApprovedDate
                 };
             });

             var ws = XLSX.utils.json_to_sheet(filteredData);

             // Initialize ws['!cols'] as an array
             ws['!cols'] = [];

             // Auto-detect column lengths
             var range = XLSX.utils.decode_range(ws['!ref']);
             for (var C = range.s.c; C <= range.e.c; ++C) {
                 var maxLength = filteredData.reduce((max, row) => {
                     var cell = row[XLSX.utils.encode_col(C)];
                     return cell ? Math.max(max, cell.length) : max;
                 }, 10);
                 ws['!cols'][C] = {width: maxLength};
             }

             // Adding auto filter and styling
             ws['!autofilter'] = {ref: XLSX.utils.encode_range(range)};

             var wb = XLSX.utils.book_new();
             XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

             // Save the Excel file
             XLSX.writeFile(wb, $scope.userRecord.userName + '_Tasc KYC Records Report.xlsx');

             location.reload();
         };

         $scope.exportToExcel = function () {
             $scope.loadSheet().then(function () {
                 // Ensure all data is loaded before exporting
                 $scope.exportToExcelJointSaving();
                 $scope.exportToExcelMaster();
                 $scope.exportToExcelPartnership();
                 $scope.exportToExcelPubpvt();
                 $scope.exportToExcelSavingCurrent();
                 $scope.exportToExcelSoleProprietorship();
                 $scope.exportToExcelTasc();
                 alert("Downloading Data Excel file.");
             });
         };
         // exportToExcel code end

         $scope.viewRemark = function (mess) {
             var messRemark = mess.split(",");
             var messLength = messRemark.length;
             alert(messRemark[messLength - 1]);
         };

//          Set up the interval to call refresh every 1 minute (60000 milliseconds)
         var intervalPromise = $interval(function () {
             $scope.refresh();
         }, 30000);

         // Optionally, you can cancel the interval when the scope is destroyed to prevent memory leaks
         $scope.$on('$destroy', function () {
             if (intervalPromise) {
                 $interval.cancel(intervalPromise);
             }
         });

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

////silver saving controller
// app.controller('silverSavingCont', function ($scope, $http, kycSavingCurrentService, kycService) {
//     debugger;
//     var protocal = window.location.protocol;
//     var host = window.location.host;
//     $scope.uRl = protocal + "//" + host + "/";
//     $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asBOM"));
//     $scope.recordData = JSON.parse(window.localStorage.getItem("Record"));
//     if (($scope.userRecord)) {
//         $scope.Record;
//         $scope.kycDetails = function () {
//             kycSavingCurrentService.getRecordByCode($scope.recordData.code).then(function (response) {
//                 $scope.Record = response.data;
//                 console.log($scope.Record);
//             }).catch(function (error) {
//                 console.log('Error:', error);
//             });
//         };
//         $scope.kycDetails();
//         $scope.list = [];
//         $scope.forAadharDetails = false;
//         $scope.branchlist = [];
//
//         $scope.branchName = $scope.userRecord.branchName;
//         $scope.url = "branch/getuser/" + $scope.userRecord.userName;
//         $http.get($scope.uRl + $scope.url)
//                 .then(function (response) {
//                     $scope.branchlist = response.data.branchNameList;
//                 }, function (error) {
//                     console.log(error);
//                 });
//
//         $scope.validateForm = function () {
//             if ($scope.accountType) {
//                 return true;
//             } else {
//                 alert("Please! select the Account Type.");
//                 return false;
//             }
//         };
//
//         $scope.closeAadharDetails = function () {
//             $scope.forAadharDetails = false;
//         };
//
//         $scope.aadharcheck = function (adharNo) {
//             debugger;
//             if (!(adharNo)) {
//                 alert("     Please enter the Aadhar Number! \n\
//                                                    OR \n\
//                            Check the enter digit is 12 or not.");
//                 $scope.forAadharDetails = false;
//                 $scope.list = null;
//             } else {
//                 $scope.forAadharDetails = false;
//                 $scope.list = null;
//                 $scope.url = "kyc/getAadhar/" + adharNo;
//                 $http.get($scope.uRl + $scope.url)
//                         .then(function (response) {
//                             debugger;
//                             $scope.list = response.data;
//                             if ($scope.list.length > 0) {
//                                 console.log($scope.list);
//                                 $scope.forAadharDetails = true;
//                             } else {
//                                 $scope.list = null;
//                                 $scope.forAadharDetails = false;
//                                 alert("Aadhar not present in KYC.");
//                             }
//                         }, function (error) {
//                             console.log(error);
//                         });
//             }
//         };
//
//
//
//         $scope.formdata = function () {
//
//
//             if ($scope.adharNo) {
//                 $scope.url = "kyc/getAadhar/" + $scope.adharNo;
//             } else {
//                 alert("Please enter all Aadhar No.");
//                 return;
//             }
//
//
//             $http.get($scope.uRl + $scope.url)
//                     .then(function (response) {
//                         debugger;
//                         $scope.list = response.data;
//                         if ($scope.list.length === 0) {
//                             $scope.forAadharDetails = false;
//                         } else {
//                             $scope.list = null;
//                             $scope.forAadharDetails = false;
//                         }
//
//                         if ($scope.validateForm()) {
//
//                             var form = new FormData();
//                             var loopForPan = document.getElementById("pan").files.length;
//                             for (let i = 0; i < loopForPan; i++) {
//                                 form.append("pan", document.getElementById("pan").files[i], document.getElementById("pan").localName);
//                             }
//
//                             var loopForAadhar = document.getElementById("adhar").files.length;
//                             for (let i = 0; i < loopForAadhar; i++) {
//                                 form.append("adhar", document.getElementById("adhar").files[i], document.getElementById("adhar").localName);
//                             }
//
//                             var loopForApplicationForm = document.getElementById("applicationForm").files.length;
//                             for (let i = 0; i < loopForApplicationForm; i++) {
//                                 form.append("applicationForm", document.getElementById("applicationForm").files[i], document.getElementById("applicationForm").localName);
//                             }
//
//                             var loopForOtherDoc = document.getElementById("otherDoc").files.length;
//                             for (let i = 0; i < loopForOtherDoc; i++) {
//                                 form.append("otherDoc", document.getElementById("otherDoc").files[i], document.getElementById("otherDoc").localName);
//                             }
//
////                            var jointType = $scope.accountType.startsWith("Joint");
//                             form.append("mobileNo", $scope.mobileNo);
//                             form.append("accountType", $scope.accountType);
//                             form.append("branchName", $scope.branchName);
//                             form.append("status", "Pending at COPs");
//
//                             if (response.data.length === 0) {
//                                 form.append("remark", "BOM : Data Submitted");
//                             } else {
//                                 form.append("remark", "BOM : Existing Customer KYC Verification for " + $scope.accountType + "");
//                             }
//
//                             form.append("panStatus", "");
//                             form.append("adharStatus", "");
//                             form.append("otherDocStatus", "");
//                             form.append("applicationFormStatus", "");
//                             form.append("approvedBy", "");
//                             form.append("uploadedBy", $scope.userRecord.userName + "(BOM)");
//                             console.log(form);
//                             var settings = {
//                                 "url": $scope.uRl + "kyc/save",
//                                 "method": "POST",
//                                 "timeout": 0,
//                                 "processData": false,
//                                 "mimeType": "multipart/form-data",
//                                 "contentType": false,
//                                 "data": form
//                             };
//
//                             $.ajax(settings).done(function (response) {
//                                 debugger;
//                                 console.log("Response:", response);  // Log the raw response
//                                 console.log("Response Length:", response.length);  // Log the length of the response
//                                 console.log("Response Type:", typeof response);  // Log the type of the response
//
//                                 if (!response) {
//                                     alert("Empty response from server. Please try again later.");
//                                     return;
//                                 }
//
//                                 try {
//                                     var responseData = JSON.parse(response);  // Try to parse the response
//                                 } catch (e) {
//                                     console.error("Error parsing JSON response:", e);
//                                     alert("There was an error processing your request. Please try again.");
//                                     return;  // Exit the function if JSON parsing fails
//                                 }
//
//                                 // Continue with your logic if JSON parsing succeeds
//                                 var Ack = responseData.code;
//                                 if ("" === response) {
//                                     alert("Already have an Account Type for this Aadhar number !");
//                                 } else {
//                                     alert("Data successfully submitted. Ack_No( " + Ack.substring(6) + " )");
//                                     window.location.href = $scope.uRl + "user_asBOM.html";
//                                 }
//                             }).fail(function (jqXHR, textStatus, errorThrown) {
//                                 // Handle AJAX errors
//                                 console.error("AJAX error:", textStatus, errorThrown);
//                                 alert("There was an error processing your request. Please try again.");
//                             });
//                         }
//                     }, function (error) {
//                         console.log(error);
//                     });
//
//         };
//
//
//     } else {
//         window.location.href = $scope.uRl + "index.html";
//     }
// });
//
//
// app.controller("normalSavingCont", function ($scope, $http, $timeout) {
//
//     var protocal = window.location.protocol;
//     var host = window.location.host;
//     $scope.uRl = protocal + "//" + host + "/";
//
//     $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asBOM"));
//     if (($scope.userRecord)) {
//         $scope.list = [];
//         $scope.forAadharDetails = false;
//         $scope.branchlist = [];
//
//
//         $scope.branchName = $scope.userRecord.branchName;
//         $scope.url = "branch/getuser/" + $scope.userRecord.userName;
//         $http.get($scope.uRl + $scope.url)
//                 .then(function (response) {
//                     $scope.branchlist = response.data.branchNameList;
//                 }, function (error) {
//                     console.log(error);
//                 });
//
//         $scope.validateForm = function () {
//             if ($scope.accountType) {
//                 return true;
//             } else {
//                 alert("Please! select the Account Type.");
//                 return false;
//             }
//         };
//
//         $scope.closeAadharDetails = function () {
//             $scope.forAadharDetails = false;
//         };
//
//         $scope.aadharcheck = function (adharNo) {
//             debugger;
//             if (!(adharNo)) {
//                 alert("     Please enter the Aadhar Number! \n\
//                                                    OR \n\
//                            Check the enter digit is 12 or not.");
//                 $scope.forAadharDetails = false;
//                 $scope.list = null;
//             } else {
//                 $scope.forAadharDetails = false;
//                 $scope.list = null;
//                 $scope.url = "kyc/getAadhar/" + adharNo;
//                 $http.get($scope.uRl + $scope.url)
//                         .then(function (response) {
//                             debugger;
//                             $scope.list = response.data;
//                             if ($scope.list.length > 0) {
//                                 console.log($scope.list);
//                                 $scope.forAadharDetails = true;
//                             } else {
//                                 $scope.list = null;
//                                 $scope.forAadharDetails = false;
//                                 alert("Aadhar not present in KYC.");
//                             }
//                         }, function (error) {
//                             console.log(error);
//                         });
//             }
//         };
//
//
//
//         $scope.formdata = function () {
//
//
//             if ($scope.adharNo) {
//                 $scope.url = "kyc/getAadhar/" + $scope.adharNo;
//             } else {
//                 alert("Please enter all Aadhar No.");
//                 return;
//             }
//
//
//             $http.get($scope.uRl + $scope.url)
//                     .then(function (response) {
//                         debugger;
//                         $scope.list = response.data;
//                         if ($scope.list.length === 0) {
//                             $scope.forAadharDetails = false;
//                         } else {
//                             $scope.list = null;
//                             $scope.forAadharDetails = false;
//                         }
//
//                         if ($scope.validateForm()) {
//
//                             var form = new FormData();
//                             var loopForPan = document.getElementById("pan").files.length;
//                             for (let i = 0; i < loopForPan; i++) {
//                                 form.append("pan", document.getElementById("pan").files[i], document.getElementById("pan").localName);
//                             }
//
//                             var loopForAadhar = document.getElementById("adhar").files.length;
//                             for (let i = 0; i < loopForAadhar; i++) {
//                                 form.append("adhar", document.getElementById("adhar").files[i], document.getElementById("adhar").localName);
//                             }
//
//                             var loopForApplicationForm = document.getElementById("applicationForm").files.length;
//                             for (let i = 0; i < loopForApplicationForm; i++) {
//                                 form.append("applicationForm", document.getElementById("applicationForm").files[i], document.getElementById("applicationForm").localName);
//                             }
//
//                             var loopForOtherDoc = document.getElementById("otherDoc").files.length;
//                             for (let i = 0; i < loopForOtherDoc; i++) {
//                                 form.append("otherDoc", document.getElementById("otherDoc").files[i], document.getElementById("otherDoc").localName);
//                             }
//
////                            var jointType = $scope.accountType.startsWith("Joint");
//                             form.append("mobileNo", $scope.mobileNo);
//                             form.append("accountType", $scope.accountType);
//                             form.append("branchName", $scope.branchName);
//                             form.append("status", "Pending at COPs");
//
//                             if (response.data.length === 0) {
//                                 form.append("remark", "BOM : Data Submitted");
//                             } else {
//                                 form.append("remark", "BOM : Existing Customer KYC Verification for " + $scope.accountType + "");
//                             }
//
//                             form.append("panStatus", "");
//                             form.append("adharStatus", "");
//                             form.append("otherDocStatus", "");
//                             form.append("applicationFormStatus", "");
//                             form.append("approvedBy", "");
//                             form.append("uploadedBy", $scope.userRecord.userName + "(BOM)");
//                             console.log(form);
//
//                             var settings = {
//                                 "url": $scope.uRl + "kyc/save",
//                                 "method": "POST",
//                                 "timeout": 0,
//                                 "processData": false,
//                                 "mimeType": "multipart/form-data",
//                                 "contentType": false,
//                                 "data": form
//                             };
//
//                             $.ajax(settings).done(function (response) {
//                                 debugger;
//                                 console.log("Response:", response);  // Log the raw response
//                                 console.log("Response Length:", response.length);  // Log the length of the response
//                                 console.log("Response Type:", typeof response);  // Log the type of the response
//
//                                 if (!response) {
//                                     alert("Empty response from server. Please try again later.");
//                                     return;
//                                 }
//
//                                 try {
//                                     var responseData = JSON.parse(response);  // Try to parse the response
//                                 } catch (e) {
//                                     console.error("Error parsing JSON response:", e);
//                                     alert("There was an error processing your request. Please try again.");
//                                     return;  // Exit the function if JSON parsing fails
//                                 }
//
//                                 // Continue with your logic if JSON parsing succeeds
//                                 var Ack = responseData.code;
//                                 if ("" === response) {
//                                     alert("Already have an Account Type for this Aadhar number !");
//                                 } else {
//                                     alert("Data successfully submitted. Ack_No( " + Ack.substring(6) + " )");
//                                     window.location.href = $scope.uRl + "user_asBOM.html";
//                                 }
//                             }).fail(function (jqXHR, textStatus, errorThrown) {
//                                 // Handle AJAX errors
//                                 console.error("AJAX error:", textStatus, errorThrown);
//                                 alert("There was an error processing your request. Please try again.");
//                             });
//                         }
//                     }, function (error) {
//                         console.log(error);
//                     });
//
//         };
//
//
//     } else {
//         window.location.href = $scope.uRl + "index.html";
//     }
//
// });
//
//
//
//
//
////joint silver saving
// app.controller("jointSilverSavingCont", function ($scope, $http, $timeout) {
//
//     var protocal = window.location.protocol;
//     var host = window.location.host;
//     $scope.uRl = protocal + "//" + host + "/";
//
//     $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asBOM"));
//     if (($scope.userRecord)) {
//         $scope.list = [];
//         $scope.forAadharDetails = false;
//         $scope.branchlist = [];
//
////       form button for add applicant and aadhar
//
//
//
//         $scope.showApp3 = false;
//         $scope.showAadhar3 = false;
//
//
//
//
//         $scope.branchName = $scope.userRecord.branchName;
//         $scope.url = "branch/getuser/" + $scope.userRecord.userName;
//         $http.get($scope.uRl + $scope.url)
//                 .then(function (response) {
//                     $scope.branchlist = response.data.branchNameList;
//                 }, function (error) {
//                     console.log(error);
//                 });
//
//         $scope.validateForm = function () {
////             var accountTypeElement = document.getElementById("accountType").value;
//             if ($scope.accountType) {
//                 return true;
//             } else {
//                 alert("Please! select the Account Type.");
//                 return false;
//             }
//         };
//
//         $scope.closeAadharDetails = function () {
//             $scope.forAadharDetails = false;
//         };
//
//         $scope.aadharcheck = function (adharNo) {
//             debugger;
//             if (!(adharNo)) {
//                 alert("     Please enter the Aadhar Number! \n\
//                                                    OR \n\
//                            Check the enter digit is 12 or not.");
//                 $scope.forAadharDetails = false;
//                 $scope.list = null;
//             } else {
//                 $scope.forAadharDetails = false;
//                 $scope.list = null;
//                 $scope.url = "kyc/getAadhar/" + adharNo;
//                 $http.get($scope.uRl + $scope.url)
//                         .then(function (response) {
//                             debugger;
//                             $scope.list = response.data;
//                             if ($scope.list.length > 0) {
//                                 console.log($scope.list);
//                                 $scope.forAadharDetails = true;
//                             } else {
//                                 $scope.list = null;
//                                 $scope.forAadharDetails = false;
//                                 alert("Aadhar not present in KYC.");
//                             }
//                         }, function (error) {
//                             console.log(error);
//                         });
//             }
//         };
//
//
//
//         $scope.addApplicant = function () {
//             $scope.showApp3 = true;
//             $scope.showAadhar3 = true;
//         };
//
//
//         $scope.formdata = function () {
//
//             if ($scope.showApp3 === true) {
//                 if ($scope.adharNo1) {
//                     $scope.url = "kyc/getAadhar/" + $scope.adharNo1;
//                 } else {
//                     alert("Please enter Aadhar No.");
//                     return;
//                 }
//             } else {
//                 if ($scope.adharNo1) {
//                     $scope.url = "kyc/getAadhar/" + $scope.adharNo1;
//                 } else {
//                     alert("Please enter Aadhar No.");
//                     return;
//                 }
//             }
//
//             $http.get($scope.uRl + $scope.url)
//                     .then(function (response) {
//                         debugger;
//
//                         $scope.list = response.data;
//                         if ($scope.list.length === 0) {
//                             $scope.forAadharDetails = false;
//                         } else {
//                             $scope.list = null;
//                             $scope.forAadharDetails = false;
//                         }
//
//                         if ($scope.validateForm()) {
//
//                             var form = new FormData();
//                             var loopForPan = document.getElementById("pan").files.length;
//                             for (let i = 0; i < loopForPan; i++) {
//                                 form.append("pan", document.getElementById("pan").files[i], document.getElementById("pan").localName);
//                             }
//
//                             var loopForAadhar = document.getElementById("adhar").files.length;
//                             for (let i = 0; i < loopForAadhar; i++) {
//                                 form.append("adhar", document.getElementById("adhar").files[i], document.getElementById("adhar").localName);
//                             }
//
//                             var loopForApplicationForm = document.getElementById("applicationForm").files.length;
//                             for (let i = 0; i < loopForApplicationForm; i++) {
//                                 form.append("applicationForm", document.getElementById("applicationForm").files[i], document.getElementById("applicationForm").localName);
//                             }
//
//                             var loopForOtherDoc = document.getElementById("otherDoc").files.length;
//                             for (let i = 0; i < loopForOtherDoc; i++) {
//                                 form.append("otherDoc", document.getElementById("otherDoc").files[i], document.getElementById("otherDoc").localName);
//                             }
//
//
//                             if ($scope.showApp3 === true) {
//                                 if (($scope.applicant1) && ($scope.applicant2) && ($scope.applicant3)) {
//                                     form.append("applicant", $scope.applicant1);
//                                     form.append("applicant", $scope.applicant2);
//                                     form.append("applicant", $scope.applicant3);
//                                 } else {
//                                     alert("Please enter all applicant name.");
//                                     return;
//                                 }
//                                 if (($scope.adharNo1) && ($scope.adharNo2) && ($scope.adharNo3)) {
//                                     form.append("adharNo", $scope.adharNo1);
//                                     form.append("adharNo", $scope.adharNo2);
//                                     form.append("adharNo", $scope.adharNo3);
//                                 } else {
//                                     alert("Please enter all Aadhar No.");
//                                     return;
//                                 }
//                             } else {
//                                 if (($scope.applicant1) && ($scope.applicant2)) {
//                                     form.append("applicant", $scope.applicant1);
//                                     form.append("applicant", $scope.applicant2);
//                                 } else {
//                                     alert("Please enter all applicant name.");
//                                     return;
//                                 }
//                                 if (($scope.adharNo1) && ($scope.adharNo2)) {
//                                     form.append("adharNo", $scope.adharNo1);
//                                     form.append("adharNo", $scope.adharNo2);
//                                 } else {
//                                     alert("Please enter all Aadhar No.");
//                                     return;
//                                 }
//                             }
//
////                            var jointType = $scope.accountType.startsWith("Joint");
//                             form.append("mobileNo", $scope.mobileNo);
//                             form.append("accountType", $scope.accountType);
//                             form.append("branchName", $scope.branchName);
//                             form.append("status", "Pending at COPs");
//
//                             if (response.data.length === 0) {
//                                 form.append("remark", "BOM : Data Submitted");
//                             } else {
//                                 form.append("remark", "BOM : Existing Customer KYC Verification for " + $scope.accountType + "");
//                             }
//
//                             form.append("panStatus", "");
//                             form.append("adharStatus", "");
//                             form.append("otherDocStatus", "");
//                             form.append("applicationFormStatus", "");
//                             form.append("approvedBy", "");
//                             form.append("uploadedBy", $scope.userRecord.userName + "(BOM)");
//                             console.log(form);
//                             var settings = {
//                                 "url": $scope.uRl + "kyc/save",
//                                 "method": "POST",
//                                 "timeout": 0,
//                                 "processData": false,
//                                 "mimeType": "multipart/form-data",
//                                 "contentType": false,
//                                 "data": form
//                             };
//
//
//                             $.ajax(settings).done(function (response) {
//                                 debugger;
//                                 console.log("Response:", response);  // Log the raw response
//                                 console.log("Response Length:", response.length);  // Log the length of the response
//                                 console.log("Response Type:", typeof response);  // Log the type of the response
//
//                                 if (!response) {
//                                     alert("Empty response from server. Please try again later.");
//                                     return;
//                                 }
//
//                                 try {
//                                     var responseData = JSON.parse(response);  // Try to parse the response
//                                 } catch (e) {
//                                     console.error("Error parsing JSON response:", e);
//                                     alert("There was an error processing your request. Please try again.");
//                                     return;  // Exit the function if JSON parsing fails
//                                 }
//
//                                 // Continue with your logic if JSON parsing succeeds
//                                 var Ack = responseData.code;
//                                 if ("" === response) {
//                                     alert("Already have an Account Type for this Aadhar number !");
//                                 } else {
//                                     alert("Data successfully submitted. Ack_No( " + Ack.substring(6) + " )");
//                                     window.location.href = $scope.uRl + "user_asBOM.html";
//                                 }
//                             }).fail(function (jqXHR, textStatus, errorThrown) {
//                                 // Handle AJAX errors
//                                 console.error("AJAX error:", textStatus, errorThrown);
//                                 alert("There was an error processing your request. Please try again.");
//                             });
//                         }
//                     }, function (error) {
//                         console.log(error);
//                     });
//         };
//
//
//     } else {
//         window.location.href = $scope.uRl + "index.html";
//     }
//
// });
//
//
// app.controller("jointNormalSavingCont", function ($scope, $http, $timeout) {
//
//     var protocal = window.location.protocol;
//     var host = window.location.host;
//     $scope.uRl = protocal + "//" + host + "/";
//
//     $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asBOM"));
//     if (($scope.userRecord)) {
//         $scope.list = [];
//         $scope.forAadharDetails = false;
//         $scope.branchlist = [];
//
////       form button for add applicant and aadhar
//
//
//
//         $scope.showApp3 = false;
//         $scope.showAadhar3 = false;
//
//
//
//
//         $scope.branchName = $scope.userRecord.branchName;
//         $scope.url = "branch/getuser/" + $scope.userRecord.userName;
//         $http.get($scope.uRl + $scope.url)
//                 .then(function (response) {
//                     $scope.branchlist = response.data.branchNameList;
//                 }, function (error) {
//                     console.log(error);
//                 });
//
//         $scope.validateForm = function () {
////             var accountTypeElement = document.getElementById("accountType").value;
//             if ($scope.accountType) {
//                 return true;
//             } else {
//                 alert("Please! select the Account Type.");
//                 return false;
//             }
//         };
//
//         $scope.closeAadharDetails = function () {
//             $scope.forAadharDetails = false;
//         };
//
//         $scope.aadharcheck = function (adharNo) {
//             debugger;
//             if (!(adharNo)) {
//                 alert("     Please enter the Aadhar Number! \n\
//                                                    OR \n\
//                            Check the enter digit is 12 or not.");
//                 $scope.forAadharDetails = false;
//                 $scope.list = null;
//             } else {
//                 $scope.forAadharDetails = false;
//                 $scope.list = null;
//                 $scope.url = "kyc/getAadhar/" + adharNo;
//                 $http.get($scope.uRl + $scope.url)
//                         .then(function (response) {
//                             debugger;
//                             $scope.list = response.data;
//                             if ($scope.list.length > 0) {
//                                 console.log($scope.list);
//                                 $scope.forAadharDetails = true;
//                             } else {
//                                 $scope.list = null;
//                                 $scope.forAadharDetails = false;
//                                 alert("Aadhar not present in KYC.");
//                             }
//                         }, function (error) {
//                             console.log(error);
//                         });
//             }
//         };
//
//
//
//         $scope.addApplicant = function () {
//             $scope.showApp3 = true;
//             $scope.showAadhar3 = true;
//         };
//
//
//         $scope.formdata = function () {
//
//             if ($scope.showApp3 === true) {
//                 if ($scope.adharNo1) {
//                     $scope.url = "kyc/getAadhar/" + $scope.adharNo1;
//                 } else {
//                     alert("Please enter Aadhar No.");
//                     return;
//                 }
//             } else {
//                 if ($scope.adharNo1) {
//                     $scope.url = "kyc/getAadhar/" + $scope.adharNo1;
//                 } else {
//                     alert("Please enter Aadhar No.");
//                     return;
//                 }
//             }
//
//             $http.get($scope.uRl + $scope.url)
//                     .then(function (response) {
//                         debugger;
//
//                         $scope.list = response.data;
//                         if ($scope.list.length === 0) {
//                             $scope.forAadharDetails = false;
//                         } else {
//                             $scope.list = null;
//                             $scope.forAadharDetails = false;
//                         }
//
//                         if ($scope.validateForm()) {
//
//                             var form = new FormData();
//                             var loopForPan = document.getElementById("pan").files.length;
//                             for (let i = 0; i < loopForPan; i++) {
//                                 form.append("pan", document.getElementById("pan").files[i], document.getElementById("pan").localName);
//                             }
//
//                             var loopForAadhar = document.getElementById("adhar").files.length;
//                             for (let i = 0; i < loopForAadhar; i++) {
//                                 form.append("adhar", document.getElementById("adhar").files[i], document.getElementById("adhar").localName);
//                             }
//
//                             var loopForApplicationForm = document.getElementById("applicationForm").files.length;
//                             for (let i = 0; i < loopForApplicationForm; i++) {
//                                 form.append("applicationForm", document.getElementById("applicationForm").files[i], document.getElementById("applicationForm").localName);
//                             }
//
//                             var loopForOtherDoc = document.getElementById("otherDoc").files.length;
//                             for (let i = 0; i < loopForOtherDoc; i++) {
//                                 form.append("otherDoc", document.getElementById("otherDoc").files[i], document.getElementById("otherDoc").localName);
//                             }
//
//
//                             if ($scope.showApp3 === true) {
//                                 if (($scope.applicant1) && ($scope.applicant2) && ($scope.applicant3)) {
//                                     form.append("applicant", $scope.applicant1);
//                                     form.append("applicant", $scope.applicant2);
//                                     form.append("applicant", $scope.applicant3);
//                                 } else {
//                                     alert("Please enter all applicant name.");
//                                     return;
//                                 }
//                                 if (($scope.adharNo1) && ($scope.adharNo2) && ($scope.adharNo3)) {
//                                     form.append("adharNo", $scope.adharNo1);
//                                     form.append("adharNo", $scope.adharNo2);
//                                     form.append("adharNo", $scope.adharNo3);
//                                 } else {
//                                     alert("Please enter all Aadhar No.");
//                                     return;
//                                 }
//                             } else {
//                                 if (($scope.applicant1) && ($scope.applicant2)) {
//                                     form.append("applicant", $scope.applicant1);
//                                     form.append("applicant", $scope.applicant2);
//                                 } else {
//                                     alert("Please enter all applicant name.");
//                                     return;
//                                 }
//                                 if (($scope.adharNo1) && ($scope.adharNo2)) {
//                                     form.append("adharNo", $scope.adharNo1);
//                                     form.append("adharNo", $scope.adharNo2);
//                                 } else {
//                                     alert("Please enter all Aadhar No.");
//                                     return;
//                                 }
//                             }
//
////                            var jointType = $scope.accountType.startsWith("Joint");
//                             form.append("mobileNo", $scope.mobileNo);
//                             form.append("accountType", $scope.accountType);
//                             form.append("branchName", $scope.branchName);
//                             form.append("status", "Pending at COPs");
//
//                             if (response.data.length === 0) {
//                                 form.append("remark", "BOM : Data Submitted");
//                             } else {
//                                 form.append("remark", "BOM : Existing Customer KYC Verification for " + $scope.accountType + "");
//                             }
//
//                             form.append("panStatus", "");
//                             form.append("adharStatus", "");
//                             form.append("otherDocStatus", "");
//                             form.append("applicationFormStatus", "");
//                             form.append("approvedBy", "");
//                             form.append("uploadedBy", $scope.userRecord.userName + "(BOM)");
//                             console.log(form);
//                             var settings = {
//                                 "url": $scope.uRl + "kyc/save",
//                                 "method": "POST",
//                                 "timeout": 0,
//                                 "processData": false,
//                                 "mimeType": "multipart/form-data",
//                                 "contentType": false,
//                                 "data": form
//                             };
//
//
//                             $.ajax(settings).done(function (response) {
//                                 debugger;
//                                 console.log("Response:", response);  // Log the raw response
//                                 console.log("Response Length:", response.length);  // Log the length of the response
//                                 console.log("Response Type:", typeof response);  // Log the type of the response
//
//                                 if (!response) {
//                                     alert("Empty response from server. Please try again later.");
//                                     return;
//                                 }
//
//                                 try {
//                                     var responseData = JSON.parse(response);  // Try to parse the response
//                                 } catch (e) {
//                                     console.error("Error parsing JSON response:", e);
//                                     alert("There was an error processing your request. Please try again.");
//                                     return;  // Exit the function if JSON parsing fails
//                                 }
//
//                                 // Continue with your logic if JSON parsing succeeds
//                                 var Ack = responseData.code;
//                                 if ("" === response) {
//                                     alert("Already have an Account Type for this Aadhar number !");
//                                 } else {
//                                     alert("Data successfully submitted. Ack_No( " + Ack.substring(6) + " )");
//                                     window.location.href = $scope.uRl + "user_asBOM.html";
//                                 }
//                             }).fail(function (jqXHR, textStatus, errorThrown) {
//                                 // Handle AJAX errors
//                                 console.error("AJAX error:", textStatus, errorThrown);
//                                 alert("There was an error processing your request. Please try again.");
//                             });
//                         }
//                     }, function (error) {
//                         console.log(error);
//                     });
//         };
//
//
//     } else {
//         window.location.href = $scope.uRl + "index.html";
//     }
//
// });
//
//
// app.controller("normalCurrentCont", function ($scope, $http, $timeout) {
//     var protocal = window.location.protocol;
//     var host = window.location.host;
//     $scope.uRl = protocal + "//" + host + "/";
//
//     $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asBOM"));
//     if (($scope.userRecord)) {
//         $scope.list = [];
//         $scope.forAadharDetails = false;
//         $scope.branchlist = [];
//
//
//         $scope.branchName = $scope.userRecord.branchName;
//         $scope.url = "branch/getuser/" + $scope.userRecord.userName;
//         $http.get($scope.uRl + $scope.url)
//                 .then(function (response) {
//                     $scope.branchlist = response.data.branchNameList;
//                 }, function (error) {
//                     console.log(error);
//                 });
//
//         $scope.validateForm = function () {
//             if ($scope.accountType) {
//                 return true;
//             } else {
//                 alert("Please! select the Account Type.");
//                 return false;
//             }
//         };
//
//         $scope.closeAadharDetails = function () {
//             $scope.forAadharDetails = false;
//         };
//
//         $scope.aadharcheck = function (adharNo) {
//             debugger;
//             if (!(adharNo)) {
//                 alert("     Please enter the Aadhar Number! \n\
//                                                    OR \n\
//                            Check the enter digit is 12 or not.");
//                 $scope.forAadharDetails = false;
//                 $scope.list = null;
//             } else {
//                 $scope.forAadharDetails = false;
//                 $scope.list = null;
//                 $scope.url = "kyc/getAadhar/" + adharNo;
//                 $http.get($scope.uRl + $scope.url)
//                         .then(function (response) {
//                             debugger;
//                             $scope.list = response.data;
//                             if ($scope.list.length > 0) {
//                                 console.log($scope.list);
//                                 $scope.forAadharDetails = true;
//                             } else {
//                                 $scope.list = null;
//                                 $scope.forAadharDetails = false;
//                                 alert("Aadhar not present in KYC.");
//                             }
//                         }, function (error) {
//                             console.log(error);
//                         });
//             }
//         };
//
//
//
//         $scope.formdata = function () {
//
//
//             if ($scope.adharNo) {
//                 $scope.url = "kyc/getAadhar/" + $scope.adharNo;
//             } else {
//                 alert("Please enter all Aadhar No.");
//                 return;
//             }
//
//
//             $http.get($scope.uRl + $scope.url)
//                     .then(function (response) {
//                         debugger;
//                         $scope.list = response.data;
//                         if ($scope.list.length === 0) {
//                             $scope.forAadharDetails = false;
//                         } else {
//                             $scope.list = null;
//                             $scope.forAadharDetails = false;
//                         }
//
//                         if ($scope.validateForm()) {
//
//                             var form = new FormData();
//                             var loopForIdProof = document.getElementById("idProof").files.length;
//                             for (let i = 0; i < loopForIdProof; i++) {
//                                 form.append("idProof", document.getElementById("idProof").files[i], document.getElementById("idProof").localName);
//                             }
//
//
//                             var form = new FormData();
//                             var loopForAddProof = document.getElementById("addProof").files.length;
//                             for (let i = 0; i < loopForAddProof; i++) {
//                                 form.append("addProof", document.getElementById("addProof").files[i], document.getElementById("addProof").localName);
//                             }
//
//                             var form = new FormData();
//                             var loopForPan = document.getElementById("pan").files.length;
//                             for (let i = 0; i < loopForPan; i++) {
//                                 form.append("pan", document.getElementById("pan").files[i], document.getElementById("pan").localName);
//                             }
//
//                             var loopForAadhar = document.getElementById("adhar").files.length;
//                             for (let i = 0; i < loopForAadhar; i++) {
//                                 form.append("adhar", document.getElementById("adhar").files[i], document.getElementById("adhar").localName);
//                             }
//
//                             var loopForApplicationForm = document.getElementById("applicationForm").files.length;
//                             for (let i = 0; i < loopForApplicationForm; i++) {
//                                 form.append("applicationForm", document.getElementById("applicationForm").files[i], document.getElementById("applicationForm").localName);
//                             }
//
//                             var loopForOtherDoc = document.getElementById("otherDoc").files.length;
//                             for (let i = 0; i < loopForOtherDoc; i++) {
//                                 form.append("otherDoc", document.getElementById("otherDoc").files[i], document.getElementById("otherDoc").localName);
//                             }
//
////                            var jointType = $scope.accountType.startsWith("Joint");
//                             form.append("mobileNo", $scope.mobileNo);
//                             form.append("accountType", $scope.accountType);
//                             form.append("branchName", $scope.branchName);
//                             form.append("status", "Pending at COPs");
//
//                             if (response.data.length === 0) {
//                                 form.append("remark", "BOM : Data Submitted");
//                             } else {
//                                 form.append("remark", "BOM : Existing Customer KYC Verification for " + $scope.accountType + "");
//                             }
//
//                             form.append("panStatus", "");
//                             form.append("adharStatus", "");
//                             form.append("otherDocStatus", "");
//                             form.append("applicationFormStatus", "");
//                             form.append("approvedBy", "");
//                             form.append("uploadedBy", $scope.userRecord.userName + "(BOM)");
//                             console.log(form);
//                             var settings = {
//                                 "url": $scope.uRl + "kyc/save",
//                                 "method": "POST",
//                                 "timeout": 0,
//                                 "processData": false,
//                                 "mimeType": "multipart/form-data",
//                                 "contentType": false,
//                                 "data": form
//                             };
//
//                             $.ajax(settings).done(function (response) {
//                                 debugger;
//                                 console.log("Response:", response);  // Log the raw response
//                                 console.log("Response Length:", response.length);  // Log the length of the response
//                                 console.log("Response Type:", typeof response);  // Log the type of the response
//
//                                 if (!response) {
//                                     alert("Empty response from server. Please try again later.");
//                                     return;
//                                 }
//
//                                 try {
//                                     var responseData = JSON.parse(response);  // Try to parse the response
//                                 } catch (e) {
//                                     console.error("Error parsing JSON response:", e);
//                                     alert("There was an error processing your request. Please try again.");
//                                     return;  // Exit the function if JSON parsing fails
//                                 }
//
//                                 // Continue with your logic if JSON parsing succeeds
//                                 var Ack = responseData.code;
//                                 if ("" === response) {
//                                     alert("Already have an Account Type for this Aadhar number !");
//                                 } else {
//                                     alert("Data successfully submitted. Ack_No( " + Ack.substring(6) + " )");
//                                     window.location.href = $scope.uRl + "user_asBOM.html";
//                                 }
//                             }).fail(function (jqXHR, textStatus, errorThrown) {
//                                 // Handle AJAX errors
//                                 console.error("AJAX error:", textStatus, errorThrown);
//                                 alert("There was an error processing your request. Please try again.");
//                             });
//                         }
//                     }, function (error) {
//                         console.log(error);
//                     });
//
//         };
//
//
//     } else {
//         window.location.href = $scope.uRl + "index.html";
//     }
//
//
// });
//
//
// app.controller("currentGoldCont", function ($scope, $http, $timeout) {
//     var protocal = window.location.protocol;
//     var host = window.location.host;
//     $scope.uRl = protocal + "//" + host + "/";
//
//     $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asBOM"));
//     if (($scope.userRecord)) {
//         $scope.list = [];
//         $scope.forAadharDetails = false;
//         $scope.branchlist = [];
//
//
//         $scope.branchName = $scope.userRecord.branchName;
//         $scope.url = "branch/getuser/" + $scope.userRecord.userName;
//         $http.get($scope.uRl + $scope.url)
//                 .then(function (response) {
//                     $scope.branchlist = response.data.branchNameList;
//                 }, function (error) {
//                     console.log(error);
//                 });
//
//         $scope.validateForm = function () {
//             if ($scope.accountType) {
//                 return true;
//             } else {
//                 alert("Please! select the Account Type.");
//                 return false;
//             }
//         };
//
//         $scope.closeAadharDetails = function () {
//             $scope.forAadharDetails = false;
//         };
//
//         $scope.aadharcheck = function (adharNo) {
//             debugger;
//             if (!(adharNo)) {
//                 alert("     Please enter the Aadhar Number! \n\
//                                                    OR \n\
//                            Check the enter digit is 12 or not.");
//                 $scope.forAadharDetails = false;
//                 $scope.list = null;
//             } else {
//                 $scope.forAadharDetails = false;
//                 $scope.list = null;
//                 $scope.url = "kyc/getAadhar/" + adharNo;
//                 $http.get($scope.uRl + $scope.url)
//                         .then(function (response) {
//                             debugger;
//                             $scope.list = response.data;
//                             if ($scope.list.length > 0) {
//                                 console.log($scope.list);
//                                 $scope.forAadharDetails = true;
//                             } else {
//                                 $scope.list = null;
//                                 $scope.forAadharDetails = false;
//                                 alert("Aadhar not present in KYC.");
//                             }
//                         }, function (error) {
//                             console.log(error);
//                         });
//             }
//         };
//
//
//
//         $scope.formdata = function () {
//
//
//             if ($scope.adharNo) {
//                 $scope.url = "kyc/getAadhar/" + $scope.adharNo;
//             } else {
//                 alert("Please enter all Aadhar No.");
//                 return;
//             }
//
//
//             $http.get($scope.uRl + $scope.url)
//                     .then(function (response) {
//                         debugger;
//                         $scope.list = response.data;
//                         if ($scope.list.length === 0) {
//                             $scope.forAadharDetails = false;
//                         } else {
//                             $scope.list = null;
//                             $scope.forAadharDetails = false;
//                         }
//
//                         if ($scope.validateForm()) {
//
//                             var form = new FormData();
//                             var loopForIdProof = document.getElementById("idProof").files.length;
//                             for (let i = 0; i < loopForIdProof; i++) {
//                                 form.append("idProof", document.getElementById("idProof").files[i], document.getElementById("idProof").localName);
//                             }
//
//
//                             var form = new FormData();
//                             var loopForAddProof = document.getElementById("addProof").files.length;
//                             for (let i = 0; i < loopForAddProof; i++) {
//                                 form.append("addProof", document.getElementById("addProof").files[i], document.getElementById("addProof").localName);
//                             }
//
//                             var form = new FormData();
//                             var loopForPan = document.getElementById("pan").files.length;
//                             for (let i = 0; i < loopForPan; i++) {
//                                 form.append("pan", document.getElementById("pan").files[i], document.getElementById("pan").localName);
//                             }
//
//                             var loopForAadhar = document.getElementById("adhar").files.length;
//                             for (let i = 0; i < loopForAadhar; i++) {
//                                 form.append("adhar", document.getElementById("adhar").files[i], document.getElementById("adhar").localName);
//                             }
//
//                             var loopForApplicationForm = document.getElementById("applicationForm").files.length;
//                             for (let i = 0; i < loopForApplicationForm; i++) {
//                                 form.append("applicationForm", document.getElementById("applicationForm").files[i], document.getElementById("applicationForm").localName);
//                             }
//
//                             var loopForOtherDoc = document.getElementById("otherDoc").files.length;
//                             for (let i = 0; i < loopForOtherDoc; i++) {
//                                 form.append("otherDoc", document.getElementById("otherDoc").files[i], document.getElementById("otherDoc").localName);
//                             }
//
////                            var jointType = $scope.accountType.startsWith("Joint");
//                             form.append("mobileNo", $scope.mobileNo);
//                             form.append("accountType", $scope.accountType);
//                             form.append("branchName", $scope.branchName);
//                             form.append("status", "Pending at COPs");
//
//                             if (response.data.length === 0) {
//                                 form.append("remark", "BOM : Data Submitted");
//                             } else {
//                                 form.append("remark", "BOM : Existing Customer KYC Verification for " + $scope.accountType + "");
//                             }
//
//                             form.append("panStatus", "");
//                             form.append("adharStatus", "");
//                             form.append("otherDocStatus", "");
//                             form.append("applicationFormStatus", "");
//                             form.append("approvedBy", "");
//                             form.append("uploadedBy", $scope.userRecord.userName + "(BOM)");
//                             console.log(form);
//                             var settings = {
//                                 "url": $scope.uRl + "kyc/save",
//                                 "method": "POST",
//                                 "timeout": 0,
//                                 "processData": false,
//                                 "mimeType": "multipart/form-data",
//                                 "contentType": false,
//                                 "data": form
//                             };
//
//                             $.ajax(settings).done(function (response) {
//                                 debugger;
//                                 console.log("Response:", response);  // Log the raw response
//                                 console.log("Response Length:", response.length);  // Log the length of the response
//                                 console.log("Response Type:", typeof response);  // Log the type of the response
//
//                                 if (!response) {
//                                     alert("Empty response from server. Please try again later.");
//                                     return;
//                                 }
//
//                                 try {
//                                     var responseData = JSON.parse(response);  // Try to parse the response
//                                 } catch (e) {
//                                     console.error("Error parsing JSON response:", e);
//                                     alert("There was an error processing your request. Please try again.");
//                                     return;  // Exit the function if JSON parsing fails
//                                 }
//
//                                 // Continue with your logic if JSON parsing succeeds
//                                 var Ack = responseData.code;
//                                 if ("" === response) {
//                                     alert("Already have an Account Type for this Aadhar number !");
//                                 } else {
//                                     alert("Data successfully submitted. Ack_No( " + Ack.substring(6) + " )");
//                                     window.location.href = $scope.uRl + "user_asBOM.html";
//                                 }
//                             }).fail(function (jqXHR, textStatus, errorThrown) {
//                                 // Handle AJAX errors
//                                 console.error("AJAX error:", textStatus, errorThrown);
//                                 alert("There was an error processing your request. Please try again.");
//                             });
//                         }
//                     }, function (error) {
//                         console.log(error);
//                     });
//
//         };
//         $scope.check = function (maxFiles, maxTotalSizeKB, event) {
//             var files = event.target.files;
//             var maxTotalSizeBytes = maxTotalSizeKB * 1024; // Convert KB to Bytes
//
//             if (files.length > maxFiles) {
//                 alert(`You can only upload a maximum of ${maxFiles} files.`);
//                 event.target.value = ""; // Reset the file input
//                 return;
//             }
//
//             var totalSize = 0;
//             for (var i = 0; i < files.length; i++) {
//                 totalSize += files[i].size;
//             }
//
//             if (totalSize > maxTotalSizeBytes) {
//                 alert(`Total file size exceeds the limit of ${maxTotalSizeKB} KB.`);
//                 event.target.value = ""; // Reset the file input
//                 return;
//             }
//
//             alert("Files are valid for upload.");
//         };
//
//     } else {
//         window.location.href = $scope.uRl + "index.html";
//     }
//
//
// });
//
//
// app.controller("currentWealthCont", function ($scope, $http, $timeout) {
//     var protocal = window.location.protocol;
//     var host = window.location.host;
//     $scope.uRl = protocal + "//" + host + "/";
//
//     $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asBOM"));
//     if (($scope.userRecord)) {
//         $scope.list = [];
//         $scope.forAadharDetails = false;
//         $scope.branchlist = [];
//
//
//         $scope.branchName = $scope.userRecord.branchName;
//         $scope.url = "branch/getuser/" + $scope.userRecord.userName;
//         $http.get($scope.uRl + $scope.url)
//                 .then(function (response) {
//                     $scope.branchlist = response.data.branchNameList;
//                 }, function (error) {
//                     console.log(error);
//                 });
//
//         $scope.validateForm = function () {
//             if ($scope.accountType) {
//                 return true;
//             } else {
//                 alert("Please! select the Account Type.");
//                 return false;
//             }
//         };
//
//         $scope.closeAadharDetails = function () {
//             $scope.forAadharDetails = false;
//         };
//
//         $scope.aadharcheck = function (adharNo) {
//             debugger;
//             if (!(adharNo)) {
//                 alert("     Please enter the Aadhar Number! \n\
//                                                    OR \n\
//                            Check the enter digit is 12 or not.");
//                 $scope.forAadharDetails = false;
//                 $scope.list = null;
//             } else {
//                 $scope.forAadharDetails = false;
//                 $scope.list = null;
//                 $scope.url = "kyc/getAadhar/" + adharNo;
//                 $http.get($scope.uRl + $scope.url)
//                         .then(function (response) {
//                             debugger;
//                             $scope.list = response.data;
//                             if ($scope.list.length > 0) {
//                                 console.log($scope.list);
//                                 $scope.forAadharDetails = true;
//                             } else {
//                                 $scope.list = null;
//                                 $scope.forAadharDetails = false;
//                                 alert("Aadhar not present in KYC.");
//                             }
//                         }, function (error) {
//                             console.log(error);
//                         });
//             }
//         };
//
//
//
//         $scope.formdata = function () {
//
//
//             if ($scope.adharNo) {
//                 $scope.url = "kyc/getAadhar/" + $scope.adharNo;
//             } else {
//                 alert("Please enter all Aadhar No.");
//                 return;
//             }
//
//
//             $http.get($scope.uRl + $scope.url)
//                     .then(function (response) {
//                         debugger;
//                         $scope.list = response.data;
//                         if ($scope.list.length === 0) {
//                             $scope.forAadharDetails = false;
//                         } else {
//                             $scope.list = null;
//                             $scope.forAadharDetails = false;
//                         }
//
//                         if ($scope.validateForm()) {
//
//                             var form = new FormData();
//                             var loopForIdProof = document.getElementById("idProof").files.length;
//                             for (let i = 0; i < loopForIdProof; i++) {
//                                 form.append("idProof", document.getElementById("idProof").files[i], document.getElementById("idProof").localName);
//                             }
//
//
//                             var form = new FormData();
//                             var loopForAddProof = document.getElementById("addProof").files.length;
//                             for (let i = 0; i < loopForAddProof; i++) {
//                                 form.append("addProof", document.getElementById("addProof").files[i], document.getElementById("addProof").localName);
//                             }
//
//                             var form = new FormData();
//                             var loopForPan = document.getElementById("pan").files.length;
//                             for (let i = 0; i < loopForPan; i++) {
//                                 form.append("pan", document.getElementById("pan").files[i], document.getElementById("pan").localName);
//                             }
//
//                             var loopForAadhar = document.getElementById("adhar").files.length;
//                             for (let i = 0; i < loopForAadhar; i++) {
//                                 form.append("adhar", document.getElementById("adhar").files[i], document.getElementById("adhar").localName);
//                             }
//
//                             var loopForApplicationForm = document.getElementById("applicationForm").files.length;
//                             for (let i = 0; i < loopForApplicationForm; i++) {
//                                 form.append("applicationForm", document.getElementById("applicationForm").files[i], document.getElementById("applicationForm").localName);
//                             }
//
//                             var loopForOtherDoc = document.getElementById("otherDoc").files.length;
//                             for (let i = 0; i < loopForOtherDoc; i++) {
//                                 form.append("otherDoc", document.getElementById("otherDoc").files[i], document.getElementById("otherDoc").localName);
//                             }
//
////                            var jointType = $scope.accountType.startsWith("Joint");
//                             form.append("mobileNo", $scope.mobileNo);
//                             form.append("accountType", $scope.accountType);
//                             form.append("branchName", $scope.branchName);
//                             form.append("status", "Pending at COPs");
//
//                             if (response.data.length === 0) {
//                                 form.append("remark", "BOM : Data Submitted");
//                             } else {
//                                 form.append("remark", "BOM : Existing Customer KYC Verification for " + $scope.accountType + "");
//                             }
//
//                             form.append("panStatus", "");
//                             form.append("adharStatus", "");
//                             form.append("otherDocStatus", "");
//                             form.append("applicationFormStatus", "");
//                             form.append("approvedBy", "");
//                             form.append("uploadedBy", $scope.userRecord.userName + "(BOM)");
//                             console.log(form);
//                             var settings = {
//                                 "url": $scope.uRl + "kyc/save",
//                                 "method": "POST",
//                                 "timeout": 0,
//                                 "processData": false,
//                                 "mimeType": "multipart/form-data",
//                                 "contentType": false,
//                                 "data": form
//                             };
//
//                             $.ajax(settings).done(function (response) {
//                                 debugger;
//                                 console.log("Response:", response);  // Log the raw response
//                                 console.log("Response Length:", response.length);  // Log the length of the response
//                                 console.log("Response Type:", typeof response);  // Log the type of the response
//
//                                 if (!response) {
//                                     alert("Empty response from server. Please try again later.");
//                                     return;
//                                 }
//
//                                 try {
//                                     var responseData = JSON.parse(response);  // Try to parse the response
//                                 } catch (e) {
//                                     console.error("Error parsing JSON response:", e);
//                                     alert("There was an error processing your request. Please try again.");
//                                     return;  // Exit the function if JSON parsing fails
//                                 }
//
//                                 // Continue with your logic if JSON parsing succeeds
//                                 var Ack = responseData.code;
//                                 if ("" === response) {
//                                     alert("Already have an Account Type for this Aadhar number !");
//                                 } else {
//                                     alert("Data successfully submitted. Ack_No( " + Ack.substring(6) + " )");
//                                     window.location.href = $scope.uRl + "user_asBOM.html";
//                                 }
//                             }).fail(function (jqXHR, textStatus, errorThrown) {
//                                 // Handle AJAX errors
//                                 console.error("AJAX error:", textStatus, errorThrown);
//                                 alert("There was an error processing your request. Please try again.");
//                             });
//                         }
//                     }, function (error) {
//                         console.log(error);
//                     });
//
//         };
//
//
//     } else {
//         window.location.href = $scope.uRl + "index.html";
//     }
//
// });
//
//
// app.controller("soleProprietorshipCont", function ($scope, $http, $timeout) {
//     var protocal = window.location.protocol;
//     var host = window.location.host;
//     $scope.uRl = protocal + "//" + host + "/";
//
//     $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asBOM"));
//     if (($scope.userRecord)) {
//         $scope.list = [];
//         $scope.forAadharDetails = false;
//         $scope.branchlist = [];
//
//
//
//         $scope.branchName = $scope.userRecord.branchName;
//         $scope.url = "branch/getuser/" + $scope.userRecord.userName;
//         $http.get($scope.uRl + $scope.url)
//                 .then(function (response) {
//                     $scope.branchlist = response.data.branchNameList;
//                 }, function (error) {
//                     console.log(error);
//                 });
//
//
//
//
//
//
//         $scope.validateForm = function () {
////             var accountTypeElement = document.getElementById("accountType").value;
//             if ($scope.accountType) {
//                 return true;
//             } else {
//                 alert("Please! select the Account Type.");
//                 return false;
//             }
//         };
//
//
//
//         $scope.closeAadharDetails = function () {
//             $scope.forAadharDetails = false;
//         };
//
//
//
//
//         $scope.aadharcheck = function (adharNo) {
//             debugger;
//             if (!(adharNo)) {
//                 alert("     Please enter the Aadhar Number! \n\
//                                                    OR \n\
//                            Check the enter digit is 12 or not.");
//                 $scope.forAadharDetails = false;
//                 $scope.list = null;
//             } else {
//                 $scope.forAadharDetails = false;
//                 $scope.list = null;
//                 $scope.url = "kyc/getAadhar/" + adharNo;
//                 $http.get($scope.uRl + $scope.url)
//                         .then(function (response) {
//                             debugger;
//                             $scope.list = response.data;
//                             if ($scope.list.length > 0) {
//                                 console.log($scope.list);
//                                 $scope.forAadharDetails = true;
//                             } else {
//                                 $scope.list = null;
//                                 $scope.forAadharDetails = false;
//                                 alert("Aadhar not present in KYC.");
//                             }
//                         }, function (error) {
//                             console.log(error);
//                         });
//             }
//         };
//
//
//
//
//         $scope.formdata = function () {
//
//             if ($scope.adharNo) {
//                 $scope.url = "kyc/getAadhar/" + $scope.adharNo;
//             } else {
//                 alert("Please enter all Aadhar No.");
//                 return;
//             }
//
//             $http.get($scope.uRl + $scope.url)
//                     .then(function (response) {
//                         debugger;
//                         $scope.list = response.data;
//                         if ($scope.list.length === 0) {
//                             $scope.forAadharDetails = false;
//                         } else {
//                             $scope.list = null;
//                             $scope.forAadharDetails = false;
//                         }
//
//                         if ($scope.validateForm()) {
//
//                             var form = new FormData();
//                             var loopForIdProof = document.getElementById("idProof").files.length;
//                             for (let i = 0; i < loopForIdProof; i++) {
//                                 form.append("idProof", document.getElementById("idProof").files[i], document.getElementById("idProof").localName);
//                             }
//
//
//                             var form = new FormData();
//                             var loopForAddProof = document.getElementById("addProof").files.length;
//                             for (let i = 0; i < loopForAddProof; i++) {
//                                 form.append("addProof", document.getElementById("addProof").files[i], document.getElementById("addProof").localName);
//                             }
//
//
//                             var form = new FormData();
//                             var loopForPan = document.getElementById("pan").files.length;
//                             for (let i = 0; i < loopForPan; i++) {
//                                 form.append("pan", document.getElementById("pan").files[i], document.getElementById("pan").localName);
//                             }
//
//                             var loopForEntProof = document.getElementById("entProof").files.length;
//                             for (let i = 0; i < loopForEntProof; i++) {
//                                 form.append("entProof", document.getElementById("entProof").files[i], document.getElementById("entProof").localName);
//                             }
//
//
//                             var loopForApplicationForm = document.getElementById("applicationForm").files.length;
//                             for (let i = 0; i < loopForApplicationForm; i++) {
//                                 form.append("applicationForm", document.getElementById("applicationForm").files[i], document.getElementById("applicationForm").localName);
//                             }
//
//                             var loopForOtherDoc = document.getElementById("otherDoc").files.length;
//                             for (let i = 0; i < loopForOtherDoc; i++) {
//                                 form.append("otherDoc", document.getElementById("otherDoc").files[i], document.getElementById("otherDoc").localName);
//                             }
//
//
//                             if (($scope.entity)) {
//                                 form.append("entity", $scope.entity);
//                             } else {
//                                 alert("Please enter entity name.");
//                                 return;
//                             }
//                             if (($scope.adharNo)) {
//                                 form.append("adharNo", $scope.adharNo);
//                             } else {
//                                 alert("Please enter the aadhar No.");
//                                 return;
//                             }
//
//
//
////                            var jointType = $scope.accountType.startsWith("Joint");
//                             form.append("applicant", $scope.applicant);
//                             form.append("mobileNo", $scope.mobileNo);
//                             form.append("accountType", $scope.accountType);
//                             form.append("branchName", $scope.branchName);
//                             form.append("status", "Pending at COPs");
//
//                             if (response.data.length === 0) {
//                                 form.append("remark", "BOM : Data Submitted");
//                             } else {
//                                 form.append("remark", "BOM : Existing Customer KYC Verification for " + $scope.accountType + "");
//                             }
//
//
//
//                             form.append("idProofStatus", "");
//                             form.append("addProofStatus", "");
//                             form.append("panStatus", "");
//                             form.append("entProofStatus", "");
//                             form.append("otherDocStatus", "");
//                             form.append("applicationFormStatus", "");
//                             form.append("approvedBy", "");
//                             form.append("uploadedBy", $scope.userRecord.userName + "(BOM)");
//                             console.log(form);
//                             var settings = {
//                                 "url": $scope.uRl + "kyc/save",
//                                 "method": "POST",
//                                 "timeout": 0,
//                                 "processData": false,
//                                 "mimeType": "multipart/form-data",
//                                 "contentType": false,
//                                 "data": form
//                             };
//
//                             $.ajax(settings).done(function (response) {
//                                 debugger;
//                                 console.log("Response:", response);  // Log the raw response
//                                 console.log("Response Length:", response.length);  // Log the length of the response
//                                 console.log("Response Type:", typeof response);  // Log the type of the response
//
//                                 if (!response) {
//                                     alert("Empty response from server. Please try again later.");
//                                     return;
//                                 }
//
//                                 try {
//                                     var responseData = JSON.parse(response);  // Try to parse the response
//                                 } catch (e) {
//                                     console.error("Error parsing JSON response:", e);
//                                     alert("There was an error processing your request. Please try again.");
//                                     return;  // Exit the function if JSON parsing fails
//                                 }
//
//                                 // Continue with your logic if JSON parsing succeeds
//                                 var Ack = responseData.code;
//                                 if ("" === response) {
//                                     alert("Already have an Account Type for this Aadhar number !");
//                                 } else {
//                                     alert("Data successfully submitted. Ack_No( " + Ack.substring(6) + " )");
//                                     window.location.href = $scope.uRl + "user_asBOM.html";
//                                 }
//                             }).fail(function (jqXHR, textStatus, errorThrown) {
//                                 // Handle AJAX errors
//                                 console.error("AJAX error:", textStatus, errorThrown);
//                                 alert("There was an error processing your request. Please try again.");
//                             });
//                         }
//                     }, function (error) {
//                         console.log(error);
//                     });
//
//         };
//
//
//     } else {
//         window.location.href = $scope.uRl + "index.html";
//     }
//
//
// });
//
//
// app.controller("partnershipCont", function ($scope, $http, $timeout) {
//     var protocal = window.location.protocol;
//     var host = window.location.host;
//     $scope.uRl = protocal + "//" + host + "/";
//
//     $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asBOM"));
//     if (($scope.userRecord)) {
//         $scope.list = [];
//         $scope.forAadharDetails = false;
//         $scope.branchlist = [];
//
////       form button for add applicant and aadhar
//
//         $scope.addApplicantButton = false;
//         $scope.showApp3 = false;
//         $scope.showAadhar3 = false;
//         $scope.showAdharforjoint = false;
//
//
//
//         $scope.branchName = $scope.userRecord.branchName;
//         $scope.url = "branch/getuser/" + $scope.userRecord.userName;
//         $http.get($scope.uRl + $scope.url)
//                 .then(function (response) {
//                     $scope.branchlist = response.data.branchNameList;
//                 }, function (error) {
//                     console.log(error);
//                 });
//
//         $scope.validateForm = function () {
////             var accountTypeElement = document.getElementById("accountType").value;
//             if ($scope.accountType) {
//                 return true;
//             } else {
//                 alert("Please! select the Account Type.");
//                 return false;
//             }
//         };
//
//         $scope.closeAadharDetails = function () {
//             $scope.forAadharDetails = false;
//         };
//
//         $scope.aadharcheck = function (adharNo) {
//             debugger;
//             if (!(adharNo)) {
//                 alert("     Please enter the Aadhar Number! \n\
//                                                    OR \n\
//                            Check the enter digit is 12 or not.");
//                 $scope.forAadharDetails = false;
//                 $scope.list = null;
//             } else {
//                 $scope.forAadharDetails = false;
//                 $scope.list = null;
//                 $scope.url = "kyc/getAadhar/" + adharNo;
//                 $http.get($scope.uRl + $scope.url)
//                         .then(function (response) {
//                             debugger;
//                             $scope.list = response.data;
//                             if ($scope.list.length > 0) {
//                                 console.log($scope.list);
//                                 $scope.forAadharDetails = true;
//                             } else {
//                                 $scope.list = null;
//                                 $scope.forAadharDetails = false;
//                                 alert("Aadhar not present in KYC.");
//                             }
//                         }, function (error) {
//                             console.log(error);
//                         });
//             }
//         };
//
//
//
//         $scope.addApplicant = function () {
//
//             $scope.showApp3 = true;
//             $scope.showAadhar3 = true;
//         };
//
//
//
//         $scope.formdata = function () {
//
//             if ($scope.showApp3 === true) {
//
//                 if ($scope.adharNo1) {
//                     $scope.url = "kyc/getAadhar/" + $scope.adharNo1;
//                 } else {
//                     alert("Please enter Aadhar No.");
//                     return;
//                 }
//             } else {
//
//                 if ($scope.adharNo1) {
//                     $scope.url = "kyc/getAadhar/" + $scope.adharNo1;
//                 } else {
//                     alert("Please enter Aadhar No.");
//                     return;
//                 }
//             }
//
//
//             $http.get($scope.uRl + $scope.url)
//                     .then(function (response) {
//                         debugger;
//                         $scope.list = response.data;
//                         if ($scope.list.length === 0) {
//                             $scope.forAadharDetails = false;
//                         } else {
//                             $scope.list = null;
//                             $scope.forAadharDetails = false;
//                         }
//
//                         if ($scope.validateForm()) {
//
//                             var form = new FormData();
//                             var loopForIdProof = document.getElementById("idProof").files.length;
//                             for (let i = 0; i < loopForIdProof; i++) {
//                                 form.append("idProof", document.getElementById("idProof").files[i], document.getElementById("idProof").localName);
//                             }
//
//
//                             var form = new FormData();
//                             var loopForAddProof = document.getElementById("addProof").files.length;
//                             for (let i = 0; i < loopForAddProof; i++) {
//                                 form.append("addProof", document.getElementById("addProof").files[i], document.getElementById("addProof").localName);
//                             }
//
//
//
//                             var form = new FormData();
//                             var loopForPan = document.getElementById("pan").files.length;
//                             for (let i = 0; i < loopForPan; i++) {
//                                 form.append("pan", document.getElementById("pan").files[i], document.getElementById("pan").localName);
//                             }
//
//                             var loopForPartDoc = document.getElementById("partDoc").files.length;
//                             for (let i = 0; i < loopForPartDoc; i++) {
//                                 form.append("partDoc", document.getElementById("partDoc").files[i], document.getElementById("partDoc").localName);
//                             }
//
//                             var loopForApplicationForm = document.getElementById("applicationForm").files.length;
//                             for (let i = 0; i < loopForApplicationForm; i++) {
//                                 form.append("applicationForm", document.getElementById("applicationForm").files[i], document.getElementById("applicationForm").localName);
//                             }
//
//                             var loopForOtherDoc = document.getElementById("otherDoc").files.length;
//                             for (let i = 0; i < loopForOtherDoc; i++) {
//                                 form.append("otherDoc", document.getElementById("otherDoc").files[i], document.getElementById("otherDoc").localName);
//                             }
//
//
//                             if ($scope.showApp3 === true) {
//                                 if ($scope.entity) {
//                                     form.append("entity", $scope.entity);
//                                 }
//
//                                 if (($scope.applicant1) && ($scope.applicant2) && ($scope.applicant3)) {
//                                     form.append("applicant", $scope.applicant1);
//                                     form.append("applicant", $scope.applicant2);
//                                     form.append("applicant", $scope.applicant3);
//                                 } else {
//                                     alert("Please enter all applicant name.");
//                                     return;
//                                 }
//                                 if (($scope.adharNo1) && ($scope.adharNo2) && ($scope.adharNo3)) {
//                                     form.append("adharNo", $scope.adharNo1);
//                                     form.append("adharNo", $scope.adharNo2);
//                                     form.append("adharNo", $scope.adharNo3);
//                                 } else {
//                                     alert("Please enter all Aadhar No.");
//                                     return;
//                                 }
//                             } else {
//
//                                 if ($scope.entity) {
//                                     form.append("entity", $scope.entity);
//                                 }
//
//                                 if (($scope.applicant1) && ($scope.applicant2)) {
//                                     form.append("applicant", $scope.applicant1);
//                                     form.append("applicant", $scope.applicant2);
//                                 } else {
//                                     alert("Please enter all applicant name.");
//                                     return;
//                                 }
//                                 if (($scope.adharNo1) && ($scope.adharNo2)) {
//                                     form.append("adharNo", $scope.adharNo1);
//                                     form.append("adharNo", $scope.adharNo2);
//                                 } else {
//                                     alert("Please enter all Aadhar No.");
//                                     return;
//                                 }
//                             }
//
//
////                            var jointType = $scope.accountType.startsWith("Joint");
//
//
//                             form.append("mobileNo", $scope.mobileNo);
//                             form.append("accountType", $scope.accountType);
//                             form.append("branchName", $scope.branchName);
//                             form.append("status", "Pending at COPs");
//
//                             if (response.data.length === 0) {
//                                 form.append("remark", "BOM : Data Submitted");
//                             } else {
//                                 form.append("remark", "BOM : Existing Customer KYC Verification for " + $scope.accountType + "");
//                             }
//
//                             form.append("idProofStatus", "");
//                             form.append("addProofStatus", "");
//                             form.append("panStatus", "");
//                             form.append("partDocStatus", "");
//                             form.append("otherDocStatus", "");
//                             form.append("applicationFormStatus", "");
//                             form.append("approvedBy", "");
//                             form.append("uploadedBy", $scope.userRecord.userName + "(BOM)");
//                             console.log(form);
//                             var settings = {
//                                 "url": $scope.uRl + "kyc/save",
//                                 "method": "POST",
//                                 "timeout": 0,
//                                 "processData": false,
//                                 "mimeType": "multipart/form-data",
//                                 "contentType": false,
//                                 "data": form
//                             };
//
//                             $.ajax(settings).done(function (response) {
//                                 debugger;
//                                 console.log("Response:", response);  // Log the raw response
//                                 console.log("Response Length:", response.length);  // Log the length of the response
//                                 console.log("Response Type:", typeof response);  // Log the type of the response
//
//                                 if (!response) {
//                                     alert("Empty response from server. Please try again later.");
//                                     return;
//                                 }
//
//                                 try {
//                                     var responseData = JSON.parse(response);  // Try to parse the response
//                                 } catch (e) {
//                                     console.error("Error parsing JSON response:", e);
//                                     alert("There was an error processing your request. Please try again.");
//                                     return;  // Exit the function if JSON parsing fails
//                                 }
//
//                                 // Continue with your logic if JSON parsing succeeds
//                                 var Ack = responseData.code;
//                                 if ("" === response) {
//                                     alert("Already have an Account Type for this Aadhar number !");
//                                 } else {
//                                     alert("Data successfully submitted. Ack_No( " + Ack.substring(6) + " )");
//                                     window.location.href = $scope.uRl + "user_asBOM.html";
//                                 }
//                             }).fail(function (jqXHR, textStatus, errorThrown) {
//                                 // Handle AJAX errors
//                                 console.error("AJAX error:", textStatus, errorThrown);
//                                 alert("There was an error processing your request. Please try again.");
//                             });
//                         }
//                     }, function (error) {
//                         console.log(error);
//                     });
//
//         };
//
//
//     } else {
//         window.location.href = $scope.uRl + "index.html";
//     }
//
//
// });
//
// app.controller("public_PvtCont", function ($scope, $http, $timeout) {
//
//     var protocal = window.location.protocol;
//     var host = window.location.host;
//     $scope.uRl = protocal + "//" + host + "/";
//
//     $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asBOM"));
//     if (($scope.userRecord)) {
//         $scope.list = [];
//         $scope.forAadharDetails = false;
//         $scope.branchlist = [];
//
////       form button for add applicant and aadhar
//
//         $scope.addApplicantButton = false;
//         $scope.showApp3 = false;
//         $scope.showAadhar3 = false;
//         $scope.showAdharforjoint = false;
//
//
//
//         $scope.branchName = $scope.userRecord.branchName;
//         $scope.url = "branch/getuser/" + $scope.userRecord.userName;
//         $http.get($scope.uRl + $scope.url)
//                 .then(function (response) {
//                     $scope.branchlist = response.data.branchNameList;
//                 }, function (error) {
//                     console.log(error);
//                 });
//
//         $scope.validateForm = function () {
////             var accountTypeElement = document.getElementById("accountType").value;
//             if ($scope.accountType) {
//                 return true;
//             } else {
//                 alert("Please! select the Account Type.");
//                 return false;
//             }
//         };
//
//         $scope.closeAadharDetails = function () {
//             $scope.forAadharDetails = false;
//         };
//
//         $scope.aadharcheck = function (adharNo) {
//             debugger;
//             if (!(adharNo)) {
//                 alert("     Please enter the Aadhar Number! \n\
//                                                    OR \n\
//                            Check the enter digit is 12 or not.");
//                 $scope.forAadharDetails = false;
//                 $scope.list = null;
//             } else {
//                 $scope.forAadharDetails = false;
//                 $scope.list = null;
//                 $scope.url = "kyc/getAadhar/" + adharNo;
//                 $http.get($scope.uRl + $scope.url)
//                         .then(function (response) {
//                             debugger;
//                             $scope.list = response.data;
//                             if ($scope.list.length > 0) {
//                                 console.log($scope.list);
//                                 $scope.forAadharDetails = true;
//                             } else {
//                                 $scope.list = null;
//                                 $scope.forAadharDetails = false;
//                                 alert("Aadhar not present in KYC.");
//                             }
//                         }, function (error) {
//                             console.log(error);
//                         });
//             }
//         };
//
//
//
//         $scope.addApplicant = function () {
//
//             $scope.showApp3 = true;
//             $scope.showAadhar3 = true;
//         };
//
//
//
//         $scope.formdata = function () {
//
//             if ($scope.showApp3 === true) {
//
//                 if ($scope.adharNo1) {
//                     $scope.url = "kyc/getAadhar/" + $scope.adharNo1;
//                 } else {
//                     alert("Please enter Aadhar No.");
//                     return;
//                 }
//
//             } else {
//
//                 if ($scope.adharNo1) {
//                     $scope.url = "kyc/getAadhar/" + $scope.adharNo1;
//                 } else {
//                     alert("Please enter Aadhar No.");
//                     return;
//                 }
//             }
//
//
//             $http.get($scope.uRl + $scope.url)
//                     .then(function (response) {
//                         debugger;
//                         $scope.list = response.data;
//                         if ($scope.list.length === 0) {
//                             $scope.forAadharDetails = false;
//                         } else {
//                             $scope.list = null;
//                             $scope.forAadharDetails = false;
//                         }
//
//                         if ($scope.validateForm()) {
//
//                             var form = new FormData();
//                             var loopForIdProof = document.getElementById("idProof").files.length;
//                             for (let i = 0; i < loopForIdProof; i++) {
//                                 form.append("idProof", document.getElementById("idProof").files[i], document.getElementById("idProof").localName);
//                             }
//
//
//                             var form = new FormData();
//                             var loopForAddProof = document.getElementById("addProof").files.length;
//                             for (let i = 0; i < loopForAddProof; i++) {
//                                 form.append("addProof", document.getElementById("addProof").files[i], document.getElementById("addProof").localName);
//                             }
//
//
//
//                             var form = new FormData();
//                             var loopForPan = document.getElementById("pan").files.length;
//                             for (let i = 0; i < loopForPan; i++) {
//                                 form.append("pan", document.getElementById("pan").files[i], document.getElementById("pan").localName);
//                             }
//
//                             var loopForCompDoc = document.getElementById("compDoc").files.length;
//                             for (let i = 0; i < loopForCompDoc; i++) {
//                                 form.append("compDoc", document.getElementById("compDoc").files[i], document.getElementById("compDoc").localName);
//                             }
//
//                             var loopForApplicationForm = document.getElementById("applicationForm").files.length;
//                             for (let i = 0; i < loopForApplicationForm; i++) {
//                                 form.append("applicationForm", document.getElementById("applicationForm").files[i], document.getElementById("applicationForm").localName);
//                             }
//
//                             var loopForOtherDoc = document.getElementById("otherDoc").files.length;
//                             for (let i = 0; i < loopForOtherDoc; i++) {
//                                 form.append("otherDoc", document.getElementById("otherDoc").files[i], document.getElementById("otherDoc").localName);
//                             }
//
//
//                             if ($scope.showApp3 === true) {
//                                 if ($scope.entity) {
//                                     form.append("entity", $scope.entity);
//                                 }
//
//                                 if (($scope.applicant1) && ($scope.applicant2) && ($scope.applicant3)) {
//                                     form.append("applicant", $scope.applicant1);
//                                     form.append("applicant", $scope.applicant2);
//                                     form.append("applicant", $scope.applicant3);
//                                 } else {
//                                     alert("Please enter all applicant name.");
//                                     return;
//                                 }
//                                 if (($scope.adharNo1) && ($scope.adharNo2) && ($scope.adharNo3)) {
//                                     form.append("adharNo", $scope.adharNo1);
//                                     form.append("adharNo", $scope.adharNo2);
//                                     form.append("adharNo", $scope.adharNo3);
//                                 } else {
//                                     alert("Please enter all Aadhar No.");
//                                     return;
//                                 }
//                             } else {
//
//                                 if ($scope.entity) {
//                                     form.append("entity", $scope.entity);
//                                 }
//
//                                 if (($scope.applicant1) && ($scope.applicant2)) {
//                                     form.append("applicant", $scope.applicant1);
//                                     form.append("applicant", $scope.applicant2);
//                                 } else {
//                                     alert("Please enter all applicant name.");
//                                     return;
//                                 }
//                                 if (($scope.adharNo1) && ($scope.adharNo2)) {
//                                     form.append("adharNo", $scope.adharNo1);
//                                     form.append("adharNo", $scope.adharNo2);
//                                 } else {
//                                     alert("Please enter all Aadhar No.");
//                                     return;
//                                 }
//                             }
//
//
////                            var jointType = $scope.accountType.startsWith("Joint");
//
//
//                             form.append("mobileNo", $scope.mobileNo);
//                             form.append("accountType", $scope.accountType);
//                             form.append("branchName", $scope.branchName);
//                             form.append("status", "Pending at COPs");
//
//                             if (response.data.length === 0) {
//                                 form.append("remark", "BOM : Data Submitted");
//                             } else {
//                                 form.append("remark", "BOM : Existing Customer KYC Verification for " + $scope.accountType + "");
//                             }
//
//                             form.append("idProofStatus", "");
//                             form.append("addProofStatus", "");
//                             form.append("panStatus", "");
//                             form.append("compDocStatus", "");
//                             form.append("otherDocStatus", "");
//                             form.append("applicationFormStatus", "");
//                             form.append("approvedBy", "");
//                             form.append("uploadedBy", $scope.userRecord.userName + "(BOM)");
//                             console.log(form);
//                             var settings = {
//                                 "url": $scope.uRl + "kyc/save",
//                                 "method": "POST",
//                                 "timeout": 0,
//                                 "processData": false,
//                                 "mimeType": "multipart/form-data",
//                                 "contentType": false,
//                                 "data": form
//                             };
//
//                             $.ajax(settings).done(function (response) {
//                                 debugger;
//                                 console.log("Response:", response);  // Log the raw response
//                                 console.log("Response Length:", response.length);  // Log the length of the response
//                                 console.log("Response Type:", typeof response);  // Log the type of the response
//
//                                 if (!response) {
//                                     alert("Empty response from server. Please try again later.");
//                                     return;
//                                 }
//
//                                 try {
//                                     var responseData = JSON.parse(response);  // Try to parse the response
//                                 } catch (e) {
//                                     console.error("Error parsing JSON response:", e);
//                                     alert("There was an error processing your request. Please try again.");
//                                     return;  // Exit the function if JSON parsing fails
//                                 }
//
//                                 // Continue with your logic if JSON parsing succeeds
//                                 var Ack = responseData.code;
//                                 if ("" === response) {
//                                     alert("Already have an Account Type for this Aadhar number !");
//                                 } else {
//                                     alert("Data successfully submitted. Ack_No( " + Ack.substring(6) + " )");
//                                     window.location.href = $scope.uRl + "user_asBOM.html";
//                                 }
//                             }).fail(function (jqXHR, textStatus, errorThrown) {
//                                 // Handle AJAX errors
//                                 console.error("AJAX error:", textStatus, errorThrown);
//                                 alert("There was an error processing your request. Please try again.");
//                             });
//                         }
//                     }, function (error) {
//                         console.log(error);
//                     });
//
//         };
//
//
//     } else {
//         window.location.href = $scope.uRl + "index.html";
//     }
//
//
//
// });
//
//
// app.controller("tascCont", function ($scope, $http, $timeout) {
//     var protocal = window.location.protocol;
//     var host = window.location.host;
//     $scope.uRl = protocal + "//" + host + "/";
//
//     $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asBOM"));
//     if (($scope.userRecord)) {
//         $scope.list = [];
//         $scope.forAadharDetails = false;
//         $scope.branchlist = [];
//
//
//
////applicants
//
//
//         $scope.appStatus = {
//             "app2": false,
//
//             "app3": false,
//
//             "app4": false,
//
//             "app5": false
//
//         };
//
//
//
//
//
//
//
//         $scope.branchName = $scope.userRecord.branchName;
//         $scope.url = "branch/getuser/" + $scope.userRecord.userName;
//         $http.get($scope.uRl + $scope.url)
//                 .then(function (response) {
//                     $scope.branchlist = response.data.branchNameList;
//                 }, function (error) {
//                     console.log(error);
//                 });
//
//         $scope.validateForm = function () {
////             var accountTypeElement = document.getElementById("accountType").value;
//             if ($scope.accountType) {
//                 return true;
//             } else {
//                 alert("Please! select the Account Type.");
//                 return false;
//             }
//         };
//
//         $scope.closeAadharDetails = function () {
//             $scope.forAadharDetails = false;
//         };
//
//         $scope.aadharcheck = function (adharNo) {
//             debugger;
//             if (!(adharNo)) {
//                 alert("     Please enter the Aadhar Number! \n\
//                                                    OR \n\
//                            Check the enter digit is 12 or not.");
//                 $scope.forAadharDetails = false;
//                 $scope.list = null;
//             } else {
//                 $scope.forAadharDetails = false;
//                 $scope.list = null;
//                 $scope.url = "kyc/getAadhar/" + adharNo;
//                 $http.get($scope.uRl + $scope.url)
//                         .then(function (response) {
//                             debugger;
//                             $scope.list = response.data;
//                             if ($scope.list.length > 0) {
//                                 console.log($scope.list);
//                                 $scope.forAadharDetails = true;
//                             } else {
//                                 $scope.list = null;
//                                 $scope.forAadharDetails = false;
//                                 alert("Aadhar not present in KYC.");
//                             }
//                         }, function (error) {
//                             console.log(error);
//                         });
//             }
//         };
//
//
//
//         $scope.formdata = function () {
//
//
//
//             if ($scope.adharNo1) {
//                 $scope.url = "kyc/getAadhar/" + $scope.adharNo1;
//             } else {
//                 alert("Please enter Aadhar No.");
//                 return;
//             }
//
//             if ($scope.adharNo1) {
//                 $scope.url = "kyc/getAadhar/" + $scope.adharNo1;
//             } else {
//                 alert("Please enter Aadhar No.");
//                 return;
//             }
//
//
//
//             $http.get($scope.uRl + $scope.url)
//                     .then(function (response) {
//                         debugger;
//                         $scope.list = response.data;
//                         if ($scope.list.length === 0) {
//                             $scope.forAadharDetails = false;
//                         } else {
//                             $scope.list = null;
//                             $scope.forAadharDetails = false;
//                         }
//
//                         if ($scope.validateForm()) {
//
//                             var form = new FormData();
//                             var loopForIdProof = document.getElementById("idProof").files.length;
//                             for (let i = 0; i < loopForIdProof; i++) {
//                                 form.append("idProof", document.getElementById("idProof").files[i], document.getElementById("idProof").localName);
//                             }
//
//
//                             var form = new FormData();
//                             var loopForAddProof = document.getElementById("addProof").files.length;
//                             for (let i = 0; i < loopForAddProof; i++) {
//                                 form.append("addProof", document.getElementById("addProof").files[i], document.getElementById("addProof").localName);
//                             }
//
//
//
//                             var form = new FormData();
//                             var loopForPan = document.getElementById("pan").files.length;
//                             for (let i = 0; i < loopForPan; i++) {
//                                 form.append("pan", document.getElementById("pan").files[i], document.getElementById("pan").localName);
//                             }
//
//                             var loopForTascDoc = document.getElementById("tascDoc").files.length;
//                             for (let i = 0; i < loopForTascDoc; i++) {
//                                 form.append("tascDoc", document.getElementById("tascDoc").files[i], document.getElementById("tascDoc").localName);
//                             }
//
//                             var loopForApplicationForm = document.getElementById("applicationForm").files.length;
//                             for (let i = 0; i < loopForApplicationForm; i++) {
//                                 form.append("applicationForm", document.getElementById("applicationForm").files[i], document.getElementById("applicationForm").localName);
//                             }
//
//                             var loopForOtherDoc = document.getElementById("otherDoc").files.length;
//                             for (let i = 0; i < loopForOtherDoc; i++) {
//                                 form.append("otherDoc", document.getElementById("otherDoc").files[i], document.getElementById("otherDoc").localName);
//                             }
//
//
//                             if ($scope.entity) {
//                                 form.append("entity", $scope.entity);
//                             }
//
//                             if (($scope.applicant1) && ($scope.applicant2) && ($scope.applicant3)) {
//                                 form.append("applicant", $scope.applicant1);
//                                 form.append("applicant", $scope.applicant2);
//                                 form.append("applicant", $scope.applicant3);
//                                 form.append("applicant", $scope.applicant4);
//                                 form.append("applicant", $scope.applicant5);
//                             } else {
//                                 alert("Please enter all applicant name.");
//                                 return;
//                             }
//
//
//
//                             if (($scope.adharNo1) && ($scope.adharNo2) && ($scope.adharNo3)) {
//                                 form.append("adharNo", $scope.adharNo1);
//                                 form.append("adharNo", $scope.adharNo2);
//                                 form.append("adharNo", $scope.adharNo3);
//                                 form.append("adharNo", $scope.adharNo4);
//                                 form.append("adharNo", $scope.adharNo5);
//                             } else {
//                                 alert("Please enter all Aadhar No.");
//                                 return;
//                             }
//
//
//
////                            var jointType = $scope.accountType.startsWith("Joint");
//
//
//                             form.append("mobileNo", $scope.mobileNo);
//                             form.append("accountType", $scope.accountType);
//                             form.append("branchName", $scope.branchName);
//                             form.append("status", "Pending at COPs");
//
//                             if (response.data.length === 0) {
//                                 form.append("remark", "BOM : Data Submitted");
//                             } else {
//                                 form.append("remark", "BOM : Existing Customer KYC Verification for " + $scope.accountType + "");
//                             }
//
//                             form.append("idProofStatus", "");
//                             form.append("addProofStatus", "");
//                             form.append("panStatus", "");
//                             form.append("tascDocStatus", "");
//                             form.append("otherDocStatus", "");
//                             form.append("applicationFormStatus", "");
//                             form.append("approvedBy", "");
//                             form.append("uploadedBy", $scope.userRecord.userName + "(BOM)");
//                             console.log(form);
//                             var settings = {
//                                 "url": $scope.uRl + "kyc/save",
//                                 "method": "POST",
//                                 "timeout": 0,
//                                 "processData": false,
//                                 "mimeType": "multipart/form-data",
//                                 "contentType": false,
//                                 "data": form
//                             };
//
//                             $.ajax(settings).done(function (response) {
//                                 debugger;
//                                 console.log("Response:", response);  // Log the raw response
//                                 console.log("Response Length:", response.length);  // Log the length of the response
//                                 console.log("Response Type:", typeof response);  // Log the type of the response
//
//                                 if (!response) {
//                                     alert("Empty response from server. Please try again later.");
//                                     return;
//                                 }
//
//                                 try {
//                                     var responseData = JSON.parse(response);  // Try to parse the response
//                                 } catch (e) {
//                                     console.error("Error parsing JSON response:", e);
//                                     alert("There was an error processing your request. Please try again.");
//                                     return;  // Exit the function if JSON parsing fails
//                                 }
//
//                                 // Continue with your logic if JSON parsing succeeds
//                                 var Ack = responseData.code;
//                                 if ("" === response) {
//                                     alert("Already have an Account Type for this Aadhar number !");
//                                 } else {
//                                     alert("Data successfully submitted. Ack_No( " + Ack.substring(6) + " )");
//                                     window.location.href = $scope.uRl + "user_asBOM.html";
//                                 }
//                             }).fail(function (jqXHR, textStatus, errorThrown) {
//                                 // Handle AJAX errors
//                                 console.error("AJAX error:", textStatus, errorThrown);
//                                 alert("There was an error processing your request. Please try again.");
//                             });
//                         }
//                     }, function (error) {
//                         console.log(error);
//                     });
//         };
//
//
//
//
//         $scope.updateAppStatus = function () {
//             debugger;
//
//             $scope.showApp2 = $scope.appStatus["app2"];
//             $scope.showApp3 = $scope.appStatus["app3"];
//             $scope.showApp4 = $scope.appStatus["app4"];
//             $scope.showApp5 = $scope.appStatus["app5"];
//         };
//
//
//         var keys = Object.keys($scope.appStatus);
//         var currentIndex = 0;
//
//         $scope.addApplicantTasc = function () {
//             debugger;
//             if (currentIndex < keys.length) {
//                 $scope.appStatus[keys[currentIndex]] = true;
//                 currentIndex++;
//             }
//
//             $scope.updateAppStatus();
//         };
//
//
//     } else {
//         window.location.href = $scope.uRl + "index.html";
//     }
//
//
//
//
// });
