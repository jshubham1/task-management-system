package com.taskmanagement.api.service;

import com.taskmanagement.api.entity.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender emailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:4200}")
    private String frontendUrl;

    @Async
    public void sendVerificationEmail(User user) {
        try {
            String verificationToken = UUID.randomUUID().toString();
            String verificationUrl = frontendUrl + "/auth/verify?token=" + verificationToken;

            // Save verification token to user (you'll need to implement this)
            // userService.saveVerificationToken(user, verificationToken);

            Context context = new Context();
            context.setVariable("userName", user.getFirstName());
            context.setVariable("verificationUrl", verificationUrl);
            context.setVariable("expirationHours", 24);

            String htmlBody = templateEngine.process("email/verification", context);

            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("Verify Your Email Address - Task Management System");
            helper.setText(htmlBody, true);

            emailSender.send(message);
            log.info("Verification email sent successfully to: {}", user.getEmail());

        } catch (MessagingException | MailException ex) {
            log.error("Failed to send verification email to: {}, Error: {}", user.getEmail(), ex.getMessage());
        }
    }

    @Async
    public void sendPasswordResetEmail(User user, String resetToken) {
        try {
            String resetUrl = frontendUrl + "/auth/reset-password?token=" + resetToken;

            Context context = new Context();
            context.setVariable("userName", user.getFirstName());
            context.setVariable("resetUrl", resetUrl);
            context.setVariable("expirationHours", 1);

            String htmlBody = templateEngine.process("email/password-reset", context);

            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("Password Reset Request - Task Management System");
            helper.setText(htmlBody, true);

            emailSender.send(message);
            log.info("Password reset email sent successfully to: {}", user.getEmail());

        } catch (MessagingException | MailException ex) {
            log.error("Failed to send password reset email to: {}, Error: {}", user.getEmail(), ex.getMessage());
        }
    }

    @Async
    public void sendTaskDueReminderEmail(User user, String taskTitle, LocalDateTime dueDate) {
        try {
            Context context = new Context();
            context.setVariable("userName", user.getFirstName());
            context.setVariable("taskTitle", taskTitle);
            context.setVariable("dueDate", dueDate);

            String htmlBody = templateEngine.process("email/task-reminder", context);

            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("Task Due Reminder: " + taskTitle);
            helper.setText(htmlBody, true);

            emailSender.send(message);
            log.info("Task reminder email sent successfully to: {}", user.getEmail());

        } catch (MessagingException | MailException ex) {
            log.error("Failed to send task reminder email to: {}, Error: {}", user.getEmail(), ex.getMessage());
        }
    }

    @Async
    public void sendWelcomeEmail(User user) {
        try {
            Context context = new Context();
            context.setVariable("userName", user.getFirstName());
            context.setVariable("loginUrl", frontendUrl + "/auth/login");

            String htmlBody = templateEngine.process("email/welcome", context);

            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("Welcome to Task Management System!");
            helper.setText(htmlBody, true);

            emailSender.send(message);
            log.info("Welcome email sent successfully to: {}", user.getEmail());

        } catch (MessagingException | MailException ex) {
            log.error("Failed to send welcome email to: {}, Error: {}", user.getEmail(), ex.getMessage());
        }
    }

    // Fallback method for simple text emails
    public void sendSimpleEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);

            emailSender.send(message);
            log.info("Simple email sent successfully to: {}", to);
        } catch (MailException ex) {
            log.error("Failed to send simple email to: {}, Error: {}", to, ex.getMessage());
        }
    }
}
