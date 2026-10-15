package com.project.authservice.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.ByteArrayOutputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;

@Service
public class TotpService {

    private static final String BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    private static final int TIME_STEP_SECONDS = 30;
    private static final int CODE_DIGITS = 6;
    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Generate a new cryptographically secure Base32 TOTP secret key (160-bit / 20 bytes).
     */
    public String generateSecret() {
        byte[] buffer = new byte[20];
        secureRandom.nextBytes(buffer);
        return encodeBase32(buffer);
    }

    /**
     * Generate standard otpauth URI compatible with Google Authenticator and Microsoft Authenticator.
     */
    public String getOtpAuthUri(String secret, String accountName, String issuer) {
        try {
            String encodedAccount = URLEncoder.encode(accountName, StandardCharsets.UTF_8);
            String encodedIssuer = URLEncoder.encode(issuer, StandardCharsets.UTF_8);
            return String.format(
                    "otpauth://totp/%s:%s?secret=%s&issuer=%s&algorithm=SHA1&digits=%d&period=%d",
                    encodedIssuer, encodedAccount, secret, encodedIssuer, CODE_DIGITS, TIME_STEP_SECONDS
            );
        } catch (Exception e) {
            return String.format(
                    "otpauth://totp/%s:%s?secret=%s&issuer=%s",
                    issuer, accountName, secret, issuer
            );
        }
    }

    /**
     * Generate a QR code as a Base64 data URI (data:image/png;base64,...) using ZXing.
     */
    public String generateQrCodeDataUrl(String content, int width, int height) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, width, height);
            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
            byte[] pngData = pngOutputStream.toByteArray();
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(pngData);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }

    /**
     * Verify a 6-digit TOTP code against a secret key with a window of +/- 1 time step for clock drift.
     */
    public boolean verifyCode(String secret, String code) {
        if (secret == null || code == null || code.trim().length() != CODE_DIGITS) {
            return false;
        }

        try {
            int inputCode = Integer.parseInt(code.trim());
            long currentStep = Instant.now().getEpochSecond() / TIME_STEP_SECONDS;

            // Check current step, previous step, and next step to accommodate minor clock drift
            for (int i = -1; i <= 1; i++) {
                int expectedCode = generateTotpCode(secret, currentStep + i);
                if (expectedCode == inputCode) {
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    private int generateTotpCode(String secret, long step) throws Exception {
        byte[] keyBytes = decodeBase32(secret);
        byte[] data = new byte[8];
        for (int i = 7; i >= 0; i--) {
            data[i] = (byte) (step & 0xFF);
            step >>= 8;
        }

        Mac mac = Mac.getInstance("HmacSHA1");
        mac.init(new SecretKeySpec(keyBytes, "RAW"));
        byte[] hash = mac.doFinal(data);

        int offset = hash[hash.length - 1] & 0x0F;
        int binary = ((hash[offset] & 0x7F) << 24)
                | ((hash[offset + 1] & 0xFF) << 16)
                | ((hash[offset + 2] & 0xFF) << 8)
                | (hash[offset + 3] & 0xFF);

        return binary % (int) Math.pow(10, CODE_DIGITS);
    }

    // Base32 encoding
    private String encodeBase32(byte[] data) {
        StringBuilder sb = new StringBuilder();
        int buffer = 0;
        int bitsLeft = 0;

        for (byte b : data) {
            buffer = (buffer << 8) | (b & 0xFF);
            bitsLeft += 8;
            while (bitsLeft >= 5) {
                int index = (buffer >> (bitsLeft - 5)) & 0x1F;
                bitsLeft -= 5;
                sb.append(BASE32_ALPHABET.charAt(index));
            }
        }

        if (bitsLeft > 0) {
            int index = (buffer << (5 - bitsLeft)) & 0x1F;
            sb.append(BASE32_ALPHABET.charAt(index));
        }

        return sb.toString();
    }

    // Base32 decoding
    private byte[] decodeBase32(String secret) {
        String cleanSecret = secret.trim().toUpperCase().replaceAll("[= ]", "");
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        int buffer = 0;
        int bitsLeft = 0;

        for (char c : cleanSecret.toCharArray()) {
            int val = BASE32_ALPHABET.indexOf(c);
            if (val < 0) {
                continue;
            }
            buffer = (buffer << 5) | val;
            bitsLeft += 5;
            if (bitsLeft >= 8) {
                out.write((buffer >> (bitsLeft - 8)) & 0xFF);
                bitsLeft -= 8;
            }
        }
        return out.toByteArray();
    }
}
