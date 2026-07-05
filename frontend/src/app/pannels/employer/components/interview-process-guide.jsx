import { useLocation, useNavigate } from "react-router-dom";
import { employer, empRoute } from "../../../../globals/route-names";
import "./interview-process-guide.css";

const roundOverview = [
    {
        round: "1",
        stage: "Online Assessment",
        purpose: "Skills Test",
        time: "60 min",
        conductedBy: "Platform (automated)",
        howItWorks: "Candidate completes an online test with technical questions and coding problems at their own computer.",
        clearRule: "Score of 70% or above"
    },
    {
        round: "2",
        stage: "Technical Interview",
        purpose: "Problem Solving",
        time: "45 min",
        conductedBy: "Senior Developer or Tech Lead",
        howItWorks: "Live one-on-one session where the candidate solves coding problems and discusses technical concepts.",
        clearRule: "Rating of 3 out of 5 or higher"
    },
    {
        round: "3",
        stage: "System Design Interview",
        purpose: "Architecture Thinking",
        time: "60 min",
        conductedBy: "Senior Architect or Principal Engineer",
        howItWorks: "One-on-one discussion where the candidate designs a software system using a shared screen or whiteboard.",
        clearRule: "Rating of 3 out of 5 or higher"
    },
    {
        round: "4",
        stage: "Behavioural Interview",
        purpose: "Team & Culture Fit",
        time: "30 min",
        conductedBy: "HR Manager or Team Lead",
        howItWorks: "Conversation-based interview focusing on how the candidate has worked in teams and handled past situations.",
        clearRule: "Rating of 3 out of 5 or higher"
    },
    {
        round: "5",
        stage: "Final Interview",
        purpose: "Leadership & Vision",
        time: "45 min",
        conductedBy: "Department Head or VP",
        howItWorks: "Strategic conversation about the candidate's leadership potential, goals, and alignment with the company's direction.",
        clearRule: "Rating of 4 out of 5 or higher"
    }
];

const stageProgress = [
    {
        round: "1",
        candidateSees: [
            "Waiting to start",
            "Test opened - candidate can begin",
            "Candidate is taking the test",
            "Test submitted - results being reviewed",
            "Outcome: Cleared or Not Cleared"
        ],
        clears: "Shortlisted - moved forward",
        next: [
            "Candidate is notified they cleared Round 1",
            "Round 2 interview will be scheduled",
            "Candidate sees updated progress on their dashboard"
        ],
        notClear: "Not selected - process ends here"
    },
    {
        round: "2",
        candidateSees: [
            "Waiting for interview to be scheduled",
            "Interview date & time confirmed",
            "Interview is live / in session",
            "Interview ended - feedback being recorded",
            "Outcome: Cleared or Not Cleared"
        ],
        clears: "Shortlisted - continues to Round 3",
        next: [
            "Candidate is notified they cleared Round 2",
            "Round 3 interview will be scheduled",
            "Candidate sees updated progress on their dashboard"
        ],
        notClear: "Not selected - process ends here"
    },
    {
        round: "3",
        candidateSees: [
            "Waiting for interview to be scheduled",
            "Interview date & time confirmed",
            "Interview is live / in session",
            "Interview ended - feedback being recorded",
            "Outcome: Cleared or Not Cleared"
        ],
        clears: "Shortlisted - continues to Round 4",
        next: [
            "Candidate is notified they cleared Round 3",
            "Round 4 interview will be scheduled",
            "Candidate sees updated progress on their dashboard"
        ],
        notClear: "Not selected - process ends here"
    },
    {
        round: "4",
        candidateSees: [
            "Waiting for interview to be scheduled",
            "Interview date & time confirmed",
            "Interview is live / in session",
            "Interview ended - feedback being recorded",
            "Outcome: Cleared or Not Cleared"
        ],
        clears: "Shortlisted - continues to Round 5",
        next: [
            "Candidate is notified they cleared Round 4",
            "Final interview will be scheduled",
            "Candidate sees updated progress on their dashboard"
        ],
        notClear: "Not selected - process ends here"
    },
    {
        round: "5",
        candidateSees: [
            "Waiting for interview to be scheduled",
            "Interview date & time confirmed",
            "Interview is live / in session",
            "Interview ended - decision being made",
            "Outcome: Offer Extended or Not Selected"
        ],
        clears: "Offer Sent - candidate receives job offer",
        next: [
            "Candidate receives the official job offer",
            "Candidate must accept or decline by the deadline",
            "Once accepted, status changes to Hired"
        ],
        notClear: "Not selected - process ends here"
    }
];

