# Prompts for the user research docs

Branch: `docs/user-research`. Agent: Claude Code (Claude Sonnet 5.5).

## What I noticed

After I submitted, I looked at the README and saw it said nothing about user interviews, even though Reflection 2 (the stranger test) is built on one. The only place the interview findings lived in the repo was a section of `BACKLOG.md`.

## My prompt

I asked why the README had nothing about user interviews, and said I needed them in there. The agent checked the README and `BACKLOG.md`, agreed it was a gap, and proposed a small PR. I said "lets do that."

## What the agent changed

- Added a "User research" section to `README.md`: who Tester A is, how the session was run (including where I helped), his top 3 struggles, what he liked, what he said about using the app, what I changed, and what the next interviews should be.
- Added `research/tester-a.md`: a longer write-up of the interview in order, with his answers to my questions, what I fixed and backlogged, and what the interview can't tell me.
- Removed the word "real" from `README.md` and `BACKLOG.md` where it was used as a stamp ("a real run," "real debugging"), and renamed the BACKLOG heading to "From my first full workout."
- Listed `research/` under "Project documents" in the README.

## Decisions

- **No raw transcript in the public repo.** It has his name and voice, and he agreed to a recording for my class, not to publication. The write-up uses "Tester A" and quotes only a few lines.
- **Only quotes I have checked.** The transcript has no speaker labels. The agent flagged that one line, about highlighting minutes versus seconds, might have been mine. I listened to the recording and it was Tester A, so it is now quoted in `research/tester-a.md`. The reflection and `prompts/form-hints.md` already had it right.
