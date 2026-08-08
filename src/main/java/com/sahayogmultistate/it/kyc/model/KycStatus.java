package com.sahayogmultistate.it.kyc.model;

public enum KycStatus {

    DRAFT,
    PENDING_VERIFICATION,
    VERIFIED,
    FAILED,                      // keep for now — see note below
    VERIFICATION_INCOMPLETE,     // transient failure, exhausted retries — resubmit-able
    REJECTED_BY_VERIFICATION,    // terminal failure — e.g. Aadhaar invalid — needs edit first
    APPROVED,
    REJECTED;

    public static KycStatus fromValue(String value) {
        if (value == null || value.trim().isEmpty()) {
            return DRAFT;
        }
        return KycStatus.valueOf(value.trim().toUpperCase().replace(' ', '_'));
    }
}
