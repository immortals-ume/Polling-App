package com.example.polls.security;

import org.junit.jupiter.api.Test;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RateLimiterTest {

    @Test
    void allowsUpToTheLimitThenRejects() {
        RateLimiter limiter = new RateLimiter(3, Duration.ofMinutes(1));

        assertTrue(limiter.tryAcquire("same-key"));
        assertTrue(limiter.tryAcquire("same-key"));
        assertTrue(limiter.tryAcquire("same-key"));
        assertFalse(limiter.tryAcquire("same-key"), "4th request in the same window should be rejected");
    }

    @Test
    void tracksEachKeyIndependently() {
        RateLimiter limiter = new RateLimiter(1, Duration.ofMinutes(1));

        assertTrue(limiter.tryAcquire("key-a"));
        assertTrue(limiter.tryAcquire("key-b"), "a different key should have its own independent budget");
        assertFalse(limiter.tryAcquire("key-a"));
        assertFalse(limiter.tryAcquire("key-b"));
    }

    @Test
    void resetsOnceTheWindowExpires() throws InterruptedException {
        RateLimiter limiter = new RateLimiter(1, Duration.ofMillis(50));

        assertTrue(limiter.tryAcquire("key"));
        assertFalse(limiter.tryAcquire("key"));

        Thread.sleep(80);

        assertTrue(limiter.tryAcquire("key"), "a new window should reset the budget");
    }

    @Test
    void evictExpiredRemovesOnlyStaleWindows() throws InterruptedException {
        RateLimiter limiter = new RateLimiter(1, Duration.ofMillis(50));

        limiter.tryAcquire("stale");
        Thread.sleep(80);
        limiter.tryAcquire("fresh");

        limiter.evictExpired();

        // "stale" expired and was evicted, so it gets a fresh budget again.
        assertTrue(limiter.tryAcquire("stale"));
        // "fresh" is still within its window and was not evicted, so its budget is still spent.
        assertFalse(limiter.tryAcquire("fresh"));
    }
}
