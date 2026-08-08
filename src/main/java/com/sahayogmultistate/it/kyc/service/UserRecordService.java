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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 *
 * @author HP
 */
@Service
public class UserRecordService {

    @Autowired
    private IUserRecordRepository repository;

    @Autowired
    private BranchAccessService branchAccessService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserRecordService() {
        System.out.println("I am in User Service");
    }

    public UserRecord add(String userName, String userPassword,
            String branchName, String userType, String userIdStatus,
            String remark) {
        if (getUser(userName) == null) {
            UserRecord userRecord = new UserRecord();
            userRecord.setUserName(userName);
            userRecord.setUserPassword(passwordEncoder.encode(userPassword));
            userRecord.setBranchName(branchName);
            userRecord.setUserType(userType);
            userRecord.setUserIdStatus(userIdStatus);
            userRecord.setRemark(remark);
            repository.save(userRecord);
            return userRecord;
        }
        return getUser(userName);
    }

    public UserRecord update(int id, String userName, String userPassword,
            String branchName, String userType, String userIdStatus, String remark) {
        if (getUser(userName) != null) {
            UserRecord userRecord = new UserRecord();
            userRecord.setId(id);
            userRecord.setUserName(userName);
            userRecord.setUserPassword(passwordEncoder.encode(userPassword));
            userRecord.setBranchName(branchName);
            userRecord.setUserType(userType);
            userRecord.setUserIdStatus(userIdStatus);
            userRecord.setRemark(remark);
            BranchAccess branchUser = branchAccessService.getUser(userName);
            if (branchUser != null) {
                ArrayList<String> branchNameList = branchUser.getBranchNameList();
                int branchId = branchUser.getId();
                branchAccessService.update(branchId, userName, branchNameList, userType, userIdStatus, branchName);
            } else {
                ArrayList<String> branchNameList = new ArrayList<>();
                branchNameList.add(branchName);
                branchAccessService.add(userName, branchNameList, userType, userIdStatus, branchName);
            }
            repository.save(userRecord);
            return userRecord;
        }
        return null;
    }

    public List<UserRecord> getallUser() {
        return repository.findAll();
    }

    public UserRecord get(int id) {
        Optional<UserRecord> optional = repository.findById(id);
        return optional.orElse(null);
    }

    @Transactional
    public List<UserRecord> getActiveRecords() {
        return repository.findActiveRecords();
    }

    @Transactional
    public List<UserRecord> getActiveRecordsBOM() {
        return repository.findActiveRecordsBOM();
    }

    @Transactional
    public List<UserRecord> getActiveRecordsCOPs() {
        return repository.findActiveRecordsCOPs();
    }

    @Transactional
    public List<UserRecord> getInactiveRecords() {
        return repository.findInactiveRecords();
    }

    @Transactional
    public List<UserRecord> getPendingRecords() {
        return repository.findPendingRecords();
    }

    @Transactional
    public List<UserRecord> getTerminateRecords() {
        return repository.findTerminateRecords();
    }

    @Transactional
    public List<UserRecord> getResetPasswordRecords() {
        return repository.findResetPasswordRecords();
    }

    public ArrayList<String> getAllRecordsNumberList() {
        List<UserRecord> activeRecords = getActiveRecords();
        List<UserRecord> inactiveRecords = getInactiveRecords();
        List<UserRecord> pendingRecords = getPendingRecords();
        List<UserRecord> terminateRecords = getTerminateRecords();
        List<UserRecord> resetPasswordRecords = getResetPasswordRecords();
        ArrayList<String> arrayList = new ArrayList<String>();
        arrayList.add(activeRecords.size() + "");
        arrayList.add(inactiveRecords.size() + "");
        arrayList.add(pendingRecords.size() + "");
        arrayList.add(terminateRecords.size() + "");
        arrayList.add(resetPasswordRecords.size() + "");
        return arrayList;
    }

    @Transactional
    public UserRecord getUser(String username) {
        Optional<UserRecord> userRecordOptional = repository.findByUserName(username);

        return userRecordOptional.orElse(null);
    }

    public UserRecord getUserRstPass(String username, String password) {
        UserRecord user = getUser(username);
        if (user != null) {
            user.setUserPassword(passwordEncoder.encode(password));
            user.setUserIdStatus("Reset_Password");
            user.setRemark("Remark : Reset Password");
            UserRecord record = repository.save(user);
            return record;
        }
        return user;
    }

