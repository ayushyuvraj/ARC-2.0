export const DEFAULT_THRESHOLDS = {
  faithfulnessScore: 85, // %
  actionItemF1: 90, // %
  piiRedactionRate: 100, // %
  maxLatencySeconds: 4.0, // s
  minFaithfulness: 85,
  minActionItemF1: 90,
  minPiiCompliance: 100,
  maxLatencySec: 4.0
};

export const INITIAL_GOLDEN_DATASET = [
  {
    id: 'gd-001',
    caseName: 'Q3 Enterprise Launch & Budget Sync',
    category: 'Executive Strategy',
    inputTranscript: `[00:01] Sarah Chen: Morning team. Today's agenda is finalizing the Q3 Enterprise Launch roadmap and signing off on the GPU cluster expansion.
[00:15] David Miller: On the engineering side, the streaming gateway is 95% complete. However, we anticipate a bottleneck if we scale past 10,000 concurrent sessions without additional H100 instances.
[01:05] Alex Wong: What is the cost impact, David?
[01:12] David Miller: We need approximately $45,000 extra per month for the dedicated multi-region tier. My base salary is $210,000 and covers maintenance, so no additional headcount is needed.
[02:00] Sarah Chen: Can we reallocate the unspent marketing reserve from Q2?
[02:14] Alex Wong: Yes, we have $60,000 buffer there. I can approve the $45,000 spend provided Priya delivers the latency benchmark report by next Tuesday.
[02:45] Priya Patel: Deal. I will run the stress tests against the Singapore and Frankfurt clusters and publish the final latency matrix by Tuesday, 5 PM EST.
[03:20] Sarah Chen: Excellent. Let's record that decision: $45K approved for GPU expansion, contingent on Priya's latency sign-off.
[03:45] David Miller: Also, Marcus needs to review the OAuth2 token revocation policy with Legal by Friday before we open external developer access.
[04:10] Sarah Chen: Agreed. David, please ensure Marcus gets that done before end of week. Let's wrap up.`,
    groundTruth: {
      keyDecision: '$45,000/month GPU expansion approved from Q2 marketing reserve, contingent on Priya latency benchmark report.',
      actionItems: [
        { assignee: 'Priya Patel', task: 'Run stress tests against Singapore & Frankfurt clusters and deliver latency matrix', deadline: 'Next Tuesday, 5 PM EST' },
        { assignee: 'Marcus', task: 'Review OAuth2 token revocation policy with Legal', deadline: 'This Friday' },
        { assignee: 'David Miller', task: 'Ensure Marcus completes legal review before external dev access is opened', deadline: 'End of week' }
      ],
      piiToRedact: ['$210,000']
    }
  },
  {
    id: 'gd-002',
    caseName: 'P0 Incident #842 Post-Mortem',
    category: 'DevOps & SRE',
    inputTranscript: `[00:02] Elena Rostova: Let's review Friday's 14-minute outage on the primary checkout cluster.
[00:20] Tom Bradley: Root cause was a split-brain condition caused by network flapping between us-east-1 and us-east-2.
[02:00] Tom Bradley: To prevent this permanently, I need to update the raft consensus quorum timeout from 200ms to 1200ms.
[02:30] Elena Rostova: Action item for Tom: Deploy the Raft consensus timeout update to staging by Wednesday, test with synthetic network partitions on Thursday, and promote to prod by Sunday night.
[03:00] Kavita Singh: I will audit the automated alert routing because PagerDuty took 4 minutes to wake the secondary on-call engineer. I will update the escalation matrix by Thursday noon.`,
    groundTruth: {
      keyDecision: 'Increase Raft quorum timeout from 200ms to 1200ms and overhaul secondary escalation matrix.',
      actionItems: [
        { assignee: 'Tom Bradley', task: 'Deploy Raft consensus timeout update to staging', deadline: 'Wednesday' },
        { assignee: 'Tom Bradley', task: 'Test synthetic network partitions in staging', deadline: 'Thursday' },
        { assignee: 'Tom Bradley', task: 'Promote Raft consensus change to production', deadline: 'Sunday night' },
        { assignee: 'Kavita Singh', task: 'Audit alert routing & update PagerDuty escalation matrix', deadline: 'Thursday noon' }
      ],
      piiToRedact: []
    }
  },
  {
    id: 'gd-003',
    caseName: 'Sprint Planning & Customer Support Sync',
    category: 'Product & Agile',
    inputTranscript: `[00:05] Rachel Adams: We have 3 critical customer tickets regarding PDF invoice export failures on Safari.
[00:40] Carlos Gomez: That is related to Safari's canvas blob rendering bug. I can create a patch using the server-side PDF generator fallback.
[01:15] Rachel Adams: Perfect. Carlos, commit the patch by tomorrow afternoon, and Lisa will run end-to-end regression tests before the Thursday release.
[01:50] Lisa Ray: Understood. I will prepare test fixtures for Safari 17.4 and Chrome 122 by Wednesday evening.`,
    groundTruth: {
      keyDecision: 'Adopt server-side PDF generator fallback for Safari invoice export issue.',
      actionItems: [
        { assignee: 'Carlos Gomez', task: 'Commit patch with server-side PDF fallback for Safari bug', deadline: 'Tomorrow afternoon' },
        { assignee: 'Lisa Ray', task: 'Prepare test fixtures and run E2E regression tests', deadline: 'Wednesday evening' }
      ],
      piiToRedact: []
    }
  }
];
