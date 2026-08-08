/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.sahayogmultistate.it.kyc.repository;

import com.sahayogmultistate.it.kyc.model.BranchAccess;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 *
 * @author HP
 */
@Repository
public interface IBranchAccessRepository extends JpaRepository<BranchAccess, Integer> {

    @Query("SELECT b FROM BranchAccess b WHERE b.userName = :userName")
    Optional<BranchAccess> findByUsername(@Param("userName") String userName);
}

