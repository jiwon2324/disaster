package com.disaster.api.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfiguration {

    private static final String SECURITY_SCHEME_NAME = "X-AUTH-TOKEN";

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .components(
                        new Components()
                                .addSecuritySchemes(
                                        SECURITY_SCHEME_NAME,
                                        new SecurityScheme()
                                                .name("X-AUTH-TOKEN")
                                                .type(SecurityScheme.Type.APIKEY)
                                                .in(SecurityScheme.In.HEADER)
                                )
                )
                .addSecurityItem(
                        new SecurityRequirement()
                                .addList(SECURITY_SCHEME_NAME)
                )
                .info(apiInfo());
    }

    private Info apiInfo() {
        return new Info()
                .title("Spring Boot Open API Test with Swagger")
                .description("설명 부분")
                .version("1.0.0");
    }
}