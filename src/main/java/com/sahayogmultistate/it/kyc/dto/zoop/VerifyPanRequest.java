package com.sahayogmultistate.it.kyc.dto.zoop;

import javax.validation.constraints.NotBlank;

public class VerifyPanRequest {

    @NotBlank
    private String panNumber;

    @NotBlank
    private String panHolderName;

    public String getPanNumber() {
        return panNumber;
    }

    public void setPanNumber(String panNumber) {
        this.panNumber = panNumber;
    }

    public String getPanHolderName() {
        return panHolderName;
    }

    public void setPanHolderName(String panHolderName) {
        this.panHolderName = panHolderName;
    }
}
