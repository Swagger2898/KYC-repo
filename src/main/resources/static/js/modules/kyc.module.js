 var app = angular.module('kycApp', []);
// Service for interacting with the KycTascController API
 app.service('kycService', ['$http', function ($http) {

         var protocal = window.location.protocol;
         var host = window.location.host;
         var uRl = protocal + "//" + host + "/";
         // Create a new KYC record
         this.createKYCRecord = function (kycRecord) {
             return $http.post(uRl + 'kyc', kycRecord);
         };
         // Get a KYC record by ID
         this.getKYCRecordById = function (id) {
             return $http.get(uRl + 'kyc/' + id);
         };
         // InActive KYC record
         this.kycRecordInActive = function (id, accessingId) {
             return $http.get(uRl + 'kyc/kycRecordInActive/' + id + "/" + accessingId);
         };
         // Active KYC record
         this.kycRecordActive = function (id, accessingId) {
             return $http.get(uRl + 'kyc/kycRecordActive/' + id + "/" + accessingId);
         };
//         // Get all KYC records
         this.getAllKycRecords = function () {
             return $http.get(uRl + 'kyc');
         };
         // Get all KYC records
         this.getAllKYCRecords = function (userName) {
             return $http.get(uRl + 'kyc/getList/' + userName);
         };
         // Update a KYC record
         this.updateKYCRecord = function (id, kycRecord) {
             return $http.put(uRl + 'kyc/' + id, kycRecord);
         };
         // Delete a KYC record
         this.deleteKYCRecord = function (id) {
             return $http.delete(uRl + 'kyc/' + id);
         };
         // Get KYC records by Aadhar number
         this.getKycRecordsByAadharNo = function (adharNo) {
             return $http.get(uRl + 'kyc/getAadhar/' + adharNo);
         };
     }]);
