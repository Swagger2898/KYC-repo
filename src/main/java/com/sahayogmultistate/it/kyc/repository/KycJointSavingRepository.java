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
import com.sahayogmultistate.it.kyc.model.KycJointSaving;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface KycJointSavingRepository extends JpaRepository<KycJointSaving, Long> {

    @Query("SELECT k FROM KycJointSaving k WHERE k.adharNoFirst = :adharNoFirst AND k.accountType = :accountType")
    List<KycJointSaving> findByAdharNoAndaccountType(@Param("adharNoFirst") String adharNoFirst, @Param("accountType") String accountType);

    @Query("SELECT k FROM KycJointSaving k WHERE k.branchName = :branchName")
    List<KycJointSaving> findAllByBranchName(@Param("branchName") String branchName);

    @Query("SELECT k FROM KycJointSaving k WHERE k.adharNoFirst = :adharNoFirst")
    List<KycJointSaving> findByAdharNo(@Param("adharNoFirst") String adharNoFirst);

    @Query("SELECT k FROM KycJointSaving k WHERE k.code = :code")
    KycJointSaving findByCode(@Param("code") String code);

}
