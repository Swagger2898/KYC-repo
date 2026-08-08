package com.sahayogmultistate.it.kyc.repository;

import com.sahayogmultistate.it.kyc.model.KycAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KycAuditRepository extends JpaRepository<KycAudit, Long> {
    List<KycAudit> findByKycIdOrderByTimestampAsc(Long kycId);
}
