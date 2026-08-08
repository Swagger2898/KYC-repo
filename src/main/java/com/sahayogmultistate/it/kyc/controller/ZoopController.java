//package com.sahayogmultistate.it.kyc.controller;
//
//import com.sahayogmultistate.it.kyc.dto.zoop.RequestOtpRequest;
//import com.sahayogmultistate.it.kyc.dto.zoop.VerifyOtpRequest;
//import com.sahayogmultistate.it.kyc.dto.zoop.VerifyPanRequest;
//import com.sahayogmultistate.it.kyc.service.ZoopService;
//import javax.validation.Valid;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//@RestController
//@RequestMapping("/api/zoop")
//public class ZoopController {
//
//    @Autowired
//    private ZoopService zoopService;
//
//    @PostMapping("/request-otp")
//    public ResponseEntity<String> requestOtp(@Valid @RequestBody RequestOtpRequest request) {
//        return zoopService.requestOtp(request.getAadhaarNumber());
//    }
//
//    @PostMapping("/verify-otp")
//    public ResponseEntity<String> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
//        return zoopService.verifyOtp(request.getRequestId(), request.getOtp(), request.getTaskId());
//    }
//
//    @PostMapping("/verify-pan")
//    public ResponseEntity<String> verifyPan(@Valid @RequestBody VerifyPanRequest request) {
//        return zoopService.verifyPan(request.getPanNumber(), request.getPanHolderName());
//    }
//}
