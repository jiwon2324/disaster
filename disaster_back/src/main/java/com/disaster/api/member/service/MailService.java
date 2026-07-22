package com.disaster.api.common.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String senderEmail;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public void sendMail(
            String recipient,
            String subject,
            String content
    ) {
        if (senderEmail == null
                || senderEmail.isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "메일 발송 계정이 설정되지 않았습니다."
            );
        }

        if (recipient == null
                || recipient.isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "받는 사람의 이메일이 없습니다."
            );
        }

        try {
            SimpleMailMessage message =
                    new SimpleMailMessage();

            message.setFrom(senderEmail);
            message.setTo(recipient);
            message.setSubject(subject);
            message.setText(content);

            mailSender.send(message);

        } catch (MailException exception) {

            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "이메일 발송에 실패했습니다."
            );
        }
    }

    public void sendTemporaryPassword(
            String recipient,
            String memberId,
            String temporaryPassword
    ) {
        String subject =
                "[재난안전정보] 임시 비밀번호 안내";

        String content =
                "안녕하세요. 재난안전정보입니다.\n\n"
                        + memberId
                        + " 회원님의 임시 비밀번호가 발급되었습니다.\n\n"
                        + "임시 비밀번호: "
                        + temporaryPassword
                        + "\n\n"
                        + "임시 비밀번호로 로그인한 후 "
                        + "비밀번호 변경 메뉴에서 새로운 비밀번호로 변경해 주세요.\n\n"
                        + "본인이 요청하지 않았다면 관리자에게 문의해 주세요.";

        sendMail(
                recipient,
                subject,
                content
        );
    }

    public void sendQnaAnswerNotification(
            String recipient,
            String memberName,
            String questionTitle,
            Long questionNo
    ) {
        String detailUrl =
                frontendUrl
                        + "/qna/"
                        + questionNo;

        String displayName =
                memberName == null
                        || memberName.isBlank()
                        ? "회원"
                        : memberName;

        String subject =
                "[재난안전정보] 문의 답변이 등록되었습니다.";

        String content =
                "안녕하세요. "
                        + displayName
                        + "님.\n\n"
                        + "작성하신 문의에 관리자 답변이 등록되었습니다.\n\n"
                        + "문의 제목: "
                        + questionTitle
                        + "\n\n"
                        + "아래 주소에서 답변 내용을 확인할 수 있습니다.\n"
                        + detailUrl
                        + "\n\n"
                        + "감사합니다.";

        sendMail(
                recipient,
                subject,
                content
        );
    }
}