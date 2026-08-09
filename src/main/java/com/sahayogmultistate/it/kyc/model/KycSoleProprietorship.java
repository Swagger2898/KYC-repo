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
//@Entity
@ToString
public class KycSoleProprietorship extends BaseKycModel {

    private String entity;
    private String applicantFirst;
    private String adharNoFirst;
    private String entityProofStatus;

    @Lob
    @Column(name = "entityProof", length = 3000)
    private List<byte[]> entityProof;
}
