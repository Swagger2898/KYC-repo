 var app = angular.module('kycSoleProprietorshipApp', []);

// Service for interacting with the KycSoleProprietorshipController API
 app.service('kycSoleProprietorshipService', ['$http', function ($http) {

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

             return $http.post(uRl + 'kyc-sole-proprietorship/save', formData, {
                 transformRequest: angular.identity,
                 headers: {'Content-Type': undefined}
             });
         };
         
         // Get all KYC records
         this.getAllKYCRecords = function () {
             return $http.get(uRl + 'kyc-sole-proprietorship/getAllKycRecord');
         };

         // Get all branch list of COPs
         this.getAllBranchListOfCOPs = function (userName) {
             return $http.get(uRl + 'kyc-sole-proprietorship/getAllBranchListOfCOPs/' + userName);
         };

         // Get all branch list of BOM
         this.getAllBranchListOfBOM = function (userName) {
             return $http.get(uRl + 'kyc-sole-proprietorship/getAllBranchListOfBOM/' + userName);
         };

         // Get a specific KYC record by ID
         this.get = function (id) {
             return $http.get(uRl + 'kyc-sole-proprietorship/get/' + id);
         };

         // Delete a specific KYC record by ID
         this.delete = function (id) {
             return $http.delete(uRl + 'kyc-sole-proprietorship/delete/' + id);
         };

         // Get all KYC records in JSON format
         this.getJsonFile = function () {
             return $http.get(uRl + 'kyc-sole-proprietorship/getJsonFile');
         };

         // Get KYC records by Aadhar number
         this.getAadhar = function (adharNo) {
             return $http.get(uRl + 'kyc-sole-proprietorship/getAadhar/' + adharNo);
         };

         // Get KYC records by code
         this.getRecordByCode = function (code) {
             return $http.get(uRl + 'kyc-sole-proprietorship/getRecordByCode/' + code);
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

             return $http.put(uRl + 'kyc-sole-proprietorship/update', formData, {
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

             return $http.put(uRl + 'kyc-sole-proprietorship/updateCOPs', formData, {
                 transformRequest: angular.identity,
                 headers: {'Content-Type': undefined}
             });
         };
     }]);
