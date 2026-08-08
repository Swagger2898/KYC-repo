package com.sahayogmultistate.it.kyc.model;


import javax.persistence.*;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@MappedSuperclass
public abstract class BaseKycModel {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private long id;

    private String accountType;
    private String branchName;
    private String mobileNo;

    @Enumerated(EnumType.STRING)
    private KycStatus status;

    @Column(name = "remark", length = 10000)
    private String remark;

    private String approvedBy;
    private String uploadedBy;

    private String code;

    private String rejectionReason;
    private String rejectedBy;

    // ✅ NEW: replaces all blob + file fields
    private String documentBasePath;




}
