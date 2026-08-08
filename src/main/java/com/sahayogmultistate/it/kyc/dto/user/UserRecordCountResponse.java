package com.sahayogmultistate.it.kyc.dto.user;

import java.util.ArrayList;

public class UserRecordCountResponse {

    private String active;
    private String rejected;
    private String pending;
    private String terminated;
    private String resetPassword;

    public static UserRecordCountResponse fromList(ArrayList<String> counts) {
        UserRecordCountResponse response = new UserRecordCountResponse();
        response.setActive(counts.size() > 0 ? counts.get(0) : "0");
        response.setRejected(counts.size() > 1 ? counts.get(1) : "0");
        response.setPending(counts.size() > 2 ? counts.get(2) : "0");
        response.setTerminated(counts.size() > 3 ? counts.get(3) : "0");
        response.setResetPassword(counts.size() > 4 ? counts.get(4) : "0");
        return response;
    }

    public String getActive() {
        return active;
    }

    public void setActive(String active) {
        this.active = active;
    }

    public String getRejected() {
        return rejected;
    }

    public void setRejected(String rejected) {
        this.rejected = rejected;
    }

    public String getPending() {
        return pending;
    }

    public void setPending(String pending) {
        this.pending = pending;
    }

    public String getTerminated() {
        return terminated;
    }

    public void setTerminated(String terminated) {
        this.terminated = terminated;
    }

    public String getResetPassword() {
        return resetPassword;
    }

    public void setResetPassword(String resetPassword) {
        this.resetPassword = resetPassword;
    }
}
