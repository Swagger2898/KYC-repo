CREATE SEQUENCE IF NOT EXISTS hibernate_sequence START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS kyc_saving_and_current (
    id BIGINT NOT NULL,
    account_type VARCHAR(255),
    branch_name VARCHAR(255),
    mobile_no VARCHAR(255),
    status VARCHAR(255),
    remark VARCHAR(10000),
    approved_by VARCHAR(255),
    uploaded_by VARCHAR(255),
    code VARCHAR(255),
    rejection_reason VARCHAR(255),
    rejected_by VARCHAR(255),
    document_base_path VARCHAR(255),
    applicant_first VARCHAR(255),
    adhar_no_first VARCHAR(255),
    verification_attempts INTEGER NOT NULL,
    max_verification_attempts INTEGER NOT NULL,
    CONSTRAINT pk_kyc_saving_and_current PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS kyc_audit (
    id BIGINT NOT NULL,
    kyc_id BIGINT,
    action VARCHAR(255),
    performed_by VARCHAR(255),
    role VARCHAR(255),
    remark VARCHAR(2000),
    timestamp TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_kyc_audit PRIMARY KEY (id),
    CONSTRAINT fk_kyc_audit_on_kyc FOREIGN KEY (kyc_id) REFERENCES kyc_saving_and_current (id) 
);

CREATE TABLE IF NOT EXISTS branch_access (
    id INTEGER NOT NULL,
    user_name VARCHAR(255),
    "branchNameList" BYTEA,
    user_type VARCHAR(255),
    user_id_status VARCHAR(255),
    branch_name VARCHAR(255),
    CONSTRAINT pk_branch_access PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS user_record (
    id INTEGER NOT NULL,
    user_name VARCHAR(255),
    user_password VARCHAR(255),
    branch_name VARCHAR(255),
    user_type VARCHAR(255),
    user_id_status VARCHAR(255),
    remark VARCHAR(255),
    CONSTRAINT pk_user_record PRIMARY KEY (id)
);
