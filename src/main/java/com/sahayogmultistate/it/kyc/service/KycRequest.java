package com.sahayogmultistate.it.kyc.service;

import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;


@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class KycRequest {

    // Documents
    private MultipartFile[] idProof;
    private MultipartFile[] addressProof;
    private MultipartFile[] pan;
    private MultipartFile[] otherDoc;
    private MultipartFile[] clientForm;

    // Core KYC fields
    private String accountType;
    private String branchName;
    private String applicant;
    private String mobileNo;
    private String adharNo;

    // Optional
    private String remark;
}
