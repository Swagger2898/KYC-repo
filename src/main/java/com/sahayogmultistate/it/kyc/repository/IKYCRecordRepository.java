/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.sahayogmultistate.it.kyc.repository;

import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 *
 * @author HP
 */
//@Repository
//public interface IKYCRecordRepository extends JpaRepository<KYCRecord, Long> {
//
//    @Query("SELECT k FROM KYCRecord k WHERE k.adharNoFirst = :adharNoFirst AND k.accountType = :accountType")
//    List<KYCRecord> findByAdharNoAndaccountType(@Param("adharNoFirst") String adharNoFirst, @Param("accountType") String accountType);
//
//    @Query("SELECT k FROM KYCRecord k WHERE k.branchName = :branchName")
//    List<KYCRecord> findAllByBranchName(@Param("branchName") String branchName);
//
//    @Query("SELECT k FROM KYCRecord k WHERE k.adharNoFirst = :adharNoFirst")
//    List<KYCRecord> findByAdharNo(@Param("adharNoFirst") String adharNoFirst);
//
//    List<KYCRecord> findAll(Sort sort);
//
//}
