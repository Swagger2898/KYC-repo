package com.sahayogmultistate.it.kyc.service;

import com.sahayogmultistate.it.kyc.model.KycSavingAndCurrent;
import com.sahayogmultistate.it.kyc.model.KycStatus;
import com.sahayogmultistate.it.kyc.repository.KycSavingAndCurrentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class KycVerificationService {

    @Autowired
    private KycSavingAndCurrentRepository repository;

    private static final Logger log = LoggerFactory.getLogger(KycVerificationService.class);

    @Async("kycExecutor")
    public void verifyAsync(Long kycId) {

        KycSavingAndCurrent record = repository.findById(kycId).orElse(null);

        if (record == null) {
            log.warn("KYC record not found for ID: {}", kycId);
            return;
        }

        while (record.getVerificationAttempts() < record.getMaxVerificationAttempts()) {

            try {
                int attempt = record.getVerificationAttempts() + 1;

                // 🔥 ADD THIS LINE HERE
                log.info("THREAD={} | attempt={} | kycId={}",
                        Thread.currentThread().getName(),
                        attempt,
                        kycId);

               // Thread.sleep(2000);
                repository.runHeavyQuery();
                record.setVerificationAttempts(attempt);

                boolean isValid = Math.random() > 0.3;

                if (isValid) {
                    record.setStatus(KycStatus.VERIFIED);
                    repository.save(record);

                    log.info("Verification SUCCESS for KYC ID: {}", kycId);
                    return;
                }

                log.warn("Verification FAILED attempt {} for KYC ID: {}", attempt, kycId);

            } catch (Exception e) {
                record.setVerificationAttempts(record.getVerificationAttempts() + 1);
                log.error("Verification EXCEPTION for KYC ID: {}", kycId, e);
            }
        }

        record.setStatus(KycStatus.FAILED);
        repository.save(record);

        log.error("Verification FAILED after max attempts for KYC ID: {}", kycId);
    }
}