package com.sahayogmultistate.it.kyc.dto.user;

import com.sahayogmultistate.it.kyc.model.UserRecord;

public class UserRecordResponse {

    private int id;
    private String userName;
    private String branchName;
    private String userType;
    private String userIdStatus;
    private String remark;

    public static UserRecordResponse fromEntity(UserRecord userRecord) {
        UserRecordResponse response = new UserRecordResponse();
        response.setId(userRecord.getId());
        response.setUserName(userRecord.getUserName());
        response.setBranchName(userRecord.getBranchName());
        response.setUserType(userRecord.getUserType());
        response.setUserIdStatus(userRecord.getUserIdStatus());
        response.setRemark(userRecord.getRemark());
        return response;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
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
