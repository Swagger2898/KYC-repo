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
//import com.sahayogmultistate.it.kyc.model.KycSoleProprietorship;
//import com.sahayogmultistate.it.kyc.service.KycProcessorDispatcher;
//import com.sahayogmultistate.it.kyc.service.KycSoleProprietorshipService;
//import com.sahayogmultistate.it.kyc.service.SoleKycProcessor.SoleKycRequest;
//import java.io.IOException;
//import java.util.Date;
////import com.sahayogmultistate.it.kyc.service.KycSoleProprietorshipService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//import java.util.Optional;
//import java.util.TimeZone;
//import org.springframework.web.multipart.MultipartFile;
//
//@CrossOrigin
//@RestController
//@RequestMapping("/kyc-sole-proprietorship")
//public class KycSoleProprietorshipController {
//
//    @Autowired
//    private KycSoleProprietorshipService service;
//
//    @Autowired
//    private KycProcessorDispatcher dispatcher;
//
//    @PostMapping("/save")
//    public KycSoleProprietorship save(@RequestParam("idProof") MultipartFile[] idProof,
//            @RequestParam("addressProof") MultipartFile[] addressProof,
//            @RequestParam("pan") MultipartFile[] pan,
//            @RequestParam("entityProof") MultipartFile[] entityProof,
//            @RequestParam("otherDoc") MultipartFile[] otherDoc,
//            @RequestParam("clientForm") MultipartFile[] clientForm,
//            @RequestParam("accountType") String accountType,
//            @RequestParam("branchName") String branchName,
//            @RequestParam("applicant") String applicant,
//            @RequestParam("entity") String entity,
//            @RequestParam("mobileNo") long mobileNo,
//            @RequestParam("adharNo") String adharNo,
//            @RequestParam("status") String status,
//            @RequestParam("remark") String remark,
//            @RequestParam("idProofStatus") String idProofStatus,
//            @RequestParam("addressProofStatus") String addressProofStatus,
//            @RequestParam("entityProofStatus") String entityProofStatus,
//            @RequestParam("panStatus") String panStatus,
//            @RequestParam("otherDocStatus") String otherDocStatus,
//            @RequestParam("clientFormStatus") String clientFormStatus,
//            @RequestParam("approvedBy") String approvedBy,
//            @RequestParam("uploadedBy") String uploadedBy
//    ) throws IOException {
//        long currentTimeMillis = System.currentTimeMillis();
//        TimeZone indianTimeZone = TimeZone.getTimeZone("Asia/Kolkata");
//        TimeZone.setDefault(indianTimeZone);
//        Date date = new Date(currentTimeMillis);
//        String timeStamp = " Uploaded By - " + uploadedBy + " : " + date.toString();
//        SoleKycRequest request = new SoleKycRequest();
//        request.setIdProof(idProof);
//        request.setAddressProof(addressProof);
//        request.setPan(pan);
//        request.setEntityProof(entityProof);
//        request.setOtherDoc(otherDoc);
//        request.setClientForm(clientForm);
//        request.setAccountType(accountType);
//        request.setBranchName(branchName);
//        request.setApplicant(applicant);
//        request.setEntity(entity);
//        request.setMobileNo(mobileNo);
//        request.setAdharNo(adharNo);
//        request.setStatus(status);
//        request.setRemark(remark);
//        request.setDate(date);
//        request.setIdProofStatus(idProofStatus);
//        request.setAddressProofStatus(addressProofStatus);
//        request.setEntityProofStatus(entityProofStatus);
//        request.setPanStatus(panStatus);
//        request.setOtherDocStatus(otherDocStatus);
//        request.setClientFormStatus(clientFormStatus);
//        request.setApprovedBy(approvedBy);
//        request.setUploadedBy(uploadedBy);
//        request.setTimeStam(timeStamp);
//
//        return (KycSoleProprietorship) dispatcher.process("SOLE", request);
//    }
//
//    @GetMapping("getAllBranchListOfCOPs/{userName}")
//    public List<KycSoleProprietorship> getAllBranchListOfCOPs(@PathVariable String userName) {
//        List<KycSoleProprietorship> list = service.getAllKycForUserBranches(userName);
//        return list;
//    }
//
//    @GetMapping("getAllBranchListOfBOM/{userName}")
//    public List<KycSoleProprietorship> getAllBranchListOfBOM(@PathVariable String userName) {
//        List<KycSoleProprietorship> list = service.getAllKycForUserBranches(userName);
//        return list;
//    }
//
//    @GetMapping("get/{id}")
//    public KycSoleProprietorship get(@PathVariable long id) {
//        KycSoleProprietorship record = service.getKycRecordById(id);
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
////    public List<KycSoleProprietorship> getAll() {
////        return service.getAllKYCRecordsFromDB();
////    }
//    @GetMapping("getAllKycRecord")
//    public ResponseEntity<List<KycSoleProprietorship>> getAllKYCRecords() {
//        List<KycSoleProprietorship> kycRecords = service.getAllKYCRecordsFromDB();
//        return ResponseEntity.ok(kycRecords);
//    }
//
//    @GetMapping("getAadhar/{adharNo}")
//    public List<KycSoleProprietorship> getAadhar(@PathVariable String adharNo) {
//        return service.getKycRecordsByAadharNo(adharNo);
//    }
//
//    @GetMapping("getRecordByCode/{code}")
//    public KycSoleProprietorship getRecordByCode(@PathVariable String code) {
//        return service.findByCode(code);
//    }
//
//    @PutMapping("/update")
//    public ResponseEntity<KycSoleProprietorship> update(@RequestParam("idProof") MultipartFile[] idProof,
//            @RequestParam("addressProof") MultipartFile[] addressProof,
//            @RequestParam("pan") MultipartFile[] pan,
//            @RequestParam("entityProof") MultipartFile[] entityProof,
//            @RequestParam("otherDoc") MultipartFile[] otherDoc,
//            @RequestParam("clientForm") MultipartFile[] clientForm,
//            @RequestParam("id") long id,
//            @RequestParam("accountType") String accountType,
//            @RequestParam("branchName") String branchName,
//            @RequestParam("entity") String entity,
//            @RequestParam("applicant") String applicant,
//            @RequestParam("mobileNo") long mobileNo,
//            @RequestParam("adharNo") String adharNo,
//            @RequestParam("status") String status,
//            @RequestParam("remark") String remark,
//            @RequestParam("idProofStatus") String idProofStatus,
//            @RequestParam("addressProofStatus") String addressProofStatus,
//            @RequestParam("panStatus") String panStatus,
//            @RequestParam("entityProofStatus") String entityProofStatus,
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
//            KycSoleProprietorship record = service.update(idProof, addressProof, pan,
//                    entityProof, otherDoc, clientForm, id, accountType, branchName, entity,
//                    applicant, mobileNo, adharNo, status, remark, date, idProofStatus,
//                    addressProofStatus, panStatus, entityProofStatus, otherDocStatus,
//                    clientFormStatus, approvedBy, uploadedBy, timeStamp);
//            return ResponseEntity.ok(record);
//        } catch (RuntimeException e) {
//            return ResponseEntity.notFound().build();
//        }
//    }
//
//    @PutMapping("/updateCOPs")
//    public ResponseEntity<KycSoleProprietorship> updateCOPs(@RequestParam("id") long id,
//            @RequestParam("accountType") String accountType,
//            @RequestParam("branchName") String branchName,
//            @RequestParam("entity") String entity,
//            @RequestParam("applicant") String applicant,
//            @RequestParam("mobileNo") long mobileNo,
//            @RequestParam("adharNo") String adharNo,
//            @RequestParam("status") String status,
//            @RequestParam("remark") String remark,
//            @RequestParam("idProofStatus") String idProofStatus,
//            @RequestParam("addressProofStatus") String addressProofStatus,
//            @RequestParam("panStatus") String panStatus,
//            @RequestParam("entityProofStatus") String entityProofStatus,
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
//            KycSoleProprietorship record = service.update(id, accountType, branchName, entity,
//                    applicant, mobileNo, adharNo, status, remark, date, idProofStatus,
//                    addressProofStatus, panStatus, entityProofStatus, otherDocStatus,
//                    clientFormStatus, approvedBy, uploadedBy, timeStamp);
//            return ResponseEntity.ok(record);
//        } catch (RuntimeException e) {
//            return ResponseEntity.notFound().build();
//        }
//    }
//
//}
