package com.sahayogmultistate.it.kyc.dto.auth;

public class AuthResponse {

    private String token;
    private String tokenType;
    private String userName;
    private String userType;

    public AuthResponse() {
    }

    public AuthResponse(String token, String tokenType, String userName, String userType) {
        this.token = token;
        this.tokenType = tokenType;
        this.userName = userName;
        this.userType = userType;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserType() {
        return userType;
    }

    public void setUserType(String userType) {
        this.userType = userType;
    }
}
