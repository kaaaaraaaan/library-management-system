package com.library.lms.service;

import com.library.lms.dto.MemberDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MemberService {
    MemberDTO createMember(MemberDTO dto);
    MemberDTO updateMember(Long id, MemberDTO dto);
    void deleteMember(Long id);
    MemberDTO getMemberById(Long id);
    Page<MemberDTO> searchMembers(String name, String status, Pageable pageable);
}
