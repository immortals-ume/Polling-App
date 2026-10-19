package com.example.polls.model;

import com.example.polls.model.audit.DateAudit;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "votes", uniqueConstraints = {
        @UniqueConstraint(columnNames = {
                "poll_id",
                "user_id"
        })
})
public class Vote extends DateAudit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "poll_id", nullable = false)
    private Poll poll;

    /**
     * Populated for single-choice polls only. Multi-choice polls leave this null and
     * use {@link #selections} instead - see Poll.allowMultipleChoices.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "choice_id", nullable = true)
    private Choice choice;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "vote", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<VoteSelection> selections = new ArrayList<>();

    public List<VoteSelection> getSelections() {
        return selections;
    }

    public void setSelections(List<VoteSelection> selections) {
        this.selections = selections;
    }

    public void addSelection(Choice selectedChoice) {
        VoteSelection selection = new VoteSelection();
        selection.setVote(this);
        selection.setChoice(selectedChoice);
        selections.add(selection);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Poll getPoll() {
        return poll;
    }

    public void setPoll(Poll poll) {
        this.poll = poll;
    }

    public Choice getChoice() {
        return choice;
    }

    public void setChoice(Choice choice) {
        this.choice = choice;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
