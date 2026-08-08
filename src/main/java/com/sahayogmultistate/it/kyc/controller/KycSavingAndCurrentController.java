/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.sahayogmultistate.it.kyc.controller;

/**
 *
 * @author ritik
 */
import com.sahayogmultistate.it.kyc.model.KycAudit;
import com.sahayogmultistate.it.kyc.model.KycSavingAndCurrent;
import com.sahayogmultistate.it.kyc.model.KycStatus;
import com.sahayogmultistate.it.kyc.repository.KycSavingAndCurrentRepository;
import com.sahayogmultistate.it.kyc.service.KycRequest;
import com.sahayogmultistate.it.kyc.service.KycSavingAndCurrentService;
import java.io.IOException;
import java.util.Date;

import com.sahayogmultistate.it.kyc.service.KycVerificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.TimeZone;
import org.springframework.web.multipart.MultipartFile;



    @RestController
    @RequestMapping("/kyc")
    public class KycSavingAndCurrentController {

        @Autowired
        private KycSavingAndCurrentService service;

        @Autowired
        private KycVerificationService kservice;

        @Autowired
        private KycSavingAndCurrentRepository repository;



        @GetMapping("/test")
        public String test() {

            KycSavingAndCurrent record = new KycSavingAndCurrent();
            record.setStatus(KycStatus.DRAFT);
            record.setVerificationAttempts(0);
            record.setMaxVerificationAttempts(3);

            record = repository.save(record);

            kservice.verifyAsync(record.getId());

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            System.out.println("AUTHORITIES: " + auth.getAuthorities());

            return "OK";
        }

        // ===================== SAVE =====================
        @PostMapping("/save")
        public KycSavingAndCurrent save(
                @RequestParam MultipartFile[] idProof,
                @RequestParam MultipartFile[] addressProof,
                @RequestParam MultipartFile[] pan,
                @RequestParam MultipartFile[] otherDoc,
                @RequestParam MultipartFile[] clientForm,
                @RequestParam String accountType,
                @RequestParam String branchName,
                @RequestParam String applicant,
                @RequestParam String mobileNo,
                @RequestParam String adharNo,
                @RequestParam(required = false) String remark
        ) throws IOException {

            KycRequest request = new KycRequest(
                    idProof, addressProof, pan, otherDoc, clientForm,
                    accountType, branchName, applicant, mobileNo, adharNo, remark
            );

            return service.add(request);
        }

        // ===================== UPDATE =====================
        @PutMapping("/update/{id}")
        public KycSavingAndCurrent update(
                @PathVariable long id,
                @RequestParam MultipartFile[] idProof,
                @RequestParam MultipartFile[] addressProof,
                @RequestParam MultipartFile[] pan,
                @RequestParam MultipartFile[] otherDoc,
                @RequestParam MultipartFile[] clientForm,
                @RequestParam String accountType,
                @RequestParam String branchName,
                @RequestParam String applicant,
                @RequestParam String mobileNo,
                @RequestParam String adharNo,
                @RequestParam(required = false) String remark
        ) throws IOException {

            KycRequest request = new KycRequest(
                    idProof, addressProof, pan, otherDoc, clientForm,
                    accountType, branchName, applicant, mobileNo, adharNo, remark
            );

            return service.update(id, request);
        }

        // ===================== SUBMIT =====================
        @PostMapping("/{id}/submit")
        public KycSavingAndCurrent submit(@PathVariable long id) {
            return service.submit(id);
        }

        // ===================== APPROVE =====================
        @PostMapping("/{id}/approve")
        public KycSavingAndCurrent approve(@PathVariable long id) {
            return service.approve(id);
        }

        // ===================== REJECT =====================
        @PostMapping("/{id}/reject")
        public KycSavingAndCurrent reject(
                @PathVariable long id,
                @RequestParam String reason
        ) {
            return service.reject(id, reason);
        }

        // ===================== GET =====================
        @GetMapping("/{id}")
        public KycSavingAndCurrent get(@PathVariable long id) {
            return service.getKycRecordByIdForCurrentUser(id);  // was getKycRecordById
        }

        // ===================== GET ALL =====================
        @GetMapping
        public List<KycSavingAndCurrent> getAll() {
            return service.getAllKycRecordsForCurrentUser();     // was getAllKycRecords
        }

        // ===================== DELETE =====================
        @DeleteMapping("/{id}")
        public String delete(@PathVariable long id) {
            return service.delete(id);
        }

        // ===================== AUDIT =====================
        @GetMapping("/{id}/audit")
        public List<KycAudit> getAudit(@PathVariable long id) {
            return service.getAuditHistory(id);
        }
    }
