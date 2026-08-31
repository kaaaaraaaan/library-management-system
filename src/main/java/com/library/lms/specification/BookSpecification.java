package com.library.lms.specification;

import com.library.lms.entity.Book;
import org.springframework.data.jpa.domain.Specification;

public class BookSpecification {

    public static Specification<Book> hasTitle(String title) {
        return (root, query, cb) -> title == null ? cb.conjunction() :
                cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%");
    }

    public static Specification<Book> hasCategory(Long categoryId) {
        return (root, query, cb) -> categoryId == null ? cb.conjunction() :
                cb.equal(root.get("category").get("id"), categoryId);
    }

    public static Specification<Book> hasAuthor(Long authorId) {
        return (root, query, cb) -> authorId == null ? cb.conjunction() :
                cb.equal(root.get("author").get("id"), authorId);
    }

    public static Specification<Book> availableOnly(Boolean availableOnly) {
        return (root, query, cb) -> (availableOnly == null || !availableOnly) ? cb.conjunction() :
                cb.greaterThan(root.get("availableCopies"), 0);
    }
}
