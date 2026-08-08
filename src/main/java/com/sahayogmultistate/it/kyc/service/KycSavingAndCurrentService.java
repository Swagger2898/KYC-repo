package com.sahayogmultistate.it.kyc.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.sahayogmultistate.it.kyc.model.*;
import com.sahayogmultistate.it.kyc.repository.KycAuditRepository;
import com.sahayogmultistate.it.kyc.repository.KycSavingAndCurrentRepository;
import java.io.*;import java.nio.file.Files;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.logging.*;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class KycSavingAndCurrentService {

    @Autowired
    private KycSavingAndCurrentRepository repository;

    @Autowired
    private KycAuditRepository auditRepository;

    @Autowired
    private BranchAccessService branchAccessService;

    @Value("${root.path}")
    private String ROOT_F;

    @Autowired
    private KycVerificationService kycVerificationService;

    // ===================== SAVE =====================
    @PreAuthorize("hasRole('BOM')")
    public KycSavingAndCurrent add(KycRequest request) throws IOException {

        validateForSave(request);

        // FIX 1: use authenticated user, not customer name
        String createdBy = getCurrentUsername();

        // FIX 3: generate UUID-based code to eliminate race condition
        String code = generateCode(request.getBranchName());

        // FIX 2: save DB record first, then write files
        // If DB save fails, no orphan files are created.
        // If file save fails after DB save, we catch and compensate by deleting the DB record.
        KycSavingAndCurrent record = buildEntity(request, code);
        KycSavingAndCurrent saved;

        try {
            saved = repository.save(record);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save KYC record: " + e.getMessage(), e);
        }

        try {
            saveFiles(
                    request.getBranchName(),
                    request.getAccountType(),
                    code,
                    request.getIdProof(),
                    request.getAddressProof(),
                    request.getPan(),
                    request.getOtherDoc(),
                    request.getClientForm()
            );
        } catch (IOException e) {
            // FIX 2: compensate — delete the DB record so no orphan state remains
            repository.deleteById(saved.getId());
            throw new RuntimeException("File upload failed, KYC record rolled back: " + e.getMessage(), e);
        }

        // FIX 4: wrap logAudit in try-catch so audit failure never silently swallows the record
        try {
            logAudit(saved.getId(), "CREATED", createdBy, "BOM", null);
        } catch (Exception e) {
            // Audit failure is logged but does not roll back the KYC record.
            // Operational alert should fire here in production (e.g. log to a separate error sink).
            Logger.getLogger(getClass().getName())
                    .severe("AUDIT FAILURE on CREATED for kycId=" + saved.getId() + ": " + e.getMessage());
        }

        return saved;
    }

    // ===================== UPDATE =====================
    @PreAuthorize("hasRole('BOM')")
    public KycSavingAndCurrent update(long id, KycRequest request) throws IOException {

        KycSavingAndCurrent record = getKycRecordById(id);

        if (record == null) throw new RuntimeException("Record not found");

        if (record.getStatus() == KycStatus.APPROVED)
            throw new RuntimeException("Approved KYC cannot be modified");

        if (record.getStatus() == KycStatus.REJECTED) {
            record.setStatus(KycStatus.DRAFT);
            record.setRejectionReason(null);
            record.setRejectedBy(null);
        }

        validateForSave(request);

        // FIX 1: use authenticated user, not customer name
        String updatedBy = getCurrentUsername();

        saveFiles(
                record.getBranchName(),
                record.getAccountType(),
                record.getCode(),
                request.getIdProof(),
                request.getAddressProof(),
                request.getPan(),
                request.getOtherDoc(),
                request.getClientForm()
        );

        updateEntity(record, request);

        KycSavingAndCurrent saved = repository.save(record);

        // FIX 4: audit failure isolated
        try {
            logAudit(saved.getId(), "UPDATED", updatedBy, "BOM", null);
        } catch (Exception e) {
            Logger.getLogger(getClass().getName())
                    .severe("AUDIT FAILURE on UPDATED for kycId=" + saved.getId() + ": " + e.getMessage());
        }

        return saved;
    }

    // ===================== SUBMIT =====================
    @PreAuthorize("hasRole('BOM')")
    public KycSavingAndCurrent submit(long id) {

        KycSavingAndCurrent record = getKycRecordById(id);

        if (record == null) throw new RuntimeException("Record not found");

        if (record.getStatus() != KycStatus.DRAFT)
            throw new RuntimeException("Only DRAFT can be submitted");

        validateForSubmit(record);

        record.setStatus(KycStatus.PENDING_VERIFICATION);

        KycSavingAndCurrent saved = repository.save(record);

        kycVerificationService.verifyAsync(saved.getId());

        String submittedBy = getCurrentUsername();

        try {
            logAudit(saved.getId(), "SUBMITTED", submittedBy, "BOM", null);
        } catch (Exception e) {
            Logger.getLogger(getClass().getName())
                    .severe("AUDIT FAILURE on SUBMITTED for kycId=" + saved.getId() + ": " + e.getMessage());
        }

        return saved;
    }

    // ===================== APPROVE =====================
    @PreAuthorize("hasRole('COP')")
    public KycSavingAndCurrent approve(long id) {

        String approvedBy = getCurrentUsername();

        KycSavingAndCurrent record = getKycRecordById(id);

        if (record == null)
            throw new RuntimeException("Record not found");

        if (record.getStatus() == KycStatus.APPROVED)
            throw new RuntimeException("Already approved");

        if (record.getStatus() != KycStatus.VERIFIED)
            throw new RuntimeException("KYC not verified yet");

        assertCopBranchAuthorized(approvedBy, record.getBranchName());

        record.setStatus(KycStatus.APPROVED);
        record.setApprovedBy(approvedBy);
        record.setRejectionReason(null);
        record.setRejectedBy(null);

        KycSavingAndCurrent saved = repository.save(record);

        try {
            logAudit(saved.getId(), "APPROVED", approvedBy, "COP", null);
        } catch (Exception e) {
            Logger.getLogger(getClass().getName())
                    .severe("AUDIT FAILURE on APPROVED for kycId=" + saved.getId() + ": " + e.getMessage());
        }

        return saved;
    }

    // ===================== REJECT =====================
    @PreAuthorize("hasRole('COP')")
    public KycSavingAndCurrent reject(long id, String reason) {

        String rejectedBy = getCurrentUsername();

        KycSavingAndCurrent record = getKycRecordById(id);

        if (record == null)
            throw new RuntimeException("Record not found");

        if (record.getStatus() == KycStatus.APPROVED)
            throw new RuntimeException("Approved KYC cannot be rejected");

        if (record.getStatus() != KycStatus.VERIFIED)
            throw new RuntimeException("KYC not verified yet");

        assertCopBranchAuthorized(rejectedBy, record.getBranchName());

        record.setStatus(KycStatus.REJECTED);
        record.setRejectionReason(reason);
        record.setRejectedBy(rejectedBy);
        record.setApprovedBy(null);

        KycSavingAndCurrent saved = repository.save(record);

        try {
            logAudit(saved.getId(), "REJECTED", rejectedBy, "COP", reason);
        } catch (Exception e) {
            Logger.getLogger(getClass().getName())
                    .severe("AUDIT FAILURE on REJECTED for kycId=" + saved.getId() + ": " + e.getMessage());
        }

        return saved;
    }

    // ===================== FETCH (internal) =====================
    public List<KycSavingAndCurrent> getAllKycRecords() {
        return repository.findAll();
    }

    public KycSavingAndCurrent getKycRecordById(long id) {
        return repository.findById(id).orElse(null);
    }

    // ===================== FETCH (branch-filtered, for controller) =====================
    public List<KycSavingAndCurrent> getAllKycRecordsForCurrentUser() {

        String username = getCurrentUsername();
        BranchAccess access = branchAccessService.getUser(username);

        if (access == null)
            throw new RuntimeException("No branch access configured for user: " + username);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isCop = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_COP"));

        if (isCop) {
            List<String> allowed = access.getBranchNameList().stream()
                    .filter(b -> !b.equals(access.getBranchName()))
                    .collect(Collectors.toList());

            return repository.findAll().stream()
                    .filter(r -> allowed.contains(r.getBranchName()))
                    .collect(Collectors.toList());
        }

        return repository.findAllByBranchName(access.getBranchName());
    }

    public KycSavingAndCurrent getKycRecordByIdForCurrentUser(long id) {

        String username = getCurrentUsername();
        BranchAccess access = branchAccessService.getUser(username);

        if (access == null)
            throw new RuntimeException("No branch access configured for user: " + username);

        KycSavingAndCurrent record = getKycRecordById(id);

        if (record == null)
            throw new RuntimeException("Record not found");

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isCop = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_COP"));

        if (isCop) {
            assertCopBranchAuthorized(username, record.getBranchName());
        } else {
            if (!record.getBranchName().equals(access.getBranchName()))
                throw new RuntimeException("Access denied: record belongs to a different branch");
        }

        return record;
    }

    // ===================== DELETE =====================
    @PreAuthorize("hasRole('BOM')")
    public String delete(long id) {

        KycSavingAndCurrent record = getKycRecordById(id);

        if (record == null) throw new RuntimeException("Record not found");

        if (record.getStatus() == KycStatus.APPROVED)
            throw new RuntimeException("Approved KYC cannot be deleted");

        String deletedBy = getCurrentUsername();

        repository.deleteById(id);

        try {
            logAudit(record.getId(), "DELETED", deletedBy, "BOM", null);
        } catch (Exception e) {
            Logger.getLogger(getClass().getName())
                    .severe("AUDIT FAILURE on DELETED for kycId=" + record.getId() + ": " + e.getMessage());
        }

        return "Done";
    }

    // ===================== AUDIT =====================
    public List<KycAudit> getAuditHistory(Long kycId) {
        return auditRepository.findByKycIdOrderByTimestampAsc(kycId);
    }

    // ===================== BUILD =====================
    private KycSavingAndCurrent buildEntity(KycRequest request, String code) {

        KycSavingAndCurrent record = new KycSavingAndCurrent();

        record.setAccountType(request.getAccountType());
        record.setBranchName(request.getBranchName());
        record.setApplicantFirst(request.getApplicant());
        record.setMobileNo(request.getMobileNo());
        record.setAdharNoFirst(request.getAdharNo());

        record.setStatus(KycStatus.DRAFT);
        record.setRemark(request.getRemark());
        record.setCode(code);

        // FIX 5: path now matches saveFiles() exactly — includes CASA/folderType segment
        String folderType = request.getAccountType().endsWith("Saving") ? "Saving" : "Current";

        String basePath = ROOT_F + "/" +
                request.getBranchName() + "/CASA/" +
                folderType + "/" +
                request.getAccountType() + "/" +
                code;

        record.setDocumentBasePath(basePath);

        return record;
    }

    private void updateEntity(KycSavingAndCurrent record, KycRequest request) {

        record.setAccountType(request.getAccountType());
        record.setBranchName(request.getBranchName());
        record.setApplicantFirst(request.getApplicant());
        record.setMobileNo(request.getMobileNo());
        record.setAdharNoFirst(request.getAdharNo());

        String existing = record.getRemark() == null ? "" : record.getRemark();
        String incoming = request.getRemark() == null ? "" : request.getRemark();

        record.setRemark(existing + "\n" + incoming);
    }

    // ===================== VALIDATION =====================
    private void validateForSave(KycRequest request) {

        if (request.getAdharNo() == null || request.getAdharNo().length() != 12)
            throw new RuntimeException("Invalid Aadhaar");

        if (request.getApplicant() == null || request.getApplicant().isBlank())
            throw new RuntimeException("Applicant name required");

        if (request.getMobileNo() == null || request.getMobileNo().length() != 10)
            throw new RuntimeException("Invalid mobile number");
    }

    private void validateForSubmit(KycSavingAndCurrent record) {

        if (record.getAdharNoFirst() == null || record.getApplicantFirst() == null)
            throw new RuntimeException("Incomplete KYC");
    }

    // ===================== FILE HANDLING =====================
    private void saveFiles(
            String branchName,
            String accountType,
            String code,
            MultipartFile[] idProof,
            MultipartFile[] addressProof,
            MultipartFile[] pan,
            MultipartFile[] otherDoc,
            MultipartFile[] clientForm
    ) throws IOException {

        String folderType = accountType.endsWith("Saving") ? "Saving" : "Current";

        String basePath = ROOT_F + "/" + branchName + "/CASA/" +
                folderType + "/" + accountType + "/" + code;

        saveMultipartFiles(new File(basePath + "/idProof"), "id_", idProof);
        saveMultipartFiles(new File(basePath + "/addressProof"), "addr_", addressProof);
        saveMultipartFiles(new File(basePath + "/pan"), "pan_", pan);
        saveMultipartFiles(new File(basePath + "/otherDoc"), "other_", otherDoc);
        saveMultipartFiles(new File(basePath + "/clientForm"), "form_", clientForm);
    }

    private void saveMultipartFiles(File directory, String prefix, MultipartFile[] files)
            throws IOException {

        if (files == null) return;

        directory.mkdirs();

        for (int i = 0; i < files.length; i++) {
            File file = new File(directory, prefix + i);
            try (FileOutputStream fos = new FileOutputStream(file)) {
                fos.write(files[i].getBytes());
            }
        }
    }

    // ===================== HELPER =====================

    // FIX 3: UUID-based code — no DB read, no race condition, globally unique
    private String generateCode(String branchName) {
        return "CODE_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase()
                + "_" + branchName;
    }

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }

    private void assertCopBranchAuthorized(String copUsername, String recordBranch) {

        BranchAccess access = branchAccessService.getUser(copUsername);

        if (access == null)
            throw new RuntimeException("No branch access configured for COP: " + copUsername);

        if (access.getBranchNameList() == null || access.getBranchNameList().isEmpty())
            throw new RuntimeException("COP has no branch access list configured");

        if (recordBranch.equals(access.getBranchName()))
            throw new RuntimeException("COP cannot review records from their own home branch");

        if (!access.getBranchNameList().contains(recordBranch))
            throw new RuntimeException("COP is not authorized for branch: " + recordBranch);
    }

    private void logAudit(Long kycId, String action, String user, String role, String remark) {

        KycAudit audit = new KycAudit();
        audit.setKycId(kycId);
        audit.setAction(action);
        audit.setPerformedBy(user);
        audit.setRole(role);
        audit.setRemark(remark);
        audit.setTimestamp(LocalDateTime.now());

        auditRepository.save(audit);
    }
}