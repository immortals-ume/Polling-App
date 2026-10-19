package com.example.polls.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PollStatusTest {

    @Test
    void draftCanOnlyMoveToPublished() {
        assertTrue(PollStatus.DRAFT.canTransitionTo(PollStatus.PUBLISHED));
        assertFalse(PollStatus.DRAFT.canTransitionTo(PollStatus.CLOSED));
        assertFalse(PollStatus.DRAFT.canTransitionTo(PollStatus.ARCHIVED));
        assertFalse(PollStatus.DRAFT.canTransitionTo(PollStatus.DRAFT));
    }

    @Test
    void publishedCanOnlyMoveToClosed() {
        assertTrue(PollStatus.PUBLISHED.canTransitionTo(PollStatus.CLOSED));
        assertFalse(PollStatus.PUBLISHED.canTransitionTo(PollStatus.DRAFT));
        assertFalse(PollStatus.PUBLISHED.canTransitionTo(PollStatus.ARCHIVED));
    }

    @Test
    void closedCanOnlyMoveToArchived() {
        assertTrue(PollStatus.CLOSED.canTransitionTo(PollStatus.ARCHIVED));
        assertFalse(PollStatus.CLOSED.canTransitionTo(PollStatus.PUBLISHED));
        assertFalse(PollStatus.CLOSED.canTransitionTo(PollStatus.DRAFT));
    }

    @ParameterizedTest
    @EnumSource(PollStatus.class)
    void archivedIsTerminal(PollStatus target) {
        assertFalse(PollStatus.ARCHIVED.canTransitionTo(target));
    }

    @Test
    void onlyPublishedAcceptsVotes() {
        assertTrue(PollStatus.PUBLISHED.acceptsVotes());
        assertFalse(PollStatus.DRAFT.acceptsVotes());
        assertFalse(PollStatus.CLOSED.acceptsVotes());
        assertFalse(PollStatus.ARCHIVED.acceptsVotes());
    }
}
