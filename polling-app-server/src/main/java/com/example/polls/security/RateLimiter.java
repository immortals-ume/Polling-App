package com.example.polls.security;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * A plain in-memory fixed-window counter. Good enough for a single application
 * instance; a multi-instance deployment would need this backed by Redis (or similar
 * shared store) so limits are enforced across instances rather than per-instance.
 * One RateLimiter instance is one bucket of (maxRequests per window); callers key
 * requests by whatever identity makes sense for that bucket (IP, user id, ...).
 */
public class RateLimiter {

    private record WindowState(long windowStartMillis, int count) {
    }

    private final int maxRequests;
    private final long windowMillis;
    private final Map<String, WindowState> windows = new ConcurrentHashMap<>();

    public RateLimiter(int maxRequests, Duration window) {
        this.maxRequests = maxRequests;
        this.windowMillis = window.toMillis();
    }

    public boolean tryAcquire(String key) {
        long now = System.currentTimeMillis();
        WindowState state = windows.compute(key, (k, existing) -> {
            if (existing == null || now - existing.windowStartMillis() >= windowMillis) {
                return new WindowState(now, 1);
            }
            return new WindowState(existing.windowStartMillis(), existing.count() + 1);
        });
        return state.count() <= maxRequests;
    }

    /** Removes windows that have already expired, so memory doesn't grow forever. */
    public void evictExpired() {
        long now = System.currentTimeMillis();
        windows.entrySet().removeIf(entry -> now - entry.getValue().windowStartMillis() >= windowMillis);
    }
}
