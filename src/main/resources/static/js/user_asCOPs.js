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

     $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asCOPs"));
     if (($scope.userRecord)) {
// start for COPs edit form
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
// end for COPs edit form
         $scope.kycRecordList = [];
         $scope.refresh = function () {
             kycService.getAllKYCRecords($scope.userRecord.userName).then(function (response) {
                 $scope.kycRecordList = response.data;
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
             window.localStorage.removeItem("user_asCOPs");
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

//         $scope.cancelCOPsForm = function () {
//             debugger;
//             kycService.kycRecordActive($scope.kycRecord.id).then(function (response) {
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

         $scope.editRecord = function (record) {
             debugger;

             $scope.Record = record;
             localStorage.setItem("Record", JSON.stringify(record));
//             $scope.stopRefresh();
             if (record.accessingId === $scope.userRecord.userName) {
                 if (record.activeStatus === true) {
                     kycService.kycRecordInActive(record.id, $scope.userRecord.userName).then(function (response) {
                         $scope.changeForm(record.accountType);
                         $scope.formContainerVisible = true;
                         $scope.listContainerVisible = false;
                         window.location.href = $scope.uRl + "user_asCOPs_Form.html";
                     }).catch(function (error) {
                         console.log('Error:', error);
                     });
                 }
                 if (record.activeStatus === false) {
                     $scope.changeForm(record.accountType);
                     $scope.formContainerVisible = true;
                     $scope.listContainerVisible = false;
                     window.location.href = $scope.uRl + "user_asCOPs_Form.html";
                 }
             }
             if (record.activeStatus === true) {
                 kycService.kycRecordInActive(record.id, $scope.userRecord.userName).then(function (response) {
                     $scope.kycRecord = response.data;
                     $scope.changeForm(record.accountType);
                     $scope.formContainerVisible = true;
                     $scope.listContainerVisible = false;
                     window.location.href = $scope.uRl + "user_asCOPs_Form.html";
                 }).catch(function (error) {
                     console.log('Error:', error);
                 });
             } else {
                 $scope.showEditFormAlertBox();
//                 alert(record.accessingId + " is already accessing the form.");
//                 location.reload();
             }
         };

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

         $scope.dataURLtoFilefunction = function (dataurl, filename) {
             var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                     bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
             while (n--) {
                 u8arr[n] = bstr.charCodeAt(n);
             }
             return new File([u8arr], filename, {type: mime});
         };

         $scope.validateForm = function () {
             if ($scope.accountType) {
                 return true;
             } else {
                 alert("Please! select the Account Type.");
                 return false;
             }

         };

         $scope.isRemarkTooLong = false;

         $scope.remark = '';

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

         // exportToExcel code start

         $scope.loadSheet = function () {
             // Create an array of promises for all the service calls
             var kycRecordsPromises = [
                 kycService.getAllKycRecords(),
                 kycJointSavingService.getAllKYCRecords(),
                 kycPartnershipService.getAllKYCRecords(),
                 kycPubpvtService.getAllKYCRecords(),
                 kycSavingCurrentService.getAllKYCRecords(),
                 kycSoleProprietorshipService.getAllKYCRecords(),
                 kycTascService.getAllKYCRecords()
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


 // var app = angular.module("myApp", []);
// app.controller("cont", function ($scope, $http, $interval) {
//     var protocal = window.location.protocol;
//     var host = window.location.host;
//     $scope.uRl = protocal + "//" + host + "/";
//     console.log($scope.uRl);
//
//     $scope.userRecord = JSON.parse(window.localStorage.getItem("user_asCOPs"));
//     if (($scope.userRecord)) {
//         $scope.list_Adhar = [];
//         $scope.panstatus = null;
//         $scope.adharstatus = null;
//         $scope.otherDocstatus = null;
//         $scope.applicationFormstatus = null;
//         $scope.notVisible_OnAccept = false;
//         $scope.notVisible_OnAcceptP = false;
//         $scope.formContainerVisible = false;
//         $scope.listContainerVisible = true;
//         $scope.visibelForAadharDetails = false;
//
////                    //registration page
////                    $scope.onShowSignUpPage = function () {
////                    $scope.signUpContainerVisible = true;
////                            $scope.loginContainerVisible = false;
////                    };
////                    $scope.onShowLoginPage = function () {
////                    $scope.signUpContainerVisible = false;
////                            $scope.loginContainerVisible = true;
////                    };
////                    
//
//         $scope.list = [];
//         $scope.accout_Type = null;
//         $scope.refresh = function () {
//             $http.get($scope.uRl + "kyc/getAllBranchListOfCOPs/" + $scope.userRecord.userName)
//                     .then(function (response) {
//                         $scope.list = response.data;
//                     },
//                             function (error) {
//                                 console.log(error);
//                             });
//         };
//         $scope.logout = function () {
//             alert("Logout Successfully.");
//             window.location.href = $scope.uRl + "index.html";
//             $scope.list = null;
//             window.localStorage.removeItem("user_asCOPs");
//         };
//         $scope.messApprove = function (messageApprove) {
//             if (messageApprove.endsWith("Approved")) {
//                 $scope.notVisible_OnApprovalCOPs = false;
//                 $scope.notVisible_OnApprovalCOPs = false;
//                 $scope.notVisible_OnAccept = true;
//                 $scope.notVisible_OnAcceptP = true;
//             } else if (messageApprove.endsWith("Pending at COPs")) {
//                 $scope.notVisible_OnApprovalCOPs = true;
//                 $scope.notVisible_OnApprovalCOPs = false;
//                 $scope.notVisible_OnAccept = false;
//                 $scope.notVisible_OnAcceptP = true;
//             } else if (messageApprove.endsWith("Pending at COPs")) {
//                 $scope.notVisible_OnApprovalCOPs = false;
//                 $scope.notVisible_OnApprovalCOPs = true;
//                 $scope.notVisible_OnAccept = false;
//                 $scope.notVisible_OnAcceptP = false;
//             }
//         };
//         $scope.openImageInPopup = function (imageUrl) {
//             var largeImage = document.getElementById(imageUrl);
//             var newWindow = window.open();
//             newWindow.document.write('<html><body style="margin:0;"><img src="' + largeImage.src + '"></img></body></html>');
//         };
//         $scope.refresh();
//         $scope.list1 = [];
//         $scope.reco = null;
//         $scope.panfile = [];
//         $scope.adharfile = [];
//         $scope.otherDocfile = [];
//         $scope.applicationFormfile = [];
//         $scope.recoPan = [];
//         $scope.recoAdhar = [];
//         $scope.recoApplicationForm = [];
//         $scope.recoOtherDoc = [];
//
//         $scope.editRecord = function (record) {
//             $scope.checkFiled();
//             $scope.formContainerVisible = true;
//             $scope.listContainerVisible = false;
//             $http.get($scope.uRl + "kyc/get/" + record.id)
//                     .then(function (response) {
//                         $scope.list1 = response.data;
//
//
//                         var applicantArray = $scope.list1.applicant;
//                         var applicantloop = applicantArray.split(",");
//
//                         var aadharArray = $scope.list1.adharNo;
//                         var aadharloop = aadharArray.split(",");
//                         var aadharloopsize = aadharloop.length;
//                         if (aadharloopsize === 3) {
//                             $scope.showApp2 = true;
//                             $scope.showApp3 = true;
//                             $scope.showAadhar1 = false;
//                             $scope.showAadhar2 = false;
//                             $scope.showAadhar3 = true;
//
//                         } else if (aadharloopsize === 2) {
//                             $scope.showApp2 = true;
//                             $scope.showAadhar1 = false;
//                             $scope.showAadhar2 = true;
//                             $scope.showAadhar3 = false;
//
//                         } else if (aadharloopsize === 1) {
//                             $scope.showAadhar1 = true;
//                             $scope.showAadhar2 = false;
//                             $scope.showAadhar3 = false;
//
//                         }
//
//
//                         $scope.reco = $scope.list1;
//                         $scope.id = $scope.list1.id;
//
//                         if ($scope.showApp2 === true && $scope.showApp3 === true) {
//                             $scope.adharNo1 = aadharloop[0];
//                             $scope.adharNo2 = aadharloop[1];
//                             $scope.adharNo3 = aadharloop[2];
//
//                             $scope.applicant1 = applicantloop[0];
//                             $scope.applicant2 = applicantloop[1];
//                             $scope.applicant3 = applicantloop[2];
//
//                         } else if ($scope.showApp2 === true) {
//                             $scope.adharNo1 = aadharloop[0];
//                             $scope.adharNo2 = aadharloop[1];
//
//                             $scope.applicant1 = applicantloop[0];
//                             $scope.applicant2 = applicantloop[1];
//
//                         } else {
//                             $scope.adharNo = aadharloop[0];
//
//                             $scope.applicant1 = applicantloop[0];
//                         }
//
//
//
//                         $scope.mobileNo = $scope.list1.mobileNo;
//                         $scope.accout_Type = $scope.list1.accountType;
//                         $scope.accountType = $scope.list1.accountType;
//                         $scope.branchName = $scope.list1.branchName;
//                         $scope.status = $scope.list1.status;
//                         $scope.oldRemark = $scope.list1.remark;
//                         $scope.approvedBy = $scope.list1.approvedBy;
//                         $scope.uploadedBy = $scope.list1.uploadedBy;
//                         $scope.messApprove($scope.list1.status);
//                         //
//                         var loopForPan = $scope.list1.pan.length;
//                         for (var i = 0; i < loopForPan; i++) {
//                             var panfile = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.list1.pan[i], "pan_" + i);
//                             $scope.recoPan.push(URL.createObjectURL(panfile));
//                         }
//
//                         var loopForAdhar = $scope.list1.adhar.length;
//                         for (var i = 0; i < loopForAdhar; i++) {
//                             var adharfile = $scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.list1.adhar[i], "adhar_" + i);
//                             $scope.recoAdhar.push(URL.createObjectURL(adharfile));
//                         }
//                         var loopForApplication = $scope.list1.applicationForm.length;
//                         for (var i = 0; i < loopForApplication; i++) {
//                             var aplicationfile = $scope.dataURLtoFilefunction('data:application/pdf;base64,' + $scope.list1.applicationForm[i], "applicationForm_" + i);
//                             $scope.recoApplicationForm.push(URL.createObjectURL(aplicationfile));
//                         }
//
//                         var loopForOtherDoc = $scope.list1.otherDoc.length;
//                         for (var i = 0; i < loopForOtherDoc; i++) {
//                             var otherDocfile = $scope.dataURLtoFilefunction('data:application/pdf;base64,' + $scope.list1.otherDoc[i], "otherDoc_" + i);
//                             $scope.recoOtherDoc.push(URL.createObjectURL(otherDocfile));
//                         }
//                         //
//                         if ($scope.reco.panStatus === "Accept" && $scope.reco.adharStatus === "Accept"
//                                 && $scope.reco.otherDocStatus === "Accept" &&
//                                 $scope.reco.applicationFormStatus === "Accept") {
//                             $scope.notVisible_OnAccept = true;
//                         }
//                         //
//                         if ($scope.reco.panStatus === "Accept") {
//                             $scope.panstatus = $scope.reco.panStatus;
//                             document.getElementById('onPanStatusAC').click();
//                         } else if ($scope.reco.panStatus === "Reject") {
//                             document.getElementById('onPanStatusRE').click();
//                         }
//
//                         if ($scope.reco.adharStatus === "Accept") {
//                             $scope.adharstatus = $scope.reco.adharStatus;
//                             document.getElementById('onAdharStatusAC').click();
//                         } else if ($scope.reco.adharStatus === "Reject") {
//                             document.getElementById('onAdharStatusRE').click();
//                         }
//
//                         if ($scope.reco.otherDocStatus === "Accept") {
//                             $scope.otherDocstatus = $scope.reco.otherDocStatus;
//                             document.getElementById('onOtherDocsStatusAC').click();
//                         } else if ($scope.reco.otherDocStatus === "Reject") {
//                             document.getElementById('onOtherDocsStatusRE').click();
//                         }
//
//                         if ($scope.reco.applicationFormStatus === "Accept") {
//                             $scope.applicationFormstatus = $scope.reco.applicationFormStatus;
//                             document.getElementById('onapplicationFormStatusAC').click();
//                         } else if ($scope.reco.applicationFormStatus === "Reject") {
//                             document.getElementById('onapplicationFormStatusRE').click();
//                         }
//                         //
//                     },
//                             function (error) {
//                                 console.log(error);
//                             });
//         };
//         $scope.viewPan = function () {
//             var loopsize = $scope.recoPan.length;
//             for (var i = 0; i < loopsize; i++) {
//                 window.open($scope.recoPan[i], '_blank');
//             }
//         };
//         $scope.viewAadhar = function () {
//             var loopsize = $scope.recoAdhar.length;
//             for (var i = 0; i < loopsize; i++) {
//                 window.open($scope.recoAdhar[i], '_blank');
//             }
//
//         };
//         $scope.viewPdfApp = function () {
//             var loopsize = $scope.recoApplicationForm.length;
//             for (var i = 0; i < loopsize; i++) {
//                 window.open($scope.recoApplicationForm[i], '_blank');
//             }
//         };
//         $scope.viewPdfOther = function () {
//             var loopsize = $scope.recoOtherDoc.length;
//             for (var i = 0; i < loopsize; i++) {
//                 window.open($scope.recoOtherDoc[i], '_blank');
//             }
//         };
//         $scope.deleterecord = function (record) {
//             $http.get($scope.uRl + "kyc/delete/" + record.id)
//                     .then(function (response) {
//                         alert("Data successfully deleted.");
//                     },
//                             function (error) {
//                                 console.log(error);
//                             });
//         };
//         //
//         $scope.checkFiled = function () {
//             if ($scope.panstatus === "Accept" && $scope.adharstatus === "Accept"
//                     && $scope.otherDocstatus === "Accept"
//                     && $scope.applicationFormstatus === "Accept") {
//                 $scope.notVisible_OnAccept = true;
//                 $scope.isButtonDisabled = false;
//             } else {
//                 $scope.notVisible_OnAccept = false;
//                 $scope.isButtonDisabled = true;
//             }
//         };
//
//
//         //new logic 1
//         //onPanStatus Accept
//         $scope.onPanStatusA = function (message) {
//             var buttonA = document.getElementById(message);
//             var buttonR = document.getElementById("onPanStatusRE");
//             buttonA.style.backgroundColor = "blue";
//             buttonA.style.color = "white";
//             buttonR.style.backgroundColor = "#BE4347";
//             buttonR.style.color = "white";
//             $scope.panstatus = buttonA.textContent;
//             $scope.checkFiled();
//         };
//
////            ac = #85B87E; re = #BE4347;
//         //onPanStatus Reject
//         $scope.onPanStatusR = function (message) {
//             var buttonR = document.getElementById(message);
//             var buttonA = document.getElementById("onPanStatusAC");
//             buttonR.style.backgroundColor = "blue";
//             buttonR.style.color = "white";
//             buttonA.style.backgroundColor = "#85B87E";
//             buttonA.style.color = "white";
//             $scope.panstatus = buttonR.textContent;
//             $scope.checkFiled();
//         };
//
//         ///
//         //onOtherDocsStatusA Accept
//         $scope.onOtherDocsStatusA = function (message) {
//             var buttonA = document.getElementById(message);
//             var buttonR = document.getElementById("onOtherDocsStatusRE");
//             buttonA.style.backgroundColor = "blue";
//             buttonA.style.color = "white";
//             buttonR.style.backgroundColor = "#BE4347";
//             buttonR.style.color = "white";
//             $scope.otherDocstatus = buttonA.textContent;
//             $scope.checkFiled();
//         };
//         //onAdharStatusA Accept
//
//         $scope.updateDocStatus = function (message , dynamicVar) {
//             var len = message.length;
//             if (message.endsWith("AC")) {
//                 var buttonA = document.getElementById(message);
//                 var buttonId = message.slice(0, -2);
//                 var buttonR = document.getElementById(buttonId + "RE");
//                 buttonA.style.backgroundColor = "blue";
//                 buttonA.style.color = "white";
//                 buttonR.style.backgroundColor = "#BE4347";
//                 buttonR.style.color = "white";
//                 $scope[dynamicVar] = buttonA.textContent;
//                 $scope.checkFiled();
//             } else {
//                 var buttonR = document.getElementById(message);
//                 var len = message.length;
//                 var buttonId = message.substring(0, len);
//                 var buttonA = document.getElementById(buttonId + "AC");
//                 buttonR.style.backgroundColor = "blue";
//                 buttonR.style.color = "white";
//                 buttonA.style.backgroundColor = "#85B87E";
//                 buttonA.style.color = "white";
//                 $scope[dynamicVar] = buttonR.textContent;
//                 $scope.checkFiled();
//             }
//         };
//
////            ac = #85B87E; re = #BE4347;
//         //onAdharStatusR Reject
//         $scope.onAdharStatusR = function (message) {
//             var buttonR = document.getElementById(message);
//             var buttonA = document.getElementById("onAdharStatusAC");
//             buttonR.style.backgroundColor = "blue";
//             buttonR.style.color = "white";
//             buttonA.style.backgroundColor = "#85B87E";
//             buttonA.style.color = "white";
//             $scope.adharstatus = buttonR.textContent;
//             $scope.checkFiled();
//         };
//         ///
//
////            ac = #85B87E; re = #BE4347;
//         //onOtherDocsStatusR Reject 
//         $scope.onOtherDocsStatusR = function (message) {
//             var buttonR = document.getElementById(message);
//             var buttonA = document.getElementById("onOtherDocsStatusAC");
//             buttonR.style.backgroundColor = "blue";
//             buttonR.style.color = "white";
//             buttonA.style.backgroundColor = "#85B87E";
//             buttonA.style.color = "white";
//             $scope.otherDocstatus = buttonR.textContent;
//             $scope.checkFiled();
//         };
//         //
//         ///
//         //onapplicationFormStatusA Accept
//         $scope.onapplicationFormStatusA = function (message) {
//             var buttonA = document.getElementById(message);
//             var buttonR = document.getElementById("onapplicationFormStatusRE");
//             buttonA.style.backgroundColor = "blue";
//             buttonA.style.color = "white";
//             buttonR.style.backgroundColor = "#BE4347";
//             buttonR.style.color = "white";
//             $scope.applicationFormstatus = buttonA.textContent;
//             $scope.checkFiled();
//         };
//
////            ac = #85B87E; re = #BE4347;
//         //onapplicationFormStatusR Reject 
//         $scope.onapplicationFormStatusR = function (message) {
//             var buttonR = document.getElementById(message);
//             var buttonA = document.getElementById("onapplicationFormStatusAC");
//             buttonR.style.backgroundColor = "blue";
//             buttonR.style.color = "white";
//             buttonA.style.backgroundColor = "#85B87E";
//             buttonA.style.color = "white";
//             $scope.applicationFormstatus = buttonR.textContent;
//             $scope.checkFiled();
//         };
//         //
//
//         ///
//         $scope.searchByFiled = function (message) {
//             $scope.search = message;
//         };
//
//         $scope.closeAadharDetails = function () {
//             $scope.visibelForAadharDetails = false;
//         };
//
//         $scope.aadharcheck = function (adharNo) {
//             if (!(adharNo)) {
//                 alert("    Please enter the Aadhar Number! \n\
//                                                    OR \n\
//                            Check the enter digit is 12 or not.");
//                 $scope.visibelForAadharDetails = false;
//                 $scope.list_Adhar = null;
//             } else {
//                 $scope.visibelForAadharDetails = false;
//                 $scope.list_Adhar = null;
//                 $scope.url = "kyc/getAadhar/" + adharNo;
////                $scope.loadingImg = true;
//                 $http.get($scope.uRl + $scope.url)
//                         .then(function (response) {
//                             $scope.list_Adhar = response.data;
//                             if ($scope.list_Adhar.length > 0) {
//                                 $scope.visibelForAadharDetails = true;
//                             } else {
//                                 $scope.list_Adhar = null;
//                                 $scope.visibelForAadharDetails = false;
//                                 alert("Aadhar not present in KYC.");
//                             }
////                        $scope.loadingImg = false;
//                         }, function (error) {
//                             console.log(error);
////                        $scope.loadingImg = false;
//                         });
//             }
//         };
//
//
//         ///// Json to Excel file
//         $scope.exportToExcel = function () {
//             var jsonData = $scope.list;
//
//             function formatDate(date) {
//                 var options = {
//                     day: '2-digit',
//                     month: '2-digit',
//                     year: 'numeric'
//                 };
//                 var datePart = date.toLocaleDateString('en-IN', options);
//
//                 options = {
//                     hour: '2-digit',
//                     minute: '2-digit',
//                     second: '2-digit',
//                     hour12: true
//                 };
//                 var timePart = date.toLocaleTimeString('en-IN', options);
//
//                 return `${datePart} ${timePart.replace(/\b(?:am|pm)\b/g, match => match.toUpperCase())}`;
//             }
//
//             // Format the date and timestamp columns
//             jsonData.forEach(function (item) {
//                 if (item.date instanceof Array) {
//                     item.date = item.date.map(d => formatDate(new Date(d))).join(', ');
//                 } else if (typeof item.date === 'string') {
//                     item.date = formatDate(new Date(item.date));
//                 }
//                 item.timeStam = item.timeStam.join(', ');
//             });
//
//
//
//             var filteredData = jsonData.map(function (item) {
//                 debugger;
//
//                 var dateOfArray = item.date.split(",");
//                 var dateLength = dateOfArray.length;
//                 var noOfCycle = dateLength / 2;
//                 var start = moment(dateOfArray[0], "DD/MM/YYYY hh:mm:ss A");
//                 var end = moment(dateOfArray[dateLength - 1], "DD/MM/YYYY hh:mm:ss A");
//
//                 var diff = moment.duration(end.diff(start));
//
//                 var days = Math.floor(diff.asDays());
//                 var hours = diff.hours();
//                 var minutes = diff.minutes();
//                 var seconds = diff.seconds();
//
//                 var duration = `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;
//                 var finalStatusCondition = item.status.endsWith("Approved");
//                 var finalStatus = "";
//                 var ApprovedDate = "";
//                 if (true === finalStatusCondition) {
//                     finalStatus = "Approved";
//                     ApprovedDate = dateOfArray[dateLength - 1].substring(1, 11);
//                 } else {
//                     finalStatus = "Pending";
//                 }
//                 return {
//                     'Code': item.code,
//                     'Applicant_1': item.applicant.split(",")[0],
//                     'Applicant_2': item.applicant.split(",")[1],
//                     'Applicant_3': item.applicant.split(",")[2],
//                     'Aadhar No_1': item.adharNo.split(",")[0],
//                     'Aadhar No_2': item.adharNo.split(",")[1],
//                     'Aadhar No_3': item.adharNo.split(",")[2],
//                     'Mobile No': item.mobileNo,
//                     'Account Type': item.accountType,
//                     'Branch Name': item.branchName,
//                     'Status': item.status,
//                     'Remark': item.remark,
//                     'Form Filled Date': dateOfArray[0].substring(0, 10),
//                     'Date': item.date,
//                     'Pan Status': item.panStatus,
//                     'Aadhar_Status': item.adharStatus,
//                     'Other_Doc_Status': item.otherDocStatus,
//                     'Application_Form_Status': item.applicationFormStatus,
//                     'Time Stamp': item.timeStam,
//                     'Approved By': item.approvedBy,
//                     'Uploaded By': item.uploadedBy,
//                     'No Of Cycle': noOfCycle,
//                     'Duration': duration,
//                     'Final Status': finalStatus,
//                     'Approved Date': ApprovedDate
//                 };
//             });
//
//             var ws = XLSX.utils.json_to_sheet(filteredData);
//
//             // Initialize ws['!cols'] as an array
//             ws['!cols'] = [];
//
//             // Auto-detect column lengths
//             var range = XLSX.utils.decode_range(ws['!ref']);
//             for (var C = range.s.c; C <= range.e.c; ++C) {
//                 var maxLength = filteredData.reduce((max, row) => {
//                     var cell = row[XLSX.utils.encode_col(C)];
//                     return cell ? Math.max(max, cell.length) : max;
//                 }, 10);
//                 ws['!cols'][C] = {width: maxLength};
//             }
//
//             // Adding auto filter and styling
//             ws['!autofilter'] = {ref: XLSX.utils.encode_range(range)};
//
//             var wb = XLSX.utils.book_new();
//             XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
//
//             // Save the Excel file
//             XLSX.writeFile(wb, $scope.userRecord.userName + '_report.xlsx');
//             alert("Downloading Data Excel file.");
//             location.reload();
//         };
//
//
//         $scope.dataURLtoFilefunction = function (dataurl, filename) {
//             var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
//                     bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
//             while (n--) {
//                 u8arr[n] = bstr.charCodeAt(n);
//             }
//             return new File([u8arr], filename, {type: mime});
//         };
//
//         $scope.validateForm = function () {
//             var remarkVal = document.getElementById("remark").value;
//             if (remarkVal === "") {
//                 alert("Please! Put the Remark.");
//                 return false;
//             } else {
//                 return true;
//             }
//
//         };
//
//         $scope.isRemarkTooLong = false;
//
//         $scope.remark = '';
//
//         $scope.checkLength = function () {
//             debugger;
//             var maxLength = 4900;
//
//             if ($scope.remark !== undefined) {
//
//                 if ($scope.remark.length > maxLength) {
//                     alert('Text length should not exceed ' + maxLength + ' characters.');
//                     // You can also update $scope.inputText or take other actions as needed.
//                     $scope.remark = $scope.remark.substring(0, maxLength);
//                     $scope.isRemarkTooLong = false;
//                 } else {
//                     $scope.isRemarkTooLong = true;
//                 }
//
//             } else {
//                 alert('Text length should not exceed ' + maxLength + ' characters.');
//             }
//
//
//         };
//
//         $scope.viewRemark = function (mess) {
//             var messRemark = mess.split(",");
//             var messLength = messRemark.length;
//             alert(messRemark[messLength - 1]);
//         };
//
//         $scope.userEdit = function (message) {
//             debugger;
//             if (message === "Pending at COPs") {
//////          --->
//                 $scope.checkLength();
//                 if ($scope.validateForm() && $scope.isRemarkTooLong) {
//                     $scope.checkFiled();
//                     //
//                     var loopForPan = $scope.reco.pan.length;
//                     for (var i = 0; i < loopForPan; i++) {
//                         $scope.panfile.push($scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.reco.pan[i], "pan_" + i));
//                     }
//
//                     var loopForAdhar = $scope.reco.adhar.length;
//                     for (var i = 0; i < loopForAdhar; i++) {
//                         $scope.adharfile.push($scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.reco.adhar[i], "adhar_" + i));
//                     }
//                     var loopForApplication = $scope.reco.applicationForm.length;
//                     for (var i = 0; i < loopForApplication; i++) {
//                         $scope.applicationFormfile.push($scope.dataURLtoFilefunction('data:application/pdf;base64,' + $scope.reco.applicationForm[i], "applicationForm_" + i));
//                     }
//
//                     var loopForOtherDoc = $scope.reco.otherDoc.length;
//                     for (var i = 0; i < loopForOtherDoc; i++) {
//                         $scope.otherDocfile.push($scope.dataURLtoFilefunction('data:application/pdf;base64,' + $scope.reco.otherDoc[i], "otherDoc_" + i));
//                     }
//                     //
//
//                     var form = new FormData();
//
//                     var loopForPanfile = $scope.panfile.length;
//                     for (let j = 0; j < loopForPanfile; j++) {
//                         form.append("pan", $scope.panfile[j], $scope.panfile[j].localName);
//                     }
//
//                     var loopForAadharfile = $scope.adharfile.length;
//                     for (let j = 0; j < loopForAadharfile; j++) {
//                         form.append("adhar", $scope.adharfile[j], $scope.adharfile[j].localName);
//                     }
//
//                     var loopForApplicationFormfile = $scope.applicationFormfile.length;
//                     for (let j = 0; j < loopForApplicationFormfile; j++) {
//                         form.append("applicationForm", $scope.applicationFormfile[j], $scope.applicationFormfile[j].localName);
//                     }
//
//                     var loopForOtherDocfile = $scope.otherDocfile.length;
//                     for (let j = 0; j < loopForOtherDocfile; j++) {
//                         form.append("otherDoc", $scope.otherDocfile[j], $scope.otherDocfile[j].localName);
//                     }
//                     form.append("id", $scope.id);
////                     form.append("firstName", $scope.firstName);
////                     form.append("midName", $scope.midName);
////                     form.append("lastName", $scope.lastName);
////                     form.append("adharNo", $scope.adharNo);
//
//                     if ($scope.showApp2 === true && $scope.showApp3 === true) {
//                         if (($scope.applicant1) && ($scope.applicant2) && ($scope.applicant3)) {
//                             form.append("applicant", $scope.applicant1);
//                             form.append("applicant", $scope.applicant2);
//                             form.append("applicant", $scope.applicant3);
//                         } else {
//                             alert("Please enter all applicant name.");
//                             return;
//                         }
//                         if (($scope.adharNo1) && ($scope.adharNo2) && ($scope.adharNo3)) {
//                             form.append("adharNo", $scope.adharNo1);
//                             form.append("adharNo", $scope.adharNo2);
//                             form.append("adharNo", $scope.adharNo3);
//                         } else {
//                             alert("Please enter all Aadhar No.");
//                             return;
//                         }
//                     } else if ($scope.showApp2 === true) {
//                         if (($scope.applicant1) && ($scope.applicant2)) {
//                             form.append("applicant", $scope.applicant1);
//                             form.append("applicant", $scope.applicant2);
//                         } else {
//                             alert("Please enter all applicant name.");
//                             return;
//                         }
//                         if (($scope.adharNo1) && ($scope.adharNo2)) {
//                             form.append("adharNo", $scope.adharNo1);
//                             form.append("adharNo", $scope.adharNo2);
//                         } else {
//                             alert("Please enter all Aadhar No.");
//                             return;
//                         }
//                     } else {
//                         if (($scope.applicant1)) {
//                             form.append("applicant", $scope.applicant1);
//                         } else {
//                             alert("Please enter all applicant name.");
//                             return;
//                         }
//                         if (($scope.adharNo)) {
//                             form.append("adharNo", $scope.adharNo);
//                         } else {
//                             alert("Please enter all Aadhar No.");
//                             return;
//                         }
//                     }
//
//
//                     form.append("mobileNo", $scope.mobileNo);
//                     form.append("accountType", $scope.accountType);
//                     form.append("branchName", $scope.branchName);
//                     form.append("status", "By " + $scope.userRecord.userName + "(COPs) : " + message);
//                     if (message === "Approved") {
//                         form.append("remark", "");
//                     } else {
//                         form.append("remark", "COPs : " + $scope.remark);
//                     }
//
//                     // List view image Accept Reject
//                     if ($scope.panstatus === "Accept" || $scope.panstatus === "Reject") {
//                         form.append("panStatus", $scope.panstatus);
//                     } else {
//                         form.append("panStatus", $scope.reco.panStatus);
//                     }
//
//                     if ($scope.adharstatus === "Accept" || $scope.adharstatus === "Reject") {
//                         form.append("adharStatus", $scope.adharstatus);
//                     } else {
//                         form.append("adharStatus", $scope.reco.adharStatus);
//                     }
//
//                     if ($scope.otherDocstatus === "Accept" || $scope.otherDocstatus === "Reject") {
//                         form.append("otherDocStatus", $scope.otherDocstatus);
//                     } else {
//                         form.append("otherDocStatus", $scope.reco.otherDocStatus);
//                     }
//
//                     if ($scope.applicationFormstatus === "Accept" || $scope.applicationFormstatus === "Reject") {
//                         form.append("applicationFormStatus", $scope.applicationFormstatus);
//                     } else {
//                         form.append("applicationFormStatus", $scope.reco.applicationFormStatus);
//                     }
//
//                     //
//                     if (message === "Approved") {
//                         form.append("approvedBy", $scope.userRecord.userName + "(COPs)");
//                     } else {
//                         form.append("approvedBy", "");
//                     }
//                     //
//                     form.append("uploadedBy", $scope.uploadedBy);
//                     var settings = {
//                         "url": $scope.uRl + "kyc/update",
//                         "method": "POST",
//                         "timeout": 0,
//                         "processData": false,
//                         "mimeType": "multipart/form-data",
//                         "contentType": false,
//                         "data": form
//                     };
//
//                     $.ajax(settings).done(function (response) {
//                         alert("Data successfully submitted.");
//                         location.reload();
//                     });
//                 }
//////            <-------
//             } else if (message === "Approved") {
//                 debugger;
//////            --->    
//                 $scope.checkFiled();
//                 //
//                 var loopForPan = $scope.reco.pan.length;
//                 for (var i = 0; i < loopForPan; i++) {
//                     $scope.panfile.push($scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.reco.pan[i], "pan_" + i));
//                 }
//
//                 var loopForAdhar = $scope.reco.adhar.length;
//                 for (var i = 0; i < loopForAdhar; i++) {
//                     $scope.adharfile.push($scope.dataURLtoFilefunction('data:image/png;base64,' + $scope.reco.adhar[i], "adhar_" + i));
//                 }
//                 var loopForApplication = $scope.reco.applicationForm.length;
//                 for (var i = 0; i < loopForApplication; i++) {
//                     $scope.applicationFormfile.push($scope.dataURLtoFilefunction('data:application/pdf;base64,' + $scope.reco.applicationForm[i], "applicationForm_" + i));
//                 }
//
//                 var loopForOtherDoc = $scope.reco.otherDoc.length;
//                 for (var i = 0; i < loopForOtherDoc; i++) {
//                     $scope.otherDocfile.push($scope.dataURLtoFilefunction('data:application/pdf;base64,' + $scope.reco.otherDoc[i], "otherDoc_" + i));
//                 }
//                 //
//
//                 var form = new FormData();
//
//                 var loopForPanfile = $scope.panfile.length;
//                 for (let j = 0; j < loopForPanfile; j++) {
//                     form.append("pan", $scope.panfile[j], $scope.panfile[j].localName);
//                 }
//
//                 var loopForAadharfile = $scope.adharfile.length;
//                 for (let j = 0; j < loopForAadharfile; j++) {
//                     form.append("adhar", $scope.adharfile[j], $scope.adharfile[j].localName);
//                 }
//
//                 var loopForApplicationFormfile = $scope.applicationFormfile.length;
//                 for (let j = 0; j < loopForApplicationFormfile; j++) {
//                     form.append("applicationForm", $scope.applicationFormfile[j], $scope.applicationFormfile[j].localName);
//                 }
//
//                 var loopForOtherDocfile = $scope.otherDocfile.length;
//                 for (let j = 0; j < loopForOtherDocfile; j++) {
//                     form.append("otherDoc", $scope.otherDocfile[j], $scope.otherDocfile[j].localName);
//                 }
//                 form.append("id", $scope.id);
////                 form.append("firstName", $scope.firstName);
////                 form.append("midName", $scope.midName);
////                 form.append("lastName", $scope.lastName);
////                 form.append("adharNo", $scope.adharNo);
//
//                 if ($scope.showApp2 === true && $scope.showApp3 === true) {
//                     if (($scope.applicant1) && ($scope.applicant2) && ($scope.applicant3)) {
//                         form.append("applicant", $scope.applicant1);
//                         form.append("applicant", $scope.applicant2);
//                         form.append("applicant", $scope.applicant3);
//                     } else {
//                         alert("Please enter all applicant name.");
//                         return;
//                     }
//                     if (($scope.adharNo1) && ($scope.adharNo2) && ($scope.adharNo3)) {
//                         form.append("adharNo", $scope.adharNo1);
//                         form.append("adharNo", $scope.adharNo2);
//                         form.append("adharNo", $scope.adharNo3);
//                     } else {
//                         alert("Please enter all Aadhar No.");
//                         return;
//                     }
//                 } else if ($scope.showApp2 === true) {
//                     if (($scope.applicant1) && ($scope.applicant2)) {
//                         form.append("applicant", $scope.applicant1);
//                         form.append("applicant", $scope.applicant2);
//                     } else {
//                         alert("Please enter all applicant name.");
//                         return;
//                     }
//                     if (($scope.adharNo1) && ($scope.adharNo2)) {
//                         form.append("adharNo", $scope.adharNo1);
//                         form.append("adharNo", $scope.adharNo2);
//                     } else {
//                         alert("Please enter all Aadhar No.");
//                         return;
//                     }
//                 } else {
//                     if (($scope.applicant1)) {
//                         form.append("applicant", $scope.applicant1);
//                     } else {
//                         alert("Please enter all applicant name.");
//                         return;
//                     }
//                     if (($scope.adharNo)) {
//                         form.append("adharNo", $scope.adharNo);
//                     } else {
//                         alert("Please enter all Aadhar No.");
//                         return;
//                     }
//                 }
//
//
//                 form.append("mobileNo", $scope.mobileNo);
//                 form.append("accountType", $scope.accountType);
//                 form.append("branchName", $scope.branchName);
//                 form.append("status", "By " + $scope.userRecord.userName + "(COPs) : " + message);
//                 if (message === "Approved") {
//                     form.append("remark", "Approved");
//                 } else {
//                     form.append("remark", "COPs : " + $scope.remark);
//                 }
//
//                 // List view image Accept Reject
//                 if ($scope.panstatus === "Accept" || $scope.panstatus === "Reject") {
//                     form.append("panStatus", $scope.panstatus);
//                 } else {
//                     form.append("panStatus", $scope.reco.panStatus);
//                 }
//
//                 if ($scope.adharstatus === "Accept" || $scope.adharstatus === "Reject") {
//                     form.append("adharStatus", $scope.adharstatus);
//                 } else {
//                     form.append("adharStatus", $scope.reco.adharStatus);
//                 }
//
//                 if ($scope.otherDocstatus === "Accept" || $scope.otherDocstatus === "Reject") {
//                     form.append("otherDocStatus", $scope.otherDocstatus);
//                 } else {
//                     form.append("otherDocStatus", $scope.reco.otherDocStatus);
//                 }
//
//                 if ($scope.applicationFormstatus === "Accept" || $scope.applicationFormstatus === "Reject") {
//                     form.append("applicationFormStatus", $scope.applicationFormstatus);
//                 } else {
//                     form.append("applicationFormStatus", $scope.reco.applicationFormStatus);
//                 }
//
//                 //
//                 if (message === "Approved") {
//                     form.append("approvedBy", $scope.userRecord.userName + "(COPs)");
//                 } else {
//                     form.append("approvedBy", "");
//                 }
//                 //
//                 form.append("uploadedBy", $scope.uploadedBy);
//                 var settings = {
//                     "url": $scope.uRl + "kyc/update",
//                     "method": "POST",
//                     "timeout": 0,
//                     "processData": false,
//                     "mimeType": "multipart/form-data",
//                     "contentType": false,
//                     "data": form
//                 };
//
//                 $.ajax(settings).done(function (response) {
//                     alert("Data successfully submitted.");
//                     location.reload();
//                 });
////            <----
//             }
//
//         };
//
//         // Set up the interval to call refresh every 1 minute (60000 milliseconds)
//         var intervalPromise = $interval(function () {
//             $scope.refresh();
//         }, 5000);
//
//         // Optionally, you can cancel the interval when the scope is destroyed to prevent memory leaks
//         $scope.$on('$destroy', function () {
//             if (intervalPromise) {
//                 $interval.cancel(intervalPromise);
//             }
//         });
//
//     } else {
//         window.location.href = $scope.uRl + "index.html";
//     }
// });
//
// app.filter('continuousSubstringFilter', function () {
//     return function (list, search, columns) {
//         if (!search) {
//             return list;
//         }
//
//         search = search.toLowerCase();
//
//         return list.filter(function (record) {
//             return columns.some(function (column) {
//                 var columnValue = record[column] && record[column].toString().toLowerCase();
//                 return columnValue && columnValue.includes(search);
//             });
//         });
//     };
// });
