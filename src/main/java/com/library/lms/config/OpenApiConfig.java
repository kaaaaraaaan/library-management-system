package com.library.lms.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        final String schemeName = "bearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("Library Management System API")
                        .description("""
                                REST API for the Library Management System.
                                
                                **MCS-313 — Advanced Java Programming — Final Assignment**
                                
                                ### How to authenticate
                                1. Use `POST /api/auth/login` with your credentials
                                2. Copy the `token` from the response
                                3. Click **Authorize** above and enter: `Bearer <your-token>`
                                
                                ### Default credentials
                                | Username | Password | Role |
                                |---|---|---|
                                | admin | Admin@123 | ADMIN |
                                | librarian | Lib@1234 | LIBRARIAN |
                                | member | Member@123 | MEMBER |
                                """)
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("MCS-313 Final Assignment")
                                .email("admin@library.edu")))
                .addSecurityItem(new SecurityRequirement().addList(schemeName))
                .components(new Components()
                        .addSecuritySchemes(schemeName, new SecurityScheme()
                                .name(schemeName)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Enter the JWT token obtained from /api/auth/login")));
    }
}
