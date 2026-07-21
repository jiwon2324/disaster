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

    public SecurityConfiguration(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity httpSecurity
    ) throws Exception {

        httpSecurity
                .csrf(AbstractHttpConfigurer::disable)

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)

                .authorizeHttpRequests(authorize ->
                        authorize
                                // Swagger
                                .requestMatchers(
                                        "/swagger",
                                        "/swagger-ui.html",
                                        "/swagger-ui/**",
                                        "/api-docs",
                                        "/api-docs/**",
                                        "/v3/api-docs/**"
                                ).permitAll()

                                // 회원 공개 기능
                                .requestMatchers(
                                        "/member/login.do",
                                        "/member/write.do",
                                        "/member/check-id.do"
                                ).permitAll()

                                // 일반 회원 기능
                                .requestMatchers(
                                        "/member/me.do",
                                        "/member/update.do",
                                        "/member/password.do",
                                        "/member/withdraw.do"
                                ).hasAnyRole("USER", "ADMIN")

                                // 관리자 회원관리
                                .requestMatchers(
                                        "/member/admin/**"
                                ).hasRole("ADMIN")

                                // QnA 관리자 답변
                                .requestMatchers(
                                        "/qna/answer.do"
                                ).hasRole("ADMIN")

                                // 나머지 QnA 기능
                                .requestMatchers(
                                        "/qna/**"
                                ).hasAnyRole("USER", "ADMIN")

                                // 상품
                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/product/**"
                                ).permitAll()

                                // 커뮤니티
                                .requestMatchers(
                                        "/community/**"
                                ).permitAll()

                                // 텍스트 및 이미지
                                .requestMatchers(
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

                                // 재난 카테고리
                                .requestMatchers(
                                        "/disasterCategory",
                                        "/disasterCategory/**"
                                ).permitAll()

                                // 재난 리스트(정보)
                                .requestMatchers(
                                        "/disasterInfo/**"
                                ).permitAll()

                                // 재난 스크랩
                                .requestMatchers(
                                        "/disasterScrap/**"
                                ).permitAll()

                                // 재난 정보 api 수집
                                .requestMatchers(
                                        "/api/disaster/**"
                                ).permitAll()
                                // 나머지 기능은 관리자만 접근
                                .anyRequest().hasRole("ADMIN")
                )

                .addFilterBefore(
                        new JwtAuthenticationFilter(jwtTokenProvider),
                        UsernamePasswordAuthenticationFilter.class
                )

                .exceptionHandling(exception ->
                        exception
                                // 토큰이 없거나 잘못된 경우: 401
                                .authenticationEntryPoint(
                                        (request, response, authException) -> {
                                            response.setStatus(
                                                    HttpServletResponse.SC_UNAUTHORIZED
                                            );
                                            response.setContentType(
                                                    MediaType.APPLICATION_JSON_VALUE
                                            );
                                            response.setCharacterEncoding(
                                                    StandardCharsets.UTF_8.name()
                                            );
                                            response.getWriter().write(
                                                    "{\"msg\":\"인증이 실패하였습니다.\"}"
                                            );
                                        }
                                )

                                // 로그인은 됐지만 권한이 없는 경우: 403
                                .accessDeniedHandler(
                                        (request, response, accessDeniedException) -> {
                                            response.setStatus(
                                                    HttpServletResponse.SC_FORBIDDEN
                                            );
                                            response.setContentType(
                                                    MediaType.APPLICATION_JSON_VALUE
                                            );
                                            response.setCharacterEncoding(
                                                    StandardCharsets.UTF_8.name()
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