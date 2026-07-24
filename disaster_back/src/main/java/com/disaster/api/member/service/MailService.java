package com.disaster.api.common.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Log4j2
public class MailService {

    private static final String QNA_DETAIL_URL =
            "http://localhost:5173/qna/";

    private final JavaMailSender mailSender;

    /**
     * 공통 메일 발송
     */
    public void sendMail(
            String recipient,
            String subject,
            String content
    ) {
        if (recipient == null
                || recipient.isBlank()) {

            throw new IllegalArgumentException(
                    "수신자 이메일이 없습니다."
            );
        }

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(
                recipient.trim()
        );

        message.setSubject(
                subject
        );

        message.setText(
                content
        );

        mailSender.send(
                message
        );

        log.info(
                "메일 발송 완료. recipient={}, subject={}",
                recipient,
                subject
        );
    }

    /**
     * 임시 비밀번호 안내 메일
     */
    public void sendTemporaryPassword(
            String recipient,
            String memberName,
            String temporaryPassword
    ) {
        String displayName =
                memberName == null
                        || memberName.isBlank()
                        ? "회원"
                        : memberName.trim();

        String subject =
                "[안전온] 임시 비밀번호 안내";

        String content =
                "안녕하세요. 안전온입니다.\n\n"
                        + displayName
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

    /**
     * Q&A 관리자 답변 등록 알림 메일
     */
    public void sendQnaAnswerNotification(
            String recipient,
            String memberName,
            String questionTitle,
            Long questionNo
    ) {
        String displayName =
                memberName == null
                        || memberName.isBlank()
                        ? "회원"
                        : memberName.trim();

        String displayQuestionTitle =
                questionTitle == null
                        || questionTitle.isBlank()
                        ? "문의"
                        : questionTitle.trim();

        String detailUrl =
                QNA_DETAIL_URL
                        + questionNo;

        String subject =
                "[안전온] 문의 답변이 등록되었습니다.";

        String content =
                "안녕하세요. "
                        + displayName
                        + "님.\n\n"
                        + "안전온에 작성하신 문의에 "
                        + "관리자 답변이 등록되었습니다.\n\n"
                        + "문의 제목: "
                        + displayQuestionTitle
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