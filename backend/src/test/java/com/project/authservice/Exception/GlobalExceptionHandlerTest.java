package com.project.authservice.Exception;

import com.project.authservice.dto.ErrorResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
    }

    @Test
    void handleResourceNotFoundException_returnsNotFoundStatusAndErrorResponse() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Item not found");

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleResourceNotFoundException(ex);

        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Item not found", response.getBody().message());
        assertEquals(HttpStatus.NOT_FOUND, response.getBody().status());
        assertEquals(404, response.getBody().statusCode());
    }

    @Test
    void handleIllegalArgumentException_returnsBadRequestStatusAndErrorResponse() {
        IllegalArgumentException ex = new IllegalArgumentException("Invalid input argument");

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleIllegalArgumentException(ex);

        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Invalid input argument", response.getBody().message());
        assertEquals(HttpStatus.BAD_REQUEST, response.getBody().status());
        assertEquals(400, response.getBody().statusCode());
    }
}
