package com.sahayogmultistate.it.kyc.dto.branch;

import java.util.ArrayList;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.Size;

public class BranchAccessRequest {

    @NotBlank
    @Size(min = 3, max = 100)
    private String userName;

    @NotEmpty
    private ArrayList<String> branchNameList;

    @NotBlank
    @Size(max = 50)
    private String userType;

    @NotBlank
    @Size(max = 50)
    private String userIdStatus;

    @NotBlank
    @Size(max = 100)
    private String branchName;

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public ArrayList<String> getBranchNameList() {
        return branchNameList;
    }

    public void setBranchNameList(ArrayList<String> branchNameList) {
        this.branchNameList = branchNameList;
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

    public String getBranchName() {
        return branchName;
    }

    public void setBranchName(String branchName) {
        this.branchName = branchName;
    }
}
