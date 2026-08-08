/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.sahayogmultistate.it.kyc.model;

import java.util.ArrayList;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Lob;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 *
 * @author deolapar
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BranchAccess {
    
    @Id
    @GeneratedValue
    private int id;
    private String userName;
    @Lob
    @Column(name = "branchNameList", length = 3000)
    private ArrayList<String> branchNameList;
    private String userType;
    private String userIdStatus;
    private String branchName;
    
}
