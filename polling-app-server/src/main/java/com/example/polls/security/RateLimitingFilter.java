package com.example.polls.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.polls.payload.ErrorResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.annotation.PostConstruct;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Runs after JwtAuthenticationFilter (so SecurityContext is already populated for
 * authenticated routes) and rejects requests over the configured limit with 429
 * before they reach a controller. Auth endpoints are keyed by remote IP (no identity
 * exists yet); the vote endpoint is keyed by user id once authenticated.
 *
 * IP-based keying uses request.getRemoteAddr() directly - behind a reverse proxy
 * this would need X-Forwarded-For handling, which isn't set up here. Worth revisiting
 * before deploying behind a proxy/load balancer.
 */
public class RateLimitingFilter extends OncePerRequestFilter {

    private record Rule(Pattern pathPattern, String method, RateLimiter limiter, boolean keyByAuthenticatedUser) {
    }

    @Value("${app.rateLimit.signin.maxRequests:10}")
    private int signinMaxRequests;

    @Value("${app.rateLimit.signin.windowSeconds:60}")
    private int signinWindowSeconds;

    @Value("${app.rateLimit.signup.maxRequests:5}")
    private int signupMaxRequests;

    @Value("${app.rateLimit.signup.windowSeconds:60}")
    private int signupWindowSeconds;

    @Value("${app.rateLimit.vote.maxRequests:20}")
    private int voteMaxRequests;

    @Value("${app.rateLimit.vote.windowSeconds:60}")
    private int voteWindowSeconds;

    @Autowired
    private ObjectMapper objectMapper;

    private List<Rule> rules;

    @PostConstruct
    void buildRules() {
        rules = List.of(
                new Rule(Pattern.compile("^/api/auth/signin$"), "POST",
                        new RateLimiter(signinMaxRequests, Duration.ofSeconds(signinWindowSeconds)), false),
                new Rule(Pattern.compile("^/api/auth/signup$"), "POST",
                        new RateLimiter(signupMaxRequests, Duration.ofSeconds(signupWindowSeconds)), false),
                new Rule(Pattern.compile("^/api/polls/\\d+/votes$"), "POST",
                        new RateLimiter(voteMaxRequests, Duration.ofSeconds(voteWindowSeconds)), true)
        );
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        Rule rule = matchRule(request);

        if (rule != null) {
            String key = rule.keyByAuthenticatedUser() ? authenticatedUserKey() : request.getRemoteAddr();
            if (key != null && !rule.limiter().tryAcquire(key)) {
                rejectWithTooManyRequests(response, request.getRequestURI());
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    /** Bounds memory - without this, every distinct IP/user ever seen stays in the map forever. */
    @Scheduled(fixedDelay = 5, initialDelay = 5, timeUnit = java.util.concurrent.TimeUnit.MINUTES)
    void evictExpiredWindows() {
        rules.forEach(rule -> rule.limiter().evictExpired());
    }

    private Rule matchRule(HttpServletRequest request) {
        String path = request.getRequestURI();
        for (Rule rule : rules) {
            if (rule.method().equals(request.getMethod()) && rule.pathPattern().matcher(path).matches()) {
                return rule;
            }
        }
        return null;
    }

    private String authenticatedUserKey() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            return null;
        }
        return "user:" + principal.getId();
    }

    private void rejectWithTooManyRequests(HttpServletResponse response, String path) throws IOException {
        response.setStatus(429); // Too Many Requests - not in HttpServletResponse's SC_ constants
        response.setHeader("Retry-After", "60");
        response.setContentType("application/json");
        ErrorResponse body = new ErrorResponse(429, "Too Many Requests",
                "Rate limit exceeded, please try again later", path);
        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
