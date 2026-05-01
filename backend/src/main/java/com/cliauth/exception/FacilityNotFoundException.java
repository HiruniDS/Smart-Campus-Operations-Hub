package com.cliauth.exception;

public class FacilityNotFoundException extends RuntimeException {
    public FacilityNotFoundException(String message) {
        super(message);
    }

    public FacilityNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