const statusReference = [
    ["Candidate has just applied", "Application is submitted successfully", "Application received - awaiting review", "Always happens on submission", "Platform (automatic)"],
    ["Application received", "Round 1 assessment window is open and candidate can begin", "Test is now available for the candidate", "Employer opens the assessment window", "Platform (automatic)"],
    ["Test is available", "Candidate clicks 'Start Test'", "Test is in progress", "Candidate starts the test", "Candidate"],
    ["Test is in progress", "Candidate submits, or the time limit is reached", "Test completed - under evaluation", "Submission or time expiry", "Candidate / Platform"],
    ["Test completed", "Results reviewed - candidate scored 70% or above", "Shortlisted - Round 1 cleared", "Score meets the minimum requirement", "Platform (automatic)"],
    ["Test completed", "Results reviewed - candidate scored below 70%", "Not selected", "Score did not meet the minimum requirement", "Platform (automatic)"],
    ["Shortlisted after Round 1", "Employer books a time slot for the technical interview", "Round 2 interview is scheduled", "Employer assigns a date, time, and interviewer", "Employer"],
    ["Round 2 interview scheduled", "Scheduled interview time arrives", "Interview is now live", "Interview time is reached", "Platform (automatic)"],
    ["Round 2 interview live", "Interviewer submits feedback - rating 3 or above", "Round 2 cleared - moving to Round 3", "Rating meets the minimum requirement", "Employer"],
    ["Round 2 interview live", "Interviewer submits feedback - rating below 3", "Not selected", "Rating did not meet the minimum requirement", "Employer"],
    ["Round 2 cleared", "Employer books a time slot for the system design interview", "Round 3 interview is scheduled", "Employer assigns a date, time, and interviewer", "Employer"],
    ["Round 3 interview live", "Interviewer submits feedback - average rating 3 or above", "Round 3 cleared - moving to Round 4", "Average score across design criteria meets the minimum", "Employer"],
    ["Round 3 interview live", "Interviewer submits feedback - average rating below 3", "Not selected", "Average score did not meet the minimum", "Employer"],
    ["Round 3 cleared", "Employer books a time slot for the behavioural interview", "Round 4 interview is scheduled", "Employer assigns a date, time, and interviewer", "Employer"],
    ["Round 4 interview live", "Interviewer submits feedback - average rating 3 or above", "Round 4 cleared - moving to Round 5", "Average score across behavioural criteria meets the minimum", "Employer"],
    ["Round 4 interview live", "Interviewer submits feedback - average rating below 3", "Not selected", "Average score did not meet the minimum", "Employer"],
    ["Round 4 cleared", "Employer books a time slot for the final interview", "Final interview is scheduled", "Employer assigns a date, time, and senior interviewer", "Employer"],
    ["Final interview live", "Interviewer submits feedback - average rating 4 or above", "All rounds cleared - Job Offer sent to candidate", "Rating meets the higher bar required for the final round", "Employer / Platform"],
    ["Final interview live", "Interviewer submits feedback - average rating below 4", "Not selected", "Rating did not meet the higher bar for the final round", "Employer"],
    ["Offer sent to candidate", "Candidate accepts the job offer", "Hired", "Candidate confirms acceptance before the deadline", "Candidate"],
    ["Offer sent to candidate", "Deadline passes with no response from candidate", "Not selected - offer has expired", "No response by the offer expiry date", "Platform (automatic)"],
    ["Any active stage", "Candidate does not join the scheduled interview (after 15 minutes)", "Not selected - marked as no show", "Candidate absent beyond the 15-minute waiting period", "Platform (automatic)"]
];

const overviewCards = [
    {
        title: "Overview of All Interview Rounds",
        body: "A quick summary of every stage - what it involves, who runs it, how long it takes, and what a candidate needs to move forward.",
        icon: "fa-layer-group"
    },
    {
        title: "What Happens at Each Stage",
        body: "Tracks what the candidate sees as they move through each round, and what changes depending on whether they clear or do not clear that stage.",
        icon: "fa-route"
    },
    {
        title: "Status Change Reference",
        body: "A full list of every possible status change - what triggers it, what the new status becomes, and whether a person or the platform makes the update.",
        icon: "fa-list-check"
    }
];

function BulletList({ items }) {
    return (
        <ul className="guide-bullet-list">
            {items.map((item) => (
                <li key={item}>{item}</li>
            ))}
        </ul>
    );
}

