package com.disaster.api.config.security;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.nio.charset.StandardCharsets;

@Configuration
public class SecurityConfiguration {

    private final JwtTokenProvider jwtTokenProvider;

    public SecurityConfiguration(
            JwtTokenProvider jwtTokenProvider
    ) {
        this.jwtTokenProvider =
                jwtTokenProvider;
    }

    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity httpSecurity
    ) throws Exception {

        httpSecurity
                .cors(cors -> {
                })

                .csrf(
                        AbstractHttpConfigurer::disable
                )

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .httpBasic(
                        AbstractHttpConfigurer::disable
                )

                .formLogin(
                        AbstractHttpConfigurer::disable
                )

                .authorizeHttpRequests(authorize ->
                        authorize

                                // CORS 사전 요청 허용
                                .requestMatchers(
                                        HttpMethod.OPTIONS,
                                        "/**"
                                ).permitAll()

                                // Swagger
                                .requestMatchers(
                                        "/swagger",
                                        "/swagger-ui.html",
                                        "/swagger-ui/**",
                                        "/api-docs",
                                        "/api-docs/**",
                                        "/v3/api-docs/**"
                                ).permitAll()

                                // 교육가이드 및 체크리스트
                                .requestMatchers(
                                        "/api/edu",
                                        "/api/edu/**",
                                        "/api/checklists",
                                        "/api/checklists/**"
                                ).permitAll()

                                // 비회원도 사용할 수 있는 회원 기능
                                .requestMatchers(
                                        "/member/login.do",
                                        "/member/write.do",
                                        "/member/check-id.do",
                                        "/member/find-password.do"
                                ).permitAll()

                                // 로그인 회원 기능
                                .requestMatchers(
                                        "/member/me.do",
                                        "/member/update.do",
                                        "/member/password.do",
                                        "/member/withdraw.do"
                                ).hasAnyRole(
                                        "USER",
                                        "ADMIN"
                                )

                                // 관리자 회원관리
                                .requestMatchers(
                                        "/member/admin/**"
                                ).hasRole("ADMIN")

                                // 문의 목록과 상세 조회
                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/qna/list.do",
                                        "/qna/view.do"
                                ).permitAll()

                                // 문의 등록
                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/qna/write.do"
                                ).hasAnyRole(
                                        "USER",
                                        "ADMIN"
                                )

                                // 문의 수정
                                .requestMatchers(
                                        HttpMethod.PUT,
                                        "/qna/update.do"
                                ).hasAnyRole(
                                        "USER",
                                        "ADMIN"
                                )

                                // 문의 삭제
                                .requestMatchers(
                                        HttpMethod.DELETE,
                                        "/qna/delete.do"
                                ).hasAnyRole(
                                        "USER",
                                        "ADMIN"
                                )

                                // 관리자 답변 등록
                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/qna/answer.do"
                                ).hasRole("ADMIN")

                                // 상품 조회
                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/product/**"
                                ).permitAll()

                                // 커뮤니티 및 게시판
                                .requestMatchers(
                                        "/community/**",
                                        "/board/**"
                                ).permitAll()

                                // 업로드 및 정적 파일
                                .requestMatchers(
                                        "/upload/**",
                                        "/txt/**",
                                        "/image/**"
                                ).permitAll()

                                // 퀴즈
                                .requestMatchers(
                                        "/quiz/list.do",
                                        "/quiz/view.do",
                                        "/quiz/write.do",
                                        "/quiz/update.do",
                                        "/quiz/delete.do"
                                ).permitAll()

                                .requestMatchers(
                                        "/**exception**"
                                ).permitAll()

                                // 그 외 요청은 관리자만 허용
                                .anyRequest()
                                .hasRole("ADMIN")
                )

                .addFilterBefore(
                        new JwtAuthenticationFilter(
                                jwtTokenProvider
                        ),
                        UsernamePasswordAuthenticationFilter.class
                )

                .exceptionHandling(exception ->
                        exception

                                .authenticationEntryPoint(
                                        (
                                                request,
                                                response,
                                                authException
                                        ) -> {
                                            response.setStatus(
                                                    HttpServletResponse
                                                            .SC_UNAUTHORIZED
                                            );

                                            response.setContentType(
                                                    MediaType
                                                            .APPLICATION_JSON_VALUE
                                            );

                                            response.setCharacterEncoding(
                                                    StandardCharsets
                                                            .UTF_8
                                                            .name()
                                            );

                                            response.getWriter().write(
                                                    "{\"msg\":\"인증이 실패하였습니다.\"}"
                                            );
                                        }
                                )

                                .accessDeniedHandler(
                                        (
                                                request,
                                                response,
                                                accessDeniedException
                                        ) -> {
                                            response.setStatus(
                                                    HttpServletResponse
                                                            .SC_FORBIDDEN
                                            );

                                            response.setContentType(
                                                    MediaType
                                                            .APPLICATION_JSON_VALUE
                                            );

                                            response.setCharacterEncoding(
                                                    StandardCharsets
                                                            .UTF_8
                                                            .name()
                                            );

                                            response.getWriter().write(
                                                    "{\"msg\":\"접근 권한이 없습니다.\"}"
                                            );
                                        }
                                )
                );

        return httpSecurity.build();
    }
}