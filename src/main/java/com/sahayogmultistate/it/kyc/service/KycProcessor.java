package com.sahayogmultistate.it.kyc.service;

import com.sahayogmultistate.it.kyc.model.BaseKycModel;

public interface KycProcessor<T> {

    String getType();

    BaseKycModel process(T request);
}
