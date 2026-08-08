package com.sahayogmultistate.it.kyc.security;

import com.sahayogmultistate.it.kyc.model.UserRecord;
import com.sahayogmultistate.it.kyc.service.UserRecordService;
import java.util.Collections;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRecordService userRecordService;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserRecord userRecord = userRecordService.getUser(username);
        if (userRecord == null) {
            throw new UsernameNotFoundException("User not found: " + username);
        }

        if (!"Accept".equalsIgnoreCase(userRecord.getUserIdStatus())) {
            throw new DisabledException(
                    "User account is inactive. Status: " + userRecord.getUserIdStatus()
            );
        }
        return User.builder()
                .username(userRecord.getUserName())
                .password(userRecord.getUserPassword())
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + userRecord.getUserType())))
                .build();
    }
}
