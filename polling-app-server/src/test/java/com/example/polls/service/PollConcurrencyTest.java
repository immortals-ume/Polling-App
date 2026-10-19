package com.example.polls.service;

import com.example.polls.exception.BadRequestException;
import com.example.polls.model.Choice;
import com.example.polls.model.Poll;
import com.example.polls.model.Role;
import com.example.polls.model.RoleName;
import com.example.polls.model.User;
import com.example.polls.payload.VoteRequest;
import com.example.polls.repository.PollRepository;
import com.example.polls.repository.RoleRepository;
import com.example.polls.repository.UserRepository;
import com.example.polls.repository.VoteRepository;
import com.example.polls.security.UserPrincipal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * The single-vote-per-user invariant is enforced by a DB-level unique constraint
 * (poll_id, user_id), not an application-level check-then-insert - these tests prove
 * that holds under real concurrent writes against real MySQL (not H2, not a mock),
 * which is the only way to actually prove it: an application-level check racing
 * against another connection's insert can't be caught by a unit test or H2.
 */
@SpringBootTest
class PollConcurrencyTest {

    @Autowired
    private PollService pollService;

    @Autowired
    private PollRepository pollRepository;

    @Autowired
    private VoteRepository voteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Test
    void concurrentVotesFromTheSameUserOnlyOneSucceeds() throws Exception {
        Poll poll = createPoll();
        User user = createUser();
        UserPrincipal principal = UserPrincipal.create(user);
        Long choiceId = poll.getChoices().get(0).getId();

        int attempts = 8;
        List<Callable<Boolean>> tasks = IntStream.range(0, attempts)
                .<Callable<Boolean>>mapToObj(i -> () -> castVote(poll.getId(), choiceId, principal))
                .collect(Collectors.toList());
        List<Boolean> results = runConcurrently(tasks);

        long successes = results.stream().filter(Boolean::booleanValue).count();
        assertEquals(1, successes, "exactly one of the concurrent attempts by the same user should succeed");
        assertEquals(1, voteRepository.countByUserId(user.getId()),
                "exactly one vote row should exist for this user regardless of how many requests raced");
    }

    @Test
    void concurrentVotesFromDifferentUsersAllSucceed() throws Exception {
        Poll poll = createPoll();
        Long choiceId = poll.getChoices().get(0).getId();

        int voterCount = 8;
        List<UserPrincipal> voters = IntStream.range(0, voterCount)
                .mapToObj(i -> UserPrincipal.create(createUser()))
                .collect(Collectors.toList());

        List<Callable<Boolean>> tasks = voters.stream()
                .<Callable<Boolean>>map(voter -> () -> castVote(poll.getId(), choiceId, voter))
                .collect(Collectors.toList());
        List<Boolean> results = runConcurrently(tasks);

        long successes = results.stream().filter(Boolean::booleanValue).count();
        assertEquals(voterCount, successes, "every distinct user's concurrent vote should succeed");

        long totalVotesForPoll = voteRepository.countByPollIdGroupByChoiceId(poll.getId()).stream()
                .mapToLong(c -> c.getVoteCount())
                .sum();
        assertEquals(voterCount, totalVotesForPoll, "the poll should have exactly one committed vote per distinct user");
    }

    private boolean castVote(Long pollId, Long choiceId, UserPrincipal principal) {
        VoteRequest request = new VoteRequest();
        request.setChoiceId(choiceId);
        try {
            pollService.castVoteAndGetUpdatedPoll(pollId, request, principal);
            return true;
        } catch (BadRequestException ex) {
            return false;
        }
    }

    /**
     * Runs every task on its own thread, holding each one at the start line until
     * all are ready, so they hit the database at the same moment instead of
     * trickling in one at a time.
     */
    private List<Boolean> runConcurrently(List<Callable<Boolean>> tasks) throws Exception {
        ExecutorService executor = Executors.newFixedThreadPool(tasks.size());
        CountDownLatch readyLatch = new CountDownLatch(tasks.size());
        CountDownLatch startLatch = new CountDownLatch(1);
        try {
            List<Future<Boolean>> futures = tasks.stream()
                    .map(task -> executor.submit(() -> {
                        readyLatch.countDown();
                        startLatch.await();
                        return task.call();
                    }))
                    .collect(Collectors.toList());

            readyLatch.await(5, TimeUnit.SECONDS);
            startLatch.countDown();

            List<Boolean> results = new java.util.ArrayList<>();
            for (Future<Boolean> future : futures) {
                results.add(future.get(10, TimeUnit.SECONDS));
            }
            return results;
        } finally {
            executor.shutdown();
        }
    }

    private Poll createPoll() {
        Poll poll = new Poll();
        poll.setQuestion("Race test poll " + USER_SEQ.incrementAndGet());
        poll.addChoice(new Choice("Option A"));
        poll.addChoice(new Choice("Option B"));
        poll.setExpirationDateTime(Instant.now().plus(1, ChronoUnit.DAYS));
        poll.setCreatedBy(createUser().getId());
        return pollRepository.save(poll);
    }

    private static final AtomicInteger USER_SEQ = new AtomicInteger();

    private User createUser() {
        Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                .orElseThrow(() -> new IllegalStateException("ROLE_USER not seeded"));

        // "u" + up to 9 digits comfortably fits the 15-char username column.
        String username = "u" + USER_SEQ.incrementAndGet();
        User user = new User("Race Tester", username, username + "@example.com", "irrelevant-not-used-to-login");
        user.setRoles(Set.of(userRole));
        return userRepository.save(user);
    }
}
