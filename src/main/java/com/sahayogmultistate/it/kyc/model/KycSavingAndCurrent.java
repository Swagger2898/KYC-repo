/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.sahayogmultistate.it.kyc.model;

import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 *
 * @author HP
 */
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@ToString
@Table
//    (    uniqueConstraints = @UniqueConstraint(
//                columnNames = {"adharNoFirst", "accountType"}
//
//        )
//)
public class KycSavingAndCurrent extends BaseKycModel {

    private String applicantFirst;
    private String adharNoFirst;
    private int verificationAttempts;
    private int maxVerificationAttempts = 3;
}
