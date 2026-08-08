//package com.sahayogmultistate.it.kyc.service;
//
//import com.sahayogmultistate.it.kyc.model.BaseKycModel;
//import com.sahayogmultistate.it.kyc.model.KYCRecord;
//import com.sahayogmultistate.it.kyc.model.KycStatus;
//import com.sahayogmultistate.it.kyc.model.KycSoleProprietorship;
//import com.sahayogmultistate.it.kyc.repository.KycSoleProprietorshipRepository;
//import java.io.File;
//import java.io.FileOutputStream;
//import java.io.IOException;
//import java.util.ArrayList;
//import java.util.Date;
//import javax.transaction.Transactional;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Component;
//import org.springframework.web.multipart.MultipartFile;
//
//@Component
//public class SoleKycProcessor implements KycProcessor<SoleKycProcessor.SoleKycRequest> {
//
//    @Autowired
//    private KycSoleProprietorshipRepository repository;
//
//    @Autowired
//    private KYCRecordService kYCRecordService;
//
//    @Value("${root.path}")
//    private String ROOT_F;
//
//    @Override
//    public String getType() {
//        return "SOLE";
//    }
//
//    @Override
//    public BaseKycModel process(SoleKycRequest request) {
//        try {
//            return add(request);
//        } catch (IOException e) {
//            throw new RuntimeException("Failed to process sole kyc", e);
//        }
//    }
//
//    public KycSoleProprietorship add(SoleKycRequest request) throws IOException {
//        Integer codeNo;
//        Integer codeNoOld = getBranchKycRecordListSize(request.getBranchName());
//        if (codeNoOld == null) {
//            codeNo = 0;
//        } else {
//            codeNo = getBranchKycRecordListSize(request.getBranchName());
//        }
//        String code = "CODE_0" + (1 + codeNo) + "_" + request.getBranchName();
//        KycSoleProprietorship record = new KycSoleProprietorship();
//        KYCRecord byAdhar;
//        if ("Sole Proprietorship".equals(request.getAccountType())) {
//            byAdhar = getKycRecordByAdharAndAccountType(request.getAdharNo(), request.getAccountType());
//        } else {
//            byAdhar = new KYCRecord();
//        }
//
//        if (byAdhar == null) {
//            try {
//
//                String directoryPath = ROOT_F + "//" + request.getBranchName() + "//" + "CASA" + "//" + "Non_Individual" + "//" + request.getAccountType() + "//" + code;
//                File directory = new File(directoryPath);
//
//                File directoryForIdProof = new File(directoryPath + "//" + "idProof");
//                File directoryForAddressProof = new File(directoryPath + "//" + "addressProof");
//                File directoryForPan = new File(directoryPath + "//" + "pan");
//                File directoryForEntityProof = new File(directoryPath + "//" + "entityProof");
//                File directoryForOtherDocs = new File(directoryPath + "//" + "otherDoc");
//                File directoryForClientForm = new File(directoryPath + "//" + "clientForm");
//
//                directory.mkdirs();
//                deleteDirectory(directoryForIdProof);
//                deleteDirectory(directoryForAddressProof);
//                deleteDirectory(directoryForPan);
//                deleteDirectory(directoryForEntityProof);
//                deleteDirectory(directoryForOtherDocs);
//                deleteDirectory(directoryForClientForm);
//
//                directoryForIdProof.mkdirs();
//                int loopIdProof = request.getIdProof().length;
//                for (int i = 0; i < loopIdProof; i++) {
//                    try (FileOutputStream fosIdProof = new FileOutputStream(new File(directoryForIdProof, "idProof_" + i))) {
//                        fosIdProof.write(request.getIdProof()[i].getBytes());
//                    }
//                }
//
//                directoryForAddressProof.mkdirs();
//                int loopAddressProof = request.getAddressProof().length;
//                for (int i = 0; i < loopAddressProof; i++) {
//                    try (FileOutputStream fosAddressProof = new FileOutputStream(new File(directoryForAddressProof, "addressProof_" + i))) {
//                        fosAddressProof.write(request.getAddressProof()[i].getBytes());
//                    }
//                }
//
//                directoryForPan.mkdirs();
//                int loopPan = request.getPan().length;
//                for (int i = 0; i < loopPan; i++) {
//                    try (FileOutputStream fosPan = new FileOutputStream(new File(directoryForPan, "pan_" + i))) {
//                        fosPan.write(request.getPan()[i].getBytes());
//                    }
//                }
//
//                directoryForEntityProof.mkdirs();
//                int loopEntityProof = request.getEntityProof().length;
//                for (int i = 0; i < loopEntityProof; i++) {
//                    try (FileOutputStream fosEntityProof = new FileOutputStream(new File(directoryForEntityProof, "entityProof_" + i))) {
//                        fosEntityProof.write(request.getEntityProof()[i].getBytes());
//                    }
//                }
//
//                directoryForOtherDocs.mkdirs();
//                int loopOtherDoc = request.getOtherDoc().length;
//                for (int i = 0; i < loopOtherDoc; i++) {
//                    try (FileOutputStream fosOtherDoc = new FileOutputStream(new File(directoryForOtherDocs, "otherDoc_" + i))) {
//                        fosOtherDoc.write(request.getOtherDoc()[i].getBytes());
//                    }
//                }
//
//                directoryForClientForm.mkdirs();
//                int loopclientForm = request.getClientForm().length;
//                for (int i = 0; i < loopclientForm; i++) {
//                    try (FileOutputStream fosClientForm = new FileOutputStream(new File(directoryForClientForm, "clientForm_" + i))) {
//                        fosClientForm.write(request.getClientForm()[i].getBytes());
//                    }
//                }
//
//                record.setAccountType(request.getAccountType());
//                record.setBranchName(request.getBranchName());
//                record.setEntity(request.getEntity());
//                record.setApplicantFirst(request.getApplicant());
//                record.setMobileNo(request.getMobileNo());
//                record.setAdharNoFirst(request.getAdharNo());
//                record.setStatus(request.getStatus());
//                record.setRemark(request.getRemark());
//
//                ArrayList<Date> dates = new ArrayList<>();
//                dates.add(request.getDate());
//
//                record.setDate(dates);
//
//                record.setIdProofStatus(request.getIdProofStatus());
//                record.setAddressProofStatus(request.getAddressProofStatus());
//                record.setPanStatus(request.getPanStatus());
//                record.setEntityProofStatus(request.getEntityProofStatus());
//
//                record.setOtherDocStatus(request.getOtherDocStatus());
//                record.setClientFormStatus(request.getClientFormStatus());
//                record.setApprovedBy(request.getApprovedBy());
//                record.setUploadedBy(request.getUploadedBy());
//                record.setCode(code);
//
//                ArrayList<String> tS = new ArrayList<>();
//                tS.add(request.getTimeStam());
//
//                record.setTimeStam(tS);
//
//                record.setIdProof(null);
//                record.setAddressProof(null);
//                record.setPan(null);
//                record.setEntityProof(null);
//                record.setOtherDoc(null);
//                record.setClientForm(null);
//
//                KYCRecord kycRecord = new KYCRecord();
//                kycRecord.setAccountType(request.getAccountType());
//                kycRecord.setAdharNoFirst(request.getAdharNo());
//                kycRecord.setApplicantFirst(request.getEntity());
//                kycRecord.setApprovedBy(request.getApprovedBy());
//                kycRecord.setBranchName(request.getBranchName());
//                kycRecord.setCode(code);
//                kycRecord.setDate(dates);
//                kycRecord.setMobileNo(request.getMobileNo());
//                kycRecord.setRemark(request.getRemark());
//                kycRecord.setStatus(KycStatus.fromValue(request.getStatus()));
//                kycRecord.setTimeStam(tS);
//                kycRecord.setUploadedBy(request.getUploadedBy());
//                kycRecord.setAccessingId("");
//                record.setKycRecord(kycRecord);
//                repository.save(record);
//            } catch (IOException e) {
//                System.out.println("Failed to upload file: " + e.getMessage());
//            }
//            return record;
//        } else {
//            return null;
//        }
//    }
//
//    public void deleteDirectory(File directory) {
//        if (directory.exists()) {
//            File[] files = directory.listFiles();
//            if (files != null) {
//                for (File file : files) {
//                    if (file.isDirectory()) {
//                        deleteDirectory(file);
//                    } else {
//                        file.delete();
//                    }
//                }
//            }
//            directory.delete();
//        }
//    }
//
//    public int getBranchKycRecordListSize(String branchName) {
//        return kYCRecordService.getBranchKycRecordListSize(branchName);
//    }
//
//    @Transactional
//    public KYCRecord getKycRecordByAdharAndAccountType(String oldAdharNo, String oldAccountType) {
//        KYCRecord kYCRecord = kYCRecordService.findByAdharNoAndaccountType(oldAdharNo, oldAccountType);
//        return kYCRecord;
//    }
//
//    public static class SoleKycRequest {
//
//        private MultipartFile[] idProof;
//        private MultipartFile[] addressProof;
//        private MultipartFile[] pan;
//        private MultipartFile[] entityProof;
//        private MultipartFile[] otherDoc;
//        private MultipartFile[] clientForm;
//        private String accountType;
//        private String branchName;
//        private String applicant;
//        private String entity;
//        private long mobileNo;
//        private String adharNo;
//        private String status;
//        private String remark;
//        private Date date;
//        private String idProofStatus;
//        private String addressProofStatus;
//        private String entityProofStatus;
//        private String panStatus;
//        private String otherDocStatus;
//        private String clientFormStatus;
//        private String approvedBy;
//        private String uploadedBy;
//        private String timeStam;
//
//        public MultipartFile[] getIdProof() {
//            return idProof;
//        }
//
//        public void setIdProof(MultipartFile[] idProof) {
//            this.idProof = idProof;
//        }
//
//        public MultipartFile[] getAddressProof() {
//            return addressProof;
//        }
//
//        public void setAddressProof(MultipartFile[] addressProof) {
//            this.addressProof = addressProof;
//        }
//
//        public MultipartFile[] getPan() {
//            return pan;
//        }
//
//        public void setPan(MultipartFile[] pan) {
//            this.pan = pan;
//        }
//
//        public MultipartFile[] getEntityProof() {
//            return entityProof;
//        }
//
//        public void setEntityProof(MultipartFile[] entityProof) {
//            this.entityProof = entityProof;
//        }
//
//        public MultipartFile[] getOtherDoc() {
//            return otherDoc;
//        }
//
//        public void setOtherDoc(MultipartFile[] otherDoc) {
//            this.otherDoc = otherDoc;
//        }
//
//        public MultipartFile[] getClientForm() {
//            return clientForm;
//        }
//
//        public void setClientForm(MultipartFile[] clientForm) {
//            this.clientForm = clientForm;
//        }
//
//        public String getAccountType() {
//            return accountType;
//        }
//
//        public void setAccountType(String accountType) {
//            this.accountType = accountType;
//        }
//
//        public String getBranchName() {
//            return branchName;
//        }
//
//        public void setBranchName(String branchName) {
//            this.branchName = branchName;
//        }
//
//        public String getApplicant() {
//            return applicant;
//        }
//
//        public void setApplicant(String applicant) {
//            this.applicant = applicant;
//        }
//
//        public String getEntity() {
//            return entity;
//        }
//
//        public void setEntity(String entity) {
//            this.entity = entity;
//        }
//
//        public long getMobileNo() {
//            return mobileNo;
//        }
//
//        public void setMobileNo(long mobileNo) {
//            this.mobileNo = mobileNo;
//        }
//
//        public String getAdharNo() {
//            return adharNo;
//        }
//
//        public void setAdharNo(String adharNo) {
//            this.adharNo = adharNo;
//        }
//
//        public String getStatus() {
//            return status;
//        }
//
//        public void setStatus(String status) {
//            this.status = status;
//        }
//
//        public String getRemark() {
//            return remark;
//        }
//
//        public void setRemark(String remark) {
//            this.remark = remark;
//        }
//
//        public Date getDate() {
//            return date;
//        }
//
//        public void setDate(Date date) {
//            this.date = date;
//        }
//
//        public String getIdProofStatus() {
//            return idProofStatus;
//        }
//
//        public void setIdProofStatus(String idProofStatus) {
//            this.idProofStatus = idProofStatus;
//        }
//
//        public String getAddressProofStatus() {
//            return addressProofStatus;
//        }
//
//        public void setAddressProofStatus(String addressProofStatus) {
//            this.addressProofStatus = addressProofStatus;
//        }
//
//        public String getEntityProofStatus() {
//            return entityProofStatus;
//        }
//
//        public void setEntityProofStatus(String entityProofStatus) {
//            this.entityProofStatus = entityProofStatus;
//        }
//
//        public String getPanStatus() {
//            return panStatus;
//        }
//
//        public void setPanStatus(String panStatus) {
//            this.panStatus = panStatus;
//        }
//
//        public String getOtherDocStatus() {
//            return otherDocStatus;
//        }
//
//        public void setOtherDocStatus(String otherDocStatus) {
//            this.otherDocStatus = otherDocStatus;
//        }
//
//        public String getClientFormStatus() {
//            return clientFormStatus;
//        }
//
//        public void setClientFormStatus(String clientFormStatus) {
//            this.clientFormStatus = clientFormStatus;
//        }
//
//        public String getApprovedBy() {
//            return approvedBy;
//        }
//
//        public void setApprovedBy(String approvedBy) {
//            this.approvedBy = approvedBy;
//        }
//
//        public String getUploadedBy() {
//            return uploadedBy;
//        }
//
//        public void setUploadedBy(String uploadedBy) {
//            this.uploadedBy = uploadedBy;
//        }
//
//        public String getTimeStam() {
//            return timeStam;
//        }
//
//        public void setTimeStam(String timeStam) {
//            this.timeStam = timeStam;
//        }
//    }
//}
