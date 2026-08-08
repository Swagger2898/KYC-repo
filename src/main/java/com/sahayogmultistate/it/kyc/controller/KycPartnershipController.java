///*
// * To change this license header, choose License Headers in Project Properties.
// * To change this template file, choose Tools | Templates
// * and open the template in the editor.
// */
//package com.sahayogmultistate.it.kyc.controller;
//
///**
// *
// * @author ritik
// */
//import com.sahayogmultistate.it.kyc.model.KycPartnership;
//import com.sahayogmultistate.it.kyc.service.KycPartnershipService;
//import java.io.IOException;
//import java.util.Date;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//import java.util.TimeZone;
//import org.springframework.web.multipart.MultipartFile;
//
//@RestController
//@RequestMapping("/kyc-partnership")
//public class KycPartnershipController {
//
//    @Autowired
//    private KycPartnershipService service;
//
//    @PostMapping("/save")
//    public KycPartnership save(@RequestParam("idProof") MultipartFile[] idProof,
//            @RequestParam("addressProof") MultipartFile[] addressProof,
//            @RequestParam("pan") MultipartFile[] pan,
//            @RequestParam("partnershipDoc") MultipartFile[] partnershipDoc,
//            @RequestParam("otherDoc") MultipartFile[] otherDoc,
//            @RequestParam("clientForm") MultipartFile[] clientForm,
//            @RequestParam("accountType") String accountType,
//            @RequestParam("branchName") String branchName,
//            @RequestParam("entity") String entity,
//            @RequestParam("applicantFirst") String applicantFirst,
//            @RequestParam("applicantSecond") String applicantSecond,
//            @RequestParam("applicantThird") String applicantThird,
//            @RequestParam("mobileNo") long mobileNo,
//            @RequestParam("adharNoFirst") String adharNoFirst,
//            @RequestParam("adharNoSecond") String adharNoSecond,
//            @RequestParam("adharNoThird") String adharNoThird,
//            @RequestParam("status") String status,
//            @RequestParam("remark") String remark,
//            @RequestParam("idProofStatus") String idProofStatus,
//            @RequestParam("addressProofStatus") String addressProofStatus,
//            @RequestParam("panStatus") String panStatus,
//            @RequestParam("partnershipDocStatus") String partnershipDocStatus,
//            @RequestParam("otherDocStatus") String otherDocStatus,
//            @RequestParam("clientFormStatus") String clientFormStatus,
//            @RequestParam("approvedBy") String approvedBy,
//            @RequestParam("uploadedBy") String uploadedBy
//    ) throws IOException {
//
//        long currentTimeMillis = System.currentTimeMillis();
//        TimeZone indianTimeZone = TimeZone.getTimeZone("Asia/Kolkata");
//        TimeZone.setDefault(indianTimeZone);
//        Date date = new Date(currentTimeMillis);
//        String timeStamp = " Uploaded By - " + uploadedBy + " : " + date.toString();
//        KycPartnership record = service.add(idProof, addressProof, pan, partnershipDoc,
//                otherDoc, clientForm, accountType, branchName, entity,
//                applicantFirst, applicantSecond, applicantThird,
//                mobileNo, adharNoFirst, adharNoSecond, adharNoThird,
//                status, remark, date, idProofStatus, addressProofStatus,
//                panStatus, partnershipDocStatus, otherDocStatus, clientFormStatus,
//                approvedBy, uploadedBy, timeStamp);
//
//        return record;
//    }
//
//    @GetMapping("getAllBranchListOfCOPs/{userName}")
//    public List<KycPartnership> getAllBranchListOfCOPs(@PathVariable String userName) {
//        List<KycPartnership> list = service.getAllKycForUserBranches(userName);
//        return list;
//    }
//
//    @GetMapping("getAllBranchListOfBOM/{userName}")
//    public List<KycPartnership> getAllBranchListOfBOM(@PathVariable String userName) {
//        List<KycPartnership> list = service.getAllKycForUserBranches(userName);
//        return list;
//    }
//
//    @GetMapping("get/{id}")
//    public KycPartnership get(@PathVariable long id) {
//        KycPartnership record = service.getKycRecordById(id);
//        return record;
//    }
//
//    @DeleteMapping("delete/{id}")
//    public ResponseEntity<Void> delete(@PathVariable long id) {
//        service.delete(id);
//        return ResponseEntity.noContent().build();
//    }
//
//    @GetMapping("getJsonFile")
//    public String getJsonFile() {
//        return service.getAllKycRecord_In_Json();
//    }
//
////    @GetMapping
////    public List<KycPartnership> getAll() {
////        return service.getAllKYCRecordsFromDB();
////    }
//    @GetMapping("getAllKycRecord")
//    public ResponseEntity<List<KycPartnership>> getAllKYCRecords() {
//        List<KycPartnership> kycRecords = service.getAllKYCRecordsFromDB();
//        return ResponseEntity.ok(kycRecords);
//    }
//
//    @GetMapping("getAadhar/{adharNo}")
//    public List<KycPartnership> getAadhar(@PathVariable String adharNo) {
//        return service.getKycRecordsByAadharNo(adharNo);
//    }
//
//    @GetMapping("getRecordByCode/{code}")
//    public KycPartnership getRecordByCode(@PathVariable String code) {
//        return service.findByCode(code);
//    }
//
//    @PutMapping("/update")
//    public ResponseEntity<KycPartnership> update(@RequestParam("idProof") MultipartFile[] idProof,
//            @RequestParam("addressProof") MultipartFile[] addressProof,
//            @RequestParam("pan") MultipartFile[] pan,
//            @RequestParam("partnershipDoc") MultipartFile[] partnershipDoc,
//            @RequestParam("otherDoc") MultipartFile[] otherDoc,
//            @RequestParam("clientForm") MultipartFile[] clientForm,
//            @RequestParam("id") long id,
//            @RequestParam("accountType") String accountType,
//            @RequestParam("branchName") String branchName,
//            @RequestParam("entity") String entity,
//            @RequestParam("applicantFirst") String applicantFirst,
//            @RequestParam("applicantSecond") String applicantSecond,
//            @RequestParam("applicantThird") String applicantThird,
//            @RequestParam("mobileNo") long mobileNo,
//            @RequestParam("adharNoFirst") String adharNoFirst,
//            @RequestParam("adharNoSecond") String adharNoSecond,
//            @RequestParam("adharNoThird") String adharNoThird,
//            @RequestParam("status") String status,
//            @RequestParam("remark") String remark,
//            @RequestParam("idProofStatus") String idProofStatus,
//            @RequestParam("addressProofStatus") String addressProofStatus,
//            @RequestParam("panStatus") String panStatus,
//            @RequestParam("partnershipDocStatus") String partnershipDocStatus,
//            @RequestParam("otherDocStatus") String otherDocStatus,
//            @RequestParam("clientFormStatus") String clientFormStatus,
//            @RequestParam("approvedBy") String approvedBy,
//            @RequestParam("uploadedBy") String uploadedBy
//    ) throws IOException {
//        try {
//            long currentTimeMillis = System.currentTimeMillis();
//            TimeZone indianTimeZone = TimeZone.getTimeZone("Asia/Kolkata");
//            TimeZone.setDefault(indianTimeZone);
//            Date date = new Date(currentTimeMillis);
//            String timeStamp = "";
//            if ("Approved".equals(status)) {
//                timeStamp = " Approved By - " + approvedBy + " : " + date.toString();
//            } else {
//                timeStamp = status + " : " + date.toString();
//            }
//            KycPartnership record = service.update(idProof, addressProof, pan, partnershipDoc,
//                    otherDoc, clientForm, id, accountType, branchName, entity,
//                    applicantFirst, applicantSecond, applicantThird,
//                    mobileNo, adharNoFirst, adharNoSecond, adharNoThird,
//                    status, remark, date, idProofStatus, addressProofStatus,
//                    panStatus, partnershipDocStatus, otherDocStatus, clientFormStatus,
//                    approvedBy, uploadedBy, timeStamp);
//            return ResponseEntity.ok(record);
//        } catch (RuntimeException e) {
//            return ResponseEntity.notFound().build();
//        }
//    }
//
//    @PutMapping("/updateCOPs")
//    public ResponseEntity<KycPartnership> updateCOPs(@RequestParam("id") long id,
//            @RequestParam("accountType") String accountType,
//            @RequestParam("branchName") String branchName,
//            @RequestParam("entity") String entity,
//            @RequestParam("applicantFirst") String applicantFirst,
//            @RequestParam("applicantSecond") String applicantSecond,
//            @RequestParam("applicantThird") String applicantThird,
//            @RequestParam("mobileNo") long mobileNo,
//            @RequestParam("adharNoFirst") String adharNoFirst,
//            @RequestParam("adharNoSecond") String adharNoSecond,
//            @RequestParam("adharNoThird") String adharNoThird,
//            @RequestParam("status") String status,
//            @RequestParam("remark") String remark,
//            @RequestParam("idProofStatus") String idProofStatus,
//            @RequestParam("addressProofStatus") String addressProofStatus,
//            @RequestParam("panStatus") String panStatus,
//            @RequestParam("partnershipDocStatus") String partnershipDocStatus,
//            @RequestParam("otherDocStatus") String otherDocStatus,
//            @RequestParam("clientFormStatus") String clientFormStatus,
//            @RequestParam("approvedBy") String approvedBy,
//            @RequestParam("uploadedBy") String uploadedBy
//    ) throws IOException {
//        try {
//            long currentTimeMillis = System.currentTimeMillis();
//            TimeZone indianTimeZone = TimeZone.getTimeZone("Asia/Kolkata");
//            TimeZone.setDefault(indianTimeZone);
//            Date date = new Date(currentTimeMillis);
//            String timeStamp = "";
//            if ("Approved".equals(status)) {
//                timeStamp = " Approved By - " + approvedBy + " : " + date.toString();
//            } else {
//                timeStamp = status + " : " + date.toString();
//            }
//            KycPartnership record = service.update(id, accountType, branchName, entity,
//                    applicantFirst, applicantSecond, applicantThird,
//                    mobileNo, adharNoFirst, adharNoSecond, adharNoThird,
//                    status, remark, date, idProofStatus, addressProofStatus,
//                    panStatus, partnershipDocStatus, otherDocStatus, clientFormStatus,
//                    approvedBy, uploadedBy, timeStamp);
//            return ResponseEntity.ok(record);
//        } catch (RuntimeException e) {
//            return ResponseEntity.notFound().build();
//        }
//    }
//}
