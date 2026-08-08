///*
// * To change this license header, choose License Headers in Project Properties.
// * To change this template file, choose Tools | Templates
// * and open the template in the editor.
// */
//package com.sahayogmultistate.it.kyc.model;
//
//import java.util.ArrayList;
//import java.util.Date;
//import java.util.List;
//import javax.persistence.*;
//import lombok.AllArgsConstructor;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//import lombok.ToString;
//
//@NoArgsConstructor
//@AllArgsConstructor
//@Data
//@Entity
//@ToString
//public class KYCRecord {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.SEQUENCE)
//    private long id;
//    private String accountType;
//    private String branchName;
//    private String applicantFirst;
//    private long mobileNo;
//    private String adharNoFirst;
//    @Enumerated(EnumType.STRING)
//    private KycStatus status;
//    @Version
//    private Long version;
//    private String accessingId;
//    @Column(name = "remark", length = 10000)
//    private String remark;
//
//    @Lob
//    @Column(name = "date", length = 5000)
//    private ArrayList<Date> date;
//
//    private String approvedBy;
//    private String uploadedBy;
//    private String code;
//
//    @Lob
//    @Column(name = "timeStam", length = 5000)
//    private ArrayList<String> timeStam;
//
//}
