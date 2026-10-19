package com.example.polls.model;

import java.util.Set;

/**
 * DRAFT -> PUBLISHED -> CLOSED -> ARCHIVED. Only forward transitions are allowed;
 * there is no path back to an earlier state.
 */
public enum PollStatus {
    DRAFT,
    PUBLISHED,
    CLOSED,
    ARCHIVED;

    private static final Set<PollStatus> NO_TRANSITIONS = Set.of();

    public boolean canTransitionTo(PollStatus target) {
        return switch (this) {
            case DRAFT -> target == PUBLISHED;
            case PUBLISHED -> target == CLOSED;
            case CLOSED -> target == ARCHIVED;
            case ARCHIVED -> NO_TRANSITIONS.contains(target);
        };
    }

    public boolean acceptsVotes() {
        return this == PUBLISHED;
    }
}
