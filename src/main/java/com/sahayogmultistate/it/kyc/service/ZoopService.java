/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.sahayogmultistate.it.kyc.service;

/**
 *
 * @author ritik
 */
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@ConditionalOnProperty(name = "zoop.enabled", havingValue = "true")
public class ZoopService {

    @Value("${zoop.api.key}")
    private String apiKey;

    @Value("${zoop.app.id}")
    private String appId;

    @Value("${zoop.api.url}")
    private String apiUrl;

    @Value("${zoop.api.request.url}")
    private String requestUrl;

    @Value("${zoop.api.verify.url}")
    private String verifyUrl;

    private final RestTemplate restTemplate;

    public ZoopService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public ResponseEntity<String> requestOtp(String aadhaarNumber) {
        String consent = "Y";
        String consentText = "I hear by declare my consent agreement for fetching my information via ZOOP API";
        UUID uuid = UUID.randomUUID();
        String taskId = uuid.toString();
        String requestBody = String.format("{\"mode\": \"sync\", \"data\": {\"customer_aadhaar_number\": \"%s\", \"consent\": \"%s\", \"consent_text\": \"%s\"}, \"task_id\": \"%s\"}",
                aadhaarNumber, consent, consentText, taskId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", apiKey);
        headers.set("app-id", appId);

        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        return restTemplate.exchange(requestUrl, HttpMethod.POST, entity, String.class);
    }

    public ResponseEntity<String> verifyOtp(String requestId, String otp, String taskId) {
        String consent = "Y";
        String consentText = "I hear by declare my consent agreement for fetching my information via ZOOP API";
        String requestBody = String.format("{\"mode\": \"sync\", \"data\": {\"request_id\": \"%s\", \"otp\": \"%s\", \"consent\": \"%s\", \"consent_text\": \"%s\"}, \"task_id\": \"%s\"}",
                requestId, otp, consent, consentText, taskId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", apiKey);
        headers.set("app-id", appId);

        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        return restTemplate.exchange(verifyUrl, HttpMethod.POST, entity, String.class);
    }

    public ResponseEntity<String> verifyPan(String panNumber, String panHolderName) {
        String url = UriComponentsBuilder.fromHttpUrl(apiUrl)
                .toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.set("app-id", appId);
        headers.set("api-key", apiKey);
        headers.set("Content-Type", "application/json");

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("mode", "sync");
        Map<String, String> data = new HashMap<>();
        data.put("customer_pan_number", panNumber);
        data.put("consent", "Y");
        data.put("pan_holder_name", panHolderName);
        data.put("consent_text", "I hear by declare my consent agreement for fetching my information via ZOOP API");
        requestBody.put("data", data);
        requestBody.put("task_id", "f26eb21e-4c35-4491-b2d5-41fa0e545a34");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        return restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
    }
}