function InterviewProcessGuide() {
    const navigate = useNavigate();
    const location = useLocation();
    const returnTo = location.state?.returnTo || empRoute(employer.CANDIDATES);

    return (
        <div className="interview-guide-page">
            <header className="interview-guide-hero">
                <button type="button" className="interview-guide-back" onClick={() => navigate(returnTo)}>
                    <i className="fas fa-arrow-left"></i>
                    <span>Back</span>
                </button>
                <div>
                    <span className="interview-guide-eyebrow">TaleGlobal Hiring Platform | Version 1.0</span>
                    <h1>Interview Process Guidance</h1>
                    <p>How the 5-round hiring process works - from application to offer.</p>
                </div>
            </header>

            <main className="interview-guide-content">
                <section className="interview-guide-overview" aria-label="Guide overview">
                    {overviewCards.map((card) => (
                        <article className="interview-guide-summary" key={card.title}>
                            <i className={`fas ${card.icon}`}></i>
                            <h2>{card.title}</h2>
                            <p>{card.body}</p>
                        </article>
                    ))}
                </section>

                <section className="interview-guide-note">
                    <div>
                        <h2>Things to Know</h2>
                        <p>Use these rules while updating the Manual Stage Tracking card.</p>
                    </div>
                    <ul>
                        <li><strong className="guide-positive">Green status text</strong> means the candidate is progressing forward - either clearing a round or receiving an offer.</li>
                        <li><strong className="guide-negative">Red status text</strong> means the candidate has not been selected and the process has ended for that application.</li>
                        <li>The Final Interview (Round 5) has a higher score requirement. Candidates need a rating of 4 or above, compared to 3 in earlier rounds.</li>
                        <li>Once a job offer is sent, the candidate must respond before the deadline. If there is no response by the deadline, the offer expires and the application is closed.</li>
                    </ul>
                </section>

                <section className="interview-guide-section">
                    <div className="interview-guide-section-heading">
                        <span>1</span>
                        <div>
                            <h2>Overview of All Interview Rounds</h2>
                            <p>Stage ownership, expected duration, and the rule for clearing each round.</p>
                        </div>
                    </div>
                    <div className="guide-table-wrap">
                        <table className="guide-table guide-table-rounds">
                            <thead>
                                <tr>
                                    <th>Round</th>
                                    <th>Stage Name</th>
                                    <th>Purpose</th>
                                    <th>Time</th>
                                    <th>Conducted By</th>
                                    <th>How It Works</th>
                                    <th>What the Candidate Needs to Clear</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roundOverview.map((round) => (
                                    <tr key={round.round}>
                                        <td><span className="guide-round-pill">{round.round}</span></td>
                                        <td>{round.stage}</td>
                                        <td>{round.purpose}</td>
                                        <td>{round.time}</td>
                                        <td>{round.conductedBy}</td>
                                        <td>{round.howItWorks}</td>
                                        <td>{round.clearRule}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="interview-guide-section">
                    <div className="interview-guide-section-heading">
                        <span>2</span>
                        <div>
                            <h2>What Happens at Each Stage</h2>
                            <p>Candidate-facing progress and the next action after each outcome.</p>
                        </div>
                    </div>
                    <div className="guide-table-wrap">
                        <table className="guide-table guide-table-progress">
                            <thead>
                                <tr>
                                    <th>Round</th>
                                    <th>Stage Progress</th>
                                    <th>If the Candidate Clears</th>
                                    <th>What Happens Next</th>
                                    <th>If the Candidate Does Not Clear</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stageProgress.map((stage) => (
                                    <tr key={stage.round}>
                                        <td><span className="guide-round-pill">{stage.round}</span></td>
                                        <td><BulletList items={stage.candidateSees} /></td>
                                        <td className="guide-positive-cell">{stage.clears}</td>
                                        <td><BulletList items={stage.next} /></td>
                                        <td className="guide-negative-cell">{stage.notClear}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="interview-guide-section">
                    <div className="interview-guide-section-heading">
                        <span>3</span>
                        <div>
                            <h2>Status Change Reference</h2>
                            <p>Every status change, the trigger behind it, and who updates it.</p>
                        </div>
                    </div>
                    <div className="guide-table-wrap">
                        <table className="guide-table guide-table-status">
                            <thead>
                                <tr>
                                    <th>Situation</th>
                                    <th>What Triggers the Change</th>
                                    <th>New Status</th>
                                    <th>Rule / Reason</th>
                                    <th>Who Updates It</th>
                                </tr>
                            </thead>
                            <tbody>
                                {statusReference.map(([situation, trigger, status, rule, owner]) => {
                                    const isNegative = status.toLowerCase().includes("not selected");
                                    const isPositive = status.toLowerCase().includes("shortlisted") || status.toLowerCase().includes("cleared") || status.toLowerCase().includes("hired") || status.toLowerCase().includes("offer");

                                    return (
                                        <tr key={`${situation}-${status}`}>
                                            <td>{situation}</td>
                                            <td>{trigger}</td>
                                            <td className={isNegative ? "guide-negative-cell" : isPositive ? "guide-positive-cell" : ""}>{status}</td>
                                            <td>{rule}</td>
                                            <td>{owner}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default InterviewProcessGuide;
