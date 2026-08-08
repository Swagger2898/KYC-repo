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
//import com.sahayogmultistate.it.kyc.model.KycTasc;
//import com.sahayogmultistate.it.kyc.service.KycTascService;
//import java.io.IOException;
//import java.util.Date;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//import java.util.Optional;
//import java.util.TimeZone;
//import org.springframework.web.multipart.MultipartFile;
//
//@RestController
//@RequestMapping("/kyc-tasc")
//public class KycTascController {
//
//    @Autowired
//    private KycTascService service;
//
//    @PostMapping("/save")
//    public KycTasc save(@RequestParam("idProof") MultipartFile[] idProof,
//            @RequestParam("addressProof") MultipartFile[] addressProof,
//            @RequestParam("pan") MultipartFile[] pan,
//            @RequestParam("tascDoc") MultipartFile[] tascDoc,
//            @RequestParam("otherDoc") MultipartFile[] otherDoc,
//            @RequestParam("clientForm") MultipartFile[] clientForm,
//            @RequestParam("accountType") String accountType,
//            @RequestParam("branchName") String branchName,
//            @RequestParam("entity") String entity,
//            @RequestParam("applicantFirst") String applicantFirst,
//            @RequestParam("applicantSecond") String applicantSecond,
//            @RequestParam("applicantThird") String applicantThird,
//            @RequestParam("applicantFourth") String applicantFourth,
//            @RequestParam("applicantFifth") String applicantFifth,
//            @RequestParam("mobileNo") long mobileNo,
//            @RequestParam("adharNoFirst") String adharNoFirst,
//            @RequestParam("adharNoSecond") String adharNoSecond,
//            @RequestParam("adharNoThird") String adharNoThird,
//            @RequestParam("adharNoFourth") String adharNoFourth,
//            @RequestParam("adharNoFifth") String adharNoFifth,
//            @RequestParam("status") String status,
//            @RequestParam("remark") String remark,
//            @RequestParam("idProofStatus") String idProofStatus,
//            @RequestParam("addressProofStatus") String addressProofStatus,
//            @RequestParam("panStatus") String panStatus,
//            @RequestParam("tascDocStatus") String tascDocStatus,
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
//        KycTasc record = service.add(idProof, addressProof, pan, tascDoc,
//                otherDoc, clientForm, accountType, branchName, entity,
//                applicantFirst, applicantSecond, applicantThird,
//                applicantFourth, applicantFifth, mobileNo, adharNoFirst,
//                adharNoSecond, adharNoThird, adharNoFourth, adharNoFifth,
//                status, remark, date, idProofStatus, addressProofStatus,
//                panStatus, tascDocStatus, otherDocStatus, clientFormStatus,
//                approvedBy, uploadedBy, timeStamp);
//
//        return record;
//    }
//
//    @GetMapping("getAllBranchListOfCOPs/{userName}")
//    public List<KycTasc> getAllBranchListOfCOPs(@PathVariable String userName) {
//        List<KycTasc> list = service.getAllKycForUserBranches(userName);
//        return list;
//    }
//
//    @GetMapping("getAllBranchListOfBOM/{userName}")
//    public List<KycTasc> getAllBranchListOfBOM(@PathVariable String userName) {
//        List<KycTasc> list = service.getAllKycForUserBranches(userName);
//        return list;
//    }
//
//    @GetMapping("get/{id}")
//    public KycTasc get(@PathVariable long id) {
//        KycTasc record = service.getKycRecordById(id);
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
////    public List<KycTasc> getAll() {
////        return service.getAllKYCRecordsFromDB();
////    }
//    @GetMapping("getAllKycRecord")
//    public ResponseEntity<List<KycTasc>> getAllKYCRecords() {
//        List<KycTasc> kycRecords = service.getAllKYCRecordsFromDB();
//        return ResponseEntity.ok(kycRecords);
//    }
//
//    @GetMapping("getAadhar/{adharNo}")
//    public List<KycTasc> getAadhar(@PathVariable String adharNo) {
//        return service.getKycRecordsByAadharNo(adharNo);
//    }
//
//    @GetMapping("getRecordByCode/{code}")
//    public KycTasc getRecordByCode(@PathVariable String code) {
//        return service.findByCode(code);
//    }
//
//    @PutMapping("/update")
//    public ResponseEntity<KycTasc> update(@RequestParam("idProof") MultipartFile[] idProof,
//            @RequestParam("addressProof") MultipartFile[] addressProof,
//            @RequestParam("pan") MultipartFile[] pan,
//            @RequestParam("tascDoc") MultipartFile[] tascDoc,
//            @RequestParam("otherDoc") MultipartFile[] otherDoc,
//            @RequestParam("clientForm") MultipartFile[] clientForm,
//            @RequestParam("id") long id,
//            @RequestParam("accountType") String accountType,
//            @RequestParam("branchName") String branchName,
//            @RequestParam("entity") String entity,
//            @RequestParam("applicantFirst") String applicantFirst,
//            @RequestParam("applicantSecond") String applicantSecond,
//            @RequestParam("applicantThird") String applicantThird,
//            @RequestParam("applicantFourth") String applicantFourth,
//            @RequestParam("applicantFifth") String applicantFifth,
//            @RequestParam("mobileNo") long mobileNo,
//            @RequestParam("adharNoFirst") String adharNoFirst,
//            @RequestParam("adharNoSecond") String adharNoSecond,
//            @RequestParam("adharNoThird") String adharNoThird,
//            @RequestParam("adharNoFourth") String adharNoFourth,
//            @RequestParam("adharNoFifth") String adharNoFifth,
//            @RequestParam("status") String status,
//            @RequestParam("remark") String remark,
//            @RequestParam("idProofStatus") String idProofStatus,
//            @RequestParam("addressProofStatus") String addressProofStatus,
//            @RequestParam("panStatus") String panStatus,
//            @RequestParam("tascDocStatus") String tascDocStatus,
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
//            KycTasc record = service.update(idProof, addressProof, pan, tascDoc,
//                    otherDoc, clientForm, id, accountType, branchName, entity,
//                    applicantFirst, applicantSecond, applicantThird,
//                    applicantFourth, applicantFifth, mobileNo, adharNoFirst,
//                    adharNoSecond, adharNoThird, adharNoFourth, adharNoFifth,
//                    status, remark, date, idProofStatus, addressProofStatus,
//                    panStatus, tascDocStatus, otherDocStatus, clientFormStatus,
//                    approvedBy, uploadedBy, timeStamp);
//            return ResponseEntity.ok(record);
//        } catch (RuntimeException e) {
//            return ResponseEntity.notFound().build();
//        }
//    }
//
//    @PutMapping("/updateCOPs")
//    public ResponseEntity<KycTasc> updateCOPs(@RequestParam("id") long id,
//            @RequestParam("accountType") String accountType,
//            @RequestParam("branchName") String branchName,
//            @RequestParam("entity") String entity,
//            @RequestParam("applicantFirst") String applicantFirst,
//            @RequestParam("applicantSecond") String applicantSecond,
//            @RequestParam("applicantThird") String applicantThird,
//            @RequestParam("applicantFourth") String applicantFourth,
//            @RequestParam("applicantFifth") String applicantFifth,
//            @RequestParam("mobileNo") long mobileNo,
//            @RequestParam("adharNoFirst") String adharNoFirst,
//            @RequestParam("adharNoSecond") String adharNoSecond,
//            @RequestParam("adharNoThird") String adharNoThird,
//            @RequestParam("adharNoFourth") String adharNoFourth,
//            @RequestParam("adharNoFifth") String adharNoFifth,
//            @RequestParam("status") String status,
//            @RequestParam("remark") String remark,
//            @RequestParam("idProofStatus") String idProofStatus,
//            @RequestParam("addressProofStatus") String addressProofStatus,
//            @RequestParam("panStatus") String panStatus,
//            @RequestParam("tascDocStatus") String tascDocStatus,
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
//            KycTasc record = service.update(id, accountType, branchName, entity,
//                    applicantFirst, applicantSecond, applicantThird,
//                    applicantFourth, applicantFifth, mobileNo, adharNoFirst,
//                    adharNoSecond, adharNoThird, adharNoFourth, adharNoFifth,
//                    status, remark, date, idProofStatus, addressProofStatus,
//                    panStatus, tascDocStatus, otherDocStatus, clientFormStatus,
//                    approvedBy, uploadedBy, timeStamp);
//            return ResponseEntity.ok(record);
//        } catch (RuntimeException e) {
//            return ResponseEntity.notFound().build();
//        }
//    }
//}
