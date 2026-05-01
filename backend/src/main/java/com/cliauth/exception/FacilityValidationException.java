package com.cliauth.exception;

public class FacilityValidationException extends RuntimeException {
    public FacilityValidationException(String message) {
        super(message);
    }

    public FacilityValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
