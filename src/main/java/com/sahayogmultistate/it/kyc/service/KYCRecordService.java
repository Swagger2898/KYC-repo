///*
// * To change this license header, choose License Headers in Project Properties.
// * To change this template file, choose Tools | Templates
// * and open the template in the editor.
// */
//package com.sahayogmultistate.it.kyc.service;
//
//import com.sahayogmultistate.it.kyc.model.BranchAccess;
//import com.sahayogmultistate.it.kyc.model.KYCRecord;
//import com.sahayogmultistate.it.kyc.model.KycStatus;
//import com.sahayogmultistate.it.kyc.model.OldKycRecord;
//import com.sahayogmultistate.it.kyc.repository.IKYCRecordRepository;
//import java.util.ArrayList;
//import java.util.Arrays;
//import java.util.Date;
//import java.util.EnumMap;
//import java.util.EnumSet;
//import java.util.List;
//import java.util.Map;
//import java.util.Optional;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.data.domain.Sort;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//import org.springframework.web.client.RestTemplate;
//import org.springframework.web.util.UriComponentsBuilder;
//
///**
// *
// * @author HP
// */
//@Service
//public class KYCRecordService {
//
//    private static final Map<KycStatus, EnumSet<KycStatus>> ALLOWED_TRANSITIONS = new EnumMap<>(KycStatus.class);
//
//    static {
//        ALLOWED_TRANSITIONS.put(KycStatus.DRAFT, EnumSet.of(KycStatus.SUBMITTED));
//        ALLOWED_TRANSITIONS.put(KycStatus.SUBMITTED, EnumSet.of(KycStatus.UNDER_REVIEW));
//        ALLOWED_TRANSITIONS.put(KycStatus.UNDER_REVIEW, EnumSet.of(KycStatus.APPROVED, KycStatus.REJECTED, KycStatus.REWORK_REQUIRED));
//        ALLOWED_TRANSITIONS.put(KycStatus.REWORK_REQUIRED, EnumSet.of(KycStatus.SUBMITTED));
//        ALLOWED_TRANSITIONS.put(KycStatus.APPROVED, EnumSet.noneOf(KycStatus.class));
//        ALLOWED_TRANSITIONS.put(KycStatus.REJECTED, EnumSet.noneOf(KycStatus.class));
//    }
//
//    @Autowired
//    private IKYCRecordRepository repository;
//
//    @Autowired
//    private BranchAccessService branchAccessService;
//
//    @Autowired
//    private RestTemplate restTemplate;
//
//    private static final String BASE_URL = "http://10.0.115.6:9096/kyc/getAadhar/";
//
//    public List<OldKycRecord> getAadhar(String adharNo) {
//        String url = UriComponentsBuilder.fromHttpUrl(BASE_URL)
//                .path(String.valueOf(adharNo))
//                .toUriString();
//
//        OldKycRecord[] records = restTemplate.getForObject(url, OldKycRecord[].class);
//
//        if (records != null) {
//            return new ArrayList<>(Arrays.asList(records));
//        } else {
//            throw new RuntimeException("No records found for Aadhar number: " + adharNo);
//        }
//    }
//
//    public KYCRecord createKYCRecord(KYCRecord kycRecord, String role) {
//        validateRole(role, "BOM", "Only BOM can create KYC records.");
//        kycRecord.setStatus(KycStatus.DRAFT);
//        return repository.save(kycRecord);
//    }
//
//    public KYCRecord getKYCRecordById(long id) {
//        Optional<KYCRecord> kycRecord = repository.findById(id);
//        return kycRecord.orElse(null);
//    }
//
//    @Transactional
//    public KYCRecord submit(long id, String accessingId, String role) {
//        validateRole(role, "BOM", "Only BOM can submit KYC records.");
//        return transition(id, accessingId, KycStatus.SUBMITTED);
//    }
//
//    @Transactional
//    public KYCRecord approve(long id, String accessingId, String role) {
//        validateRole(role, "COP", "Only COP can approve KYC records.");
//        return reviewTransition(id, accessingId, KycStatus.APPROVED);
//    }
//
//    @Transactional
//    public KYCRecord reject(long id, String accessingId, String role) {
//        validateRole(role, "COP", "Only COP can reject KYC records.");
//        return reviewTransition(id, accessingId, KycStatus.REJECTED);
//    }
//
//    @Transactional
//    public KYCRecord sendBackForRework(long id, String accessingId, String role) {
//        validateRole(role, "COP", "Only COP can send KYC records back for rework.");
//        return reviewTransition(id, accessingId, KycStatus.REWORK_REQUIRED);
//    }
//
//    @Transactional
//    public List<KYCRecord> getAllKYCRecords() {
//        return repository.findAll(Sort.by(Sort.Direction.DESC, "id", "date"));
//    }
//
//    @Transactional
//    public List<KYCRecord> getAllKYCRecords(String userName) {
//        ArrayList<KYCRecord> recordList = new ArrayList<>();
//        List<KYCRecord> allKYCRecords = getAllKYCRecords();
//        BranchAccess branchAccess = branchAccessService.getUser(userName);
//        ArrayList<String> branchNameList = branchAccess.getBranchNameList();
//        for (KYCRecord allKYCRecord : allKYCRecords) {
//            String branchName = allKYCRecord.getBranchName();
//            for (String string : branchNameList) {
//                if (string.endsWith(branchName)) {
//                    recordList.add(allKYCRecord);
//                }
//            }
//        }
//        return recordList;
//    }
//
//    public KYCRecord updateKYCRecord(long id, KYCRecord kycRecord, String role) {
//        if (repository.existsById(id)) {
//            validateRole(role, "BOM", "Only BOM can edit KYC records.");
//            KYCRecord existingRecord = getKYCRecordById(id);
//            KycStatus currentStatus = existingRecord.getStatus() == null ? KycStatus.DRAFT : existingRecord.getStatus();
//            if (!(currentStatus == KycStatus.DRAFT || currentStatus == KycStatus.REWORK_REQUIRED)) {
//                throw new IllegalStateException("KYC records can only be edited in DRAFT or REWORK_REQUIRED state.");
//            }
//            kycRecord.setId(id);
//            kycRecord.setStatus(existingRecord.getStatus());
//            kycRecord.setVersion(existingRecord.getVersion());
//            return repository.save(kycRecord);
//        } else {
//            return null;
//        }
//    }
//
//    public void deleteKYCRecord(long id) {
//        repository.deleteById(id);
//    }
//
//    public List<KYCRecord> getKycRecordsByAadharNo(String adharNo) {
//        ArrayList<OldKycRecord> OldRecordList = (ArrayList<OldKycRecord>) getAadhar(adharNo);
//        ArrayList<KYCRecord> recordList = new ArrayList<>();
//
//        for (OldKycRecord kYCRecord : OldRecordList) {
//            String adharNoDB = kYCRecord.getAdharNo() + "";
//            if (adharNo.equals(adharNoDB)) {
//                KYCRecord kycRecord = new KYCRecord();
//                kycRecord.setAccessingId("");
//                kycRecord.setAccountType(kYCRecord.getAccountType());
//                kycRecord.setStatus(KycStatus.fromValue(kYCRecord.getStatus()));
//                kycRecord.setAdharNoFirst(kYCRecord.getAdharNo() + "");
//                kycRecord.setApplicantFirst(kYCRecord.getFirstName()
//                        + " " + kYCRecord.getMidName()
//                        + " " + kYCRecord.getLastName());
//                kycRecord.setApprovedBy(kYCRecord.getApprovedBy());
//                kycRecord.setBranchName(kYCRecord.getBranchName());
//                kycRecord.setCode(kYCRecord.getCode());
//                ArrayList<Date> arrayList = new ArrayList<>();
//                arrayList.add(kYCRecord.getDate());
//                kycRecord.setDate(arrayList);
//                kycRecord.setId(kYCRecord.getId());
//                kycRecord.setMobileNo(kYCRecord.getMobileNo());
//                kycRecord.setRemark(kYCRecord.getRemark());
//                kycRecord.setTimeStam(kYCRecord.getTimeStam());
//                kycRecord.setUploadedBy(kYCRecord.getUploadedBy());
//                recordList.add(kycRecord);
//            }
//        }
//
//        List<KYCRecord> findAll = getAllKYCRecords();
//        for (KYCRecord kYCRecord : findAll) {
//            String adharNoDB = kYCRecord.getAdharNoFirst();
//            if (adharNo.equals(adharNoDB)) {
//                recordList.add(kYCRecord);
//            }
//        }
//        return recordList;
//    }
//
//    private KYCRecord findByAdharNoAndaccountTypeOld(String OldAdharNo, String OldAccountType) {
//        List<OldKycRecord> findAll = getAadhar(OldAdharNo);
//        KYCRecord kycRecord = new KYCRecord();
//        if (!findAll.isEmpty()) {
//
//            for (OldKycRecord kYCRecord : findAll) {
//                String accountType = kYCRecord.getAccountType();
//                String adharNo = kYCRecord.getAdharNo() + "";
//                if (adharNo.equals(OldAdharNo) && accountType.equals(OldAccountType)) {
//                    kycRecord.setAccessingId("");
//                    kycRecord.setAccountType(kYCRecord.getAccountType());
//                    kycRecord.setStatus(KycStatus.fromValue(kYCRecord.getStatus()));
//                    kycRecord.setAdharNoFirst(kYCRecord.getAdharNo() + "");
//                    kycRecord.setApplicantFirst(kYCRecord.getFirstName()
//                            + " " + kYCRecord.getMidName()
//                            + " " + kYCRecord.getLastName());
//                    kycRecord.setApprovedBy(kYCRecord.getApprovedBy());
//                    kycRecord.setBranchName(kYCRecord.getBranchName());
//                    kycRecord.setCode(kYCRecord.getCode());
//                    ArrayList<Date> arrayList = new ArrayList<>();
//                    arrayList.add(kYCRecord.getDate());
//                    kycRecord.setDate(arrayList);
//                    kycRecord.setId(kYCRecord.getId());
//                    kycRecord.setMobileNo(kYCRecord.getMobileNo());
//                    kycRecord.setRemark(kYCRecord.getRemark());
//                    kycRecord.setTimeStam(kYCRecord.getTimeStam());
//                    kycRecord.setUploadedBy(kYCRecord.getUploadedBy());
//                    return kycRecord;
//                }
//            }
//        }
//        return null;
//    }
//
//    public KYCRecord findByAdharNoAndaccountType(String OldAdharNo, String OldAccountType) {
//        KYCRecord findByAdharNoAndaccountTypeOld = findByAdharNoAndaccountTypeOld(OldAdharNo, OldAccountType);
//        if (findByAdharNoAndaccountTypeOld == null) {
//
//            List<KYCRecord> findAll = getAllKYCRecords();
//            if (!findAll.isEmpty()) {
//
//                for (KYCRecord kYCRecord : findAll) {
//                    String accountType = kYCRecord.getAccountType();
//                    String adharNo = kYCRecord.getAdharNoFirst();
//                    if (adharNo.equals(OldAdharNo) && accountType.equals(OldAccountType)) {
//                        return kYCRecord;
//                    }
//                }
//            }
//        } else {
//            return findByAdharNoAndaccountTypeOld;
//        }
//        return null;
//    }
//
//    public int getBranchKycRecordListSize(String branchName) {
//        List<KYCRecord> findAllByBranchName = repository.findAllByBranchName(branchName);
//        return findAllByBranchName.size();
//    }
//
//    private KYCRecord reviewTransition(long id, String accessingId, KycStatus targetStatus) {
//        KYCRecord kycRecord = repository.findById(id)
//                .orElseThrow(() -> new RuntimeException("KYC record not found: " + id));
//        if (kycRecord.getStatus() == KycStatus.SUBMITTED) {
//            applyTransition(kycRecord, KycStatus.UNDER_REVIEW, accessingId);
//        }
//        applyTransition(kycRecord, targetStatus, accessingId);
//        return repository.save(kycRecord);
//    }
//
//    private KYCRecord transition(long id, String accessingId, KycStatus targetStatus) {
//        KYCRecord kycRecord = repository.findById(id)
//                .orElseThrow(() -> new RuntimeException("KYC record not found: " + id));
//        applyTransition(kycRecord, targetStatus, accessingId);
//        return repository.save(kycRecord);
//    }
//
//    private void applyTransition(KYCRecord kycRecord, KycStatus targetStatus, String accessingId) {
//        KycStatus currentStatus = kycRecord.getStatus() == null ? KycStatus.DRAFT : kycRecord.getStatus();
//        EnumSet<KycStatus> allowedTargets = ALLOWED_TRANSITIONS.getOrDefault(currentStatus, EnumSet.noneOf(KycStatus.class));
//        if (!allowedTargets.contains(targetStatus)) {
//            throw new IllegalStateException("Invalid transition from " + currentStatus + " to " + targetStatus);
//        }
//        kycRecord.setStatus(targetStatus);
//        kycRecord.setAccessingId(accessingId);
//    }
//
//    private void validateRole(String actualRole, String requiredRole, String message) {
//        if (actualRole == null || !requiredRole.equalsIgnoreCase(actualRole.trim())) {
//            throw new IllegalArgumentException(message);
//        }
//    }
//
//}
