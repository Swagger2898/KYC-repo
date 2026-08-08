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
//import com.sahayogmultistate.it.kyc.model.KycPubPvt;
//import com.sahayogmultistate.it.kyc.service.KycPubPvtService;
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
//@RequestMapping("/kyc-pubpvt")
//public class KycPubPvtController {
//
//    @Autowired
//    private KycPubPvtService service;
//
//    @PostMapping("/save")
//    public KycPubPvt save(@RequestParam("idProof") MultipartFile[] idProof,
//            @RequestParam("addressProof") MultipartFile[] addressProof,
//            @RequestParam("pan") MultipartFile[] pan,
//            @RequestParam("companyDoc") MultipartFile[] companyDoc,
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
//            @RequestParam("companyDocStatus") String companyDocStatus,
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
//        KycPubPvt record = service.add(idProof, addressProof, pan, companyDoc,
//                otherDoc, clientForm, accountType, branchName, entity,
//                applicantFirst, applicantSecond, applicantThird,
//                mobileNo, adharNoFirst, adharNoSecond, adharNoThird,
//                status, remark, date, idProofStatus, addressProofStatus,
//                panStatus, companyDocStatus, otherDocStatus, clientFormStatus,
//                approvedBy, uploadedBy, timeStamp);
//
//        return record;
//    }
//
//    @GetMapping("getAllBranchListOfCOPs/{userName}")
//    public List<KycPubPvt> getAllBranchListOfCOPs(@PathVariable String userName) {
//        List<KycPubPvt> list = service.getAllKycForUserBranches(userName);
//        return list;
//    }
//
//    @GetMapping("getAllBranchListOfBOM/{userName}")
//    public List<KycPubPvt> getAllBranchListOfBOM(@PathVariable String userName) {
//        List<KycPubPvt> list = service.getAllKycForUserBranches(userName);
//        return list;
//    }
//
//    @GetMapping("get/{id}")
//    public KycPubPvt get(@PathVariable long id) {
//        KycPubPvt record = service.getKycRecordById(id);
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
////    public List<KycPubPvt> getAll() {
////        return service.getAllKYCRecordsFromDB();
////    }
//    @GetMapping("getAllKycRecord")
//    public ResponseEntity<List<KycPubPvt>> getAllKYCRecords() {
//        List<KycPubPvt> kycRecords = service.getAllKYCRecordsFromDB();
//        return ResponseEntity.ok(kycRecords);
//    }
//
//    @GetMapping("getAadhar/{adharNo}")
//    public List<KycPubPvt> getAadhar(@PathVariable String adharNo) {
//        return service.getKycRecordsByAadharNo(adharNo);
//    }
//
//    @GetMapping("getRecordByCode/{code}")
//    public KycPubPvt getRecordByCode(@PathVariable String code) {
//        return service.findByCode(code);
//    }
//
//    @PutMapping("/update")
//    public ResponseEntity<KycPubPvt> update(@RequestParam("idProof") MultipartFile[] idProof,
//            @RequestParam("addressProof") MultipartFile[] addressProof,
//            @RequestParam("pan") MultipartFile[] pan,
//            @RequestParam("companyDoc") MultipartFile[] companyDoc,
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
//            @RequestParam("companyDocStatus") String companyDocStatus,
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
//            KycPubPvt record = service.update(idProof, addressProof, pan, companyDoc,
//                    otherDoc, clientForm, id, accountType, branchName, entity,
//                    applicantFirst, applicantSecond, applicantThird,
//                    mobileNo, adharNoFirst, adharNoSecond, adharNoThird,
//                    status, remark, date, idProofStatus, addressProofStatus,
//                    panStatus, companyDocStatus, otherDocStatus, clientFormStatus,
//                    approvedBy, uploadedBy, timeStamp);
//            return ResponseEntity.ok(record);
//        } catch (RuntimeException e) {
//            return ResponseEntity.notFound().build();
//        }
//    }
//
//    @PutMapping("/updateCOPs")
//    public ResponseEntity<KycPubPvt> updateCOPs(@RequestParam("id") long id,
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
//            @RequestParam("companyDocStatus") String companyDocStatus,
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
//            KycPubPvt record = service.update(id, accountType, branchName, entity,
//                    applicantFirst, applicantSecond, applicantThird,
//                    mobileNo, adharNoFirst, adharNoSecond, adharNoThird,
//                    status, remark, date, idProofStatus, addressProofStatus,
//                    panStatus, companyDocStatus, otherDocStatus, clientFormStatus,
//                    approvedBy, uploadedBy, timeStamp);
//            return ResponseEntity.ok(record);
//        } catch (RuntimeException e) {
//            return ResponseEntity.notFound().build();
//        }
//    }
//}
