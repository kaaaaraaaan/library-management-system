package com.library.lms.specification;

import com.library.lms.entity.Member;
import org.springframework.data.jpa.domain.Specification;

public class MemberSpecification {

    public static Specification<Member> hasName(String name) {
        return (root, query, cb) -> name == null ? cb.conjunction() :
                cb.like(cb.lower(root.get("fullName")), "%" + name.toLowerCase() + "%");
    }

    public static Specification<Member> hasStatus(String status) {
        return (root, query, cb) -> status == null ? cb.conjunction() :
                cb.equal(root.get("status"), Member.MemberStatus.valueOf(status.toUpperCase()));
    }
}
