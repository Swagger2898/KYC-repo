package com.sahayogmultistate.it.kyc.controller;

import com.sahayogmultistate.it.kyc.dto.branch.BranchAccessRequest;
import com.sahayogmultistate.it.kyc.dto.branch.BranchAccessResponse;
import com.sahayogmultistate.it.kyc.model.BranchAccess;
import com.sahayogmultistate.it.kyc.service.BranchAccessService;
import java.util.List;
import java.util.stream.Collectors;
import javax.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("branch")
public class BranchAccessController {

    @Autowired
    private BranchAccessService service;

    public BranchAccessController() {
        System.out.println("I am in User RecordController");
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BranchAccessResponse> save(@Valid @RequestBody BranchAccessRequest request) {
        BranchAccess branchAccess = service.add(request.getUserName(), request.getBranchNameList(),
                request.getUserType(), request.getUserIdStatus(), request.getBranchName());
        return ResponseEntity.status(HttpStatus.CREATED).body(BranchAccessResponse.fromEntity(branchAccess));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BranchAccessResponse> update(@PathVariable int id, @Valid @RequestBody BranchAccessRequest request) {
        BranchAccess branchAccess = service.update(id, request.getUserName(), request.getBranchNameList(),
                request.getUserType(), request.getUserIdStatus(), request.getBranchName());
        if (branchAccess == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(BranchAccessResponse.fromEntity(branchAccess));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BranchAccessResponse>> getAll() {
        List<BranchAccess> list = service.getAll();
        return ResponseEntity.ok(list.stream().map(BranchAccessResponse::fromEntity).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BranchAccessResponse> get(@PathVariable int id) {
        BranchAccess branchAccess = service.get(id);
        if (branchAccess == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(BranchAccessResponse.fromEntity(branchAccess));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BranchAccessResponse> getUserRecord(@PathVariable String username) {
        BranchAccess branchAccess = service.getUser(username);
        if (branchAccess == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(BranchAccessResponse.fromEntity(branchAccess));
    }
}