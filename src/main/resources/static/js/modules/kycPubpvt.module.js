 var app = angular.module('kycPubpvtApp', []);

// Service for interacting with the KycPubPvtController API
 app.service('kycPubpvtService', ['$http', function ($http) {

         var protocal = window.location.protocol;
         var host = window.location.host;
         var uRl = protocal + "//" + host + "/";

         // Save a new KYC record
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
             return $http.post(uRl + 'kyc-pubpvt/save', formData, {
                 transformRequest: angular.identity,
                 headers: {'Content-Type': undefined}
             });
         };
         
         // Get all KYC records
         this.getAllKYCRecords = function () {
             return $http.get(uRl + 'kyc-pubpvt/getAllKycRecord');
         };

         // Get all branch list of COPs
         this.getAllBranchListOfCOPs = function (userName) {
             return $http.get(uRl + 'kyc-pubpvt/getAllBranchListOfCOPs/' + userName);
         };

         // Get all branch list of BOM
         this.getAllBranchListOfBOM = function (userName) {
             return $http.get(uRl + 'kyc-pubpvt/getAllBranchListOfBOM/' + userName);
         };

         // Get a specific KYC record by ID
         this.get = function (id) {
             return $http.get(uRl + 'kyc-pubpvt/get/' + id);
         };

         // Delete a specific KYC record by ID
         this.delete = function (id) {
             return $http.delete(uRl + 'kyc-pubpvt/delete/' + id);
         };

         // Get all KYC records in JSON format
         this.getJsonFile = function () {
             return $http.get(uRl + 'kyc-pubpvt/getJsonFile');
         };

         // Get KYC records by Aadhar number
         this.getAadhar = function (adharNo) {
             return $http.get(uRl + 'kyc-pubpvt/getAadhar/' + adharNo);
         };

         // Get KYC records by code
         this.getRecordByCode = function (code) {
             return $http.get(uRl + 'kyc-pubpvt/getRecordByCode/' + code);
         };

         // Update an existing KYC record
         this.update = function (data) {
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
             return $http.put(uRl + 'kyc-pubpvt/update', formData, {
                 transformRequest: angular.identity,
                 headers: {'Content-Type': undefined}
             });
         };

         // Update an existing KYC record
         this.updateCOPs = function (data) {
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
             return $http.put(uRl + 'kyc-pubpvt/updateCOPs', formData, {
                 transformRequest: angular.identity,
                 headers: {'Content-Type': undefined}
             });
         };
     }]);
