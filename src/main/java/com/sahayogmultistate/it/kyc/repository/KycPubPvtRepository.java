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
import com.sahayogmultistate.it.kyc.model.KycPubPvt;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface KycPubPvtRepository extends JpaRepository<KycPubPvt, Long> {
    
    @Query("SELECT k FROM KycPubPvt k WHERE k.adharNoFirst = :adharNoFirst AND k.accountType = :accountType")
    List<KycPubPvt> findByAdharNoAndaccountType(@Param("adharNoFirst") String adharNoFirst, @Param("accountType") String accountType);

    @Query("SELECT k FROM KycPubPvt k WHERE k.branchName = :branchName")
    List<KycPubPvt> findAllByBranchName(@Param("branchName") String branchName);

    @Query("SELECT k FROM KycPubPvt k WHERE k.adharNoFirst = :adharNoFirst")
    List<KycPubPvt> findByAdharNo(@Param("adharNoFirst") String adharNoFirst);  
    
    @Query("SELECT k FROM KycPubPvt k WHERE k.code = :code")
    KycPubPvt findByCode(@Param("code") String code);
    
}
