//package com.sahayogmultistate.it.kyc.service;
//
//import com.sahayogmultistate.it.kyc.model.BaseKycModel;
//import java.util.List;
//import java.util.Map;
//import java.util.function.Function;
//import java.util.stream.Collectors;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//@Service
//public class KycProcessorDispatcher {
//
//    private final Map<String, KycProcessor> processors;
//
//    @Autowired
//    public KycProcessorDispatcher(List<KycProcessor> processors) {
//        this.processors = processors.stream()
//                .collect(Collectors.toMap(KycProcessor::getType, Function.identity()));
//    }
//
//    public BaseKycModel process(String type, Object request) {
//        KycProcessor processor = processors.get(type);
//        if (processor == null) {
//            throw new IllegalArgumentException("No processor found for type: " + type);
//        }
//        return processInternal(processor, request);
//    }
//
//    @SuppressWarnings("unchecked")
//    private <T> BaseKycModel processInternal(KycProcessor<T> processor, Object request) {
//        return processor.process((T) request);
//    }
//}
