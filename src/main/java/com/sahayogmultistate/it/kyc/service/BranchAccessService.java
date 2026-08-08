/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.sahayogmultistate.it.kyc.service;

import com.sahayogmultistate.it.kyc.model.BranchAccess;
import com.sahayogmultistate.it.kyc.model.UserRecord;
import com.sahayogmultistate.it.kyc.repository.IBranchAccessRepository;
import com.sahayogmultistate.it.kyc.repository.IUserRecordRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import javax.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 *
 * @author HP
 */
@Service
public class BranchAccessService {

    @Autowired
    private IBranchAccessRepository repository;

    public BranchAccessService() {
        System.out.println("I am in BranchAccess Service");
    }

//        private int id;
//    private String userName;
//    private ArrayList branchNameList;
//    private String userType;
//    private String userIdStatus;
    public BranchAccess add(String userName, ArrayList branchNameList,
            String userType, String userIdStatus, String branchName) {
        BranchAccess bas = new BranchAccess();
        bas.setUserName(userName);
        bas.setBranchNameList(branchNameList);
        bas.setUserType(userType);
        bas.setUserIdStatus(userIdStatus);
        bas.setBranchName(branchName);
        repository.save(bas);
        return bas;
    }

    public BranchAccess update(int id, String userName, ArrayList branchNameList,
            String userType, String userIdStatus, String branchName) {
        if (getUser(userName) != null) {
            BranchAccess bas = new BranchAccess();
            bas.setId(id);
            bas.setUserName(userName);
            bas.setBranchNameList(branchNameList);
            bas.setUserType(userType);
            bas.setUserIdStatus(userIdStatus);
            bas.setBranchName(branchName);
            repository.save(bas);
            return bas;
        }
        return null;
    }

//    public BranchAccess getUser(String username) {
//        List<BranchAccess> userList = repository.findAll();
//        for (BranchAccess branchAccess : userList) {
//            if (branchAccess.getUserName().equals(username)) {
//                return branchAccess;
//            }
//        }
//        return null;
//    }
    @Transactional
    public BranchAccess getUser(String username) {
        Optional<BranchAccess> findBranchByUserName = repository.findByUsername(username);
        return findBranchByUserName.orElse(null);
    }

    public List<BranchAccess> getAll() {
        return repository.findAll();
    }

    public BranchAccess get(int id) {
        Optional<BranchAccess> optional = repository.findById(id);
        return optional.orElse(null);
    }

    public void delete(int id) {
        repository.deleteById(id);
    }
}
