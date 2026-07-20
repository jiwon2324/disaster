package com.disaster.api.config.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfiguration {

    private final JwtTokenProvider jwtTokenProvider;

    // ?앹꽦?먮? ?댁슜???명똿
    @Autowired
    public SecurityConfiguration(JwtTokenProvider jwtTokenProvider){
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Bean // 由ы꽩?섎뒗 媛앹껜(SecurityFilterChain)瑜??깅줉?댁꽌 ?ъ슜?쒕떎.
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception{
        httpSecurity
                .cors(cors -> {})
                .csrf(AbstractHttpConfigurer::disable) //CSRF 蹂댄샇 湲곕뒫???꾨뒗 ?ㅼ젙
                .sessionManagement(
                        httpSecuritySessionManagementConfigurer ->
                        httpSecuritySessionManagementConfigurer.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS)) // session???ъ슜?섏? ?딅뒗??
                //?ъ슜???대쫫(username)怨?鍮꾨?踰덊샇(password)瑜?HTTP ?ㅻ뜑???댁븘 蹂대궡??媛??湲곕낯?곸씤 ?몄쬆 諛⑹떇 ?ъ슜?덊븿.
                // JWT?쇰줈 ?ъ슜?쒕떎.
                .httpBasic(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(authorize ->
                        authorize
                                // ?몄쬆(Authentication) ?놁씠 紐⑤뱺 ?ъ슜?먯쓽 ?묎렐???덉슜 - permitAll()
                                .requestMatchers("/swagger",
                                "/swagger-ui.html", "/swagger-ui/**", "/api-docs",
                                "/api-docs/**", "/v3/api-docs/**" ).permitAll()
                                .requestMatchers("/api/edu", "/api/edu/**",
                                        "/api/checklists", "/api/checklists/**").permitAll()
                                .requestMatchers("/member/login.do", "/member/write.do").permitAll()
                                .requestMatchers(HttpMethod.GET, "/product/**").permitAll()
                                .requestMatchers("/board/**", "/image/**").permitAll()
                                .requestMatchers("/upload/**").permitAll()
                                .requestMatchers("/txt/**").permitAll()
                                .requestMatchers("**exception**").permitAll()
                                // ?욎뿉???뺤쓽??URL???쒖쇅??紐⑤뱺 ?붿껌? ADMIN ??븷(Role)??媛吏??ъ슜?먮쭔
                                // ?묎렐?????덈룄濡??섎뒗 ?멸?(Authorization) 洹쒖튃
                                // ?묎렐?섎뒗 ?ъ슜?먯쓽 沅뚰븳??ADMIN?몄? ?뚭린 ?꾪빐???좏겙? ?뺤씤?쒕떎.
                                .anyRequest().hasRole("ADMIN")
                        )
                // ?ㅽ봽留??쒗걧由ы떚?먯꽌 湲곕낯?쇰줈 ?쒓났?섍퀬 ?덈뒗 濡쒓렇???쇱쓣 鍮꾪솢?깊솕?쒕떎.
                .formLogin(AbstractHttpConfigurer::disable)
                // ?좏겙 泥섎━瑜??욎뿉 ?ㅼ쓬 ?ъ슜??濡쒓렇???꾩씠?? 鍮꾨?踰덊샇 ?뺤씤 ?꾪꽣)
                .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider),
                        UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling((exceptionHanling) ->
                        exceptionHanling
                                .authenticationEntryPoint(new CustomAuthenticationEntryPoint())
                                .accessDeniedHandler(new CustomAccessDeniedHandler()));

        return httpSecurity.build();

    }

}
