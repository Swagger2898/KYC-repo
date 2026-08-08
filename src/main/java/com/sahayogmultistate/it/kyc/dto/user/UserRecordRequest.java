package com.sahayogmultistate.it.kyc.dto.user;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public class UserRecordRequest {

    @NotBlank
    @Size(min = 3, max = 100)
    private String userName;

    @NotBlank
    @Size(min = 6, max = 100)
    private String userPassword;

    @NotBlank
    @Size(max = 100)
    private String branchName;

    @NotBlank
    @Size(max = 50)
    private String userType;

    @NotBlank
    @Size(max = 50)
    private String userIdStatus;

    @NotBlank
    @Size(max = 1000)
    private String remark;

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserPassword() {
        return userPassword;
    }

    public void setUserPassword(String userPassword) {
        this.userPassword = userPassword;
    }

    public String getBranchName() {
        return branchName;
    }

    public void setBranchName(String branchName) {
        this.branchName = branchName;
    }

    public String getUserType() {
        return userType;
    }

    public void setUserType(String userType) {
        this.userType = userType;
    }

    public String getUserIdStatus() {
        return userIdStatus;
    }

    public void setUserIdStatus(String userIdStatus) {
        this.userIdStatus = userIdStatus;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }
}
