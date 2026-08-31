package com.library.lms.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BookDTO {
    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "ISBN is required")
    private String isbn;

    private Long authorId;
    private String authorName;

    private Long categoryId;
    private String categoryName;

    @NotNull @Min(1500)
    private Integer publicationYear;

    @NotNull @Min(0)
    private Integer totalCopies;

    @NotNull @Min(0)
    private Integer availableCopies;

    private String coverImagePath;
    private String description;
}
