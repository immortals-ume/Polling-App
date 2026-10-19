package com.example.polls.payload;

import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Exactly one of choiceId / choiceIds must be set, depending on whether the poll
 * being voted on is single- or multiple-choice - PollService validates which one
 * is required and rejects the request otherwise. Neither is @NotNull here because
 * which one is required depends on the poll, not the request shape alone.
 */
public class VoteRequest {
    private Long choiceId;

    @Size(max = 6)
    private List<Long> choiceIds;

    public Long getChoiceId() {
        return choiceId;
    }

    public void setChoiceId(Long choiceId) {
        this.choiceId = choiceId;
    }

    public List<Long> getChoiceIds() {
        return choiceIds;
    }

    public void setChoiceIds(List<Long> choiceIds) {
        this.choiceIds = choiceIds;
    }
}
