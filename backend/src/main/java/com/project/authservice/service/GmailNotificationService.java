package com.project.authservice.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class GmailNotificationService {

    private static final Logger log = LoggerFactory.getLogger(GmailNotificationService.class);

    @Autowired(required = false)
    private JavaMailSender javaMailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${app.mail.enabled:true}")
    private boolean mailEnabled;

    /**
     * Send email via Gmail SMTP or fallback to console simulation.
     */
    public boolean sendEmail(String to, String subject, String bodyHtml, String bodyText) {
        if (!mailEnabled || fromEmail == null || fromEmail.isBlank() || javaMailSender == null) {
            log.info("\n================ [LOCAL GMAIL SIMULATION] ================\n" +
                            "To: {}\nSubject: {}\nBody: {}\n" +
                            "==========================================================",
                    to, subject, bodyText);
            return true;
        }

        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(bodyText, bodyHtml);

            javaMailSender.send(message);
            log.info("Email successfully dispatched via Gmail SMTP to {}", to);
            return true;
        } catch (Exception e) {
            log.warn("Gmail SMTP send failed ({}), falling back to console log: {}", e.getMessage(), bodyText);
            return true;
        }
    }

    public void sendOtpNotification(String target, String otpCode, String purpose) {
        String subject = "Your Verification Code: " + otpCode;
        String text = String.format("Hello,\n\nYour one-time authentication code for %s is: %s\n\nThis code will expire in 5 minutes. If you did not request this, please ignore this email.", purpose, otpCode);
        String html = String.format(
                "<div style='font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;'>" +
                        "<div style='display: flex; align-items: center; margin-bottom: 20px;'>" +
                        "<div style='background: #2563eb; color: #ffffff; width: 44px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; margin-right: 12px;'>R&amp;D</div>" +
                        "<span style='font-size: 18px; font-weight: bold; color: #0f172a;'>Security Verification</span>" +
                        "</div>" +
                        "<p style='color: #475569; font-size: 15px;'>Use the one-time code below to complete your %s:</p>" +
                        "<div style='background: #f1f5f9; border: 1px solid #e2e8f0; padding: 20px; text-align: center; border-radius: 8px; margin: 24px 0;'>" +
                        "<span style='font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #2563eb; font-family: monospace;'>%s</span>" +
                        "</div>" +
                        "<p style='color: #64748b; font-size: 13px; line-height: 1.5;'>This code is valid for 5 minutes. If you didn't request this code, no action is needed. Never share this code with anyone.</p>" +
                        "<hr style='border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;'/>" +
                        "<span style='font-size: 11px; color: #94a3b8;'>Powered by Enterprise Auth Service &bull; Gmail SMTP Delivery</span>" +
                        "</div>",
                purpose, otpCode
        );

        sendEmail(target, subject, html, text);
    }

    public void sendPasswordResetNotification(String toEmail, String resetCode) {
        String subject = "Reset Your Password - Verification Code: " + resetCode;
        String text = String.format("Hello,\n\nWe received a request to reset your password. Your reset code is: %s\n\nThis code is valid for 10 minutes. If you did not request a password reset, please secure your account immediately.", resetCode);
        String html = String.format(
                "<div style='font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;'>" +
                        "<div style='display: flex; align-items: center; margin-bottom: 20px;'>" +
                        "<div style='background: #dc2626; color: #ffffff; width: 44px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; margin-right: 12px;'>R&amp;D</div>" +
                        "<span style='font-size: 18px; font-weight: bold; color: #0f172a;'>Password Reset Request</span>" +
                        "</div>" +
                        "<p style='color: #475569; font-size: 15px;'>We received a request to reset the password for your account. Use the code below to proceed:</p>" +
                        "<div style='background: #fef2f2; border: 1px solid #fee2e2; padding: 20px; text-align: center; border-radius: 8px; margin: 24px 0;'>" +
                        "<span style='font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #dc2626; font-family: monospace;'>%s</span>" +
                        "</div>" +
                        "<p style='color: #64748b; font-size: 13px; line-height: 1.5;'>This verification code is valid for 10 minutes. If you did not make this request, please ignore this email or change your password if you suspect unauthorized activity.</p>" +
                        "<hr style='border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;'/>" +
                        "<span style='font-size: 11px; color: #94a3b8;'>Powered by Enterprise Auth Service &bull; Gmail SMTP Delivery</span>" +
                        "</div>",
                resetCode
        );

        sendEmail(toEmail, subject, html, text);
    }
}
