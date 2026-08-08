package com.sahayogmultistate.it.kyc.dto.kyc;
import java.util.ArrayList;
import java.util.Date;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

public class KycRecordRequest {

    @NotBlank
    @Size(max = 100)
    private String accountType;

    @NotBlank
    @Size(max = 100)
    private String branchName;

    @NotBlank
    @Size(max = 200)
    private String applicantFirst;

    @NotNull
    private Long mobileNo;

    @NotBlank
    @Size(max = 20)
    private String adharNoFirst;

    @NotBlank
    @Size(max = 100)
    private String accessingId;

    @NotBlank
    @Size(max = 50)
    private String role;

    @NotBlank
    @Size(max = 10000)
    private String remark;

    @NotNull
    private ArrayList<Date> date;

    @NotBlank
    @Size(max = 100)
    private String approvedBy;

    @NotBlank
    @Size(max = 100)
    private String uploadedBy;

    @NotBlank
    @Size(max = 200)
    private String code;

    @NotNull
    private ArrayList<String> timeStam;

    private Long version;

    public String getAccountType() {
        return accountType;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }

    public String getBranchName() {
        return branchName;
    }

    public void setBranchName(String branchName) {
        this.branchName = branchName;
    }

    public String getApplicantFirst() {
        return applicantFirst;
    }

    public void setApplicantFirst(String applicantFirst) {
        this.applicantFirst = applicantFirst;
    }

    public Long getMobileNo() {
        return mobileNo;
    }

    public void setMobileNo(Long mobileNo) {
        this.mobileNo = mobileNo;
    }

    public String getAdharNoFirst() {
        return adharNoFirst;
    }

    public void setAdharNoFirst(String adharNoFirst) {
        this.adharNoFirst = adharNoFirst;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getAccessingId() {
        return accessingId;
    }

    public void setAccessingId(String accessingId) {
        this.accessingId = accessingId;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public ArrayList<Date> getDate() {
        return date;
    }

    public void setDate(ArrayList<Date> date) {
        this.date = date;
    }

    public String getApprovedBy() {
        return approvedBy;
    }

    public void setApprovedBy(String approvedBy) {
        this.approvedBy = approvedBy;
    }

    public String getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(String uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public ArrayList<String> getTimeStam() {
        return timeStam;
    }

    public void setTimeStam(ArrayList<String> timeStam) {
        this.timeStam = timeStam;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }
}
