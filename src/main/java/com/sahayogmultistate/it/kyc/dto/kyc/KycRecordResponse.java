//package com.sahayogmultistate.it.kyc.dto.kyc;
//
//import com.sahayogmultistate.it.kyc.model.KYCRecord;
//import com.sahayogmultistate.it.kyc.model.KycStatus;
//import java.util.ArrayList;
//import java.util.Date;
//
//public class KycRecordResponse {
//
//    private long id;
//    private String accountType;
//    private String branchName;
//    private String applicantFirst;
//    private long mobileNo;
//    private String adharNoFirst;
//    private KycStatus status;
//    private Long version;
//    private String accessingId;
//    private String remark;
//    private ArrayList<Date> date;
//    private String approvedBy;
//    private String uploadedBy;
//    private String code;
//    private ArrayList<String> timeStam;
//
//    public static KycRecordResponse fromEntity(KYCRecord kycRecord) {
//        KycRecordResponse response = new KycRecordResponse();
//        response.setId(kycRecord.getId());
//        response.setAccountType(kycRecord.getAccountType());
//        response.setBranchName(kycRecord.getBranchName());
//        response.setApplicantFirst(kycRecord.getApplicantFirst());
//        response.setMobileNo(kycRecord.getMobileNo());
//        response.setAdharNoFirst(kycRecord.getAdharNoFirst());
//        response.setStatus(kycRecord.getStatus());
//        response.setVersion(kycRecord.getVersion());
//        response.setAccessingId(kycRecord.getAccessingId());
//        response.setRemark(kycRecord.getRemark());
//        response.setDate(kycRecord.getDate());
//        response.setApprovedBy(kycRecord.getApprovedBy());
//        response.setUploadedBy(kycRecord.getUploadedBy());
//        response.setCode(kycRecord.getCode());
//        response.setTimeStam(kycRecord.getTimeStam());
//        return response;
//    }
//
//    public long getId() {
//        return id;
//    }
//
//    public void setId(long id) {
//        this.id = id;
//    }
//
//    public String getAccountType() {
//        return accountType;
//    }
//
//    public void setAccountType(String accountType) {
//        this.accountType = accountType;
//    }
//
//    public String getBranchName() {
//        return branchName;
//    }
//
//    public void setBranchName(String branchName) {
//        this.branchName = branchName;
//    }
//
//    public String getApplicantFirst() {
//        return applicantFirst;
//    }
//
//    public void setApplicantFirst(String applicantFirst) {
//        this.applicantFirst = applicantFirst;
//    }
//
//    public long getMobileNo() {
//        return mobileNo;
//    }
//
//    public void setMobileNo(long mobileNo) {
//        this.mobileNo = mobileNo;
//    }
//
//    public String getAdharNoFirst() {
//        return adharNoFirst;
//    }
//
//    public void setAdharNoFirst(String adharNoFirst) {
//        this.adharNoFirst = adharNoFirst;
//    }
//
//    public KycStatus getStatus() {
//        return status;
//    }
//
//    public void setStatus(KycStatus status) {
//        this.status = status;
//    }
//
//    public Long getVersion() {
//        return version;
//    }
//
//    public void setVersion(Long version) {
//        this.version = version;
//    }
//
//    public String getAccessingId() {
//        return accessingId;
//    }
//
//    public void setAccessingId(String accessingId) {
//        this.accessingId = accessingId;
//    }
//
//    public String getRemark() {
//        return remark;
//    }
//
//    public void setRemark(String remark) {
//        this.remark = remark;
//    }
//
//    public ArrayList<Date> getDate() {
//        return date;
//    }
//
//    public void setDate(ArrayList<Date> date) {
//        this.date = date;
//    }
//
//    public String getApprovedBy() {
//        return approvedBy;
//    }
//
//    public void setApprovedBy(String approvedBy) {
//        this.approvedBy = approvedBy;
//    }
//
//    public String getUploadedBy() {
//        return uploadedBy;
//    }
//
//    public void setUploadedBy(String uploadedBy) {
//        this.uploadedBy = uploadedBy;
//    }
//
//    public String getCode() {
//        return code;
//    }
//
//    public void setCode(String code) {
//        this.code = code;
//    }
//
//    public ArrayList<String> getTimeStam() {
//        return timeStam;
//    }
//
//    public void setTimeStam(ArrayList<String> timeStam) {
//        this.timeStam = timeStam;
//    }
//}
