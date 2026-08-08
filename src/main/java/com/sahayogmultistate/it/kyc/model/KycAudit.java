package com.sahayogmultistate.it.kyc.model;

import lombok.*;

import javax.persistence.*;
import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@ToString
public class KycAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    private Long kycId;

    private String action;        // CREATED, SUBMITTED, APPROVED, REJECTED
    private String performedBy;   // user
    private String role;          // BOM / COP

    @Column(length = 2000)
    private String remark;        // optional (e.g. rejection reason)

    private LocalDateTime timestamp;
}
