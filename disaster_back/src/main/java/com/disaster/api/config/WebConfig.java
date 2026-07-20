package com.disaster.api.config;

import lombok.extern.log4j.Log4j2;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@Log4j2
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        log.info("[addResourceHandlers] image URI ?대뜑 異붽? ------");

        // URI濡??묎렐???덈릺???대뜑瑜??묎렐??媛?ν븳 URI? 留ㅼ묶?쒖폒???묎렐?쒖폒以??
        registry.addResourceHandler("/upload/image/**")
                .addResourceLocations("file:///C:/upload/image/");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

}
