package com.sahayogmultistate.it.kyc.dto.branch;

import com.sahayogmultistate.it.kyc.model.BranchAccess;
import java.util.ArrayList;

public class BranchAccessResponse {

    private int id;
    private String userName;
    private ArrayList<String> branchNameList;
    private String userType;
    private String userIdStatus;
    private String branchName;

    public static BranchAccessResponse fromEntity(BranchAccess branchAccess) {
        BranchAccessResponse response = new BranchAccessResponse();
        response.setId(branchAccess.getId());
        response.setUserName(branchAccess.getUserName());
        response.setBranchNameList(branchAccess.getBranchNameList());
        response.setUserType(branchAccess.getUserType());
        response.setUserIdStatus(branchAccess.getUserIdStatus());
        response.setBranchName(branchAccess.getBranchName());
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