    public void delete(int id) {
        repository.deleteById(id);
    }
}

//    //For Branch get User method 
//    public BranchAccess getBranchUser(String username) {
//        List<BranchAccess> userList = branchAccessRepository.findAll();
//        for (BranchAccess userRecord : userList) {
//            if (userRecord.getUserName().equals(username)) {
//                return userRecord;
//            }
//        }
//        return null;
//    }
//    
//    public UserRecord getUser(String username) {
//        List<UserRecord> userList = getallUser();
//        for (UserRecord userRecord : userList) {
//            if (userRecord.getUserName().equals(username)) {
//                return userRecord;
//            }
//        }
//        return null;
//    }
//    public UserRecord getUser(String username, String password) {
//        List<UserRecord> userList = getallUser();
//        for (UserRecord userRecord : userList) {
//            if (userRecord.getUserName().equals(username) && userRecord.getUserPassword().equals(password)) {
//                return userRecord;
//            }
//        }
//        return null;
//    }
//
//    public UserRecord getActiveRecord(int id) {
//        UserRecord userRecord = get(id);
//        if ("Accept".equals(userRecord.getUserIdStatus())) {
//            return userRecord;
//        }
//        return null;
//    }
//    
//    public UserRecord getInactiveRecord(int id) {
//        UserRecord userRecord = get(id);
//        if ("Reject".equals(userRecord.getUserIdStatus())) {
//            return userRecord;
//        }
//        return null;
//    }
//    
//    public UserRecord getPendingRecord(int id) {
//        UserRecord userRecord = get(id);
//        if ("Pending".equals(userRecord.getUserIdStatus())) {
//            return userRecord;
//        }
//        return null;
//    }
//    public List<UserRecord> getActiveRecords() {
//        List<UserRecord> all = getallUser();
//        ArrayList<UserRecord> list = new ArrayList<>();
//        all.forEach((UserRecord ele) -> {
//            if ("Accept".equals(ele.getUserIdStatus())) {
//                if (ele.getUserType() != "Super User") {
//                    list.add(ele);
//                } else {
//                }
//            }
//        });
//        return list;
//    }
//    public List<UserRecord> getActiveRecordsBOM() {
//        List<UserRecord> all = getallUser();
//        ArrayList<UserRecord> list = new ArrayList<>();
//        all.forEach((UserRecord ele) -> {
//            if ("Accept".equals(ele.getUserIdStatus()) && ele.getUserType().equals("BOM")) {
//                list.add(ele);
//            }
//        });
//        return list;
//    }
//    public List<UserRecord> getActiveRecordsCOPs() {
//        List<UserRecord> all = getallUser();
//        ArrayList<UserRecord> list = new ArrayList<>();
//        all.forEach((UserRecord ele) -> {
//            if ("Accept".equals(ele.getUserIdStatus()) && ele.getUserType().equals("COPs")) {
//                list.add(ele);
//            }
//        });
//        return list;
//    }
//    public List<UserRecord> getInactiveRecords() {
//        List<UserRecord> all = getallUser();
//        ArrayList<UserRecord> list = new ArrayList<>();
//        all.forEach((UserRecord ele) -> {
//            if ("Reject".equals(ele.getUserIdStatus())) {
//                list.add(ele);
//            }
//        });
//        return list;
//    }
//    public List<UserRecord> getPendingRecords() {
//        List<UserRecord> all = getallUser();
//        ArrayList<UserRecord> list = new ArrayList<>();
//        all.forEach((UserRecord ele) -> {
//            if ("Pending".equals(ele.getUserIdStatus())) {
//                list.add(ele);
//            }
//        });
//        return list;
//    }
//    public List<UserRecord> getTerminateRecords() {
//        List<UserRecord> all = getallUser();
//        ArrayList<UserRecord> list = new ArrayList<>();
//        all.forEach((UserRecord ele) -> {
//            if ("Terminate".equals(ele.getUserIdStatus())) {
//                list.add(ele);
//            }
//        });
//        return list;
//    }
//    public List<UserRecord> getResetPasswordRecords() {
//        List<UserRecord> all = getallUser();
//        ArrayList<UserRecord> list = new ArrayList<>();
//        all.forEach((UserRecord ele) -> {
//            if ("Reset_Password".equals(ele.getUserIdStatus())) {
//                list.add(ele);
//            }
//        });
//        return list;
//    }
