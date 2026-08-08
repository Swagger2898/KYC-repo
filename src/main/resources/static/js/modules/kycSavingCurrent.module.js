// Define the AngularJS application module
 var app = angular.module('kycSavingCurrentApp', []);

// Define the service to handle API calls
 app.service('kycSavingCurrentService', ['$http', function ($http) {

         var protocal = window.location.protocol;
         var host = window.location.host;
         var uRl = protocal + "//" + host + "/";

         // Save KYC
         this.save = function (data) {

             var formData = new FormData();

             angular.forEach(data, function (value, key) {
                 if (value instanceof FileList) {
                     for (let i = 0; i < value.length; i++) {
                         formData.append(key, value[i]); // Appending file with '[]' if multiple files
                     }
                 } else if (Array.isArray(value)) {
                     angular.forEach(value, function (file) {
                         formData.append(key + '[]', file); // Appending file with '[]' if multiple files
                     });
                 } else {
                     formData.append(key, value);
                 }
             });

             return $http.post(uRl + 'kyc-saving-current/save', formData, {
                 transformRequest: angular.identity,
                 headers: {'Content-Type': undefined}
             });
         };
         
         // Get all KYC records
         this.getAllKYCRecords = function () {
             var list = $http.get(uRl + 'kyc-saving-current/getAllKycRecord');
             console.log(list);
             return list;
         };

         // Get all branch list of COPs
         this.getAllBranchListOfCOPs = function (userName) {
             return $http.get(uRl + 'kyc-saving-current/getAllBranchListOfCOPs/' + userName);
         };

         // Get all branch list of BOM
         this.getAllBranchListOfBOM = function (userName) {
             return $http.get(uRl + 'kyc-saving-current/getAllBranchListOfBOM/' + userName);
         };

         // Get KYC record by ID
         this.getKycRecordById = function (id) {
             return $http.get(uRl + 'kyc-saving-current/get/' + id);
         };

         // Delete KYC record by ID
         this.deleteKycRecord = function (id) {
             return $http.delete(uRl + 'kyc-saving-current/delete/' + id);
         };

         // Get all KYC records in JSON
         this.getAllKycRecordInJson = function () {
             return $http.get(uRl + 'kyc-saving-current/getJsonFile');
         };

         // Get KYC records by Aadhar number
         this.getKycRecordsByAadharNo = function (adharNo) {
             return $http.get(uRl + 'kyc-saving-current/getAadhar/' + adharNo);
         };

         // Get KYC records by code
         this.getRecordByCode = function (code) {
             return $http.get(uRl + 'kyc-saving-current/getRecordByCode/' + code);
         };
 
         // Update KYC record
         this.updateKycRecord = function (data) {
             var formData = new FormData();

             angular.forEach(data, function (value, key) {
                 if (value instanceof FileList) {
                     for (let i = 0; i < value.length; i++) {
                         formData.append(key, value[i]); // Appending file with '[]' if multiple files
                     }
                 } else if (Array.isArray(value)) {
                     angular.forEach(value, function (file) {
                         formData.append(key + '[]', file); // Appending file with '[]' if multiple files
                     });
                 } else {
                     formData.append(key, value);
                 }
             });

             return $http.put(uRl + 'kyc-saving-current/update', formData, {
                 transformRequest: angular.identity,
                 headers: {'Content-Type': undefined}
             });
         };
 
         // Update KYC record
         this.updateKycRecordCOPs = function (data) {
             var formData = new FormData();

             angular.forEach(data, function (value, key) {
                 if (value instanceof FileList) {
                     for (let i = 0; i < value.length; i++) {
                         formData.append(key, value[i]); // Appending file with '[]' if multiple files
                     }
                 } else if (Array.isArray(value)) {
                     angular.forEach(value, function (file) {
                         formData.append(key + '[]', file); // Appending file with '[]' if multiple files
                     });
                 } else {
                     formData.append(key, value);
                 }
             });

             return $http.put(uRl + 'kyc-saving-current/updateCOPs', formData, {
                 transformRequest: angular.identity,
                 headers: {'Content-Type': undefined}
             });
         };
     }]);
