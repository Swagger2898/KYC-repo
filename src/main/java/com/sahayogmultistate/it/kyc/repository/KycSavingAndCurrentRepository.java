/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.sahayogmultistate.it.kyc.repository;

/**
 *
 * @author ritik
 */
import com.sahayogmultistate.it.kyc.model.KycAudit;
import com.sahayogmultistate.it.kyc.model.KycSavingAndCurrent;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface KycSavingAndCurrentRepository extends JpaRepository<KycSavingAndCurrent, Long> {

    long countByBranchName(String branchName);

    @Query("SELECT k FROM KycSavingAndCurrent k WHERE k.adharNoFirst = :adharNoFirst AND k.accountType = :accountType")
    List<KycSavingAndCurrent> findByAdharNoAndaccountType(@Param("adharNoFirst") String adharNoFirst, @Param("accountType") String accountType);

    @Query("SELECT k FROM KycSavingAndCurrent k WHERE k.branchName = :branchName")
    List<KycSavingAndCurrent> findAllByBranchName(@Param("branchName") String branchName);

    @Query("SELECT k FROM KycSavingAndCurrent k WHERE k.adharNoFirst = :adharNoFirst")
    List<KycSavingAndCurrent> findByAdharNo(@Param("adharNoFirst") String adharNoFirst);
    
    @Query("SELECT k FROM KycSavingAndCurrent k WHERE k.code = :code")
    KycSavingAndCurrent findByCode(@Param("code") String code);

    @Query(value = "SELECT 1 FROM pg_sleep(2)", nativeQuery = true)
    int runHeavyQuery();
}
