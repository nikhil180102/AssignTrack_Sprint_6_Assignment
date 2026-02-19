package com.user.repository;

import com.user.entity.ApprovalStatus;
import com.user.entity.Role;
import com.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    List<User> findByRoleAndApprovalStatus(Role role, ApprovalStatus status);
}