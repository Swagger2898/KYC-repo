/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


package com.sahayogmultistate.it.kyc.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 *
 * @author developer
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRecord {
    
    @Id
    @GeneratedValue
    private int id;
    private String userName;
    @JsonIgnore
    private String userPassword;
    private String branchName;
    private String userType;
    private String userIdStatus;
    private String remark;
    
}
