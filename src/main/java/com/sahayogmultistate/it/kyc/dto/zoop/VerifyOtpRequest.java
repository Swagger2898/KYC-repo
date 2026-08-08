package com.sahayogmultistate.it.kyc.dto.zoop;

import javax.validation.constraints.NotBlank;

public class VerifyOtpRequest {

    @NotBlank
    private String requestId;

    @NotBlank
    private String otp;

    @NotBlank
    private String taskId;

    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public String getTaskId() {
        return taskId;
    }

    public void setTaskId(String taskId) {
        this.taskId = taskId;
    }
}
