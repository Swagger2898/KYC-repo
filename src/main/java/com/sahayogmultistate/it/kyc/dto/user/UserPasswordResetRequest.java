package com.sahayogmultistate.it.kyc.dto.user;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public class UserPasswordResetRequest {

    @NotBlank
    @Size(min = 3, max = 100)
    private String userName;

    @NotBlank
    @Size(min = 6, max = 100)
    private String newPassword;

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
