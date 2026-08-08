/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.sahayogmultistate.it.kyc.model;

import java.util.List;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Lob;
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
public class KycPubPvt extends BaseKycModel {

    private String entity;
    private String applicantFirst;
    private String applicantSecond;
    private String applicantThird;
    private String adharNoFirst;
    private String adharNoSecond;
    private String adharNoThird;
    private String companyDocStatus;

    @Lob
    @Column(name = "companyDoc", length = 3000)
    private List<byte[]> companyDoc;
}
