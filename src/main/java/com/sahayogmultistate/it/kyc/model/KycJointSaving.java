/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.sahayogmultistate.it.kyc.model;

import javax.persistence.Entity;
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
//@Entity
@ToString
public class KycJointSaving extends BaseKycModel {

    private String applicantFirst;
    private String applicantSecond;
    private String applicantThird;
    private String adharNoFirst;
    private String adharNoSecond;
    private String adharNoThird;
}
