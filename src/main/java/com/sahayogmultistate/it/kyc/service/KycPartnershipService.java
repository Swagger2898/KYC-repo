///*
// * To change this license header, choose License Headers in Project Properties.
// * To change this template file, choose Tools | Templates
// * and open the template in the editor.
// */
//package com.sahayogmultistate.it.kyc.service;
//
///**
// *
// * @author ritik
// */
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.fasterxml.jackson.databind.SerializationFeature;
//import com.sahayogmultistate.it.kyc.model.BranchAccess;
//import com.sahayogmultistate.it.kyc.model.KYCRecord;
//import com.sahayogmultistate.it.kyc.model.KycStatus;
//import com.sahayogmultistate.it.kyc.model.KycPartnership;
//import com.sahayogmultistate.it.kyc.repository.KycPartnershipRepository;
//import java.io.File;
//import java.io.FileOutputStream;
//import java.io.IOException;
//import java.nio.file.Files;
//import java.util.ArrayList;
//import java.util.Date;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//import java.util.Optional;
//import java.util.logging.Level;
//import java.util.logging.Logger;
//import javax.transaction.Transactional;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.web.multipart.MultipartFile;
//
//@Service
//public class KycPartnershipService {
//
//    @Autowired
//    private KycPartnershipRepository repository;
//
//    @Autowired
//    private BranchAccessService service;
//
//    @Autowired
//    private KYCRecordService kYCRecordService;
//
//    @Value("${root.path}")
//    private String ROOT_F;
//
//    public KycPartnership add(MultipartFile[] idProof, MultipartFile[] addressProof,
//            MultipartFile[] pan, MultipartFile[] partnershipDoc, MultipartFile[] otherDoc,
//            MultipartFile[] clientForm, String accountType, String branchName,
//            String entity, String applicantFirst, String applicantSecond,
//            String applicantThird, long mobileNo, String adharNoFirst,
//            String adharNoSecond, String adharNoThird, String status,
//            String remark, Date date, String idProofStatus,
//            String addressProofStatus, String panStatus, String partnershipDocStatus,
//            String otherDocStatus, String clientFormStatus,
//            String approvedBy, String uploadedBy, String timeStam
//    ) throws IOException {
//        Integer codeNo;
//        Integer codeNoOld = getBranchKycRecordListSize(branchName);
//        if (codeNoOld == null) {
//            codeNo = 0;
//        } else {
//            codeNo = getBranchKycRecordListSize(branchName);
//        }
//        String code = "CODE_0" + (1 + codeNo) + "_" + branchName;
//        KycPartnership record = new KycPartnership();
//        KYCRecord byAdhar;
//        if ("Partnership".equals(accountType)) {
//            byAdhar = getKycRecordByAdharAndAccountType(adharNoFirst, accountType);
//        } else {
//            byAdhar = new KYCRecord();
//        }
//
//        if (byAdhar == null) {
//            try {
//
//                String directoryPath = ROOT_F + "//" + branchName + "//" + "CASA" + "//" + "Non_Individual" + "//" + accountType + "//" + code;
//                File directory = new File(directoryPath);
//
//                File directoryForIdProof = new File(directoryPath + "//" + "idProof");
//                File directoryForAddressProof = new File(directoryPath + "//" + "addressProof");
//                File directoryForPan = new File(directoryPath + "//" + "pan");
//                File directoryForPartnershipDocs = new File(directoryPath + "//" + "partnershipDoc");
//                File directoryForOtherDocs = new File(directoryPath + "//" + "otherDoc");
//                File directoryForClientForm = new File(directoryPath + "//" + "clientForm");
//
//                // Ensure parent directories exist
//                directory.mkdirs();
//                deleteDirectory(directoryForIdProof);
//                deleteDirectory(directoryForAddressProof);
//                deleteDirectory(directoryForPartnershipDocs);
//                deleteDirectory(directoryForOtherDocs);
//                deleteDirectory(directoryForPan);
//                deleteDirectory(directoryForClientForm);
//
//                directoryForIdProof.mkdirs();
//                int loopIdProof = idProof.length;
//                for (int i = 0; i < loopIdProof; i++) {
//                    try (FileOutputStream fosIdProof = new FileOutputStream(new File(directoryForIdProof, "idProof_" + i))) {
//                        fosIdProof.write(idProof[i].getBytes());
//                    }
//                }
//
//                directoryForAddressProof.mkdirs();
//                int loopAddressProof = addressProof.length;
//                for (int i = 0; i < loopAddressProof; i++) {
//                    try (FileOutputStream fosAddressProof = new FileOutputStream(new File(directoryForAddressProof, "addressProof_" + i))) {
//                        fosAddressProof.write(addressProof[i].getBytes());
//                    }
//                }
//
//                directoryForPan.mkdirs();
//                int loopPan = pan.length;
//                for (int i = 0; i < loopPan; i++) {
//                    try (FileOutputStream fosPan = new FileOutputStream(new File(directoryForPan, "pan_" + i))) {
//                        fosPan.write(pan[i].getBytes());
//                    }
//                }
//
//                directoryForPartnershipDocs.mkdirs();
//                int loopPartnershipDoc = partnershipDoc.length;
//                for (int i = 0; i < loopPartnershipDoc; i++) {
//                    try (FileOutputStream fosPartnershipDoc = new FileOutputStream(new File(directoryForPartnershipDocs, "partnershipDoc_" + i))) {
//                        fosPartnershipDoc.write(partnershipDoc[i].getBytes());
//                    }
//                }
//
//                directoryForOtherDocs.mkdirs();
//                int loopOtherDoc = otherDoc.length;
//                for (int i = 0; i < loopOtherDoc; i++) {
//                    try (FileOutputStream fosOtherDoc = new FileOutputStream(new File(directoryForOtherDocs, "otherDoc_" + i))) {
//                        fosOtherDoc.write(otherDoc[i].getBytes());
//                    }
//                }
//
//                directoryForClientForm.mkdirs();
//                int loopclientForm = clientForm.length;
//                for (int i = 0; i < loopclientForm; i++) {
//                    try (FileOutputStream fosClientForm = new FileOutputStream(new File(directoryForClientForm, "clientForm_" + i))) {
//                        fosClientForm.write(clientForm[i].getBytes());
//                    }
//                }
//
//                record.setAccountType(accountType);
//                record.setBranchName(branchName);
//                record.setEntity(entity);
//                record.setApplicantFirst(applicantFirst);
//                record.setApplicantSecond(applicantSecond);
//                record.setApplicantThird(applicantThird);
//                record.setMobileNo(mobileNo);
//                record.setAdharNoFirst(adharNoFirst);
//                record.setAdharNoSecond(adharNoSecond);
//                record.setAdharNoThird(adharNoThird);
//                record.setStatus(status);
//                record.setRemark(remark);
//
//                ArrayList<Date> dates = new ArrayList<>();
//                dates.add(date);
//
//                record.setDate(dates);
//
//                record.setIdProofStatus(idProofStatus);
//                record.setAddressProofStatus(addressProofStatus);
//                record.setPanStatus(panStatus);
//                record.setPartnershipDocStatus(partnershipDocStatus);
//                record.setOtherDocStatus(otherDocStatus);
//                record.setClientFormStatus(clientFormStatus);
//                record.setApprovedBy(approvedBy);
//                record.setUploadedBy(uploadedBy);
//                record.setCode(code);
//
//                ArrayList<String> tS = new ArrayList<>();
//                tS.add(timeStam);
//
//                record.setTimeStam(tS);
//
//                record.setIdProof(null);
//                record.setAddressProof(null);
//                record.setPan(null);
//                record.setPartnershipDoc(null);
//                record.setOtherDoc(null);
//                record.setClientForm(null);
////            -->
//
//                KYCRecord kycRecord = new KYCRecord();
//                kycRecord.setAccountType(accountType);
//                kycRecord.setAdharNoFirst(adharNoFirst);
//                kycRecord.setApplicantFirst(entity);
//                kycRecord.setApprovedBy(approvedBy);
//                kycRecord.setBranchName(branchName);
//                kycRecord.setCode(code);
//                kycRecord.setDate(dates);
//                kycRecord.setMobileNo(mobileNo);
//                kycRecord.setRemark(remark);
//                kycRecord.setStatus(KycStatus.fromValue(status));
//                kycRecord.setTimeStam(tS);
//                kycRecord.setUploadedBy(uploadedBy);
//                kycRecord.setAccessingId("");
//                record.setKycRecord(kycRecord);
//                repository.save(record);
//            } catch (IOException e) {
//                System.out.println("Failed to upload file: " + e.getMessage());
//            }
//            return record;
////            <--
//        } else {
//            return null;
//        }
//    }
//
//    public KycPartnership update(MultipartFile[] idProof, MultipartFile[] addressProof,
//            MultipartFile[] pan, MultipartFile[] partnershipDoc, MultipartFile[] otherDoc,
//            MultipartFile[] clientForm, long id, String accountType, String branchName,
//            String entity, String applicantFirst, String applicantSecond,
//            String applicantThird, long mobileNo, String adharNoFirst,
//            String adharNoSecond, String adharNoThird, String status,
//            String remark, Date date, String idProofStatus,
//            String addressProofStatus, String panStatus, String partnershipDocStatus,
//            String otherDocStatus, String clientFormStatus,
//            String approvedBy, String uploadedBy, String timeStam
//    ) throws IOException {
//        KycPartnership record = getKycRecordById(id);
//        ArrayList<Date> dates = record.getDate();
//        dates.add(date);
//        String oldRemark = record.getRemark();
//        String code = record.getCode();
//        ArrayList<String> timestam = record.getTimeStam();
//        timestam.add(timeStam);
//        if (record != null) {
//            try {
//
//                String directoryPath = ROOT_F + "//" + branchName + "//" + "CASA" + "//" + "Non_Individual" + "//" + accountType + "//" + code;
//                File directory = new File(directoryPath);
//
//                File directoryForIdProof = new File(directoryPath + "//" + "idProof");
//                File directoryForAddressProof = new File(directoryPath + "//" + "addressProof");
//                File directoryForPan = new File(directoryPath + "//" + "pan");
//                File directoryForPartnershipDocs = new File(directoryPath + "//" + "partnershipDoc");
//                File directoryForOtherDocs = new File(directoryPath + "//" + "otherDoc");
//                File directoryForClientForm = new File(directoryPath + "//" + "clientForm");
//
//                // Ensure parent directories exist
//                directory.mkdirs();
//                deleteDirectory(directoryForIdProof);
//                deleteDirectory(directoryForAddressProof);
//                deleteDirectory(directoryForPartnershipDocs);
//                deleteDirectory(directoryForOtherDocs);
//                deleteDirectory(directoryForPan);
//                deleteDirectory(directoryForClientForm);
//
//                directoryForIdProof.mkdirs();
//                int loopIdProof = idProof.length;
//                for (int i = 0; i < loopIdProof; i++) {
//                    try (FileOutputStream fosIdProof = new FileOutputStream(new File(directoryForIdProof, "idProof_" + i))) {
//                        fosIdProof.write(idProof[i].getBytes());
//                    }
//                }
//
//                directoryForAddressProof.mkdirs();
//                int loopAddressProof = addressProof.length;
//                for (int i = 0; i < loopAddressProof; i++) {
//                    try (FileOutputStream fosAddressProof = new FileOutputStream(new File(directoryForAddressProof, "addressProof_" + i))) {
//                        fosAddressProof.write(addressProof[i].getBytes());
//                    }
//                }
//
//                directoryForPan.mkdirs();
//                int loopPan = pan.length;
//                for (int i = 0; i < loopPan; i++) {
//                    try (FileOutputStream fosPan = new FileOutputStream(new File(directoryForPan, "pan_" + i))) {
//                        fosPan.write(pan[i].getBytes());
//                    }
//                }
//
//                directoryForPartnershipDocs.mkdirs();
//                int loopPartnershipDoc = partnershipDoc.length;
//                for (int i = 0; i < loopPartnershipDoc; i++) {
//                    try (FileOutputStream fosPartnershipDoc = new FileOutputStream(new File(directoryForPartnershipDocs, "partnershipDoc_" + i))) {
//                        fosPartnershipDoc.write(partnershipDoc[i].getBytes());
//                    }
//                }
//
//                directoryForOtherDocs.mkdirs();
//                int loopOtherDoc = otherDoc.length;
//                for (int i = 0; i < loopOtherDoc; i++) {
//                    try (FileOutputStream fosOtherDoc = new FileOutputStream(new File(directoryForOtherDocs, "otherDoc_" + i))) {
//                        fosOtherDoc.write(otherDoc[i].getBytes());
//                    }
//                }
//
//                directoryForClientForm.mkdirs();
//                int loopclientForm = clientForm.length;
//                for (int i = 0; i < loopclientForm; i++) {
//                    try (FileOutputStream fosClientForm = new FileOutputStream(new File(directoryForClientForm, "clientForm_" + i))) {
//                        fosClientForm.write(clientForm[i].getBytes());
//                    }
//                }
//
//                record.setAccountType(accountType);
//                record.setBranchName(branchName);
//                record.setEntity(entity);
//                record.setApplicantFirst(applicantFirst);
//                record.setApplicantSecond(applicantSecond);
//                record.setApplicantThird(applicantThird);
//                record.setMobileNo(mobileNo);
//                record.setAdharNoFirst(adharNoFirst);
//                record.setAdharNoSecond(adharNoSecond);
//                record.setAdharNoThird(adharNoThird);
//                record.setStatus(status);
//                record.setRemark(oldRemark + ", \n\n" + remark);
//
//                record.setDate(dates);
//
//                record.setIdProofStatus(idProofStatus);
//                record.setAddressProofStatus(addressProofStatus);
//                record.setPanStatus(panStatus);
//                record.setPartnershipDocStatus(partnershipDocStatus);
//                record.setOtherDocStatus(otherDocStatus);
//                record.setClientFormStatus(clientFormStatus);
//                record.setApprovedBy(approvedBy);
//                record.setUploadedBy(uploadedBy);
//                record.setCode(code);
//
//                record.setTimeStam(timestam);
//
//                record.setIdProof(null);
//                record.setAddressProof(null);
//                record.setPan(null);
//                record.setPartnershipDoc(null);
//                record.setOtherDoc(null);
//                record.setClientForm(null);
//
////            -->
//                KYCRecord kycRecord = record.getKycRecord();
//                kycRecord.setAccountType(accountType);
//                kycRecord.setAdharNoFirst(adharNoFirst);
//                kycRecord.setApplicantFirst(entity);
//                kycRecord.setApprovedBy(approvedBy);
//                kycRecord.setBranchName(branchName);
//                kycRecord.setCode(code);
//                kycRecord.setDate(dates);
//                kycRecord.setMobileNo(mobileNo);
//                kycRecord.setRemark(oldRemark + ", \n\n" + remark);
//                kycRecord.setStatus(KycStatus.fromValue(status));
//                kycRecord.setTimeStam(timestam);
//                kycRecord.setUploadedBy(uploadedBy);
//                kycRecord.setAccessingId("");
//                record.setKycRecord(kycRecord);
//                repository.save(record);
//
////                KYCRecord record = new KYCRecord(id, applicant, adharNo, mobileNo, accountType, branchName, status, oldRemark + ", \n\n" + remark, dates, panStatus, adharStatus, otherDocStatus, applicationFormStatus, approvedBy, uploadedBy, code, timestam, null, null, null, null);
////                repository.save(record);
//            } catch (IOException e) {
//                System.out.println("Failed to upload file: " + e.getMessage());
//            }
//            return record;
////            <--
//
//        }
//        return null;
//    }
//
//    public KycPartnership update(long id, String accountType, String branchName,
//            String entity, String applicantFirst, String applicantSecond,
//            String applicantThird, long mobileNo, String adharNoFirst,
//            String adharNoSecond, String adharNoThird, String status,
//            String remark, Date date, String idProofStatus,
//            String addressProofStatus, String panStatus, String partnershipDocStatus,
//            String otherDocStatus, String clientFormStatus,
//            String approvedBy, String uploadedBy, String timeStam
//    ) throws IOException {
//        KycPartnership record = getKycRecordById(id);
//        ArrayList<Date> dates = record.getDate();
//        dates.add(date);
//        String oldRemark = record.getRemark();
//        String code = record.getCode();
//        ArrayList<String> timestam = record.getTimeStam();
//        timestam.add(timeStam);
//        if (record != null) {
//            record.setAccountType(accountType);
//            record.setBranchName(branchName);
//            record.setEntity(entity);
//            record.setApplicantFirst(applicantFirst);
//            record.setApplicantSecond(applicantSecond);
//            record.setApplicantThird(applicantThird);
//            record.setMobileNo(mobileNo);
//            record.setAdharNoFirst(adharNoFirst);
//            record.setAdharNoSecond(adharNoSecond);
//            record.setAdharNoThird(adharNoThird);
//            record.setStatus(status);
//            record.setRemark(oldRemark + ", \n\n" + remark);
//            record.setDate(dates);
//            record.setIdProofStatus(idProofStatus);
//            record.setAddressProofStatus(addressProofStatus);
//            record.setPanStatus(panStatus);
//            record.setPartnershipDocStatus(partnershipDocStatus);
//            record.setOtherDocStatus(otherDocStatus);
//            record.setClientFormStatus(clientFormStatus);
//            record.setApprovedBy(approvedBy);
//            record.setUploadedBy(uploadedBy);
//            record.setCode(code);
//            record.setTimeStam(timestam);
//            record.setIdProof(null);
//            record.setAddressProof(null);
//            record.setPan(null);
//            record.setPartnershipDoc(null);
//            record.setOtherDoc(null);
//            record.setClientForm(null);
//            //            -->
//            KYCRecord kycRecord = record.getKycRecord();
//            kycRecord.setAccountType(accountType);
//            kycRecord.setAdharNoFirst(adharNoFirst);
//            kycRecord.setApplicantFirst(entity);
//            kycRecord.setApprovedBy(approvedBy);
//            kycRecord.setBranchName(branchName);
//            kycRecord.setCode(code);
//            kycRecord.setDate(dates);
//            kycRecord.setMobileNo(mobileNo);
//            kycRecord.setRemark(oldRemark + ", \n\n" + remark);
//            kycRecord.setStatus(KycStatus.fromValue(status));
//            kycRecord.setTimeStam(timestam);
//            kycRecord.setUploadedBy(uploadedBy);
//            kycRecord.setAccessingId("");
//            record.setKycRecord(kycRecord);
//            repository.save(record);
//            return record;
//        }
//        return record;
//    }
//
//    public List<KycPartnership> getAllKYCRecordsFromDB() {
//        return repository.findAll();
//    }
//
//    public List<KycPartnership> getAllKycRecords() {
//        ArrayList<KycPartnership> recordList = new ArrayList<>();
//        List<KycPartnership> findAll = getAllKYCRecordsFromDB();
//        if (!findAll.isEmpty()) {
//
//            for (KycPartnership kYCRecord : findAll) {
//
//                String branchName = kYCRecord.getBranchName();
//                String accountType = kYCRecord.getAccountType();
//                String code = kYCRecord.getCode();
//
//                File[] retrieveFilesForIdProof = retrieveFilesForIdProof(branchName, accountType, code);
//                File[] retrieveFilesForAddressProof = retrieveFilesForAddressProof(branchName, accountType, code);
//                File[] retrieveFilesForPan = retrieveFilesForPan(branchName, accountType, code);
//                File[] retrieveFilesForPartnershipDoc = retrieveFilesForPartnershipDoc(branchName, accountType, code);
//                File[] retrieveFilesForOtherDoc = retrieveFilesForOtherDoc(branchName, accountType, code);
//                File[] retrieveFilesForClientForm = retrieveFilesForClientForm(branchName, accountType, code);
//                try {
////                KycSavingAndCurrent kycRecordNew = new KycSavingAndCurrent();
//
//                    List<byte[]> arrayListForIdProof = new ArrayList<>();
//                    for (File file : retrieveFilesForIdProof) {
//                        arrayListForIdProof.add(Files.readAllBytes(file.toPath()));
//                    }
//                    kYCRecord.setIdProof(arrayListForIdProof);
//
//                    List<byte[]> arrayListForAddressProof = new ArrayList<>();
//                    for (File file : retrieveFilesForAddressProof) {
//                        arrayListForAddressProof.add(Files.readAllBytes(file.toPath()));
//                    }
//                    kYCRecord.setAddressProof(arrayListForAddressProof);
//
//                    List<byte[]> arrayListForPan = new ArrayList<>();
//                    for (File file : retrieveFilesForPan) {
//                        arrayListForPan.add(Files.readAllBytes(file.toPath()));
//                    }
//                    kYCRecord.setPan(arrayListForPan);
//
//                    List<byte[]> arrayListForPartnershipDoc = new ArrayList<>();
//                    for (File file : retrieveFilesForPartnershipDoc) {
//                        arrayListForPartnershipDoc.add(Files.readAllBytes(file.toPath()));
//                    }
//                    kYCRecord.setPartnershipDoc(arrayListForPartnershipDoc);
//
//                    List<byte[]> arrayListForOtherDoc = new ArrayList<>();
//                    for (File file : retrieveFilesForOtherDoc) {
//                        arrayListForOtherDoc.add(Files.readAllBytes(file.toPath()));
//                    }
//                    kYCRecord.setOtherDoc(arrayListForOtherDoc);
//
//                    List<byte[]> arrayListForClientForm = new ArrayList<>();
//                    for (File file : retrieveFilesForClientForm) {
//                        arrayListForClientForm.add(Files.readAllBytes(file.toPath()));
//                    }
//                    kYCRecord.setClientForm(arrayListForClientForm);
//
//                    recordList.add(kYCRecord);
//                } catch (IOException ex) {
//                    Logger.getLogger(KycPartnership.class.getName()).log(Level.SEVERE, null, ex);
//                }
//            }
//            return recordList;
//        } else {
//            return recordList;
//        }
//    }
//
//    @Transactional
//    public List<KycPartnership> getAllKycRecordsByUserName(String userName) {
//        ArrayList<KycPartnership> recordList = new ArrayList<>();
//        BranchAccess user = service.getUser(userName);
//        ArrayList<String> branchNameList = user.getBranchNameList();
////         -->
//        ArrayList<KycPartnership> kYCRecords = new ArrayList<>();
//        for (String branchName : branchNameList) {
//            List<KycPartnership> findAllByBranchName = repository.findAllByBranchName(branchName);
//            for (KycPartnership kYCRecord : findAllByBranchName) {
//                kYCRecords.add(kYCRecord);
//            }
//        }
////        <--
//
//        for (KycPartnership kYCRecord : kYCRecords) {
//
//            String branchName = kYCRecord.getBranchName();
//            String accountType = kYCRecord.getAccountType();
//            String code = kYCRecord.getCode();
//
//            File[] retrieveFilesForIdProof = retrieveFilesForIdProof(branchName, accountType, code);
//            File[] retrieveFilesForAddressProof = retrieveFilesForAddressProof(branchName, accountType, code);
//            File[] retrieveFilesForPan = retrieveFilesForPan(branchName, accountType, code);
//            File[] retrieveFilesForPartnershipDoc = retrieveFilesForPartnershipDoc(branchName, accountType, code);
//            File[] retrieveFilesForOtherDoc = retrieveFilesForOtherDoc(branchName, accountType, code);
//            File[] retrieveFilesForClientForm = retrieveFilesForClientForm(branchName, accountType, code);
//            try {
////                KycSavingAndCurrent kycRecordNew = new KycSavingAndCurrent();
//
//                List<byte[]> arrayListForIdProof = new ArrayList<>();
//                for (File file : retrieveFilesForIdProof) {
//                    arrayListForIdProof.add(Files.readAllBytes(file.toPath()));
//                }
//                kYCRecord.setIdProof(arrayListForIdProof);
//
//                List<byte[]> arrayListForAddressProof = new ArrayList<>();
//                for (File file : retrieveFilesForAddressProof) {
//                    arrayListForAddressProof.add(Files.readAllBytes(file.toPath()));
//                }
//                kYCRecord.setAddressProof(arrayListForAddressProof);
//
//                List<byte[]> arrayListForPan = new ArrayList<>();
//                for (File file : retrieveFilesForPan) {
//                    arrayListForPan.add(Files.readAllBytes(file.toPath()));
//                }
//                kYCRecord.setPan(arrayListForPan);
//
//                List<byte[]> arrayListForPartnershipDoc = new ArrayList<>();
//                for (File file : retrieveFilesForPartnershipDoc) {
//                    arrayListForPartnershipDoc.add(Files.readAllBytes(file.toPath()));
//                }
//                kYCRecord.setPartnershipDoc(arrayListForPartnershipDoc);
//
//                List<byte[]> arrayListForOtherDoc = new ArrayList<>();
//                for (File file : retrieveFilesForOtherDoc) {
//                    arrayListForOtherDoc.add(Files.readAllBytes(file.toPath()));
//                }
//                kYCRecord.setOtherDoc(arrayListForOtherDoc);
//
//                List<byte[]> arrayListForClientForm = new ArrayList<>();
//                for (File file : retrieveFilesForClientForm) {
//                    arrayListForClientForm.add(Files.readAllBytes(file.toPath()));
//                }
//                kYCRecord.setClientForm(arrayListForClientForm);
//
//                recordList.add(kYCRecord);
//            } catch (IOException ex) {
//                Logger.getLogger(KycPartnership.class.getName()).log(Level.SEVERE, null, ex);
//            }
//        }
//        return recordList;
//    }
//
//    @Transactional
//    public List<KycPartnership> getAllKycForUserBranches(String userName) {
//        BranchAccess user = service.getUser(userName);
//        ArrayList<String> branchNameList = user.getBranchNameList();
//
////         -->
//        ArrayList<KycPartnership> kYCRecords = new ArrayList<>();
//        for (String branchName : branchNameList) {
//            List<KycPartnership> findAllByBranchName = repository.findAllByBranchName(branchName);
//            for (KycPartnership kYCRecord : findAllByBranchName) {
//                kYCRecords.add(kYCRecord);
//            }
//        }
////        <--
//        return kYCRecords;
//    }
//
//    public List<KycPartnership> getAllKycRecordsForBranch(String branchname) {
//
//        ArrayList<KycPartnership> recordList = new ArrayList<>();
//        List<KycPartnership> findAllByBranchName = repository.findAllByBranchName(branchname);
//        for (KycPartnership kYCRecord : findAllByBranchName) {
//
//            String branchName = kYCRecord.getBranchName();
//            String accountType = kYCRecord.getAccountType();
//            String code = kYCRecord.getCode();
//
//            File[] retrieveFilesForIdProof = retrieveFilesForIdProof(branchName, accountType, code);
//            File[] retrieveFilesForAddressProof = retrieveFilesForAddressProof(branchName, accountType, code);
//            File[] retrieveFilesForPan = retrieveFilesForPan(branchName, accountType, code);
//            File[] retrieveFilesForPartnershipDoc = retrieveFilesForPartnershipDoc(branchName, accountType, code);
//            File[] retrieveFilesForOtherDoc = retrieveFilesForOtherDoc(branchName, accountType, code);
//            File[] retrieveFilesForClientForm = retrieveFilesForClientForm(branchName, accountType, code);
//            try {
////                KycSavingAndCurrent kycRecordNew = new KycSavingAndCurrent();
//
//                List<byte[]> arrayListForIdProof = new ArrayList<>();
//                for (File file : retrieveFilesForIdProof) {
//                    arrayListForIdProof.add(Files.readAllBytes(file.toPath()));
//                }
//                kYCRecord.setIdProof(arrayListForIdProof);
//
//                List<byte[]> arrayListForAddressProof = new ArrayList<>();
//                for (File file : retrieveFilesForAddressProof) {
//                    arrayListForAddressProof.add(Files.readAllBytes(file.toPath()));
//                }
//                kYCRecord.setAddressProof(arrayListForAddressProof);
//
//                List<byte[]> arrayListForPan = new ArrayList<>();
//                for (File file : retrieveFilesForPan) {
//                    arrayListForPan.add(Files.readAllBytes(file.toPath()));
//                }
//                kYCRecord.setPan(arrayListForPan);
//
//                List<byte[]> arrayListForPartnershipDoc = new ArrayList<>();
//                for (File file : retrieveFilesForPartnershipDoc) {
//                    arrayListForPartnershipDoc.add(Files.readAllBytes(file.toPath()));
//                }
//                kYCRecord.setPartnershipDoc(arrayListForPartnershipDoc);
//
//                List<byte[]> arrayListForOtherDoc = new ArrayList<>();
//                for (File file : retrieveFilesForOtherDoc) {
//                    arrayListForOtherDoc.add(Files.readAllBytes(file.toPath()));
//                }
//                kYCRecord.setOtherDoc(arrayListForOtherDoc);
//
//                List<byte[]> arrayListForClientForm = new ArrayList<>();
//                for (File file : retrieveFilesForClientForm) {
//                    arrayListForClientForm.add(Files.readAllBytes(file.toPath()));
//                }
//                kYCRecord.setClientForm(arrayListForClientForm);
//
//                recordList.add(kYCRecord);
//            } catch (IOException ex) {
//                Logger.getLogger(KycPartnership.class.getName()).log(Level.SEVERE, null, ex);
//            }
//        }
//        return recordList;
//    }
//
//    public int getBranchKycRecordListSize(String branchName) {
//        return kYCRecordService.getBranchKycRecordListSize(branchName);
//    }
//
//    public List<KycPartnership> getKycRecordsByAadharNo(String adharNo) {
//        ArrayList<KycPartnership> recordList = new ArrayList<>();
//        List<KycPartnership> findAll = getAllKYCRecordsFromDB();
//        for (KycPartnership kYCRecord : findAll) {
//            String adharNoDB = kYCRecord.getAdharNoFirst();
////            String aadharNoExist = "" + adharNoDB.indexOf(',');
////            if (!aadharNoExist.equals("-1")) {
////                String[] aadharNum = adharNoDB.split(",");
////                if (adharNo.equals(aadharNum[0])) {
////                    recordList.add(kYCRecord);
////                }
////            } else {
////            }
//            if (adharNo.equals(adharNoDB)) {
//                recordList.add(kYCRecord);
//            }
//        }
//        return recordList;
//    }
//
//    public String delete(long id) {
//        repository.deleteById(id);
//        return "Done";
//    }
//
//    public KycPartnership getKycRecordById(long id) {
//        Optional<KycPartnership> optional = repository.findById(id);
//        if (optional.isPresent()) {
//            KycPartnership kYCRecord = optional.get();
//
//            String branchName = kYCRecord.getBranchName();
//            String accountType = kYCRecord.getAccountType();
//            String code = kYCRecord.getCode();
//
//            File[] retrieveFilesForIdProof = retrieveFilesForIdProof(branchName, accountType, code);
//            File[] retrieveFilesForAddressProof = retrieveFilesForAddressProof(branchName, accountType, code);
//            File[] retrieveFilesForPan = retrieveFilesForPan(branchName, accountType, code);
//            File[] retrieveFilesForPartnershipDoc = retrieveFilesForPartnershipDoc(branchName, accountType, code);
//            File[] retrieveFilesForOtherDoc = retrieveFilesForOtherDoc(branchName, accountType, code);
//            File[] retrieveFilesForClientForm = retrieveFilesForClientForm(branchName, accountType, code);
//            try {
////                KycSavingAndCurrent kycRecordNew = new KycSavingAndCurrent();
//
//                List<byte[]> arrayListForIdProof = new ArrayList<>();
//                for (File file : retrieveFilesForIdProof) {
//                    arrayListForIdProof.add(Files.readAllBytes(file.toPath()));
//                }
//                kYCRecord.setIdProof(arrayListForIdProof);
//
//                List<byte[]> arrayListForAddressProof = new ArrayList<>();
//                for (File file : retrieveFilesForAddressProof) {
//                    arrayListForAddressProof.add(Files.readAllBytes(file.toPath()));
//                }
//                kYCRecord.setAddressProof(arrayListForAddressProof);
//
//                List<byte[]> arrayListForPan = new ArrayList<>();
//                for (File file : retrieveFilesForPan) {
//                    arrayListForPan.add(Files.readAllBytes(file.toPath()));
//                }
//                kYCRecord.setPan(arrayListForPan);
//
//                List<byte[]> arrayListForPartnershipDoc = new ArrayList<>();
//                for (File file : retrieveFilesForPartnershipDoc) {
//                    arrayListForPartnershipDoc.add(Files.readAllBytes(file.toPath()));
//                }
//                kYCRecord.setPartnershipDoc(arrayListForPartnershipDoc);
//
//                List<byte[]> arrayListForOtherDoc = new ArrayList<>();
//                for (File file : retrieveFilesForOtherDoc) {
//                    arrayListForOtherDoc.add(Files.readAllBytes(file.toPath()));
//                }
//                kYCRecord.setOtherDoc(arrayListForOtherDoc);
//
//                List<byte[]> arrayListForClientForm = new ArrayList<>();
//                for (File file : retrieveFilesForClientForm) {
//                    arrayListForClientForm.add(Files.readAllBytes(file.toPath()));
//                }
//                kYCRecord.setClientForm(arrayListForClientForm);
//
//                return kYCRecord;
//            } catch (IOException ex) {
//                Logger.getLogger(KycPartnership.class.getName()).log(Level.SEVERE, null, ex);
//            }
//        }
//        return null;
//    }
//
//    @Transactional
//    public KYCRecord getKycRecordByAdharAndAccountType(String OldAdharNo, String OldAccountType) {
//        KYCRecord kYCRecord = kYCRecordService.findByAdharNoAndaccountType(OldAdharNo, OldAccountType);
//        return kYCRecord;
//    }
//
//    public String getAllKycRecord_In_Json() {
//        List<KycPartnership> arrayList = getAllKYCRecordsFromDB();
//        // Configure ObjectMapper
//        ObjectMapper objectMapper = new ObjectMapper();
//        objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
//        // Convert ArrayList to JSON
//        try {
//            // Convert ArrayList to JSON
//            String json = objectMapper.writeValueAsString(arrayList);
//
//            // Write JSON to a file
//            objectMapper.writeValue(new File("output.json"), arrayList);
//
//            // Return JSON response
//            return json;
//        } catch (IOException e) {
//            e.printStackTrace();
//            return "Error processing request";
//        }
//
//    }
//
//    public File[] retrieveFiles(String branchName, String accountType, String code) {
//        String directoryPath = "";
//        if (accountType.endsWith("Saving")) {
//            directoryPath = ROOT_F + "//" + branchName + "//" + "CASA" + "//" + "Saving" + "//" + accountType + "//" + code;
//        } else {
//            directoryPath = ROOT_F + "//" + branchName + "//" + "CASA" + "//" + "Current" + "//" + accountType + "//" + code;
//        }
//        File directory = new File(directoryPath);
//        if (directory.exists() && directory.isDirectory()) {
//            File[] files = directory.listFiles();
//
//            if (files != null) {
//            } else {
//                System.out.println("No files found in the directory.");
//            }
//            return files;
//        } else {
//            System.out.println("Directory does not exist or is not a valid directory.");
//        }
//        return null;
//    }
//
//    public File[] retrieveFilesForIdProof(String branchName, String accountType, String code) {
//
//        String directoryPath = ROOT_F + "//" + branchName + "//" + "CASA" + "//" + "Non_Individual" + "//" + accountType + "//" + code + "//" + "idProof";
//        File directory = new File(directoryPath);
//        if (directory.exists() && directory.isDirectory()) {
//            File[] files = directory.listFiles();
//
//            if (files != null) {
//            } else {
//                System.out.println("No files found in the directory.");
//            }
//            return files;
//        } else {
//            System.out.println("Directory does not exist or is not a valid directory.");
//        }
//        return null;
//    }
//
//    public File[] retrieveFilesForAddressProof(String branchName, String accountType, String code) {
//
//        String directoryPath = ROOT_F + "//" + branchName + "//" + "CASA" + "//" + "Non_Individual" + "//" + accountType + "//" + code + "//" + "addressProof";
//        File directory = new File(directoryPath);
//        if (directory.exists() && directory.isDirectory()) {
//            File[] files = directory.listFiles();
//
//            if (files != null) {
//            } else {
//                System.out.println("No files found in the directory.");
//            }
//            return files;
//        } else {
//            System.out.println("Directory does not exist or is not a valid directory.");
//        }
//        return null;
//    }
//
//    public File[] retrieveFilesForPan(String branchName, String accountType, String code) {
//
//        String directoryPath = ROOT_F + "//" + branchName + "//" + "CASA" + "//" + "Non_Individual" + "//" + accountType + "//" + code + "//" + "pan";
//        File directory = new File(directoryPath);
//        if (directory.exists() && directory.isDirectory()) {
//            File[] files = directory.listFiles();
//
//            if (files != null) {
//            } else {
//                System.out.println("No files found in the directory.");
//            }
//            return files;
//        } else {
//            System.out.println("Directory does not exist or is not a valid directory.");
//        }
//        return null;
//    }
//
//    public File[] retrieveFilesForPartnershipDoc(String branchName, String accountType, String code) {
//
//        String directoryPath = ROOT_F + "//" + branchName + "//" + "CASA" + "//" + "Non_Individual" + "//" + accountType + "//" + code + "//" + "partnershipDoc";
//        File directory = new File(directoryPath);
//        if (directory.exists() && directory.isDirectory()) {
//            File[] files = directory.listFiles();
//
//            if (files != null) {
//            } else {
//                System.out.println("No files found in the directory.");
//            }
//            return files;
//        } else {
//            System.out.println("Directory does not exist or is not a valid directory.");
//        }
//        return null;
//    }
//
//    public File[] retrieveFilesForOtherDoc(String branchName, String accountType, String code) {
//
//        String directoryPath = ROOT_F + "//" + branchName + "//" + "CASA" + "//" + "Non_Individual" + "//" + accountType + "//" + code + "//" + "otherDoc";
//        File directory = new File(directoryPath);
//        if (directory.exists() && directory.isDirectory()) {
//            File[] files = directory.listFiles();
//
//            if (files != null) {
//            } else {
//                System.out.println("No files found in the directory.");
//            }
//            return files;
//        } else {
//            System.out.println("Directory does not exist or is not a valid directory.");
//        }
//        return null;
//    }
//
//    public File[] retrieveFilesForClientForm(String branchName, String accountType, String code) {
//
//        String directoryPath = ROOT_F + "//" + branchName + "//" + "CASA" + "//" + "Non_Individual" + "//" + accountType + "//" + code + "//" + "clientForm";
//        File directory = new File(directoryPath);
//        if (directory.exists() && directory.isDirectory()) {
//            File[] files = directory.listFiles();
//
//            if (files != null) {
//            } else {
//                System.out.println("No files found in the directory.");
//            }
//            return files;
//        } else {
//            System.out.println("Directory does not exist or is not a valid directory.");
//        }
//        return null;
//    }
//
//    public void deleteDirectory(File directory) {
//        if (directory.exists()) {
//            File[] files = directory.listFiles();
//            if (files != null) {
//                for (File file : files) {
//                    if (file.isDirectory()) {
//                        // Recursive call to delete subdirectories and their contents
//                        deleteDirectory(file);
//                    } else {
//                        // Delete the file
//                        file.delete();
//                    }
//                }
//            }
//            // Delete the empty directory
//            directory.delete();
//        } else {
////            System.out.println("Directory does not exist.");
//        }
//    }
//
//    private List<KycPartnership> findByAdharNoAndaccountType(String OldAdharNo, String OldAccountType) {
//        ArrayList<KycPartnership> recordList = new ArrayList<>();
//        List<KycPartnership> findAll = getAllKYCRecordsFromDB();
//        if (!findAll.isEmpty()) {
//
//            for (KycPartnership kYCRecord : findAll) {
//                String accountType = kYCRecord.getAccountType();
//                String adharNo = kYCRecord.getAdharNoFirst();
//                if (adharNo.equals(OldAdharNo) && accountType.equals(OldAccountType)) {
//                    recordList.add(kYCRecord);
//                }
//            }
//            return recordList;
//        } else {
//            return recordList;
//        }
//    }
//
//    public KycPartnership findByCode(String code) {
//        KycPartnership findByCode = repository.findByCode(code);
//        KycPartnership ksac = getKycRecordById(findByCode.getId());
//        return ksac;
//    }
//}
