package com.user.security;

import com.user.entity.Role;
import com.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private User user;

    private final String SECRET =
            "this-is-a-very-long-secret-key-for-jwt-testing-1234567890";
    private final long EXPIRATION = 3600000; // 1 hour
    @BeforeEach
    void setup() {
        jwtUtil = new JwtUtil(SECRET, EXPIRATION);

        user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setRole(Role.STUDENT);
        user.setActive(true);
    }

    @Test
    void generateToken_shouldCreateValidToken() {
        String token = jwtUtil.generateToken(user);

        assertNotNull(token);
        assertTrue(jwtUtil.isTokenValid(token));
    }

    @Test
    void extractUsername_shouldReturnCorrectEmail() {
        String token = jwtUtil.generateToken(user);

        String username = jwtUtil.extractUsername(token);

        assertEquals("test@example.com", username);
    }

    @Test
    void extractUserId_shouldReturnCorrectId() {
        String token = jwtUtil.generateToken(user);

        Long userId = jwtUtil.extractUserId(token);

        assertEquals(1L, userId);
    }

    @Test
    void extractAuthorities_shouldReturnCorrectAuthorities() {
        String token = jwtUtil.generateToken(user);

        List<String> authorities = jwtUtil.extractAuthorities(token);

        assertEquals(1, authorities.size());
        assertEquals("ROLE_STUDENT", authorities.get(0));
    }

    @Test
    void isTokenValid_shouldReturnFalseForTamperedToken() {
        String token = jwtUtil.generateToken(user);
        String tamperedToken = token + "abc";

        assertFalse(jwtUtil.isTokenValid(tamperedToken));
    }

    @Test
    void extractClaims_shouldThrowForInvalidToken() {
        assertThrows(Exception.class,
                () -> jwtUtil.extractClaims("invalid.token.value"));
    }
}
