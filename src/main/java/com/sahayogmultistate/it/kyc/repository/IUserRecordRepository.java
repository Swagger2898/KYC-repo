/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.sahayogmultistate.it.kyc.repository;

import com.sahayogmultistate.it.kyc.model.UserRecord;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

/**
 *
 * @author HP
 */
@Repository
public interface IUserRecordRepository extends JpaRepository<UserRecord, Integer> {

    Optional<UserRecord> findByUserName(String userName);

    @Query("SELECT u FROM UserRecord u WHERE u.userIdStatus = 'Accept' AND u.userType != 'Super User'")
    List<UserRecord> findActiveRecords();

    @Query("SELECT u FROM UserRecord u WHERE u.userIdStatus = 'Accept' AND u.userType = 'BOM'")
    List<UserRecord> findActiveRecordsBOM();

    @Query("SELECT u FROM UserRecord u WHERE u.userIdStatus = 'Accept' AND u.userType = 'COPs'")
    List<UserRecord> findActiveRecordsCOPs();

    @Query("SELECT u FROM UserRecord u WHERE u.userIdStatus = 'Reject'")
    List<UserRecord> findInactiveRecords();

    @Query("SELECT u FROM UserRecord u WHERE u.userIdStatus = 'Pending'")
    List<UserRecord> findPendingRecords();

    @Query("SELECT u FROM UserRecord u WHERE u.userIdStatus = 'Terminate'")
    List<UserRecord> findTerminateRecords();

    @Query("SELECT u FROM UserRecord u WHERE u.userIdStatus = 'Reset_Password'")
    List<UserRecord> findResetPasswordRecords();
}
