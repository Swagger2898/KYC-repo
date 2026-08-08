 var app = angular.module('kycJointSavingApp', []);

// Define the service to handle API calls
 app.service('kycJointSavingService', ['$http', function ($http) {

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

             return $http.post(uRl + 'kyc-joint-saving/save', formData, {
                 transformRequest: angular.identity,
                 headers: {'Content-Type': undefined}
             });
         };
         
         // Get all KYC records
         this.getAllKYCRecords = function () {
             return $http.get(uRl + 'kyc-joint-saving/getAllKycRecord');
         };

         // Get all branch list of COPs
         this.getAllBranchListOfCOPs = function (userName) {
             return $http.get(uRl + 'kyc-joint-saving/getAllBranchListOfCOPs/' + userName);
         };

         // Get all branch list of BOM
         this.getAllBranchListOfBOM = function (userName) {
             return $http.get(uRl + 'kyc-joint-saving/getAllBranchListOfBOM/' + userName);
         };

         // Get KYC record by ID
         this.get = function (id) {
             return $http.get(uRl + 'kyc-joint-saving/get/' + id);
         };

         // Delete KYC record by ID
         this.delete = function (id) {
             return $http.delete(uRl + 'kyc-joint-saving/delete/' + id);
         };

         // Get all KYC records in JSON
         this.getJsonFile = function () {
             return $http.get(uRl + 'kyc-joint-saving/getJsonFile');
         };

         // Get KYC records by Aadhar number
         this.getAadhar = function (adharNo) {
             return $http.get(uRl + 'kyc-joint-saving/getAadhar/' + adharNo);
         };

         // Get KYC records by code
         this.getRecordByCode = function (code) {
             return $http.get(uRl + 'kyc-joint-saving/getRecordByCode/' + code);
         };

         // Update KYC record
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

             return $http.put(uRl + 'kyc-joint-saving/update', formData, {
                 transformRequest: angular.identity,
                 headers: {'Content-Type': undefined}
             });
         };
         // Update KYC record
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

             return $http.put(uRl + 'kyc-joint-saving/updateCOPs', formData, {
                 transformRequest: angular.identity,
                 headers: {'Content-Type': undefined}
             });
         };
     }]);
