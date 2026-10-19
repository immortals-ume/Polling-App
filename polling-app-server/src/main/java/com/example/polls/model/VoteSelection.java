package com.example.polls.model;

import jakarta.persistence.*;

/**
 * One selected choice within a multiple-choice vote submission. A single-choice
 * vote has none of these - it uses Vote.choice directly instead.
 */
@Entity
@Table(name = "vote_selections", uniqueConstraints = {
        @UniqueConstraint(columnNames = {
                "vote_id",
                "choice_id"
        })
})
public class VoteSelection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vote_id", nullable = false)
    private Vote vote;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "choice_id", nullable = false)
    private Choice choice;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Vote getVote() {
        return vote;
    }

    public void setVote(Vote vote) {
        this.vote = vote;
    }

    public Choice getChoice() {
        return choice;
    }

    public void setChoice(Choice choice) {
        this.choice = choice;
    }
}
