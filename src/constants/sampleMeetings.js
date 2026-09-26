export const SAMPLE_MEETINGS = [
  {
    id: 'meeting-prod-sync',
    title: 'Product Launch & Infra Budget Sync (Q3)',
    date: '2026-09-24',
    duration: '42 mins',
    attendees: ['Sarah Chen (VP Product)', 'David Miller (Head of Engineering)', 'Priya Patel (Chief Architect)', 'Alex Wong (Finance Lead)'],
    transcript: `[00:01] Sarah Chen: Morning team. Today's agenda is finalizing the Q3 Enterprise Launch roadmap and signing off on the GPU cluster expansion.
[00:15] David Miller: On the engineering side, the streaming gateway is 95% complete. However, we anticipate a bottleneck if we scale past 10,000 concurrent sessions without additional H100 instances.
[01:05] Alex Wong: What is the cost impact, David?
[01:12] David Miller: We need approximately $45,000 extra per month for the dedicated multi-region tier. My team's base compensation already accounts for the maintenance, so no additional headcount is needed.
[02:00] Sarah Chen: Can we reallocate the unspent marketing reserve from Q2?
[02:14] Alex Wong: Yes, we have $60,000 buffer there. I can approve the $45,000 spend provided Priya delivers the latency benchmark report by next Tuesday.
[02:45] Priya Patel: Deal. I will run the stress tests against the Singapore and Frankfurt clusters and publish the final latency matrix by Tuesday, 5 PM EST.
[03:20] Sarah Chen: Excellent. Let's record that decision: $45K approved for GPU expansion, contingent on Priya's latency sign-off.
[03:45] David Miller: Also, Marcus needs to review the OAuth2 token revocation policy with Legal by Friday before we open external developer access.
[04:10] Sarah Chen: Agreed. David, please ensure Marcus gets that done before end of week. Let's wrap up.`
  },
  {
    id: 'meeting-incident-postmortem',
    title: 'P0 Incident #842 Post-Mortem (Database Failover)',
    date: '2026-09-21',
    duration: '28 mins',
    attendees: ['Elena Rostova (SRE Director)', 'Tom Bradley (Lead DBA)', 'Kavita Singh (Security Lead)'],
    transcript: `[00:02] Elena Rostova: Let's review Friday's 14-minute outage on the primary checkout cluster.
[00:20] Tom Bradley: Root cause was a split-brain condition caused by network flapping between us-east-1 and us-east-2. The automated failover watchdog didn't have a sufficient quorum grace period.
[01:10] Elena Rostova: Did we lose any transaction data or expose customer credentials?
[01:25] Kavita Singh: No customer data was leaked. The PII encryption key service held securely.
[02:00] Tom Bradley: To prevent this permanently, I need to update the raft consensus quorum timeout from 200ms to 1200ms and add circuit-breaker probes.
[02:30] Elena Rostova: Action item for Tom: Deploy the Raft consensus timeout update to staging by Wednesday, test with synthetic network partitions on Thursday, and promote to prod by Sunday night.
[03:00] Kavita Singh: I will audit the automated alert routing because PagerDuty took 4 minutes to wake the secondary on-call engineer. I will update the escalation matrix by Thursday noon.`
  }
];
