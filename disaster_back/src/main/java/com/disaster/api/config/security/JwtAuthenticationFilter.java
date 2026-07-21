package com.disaster.api.config.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Log4j2
public class JwtAuthenticationFilter
        extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    private static final String[] PUBLIC_PREFIXES = {
            "/api/edu",
            "/api/checklists",
            "/swagger-ui",
            "/api-docs",
            "/v3/api-docs"
    };

    private static final String[] PUBLIC_PATHS = {
            "/swagger",
            "/swagger-ui.html",
            "/api-docs",

            "/member/login.do",
            "/member/write.do",
            "/member/check-id.do",
            "/member/find-password.do"
    };

    public JwtAuthenticationFilter(
            JwtTokenProvider jwtTokenProvider
    ) {
        this.jwtTokenProvider =
                jwtTokenProvider;
    }

    @Override
    protected boolean shouldNotFilter(
            HttpServletRequest request
    ) {
        String path =
                request.getServletPath();

        // CORS 사전 요청은 JWT 검사 제외
        if ("OPTIONS".equalsIgnoreCase(
                request.getMethod()
        )) {
            return true;
        }

        for (
                String publicPath
                : PUBLIC_PATHS
        ) {
            if (publicPath.equals(path)) {
                return true;
            }
        }

        for (
                String publicPrefix
                : PUBLIC_PREFIXES
        ) {
            if (
                    path.equals(publicPrefix)
                            || path.startsWith(
                            publicPrefix + "/"
                    )
            ) {
                return true;
            }
        }

        return false;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String token =
                jwtTokenProvider.resolveToken(
                        request
                );

        log.info(
                "[doFilterInternal] token 값 추출 완료. token 존재 여부 : {}",
                token != null
        );

        if (
                token != null
                        && jwtTokenProvider
                        .validateToken(token)
        ) {
            Authentication authentication =
                    jwtTokenProvider
                            .getAuthentication(
                                    token
                            );

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(
                            authentication
                    );

            log.info(
                    "[doFilterInternal] token 값 유효성 체크 성공"
            );
        }

        filterChain.doFilter(
                request,
                response
        );
    }
}