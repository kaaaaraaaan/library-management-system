package com.library.lms.controller;

import com.library.lms.dto.ApiResponse;
import com.library.lms.dto.MemberDTO;
import com.library.lms.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @PostMapping
    public ResponseEntity<ApiResponse<MemberDTO>> create(@Valid @RequestBody MemberDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Member created successfully", memberService.createMember(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MemberDTO>> update(@PathVariable Long id, @Valid @RequestBody MemberDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Member updated successfully", memberService.updateMember(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        memberService.deleteMember(id);
        return ResponseEntity.ok(ApiResponse.success("Member deleted successfully", null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MemberDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Member fetched successfully", memberService.getMemberById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<MemberDTO>>> search(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        Page<MemberDTO> result = memberService.searchMembers(name, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Members fetched successfully", result));
    }
}
