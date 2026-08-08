package com.sahayogmultistate.it.kyc.dto.zoop;

import javax.validation.constraints.NotBlank;

public class RequestOtpRequest {

    @NotBlank
    private String aadhaarNumber;

    public String getAadhaarNumber() {
        return aadhaarNumber;
    }

    public void setAadhaarNumber(String aadhaarNumber) {
        this.aadhaarNumber = aadhaarNumber;
    }
}
