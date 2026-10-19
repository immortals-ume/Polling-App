package com.example.polls.repository;

import com.example.polls.model.ChoiceVoteCount;
import com.example.polls.model.VoteSelection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoteSelectionRepository extends JpaRepository<VoteSelection, Long> {

    @Query("SELECT NEW com.example.polls.model.ChoiceVoteCount(vs.choice.id, count(vs.id)) " +
            "FROM VoteSelection vs WHERE vs.vote.poll.id in :pollIds GROUP BY vs.choice.id")
    List<ChoiceVoteCount> countByPollIdInGroupByChoiceId(@Param("pollIds") List<Long> pollIds);

    @Query("SELECT vs FROM VoteSelection vs WHERE vs.vote.user.id = :userId AND vs.vote.poll.id in :pollIds")
    List<VoteSelection> findByUserIdAndPollIdIn(@Param("userId") Long userId, @Param("pollIds") List<Long> pollIds);
}
