package com.sahayogmultistate.it.kyc.dto.kyc;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

public class KycRecordStatusUpdateRequest {

    @NotNull
    private Long id;

    @NotBlank
    @Size(max = 100)
    private String accessingId;

    @NotBlank
    @Size(max = 20)
    private String role;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAccessingId() {
        return accessingId;
    }

    public void setAccessingId(String accessingId) {
        this.accessingId = accessingId;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
