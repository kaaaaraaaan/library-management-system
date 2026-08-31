package com.library.lms.service.impl;

import com.library.lms.dto.MemberDTO;
import com.library.lms.entity.Member;
import com.library.lms.exception.BadRequestException;
import com.library.lms.exception.ResourceNotFoundException;
import com.library.lms.repository.MemberRepository;
import com.library.lms.service.AuditService;
import com.library.lms.service.MemberService;
import com.library.lms.specification.MemberSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class MemberServiceImpl implements MemberService {

    private final MemberRepository memberRepository;
    private final AuditService auditService;

    @Override
    @Transactional
    public MemberDTO createMember(MemberDTO dto) {
        if (memberRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("A member with email " + dto.getEmail() + " already exists");
        }
        Member member = Member.builder()
                .fullName(dto.getFullName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .address(dto.getAddress())
                .build();
        Member saved = memberRepository.save(member);
        auditService.log(currentUser(), "CREATE", "Member", "Created member: " + saved.getFullName());
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public MemberDTO updateMember(Long id, MemberDTO dto) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with id: " + id));
        member.setFullName(dto.getFullName());
        member.setEmail(dto.getEmail());
        member.setPhone(dto.getPhone());
        member.setAddress(dto.getAddress());
        if (dto.getStatus() != null) {
            member.setStatus(Member.MemberStatus.valueOf(dto.getStatus().toUpperCase()));
        }
        Member updated = memberRepository.save(member);
        auditService.log(currentUser(), "UPDATE", "Member", "Updated member id: " + id);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteMember(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with id: " + id));
        memberRepository.delete(member);
        auditService.log(currentUser(), "DELETE", "Member", "Deleted member id: " + id);
    }

    @Override
    public MemberDTO getMemberById(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with id: " + id));
        return mapToDTO(member);
    }

    @Override
    public Page<MemberDTO> searchMembers(String name, String status, Pageable pageable) {
        Specification<Member> spec = Specification.where(MemberSpecification.hasName(name))
                .and(MemberSpecification.hasStatus(status));
        return memberRepository.findAll(spec, pageable).map(this::mapToDTO);
    }

    private String currentUser() {
        try {
            return SecurityContextHolder.getContext().getAuthentication().getName();
        } catch (Exception e) {
            return "system";
        }
    }

    private MemberDTO mapToDTO(Member member) {
        return MemberDTO.builder()
                .id(member.getId())
                .fullName(member.getFullName())
                .email(member.getEmail())
                .phone(member.getPhone())
                .address(member.getAddress())
                .status(member.getStatus() != null ? member.getStatus().name() : null)
                .build();
    }
}
