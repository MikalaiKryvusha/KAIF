# KAIF 2.4 — Team Deployment

## Epic Implementation Specification

**Status:** Proposed
**Target version:** KAIF 2.4
**Feature type:** Optional AI-agent skill
**Primary domain:** Multi-agent cognitive work orchestration
**First dogfooding project:** NDim
**Primary runtime assumption:** Claude Code + Git worktrees

---

## 1. Executive Summary

**Team Deployment** is an optional KAIF skill that designs and deploys an adaptive team of AI agents for a project.

The skill receives a project description and KAIF context, analyzes:

- domain;
- project type;
- project scope and complexity;
- risks;
- required capabilities;
- expected work volume;
- degree of task parallelism;
- dependency density;
- verification requirements;
- available models / agent capabilities;
- human involvement requirements;

and produces a **Team Design** rather than blindly instantiating a fixed number of agents.

The resulting team consists of reusable **roles**, instantiated as specific **agents**, operating in isolated **workspaces** and governed by a generated **Team Constitution**.

The team is adaptive: its composition, assignments, and interaction patterns may change during the project when new capability gaps, bottlenecks, or risks are discovered.

The core principle is:

> **Optimize the organization of cognitive work, not the number of agents.**

KAIF should not claim to generate a universally optimal team. It should generate an evidence-informed, constraint-aware team design and continuously improve that design from observed project outcomes.

---

# 2. Why This Feature Exists

Modern coding agents are increasingly capable of completing isolated software tasks, but long-horizon projects contain interdependent subtasks, conflicting edits, coordination overhead, integration failures, and verification problems.

Recent 2026 research is directly relevant to this architecture:

- **CAID — Centralized Asynchronous Isolated Delegation** identifies centralized delegation, asynchronous execution, and isolated workspaces as core primitives for multi-agent software engineering. The reported experiments found meaningful improvements over single-agent baselines and specifically identify `git worktree`, `git commit`, and `git merge` as useful coordination primitives. [1]
- **SPOQ — Specialist Orchestrated Queuing** introduces dependency-aware parallel execution waves, planning validation, code validation, and differentiated specialist agents. Its results support explicit dependency graphs, validation gates, and cost/quality-aware agent allocation. [2]
- **Self-Organizing Multi-Agent Systems for Continuous Software Development** explores manager-driven dynamic hiring, assignment, and removal of agents during continuous project work, with an explicit Strategy → Execution → Verification lifecycle. [3]
- **Team Topologies** provides a mature organizational-design vocabulary for software work: four fundamental team types, three interaction modes, cognitive-load awareness, and continuous evolution of team structures. [4]

These ideas do not establish a universal optimal AI team. They provide useful design primitives and hypotheses that KAIF can operationalize and measure.

---

# 3. Product Vision

KAIF should evolve from:

> **A framework that tells an AI agent how to do disciplined cognitive work.**

toward:

> **A framework that can design the organization through which multiple AI agents perform disciplined cognitive work.**

This adds an organizational layer above individual agent skills.

The conceptual stack becomes:

```text
KAIF
│
├── Project
├── Sphere
├── Canon
├── Skills
├── Agent
│
└── Team Deployment
    ├── Team Design
    ├── Role Library
    ├── Team Archetypes
    ├── Team Topology
    ├── Role Contracts
    ├── Communication Rules
    ├── Workspace Allocation
    ├── Team Lifecycle
    └── Team Learning
```

---

# 4. Core Design Principles

## 4.1 Capability-first, not profession-first

The system must reason from required capabilities rather than fixed professions.

Bad model:

```text
Manager + Designer + 3 Developers + QA
```

Better model:

```text
Capabilities required:
- product reasoning
- system architecture
- UI design
- frontend implementation
- backend implementation
- verification
- release engineering
```

The Team Designer may then decide that some capabilities should belong to the same role.

---

## 4.2 Role is not Agent

A **Role** describes responsibility and authority.

An **Agent** is a concrete model/session assigned to a role.

A role may be instantiated multiple times.

```text
Role: Backend Engineer

Instances:
- backend-engineer-01 → Claude Opus
- backend-engineer-02 → Claude Sonnet
```

This separation enables model substitution, scaling, specialization, and benchmarking.

---

## 4.3 Agent is not Workspace

An **Agent** is the worker.

A **Workspace** is the isolated execution environment available to the worker.

For software projects, a workspace may be a Git worktree.

```text
Role
  ↓
Agent
  ↓
Workspace
  ↓
Branch / Worktree
```

---

## 4.4 Authority must be explicit

Every role must have an authority boundary.

The system must distinguish:

- what the role may decide autonomously;
- what it may recommend;
- what it may reject;
- what requires manager approval;
- what requires human approval.

This is especially important for QA, security, compliance, product, and architecture roles.

---

## 4.5 Communication is a designed topology

Agents must not default to unrestricted peer-to-peer conversation.

Communication should be addressable, purposeful, and constrained by the team topology.

The default software-engineering topology should be centralized:

```text
             Team Manager
          /      |       \
         /       |        \
      Design   Engineers   QA
                  |
             Architecture
```

Direct peer communication may be explicitly permitted where it reduces coordination cost.

---

## 4.6 Parallelize work, not communication

The Team Designer should maximize independent execution while minimizing unnecessary synchronization.

The team should be evaluated using dependency-aware parallelism rather than raw agent count.

---

## 4.7 Verification is structurally independent

The implementer should not be the final judge of its own work when independent verification is economically justified.

A verifier role may be:

- permanent;
- shared;
- temporary;
- automatically activated for high-risk changes.

---

## 4.8 Team topology is adaptive

Team composition is not a one-time decision.

The team may evolve between project phases or inside a phase.

Example:

```text
Discovery
  → Researcher + Domain Expert + Architect

Implementation
  → Manager + Engineers + Designer + QA

Security Review
  → Security Reviewer + QA + Architect

Release
  → Release Engineer + QA + Manager
```

---

# 5. Scope of KAIF 2.4

## In scope

1. Team Deployment skill.
2. Team Designer role.
3. Role template library.
4. Team archetype library.
5. Capability catalog.
6. TeamSpec schema.
7. RoleContract schema.
8. Team Constitution generation.
9. Agent/worktree provisioning instructions.
10. Communication topology generation.
11. Dependency-aware team sizing.
12. Team lifecycle states.
13. Team health / retrospective mechanism.
14. NDim dogfooding template.
15. Documentation and examples.

## Explicitly out of scope for 2.4

- fully autonomous economic optimization of every token spent;
- organization-wide cross-project staffing optimization;
- automatic marketplace discovery of external agents;
- universal optimization claims;
- replacing human product ownership;
- arbitrary self-modification of KAIF itself by deployed teams;
- domain templates for every possible industry.

KAIF 2.4 should establish the platform primitives that later versions can extend.

---

# 6. Terminology

| Term | Definition |
|---|---|
| Project | The cognitive work being performed |
| Capability | A type of expertise or function needed by a project |
| Role | A reusable responsibility + authority contract |
| Role Instance | One instantiated position inside a team |
| Agent | A concrete AI worker executing a role instance |
| Workspace | Isolated execution environment |
| Team | A coordinated set of role instances |
| Team Design | Proposed team composition and operating model |
| Team Archetype | Reusable template for a class of teams |
| TeamSpec | Machine-readable team specification |
| RoleContract | Machine-readable role specification |
| Team Constitution | Human-readable operating rules for the deployed team |
| Interaction Mode | The defined way two roles/teams interact |
| Capability Gap | Required capability not currently covered |
| Team Health | Measured state of coordination and throughput |
| Team Experience | Persistent lessons from previous team deployments |

---

# 7. High-Level Architecture

```text
                   PROJECT CONTEXT
                         │
              ┌──────────┴──────────┐
              │                     │
           KAIF SPHERE           PROJECT CANON
              │                     │
              └──────────┬──────────┘
                         ▼
                  TEAM DESIGNER
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
     CAPABILITY       TEAM ARCHETYPE   CONSTRAINTS
       GRAPH           LIBRARY         / RISKS
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                     TEAM SPEC
                         │
           ┌─────────────┼─────────────┐
           ▼             ▼             ▼
     ROLE CONTRACTS   TEAM TOPOLOGY  WORKSPACES
           │             │             │
           └─────────────┼─────────────┘
                         ▼
                AGENT DEPLOYMENT
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
       Agent A         Agent B        Agent C
       Worktree        Worktree       Worktree
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                 VERIFICATION GATES
                         │
                         ▼
                    INTEGRATION
                         │
                         ▼
                   RETROSPECTIVE
                         │
                         ▼
                 TEAM EXPERIENCE
                         │
                         └──────→ future Team Design
```

---

# 8. New KAIF Skill: `team-deployment`

The skill should be optional and explicitly invokable.

Suggested invocation model:

```text
/kaif team deploy
```

or, depending on the existing KAIF command conventions:

```text
/team-deployment
```

The exact CLI syntax should follow existing KAIF conventions rather than forcing a new command philosophy.

The skill should support at least these operations:

```text
analyze
suggest
deploy
status
reconfigure
retrospective
archive
```

### `analyze`

Analyze project requirements and produce required capabilities and constraints.

### `suggest`

Generate a Team Design without modifying the project.

### `deploy`

Materialize the TeamSpec, role instructions, worktrees, manifests, and launch plan.

### `status`

Read current Team Constitution and team state.

### `reconfigure`

Add, remove, merge, split, or suspend role instances.

### `retrospective`

Evaluate whether team organization was effective.

### `archive`

Persist the team's experience for future deployments.

---

# 9. Team Designer

The Team Designer is a specialized KAIF agent/skill responsible for organizational design.

Its mission is:

> Construct the smallest team capable of reliably accomplishing the project while preserving sufficient specialization, verification, parallelism, and cognitive-load boundaries.

It must NOT optimize for:

- maximum agent count;
- maximum parallelism at all costs;
- token consumption;
- organizational complexity;
- impressive-looking hierarchy.

It should optimize a multi-objective function conceptually similar to:

```text
Team Utility =
    Delivery Capability
  + Verification Strength
  + Parallelism
  + Domain Coverage
  - Coordination Cost
  - Cognitive Load
  - Duplicate Work
  - Idle Capacity
  - Integration Risk
  - Agent Cost
```

The first implementation does not need mathematically exact optimization. A transparent heuristic scorer is preferable to an opaque pseudo-optimizer.

---

# 10. Project Analysis Model

The Team Designer should derive a project profile.

Suggested dimensions:

```yaml
project_profile:
  type: web_application
  domain: social_discovery
  maturity: existing_product
  size: medium
  complexity: medium
  risk: medium
  architecture_stability: medium
  ui_complexity: medium
  domain_complexity: medium
  regulatory_load: low
  verification_difficulty: medium
  integration_difficulty: medium
  parallelism_potential: high
  dependency_density: medium
  external_dependencies: medium
  expected_duration: long
```

The exact values may be categorical rather than numeric in 2.4.

---

# 11. Capability Graph

The Team Designer should first construct a graph of required capabilities.

Example for a web product:

```text
Product Understanding
        │
        ├── UX
        ├── Architecture
        ├── Frontend
        ├── Backend
        ├── Data
        ├── Testing
        ├── Security
        └── Release
```

Capabilities should support:

- required/optional status;
- risk level;
- estimated work volume;
- dependency relationships;
- preferred role;
- whether capability requires independence;
- whether capability can be shared.

---

# 12. Role Library

Create `roles/` as a reusable library.

Initial software-oriented roles should include at least:

```text
manager
product-owner-proxy
system-architect
software-engineer
authoring-engineer
frontend-engineer
backend-engineer
fullstack-engineer
ux-designer
qa-verifier
security-reviewer
performance-engineer
release-engineer
sre-engineer
data-engineer
researcher
domain-expert
technical-writer
```

The first release does not need all roles to have elaborate domain knowledge. The architecture should allow them to be extended.

---

# 13. Role Contract Schema

Every role should have a machine-readable contract.

Suggested structure:

```yaml
role:
  id: backend-engineer
  name: Backend Engineer
  mission: Build and maintain backend functionality safely.

  capabilities:
    - backend-development
    - testing
    - debugging

  authority:
    can_decide:
      - implementation_details
      - local_refactoring
    can_reject: []
    requires_approval:
      - architecture_changes
      - schema_breaking_changes

  responsibilities:
    - implement_assigned_tasks
    - write_tests
    - report_blockers
    - report_architecture_conflicts

  inputs:
    - approved_task
    - acceptance_criteria
    - architecture_context

  outputs:
    - source_code
    - tests
    - implementation_report

  communication:
    reports_to:
      - manager
    may_request:
      - architect
      - designer
    broadcast: false

  quality_gates:
    - local_tests
    - lint
    - typecheck

  escalation:
    triggers:
      - missing_requirement
      - architecture_conflict
      - external_blocker
```

---

# 14. Role Prompt Generation

Role prompts should be generated, not hard-coded as giant universal prompts.

The final role instruction should be assembled from:

```text
Role Template
+
Project Profile
+
Sphere
+
Project Canon
+
Team Constitution
+
Specific Authority
+
Current Assignment
+
Current Phase
+
Available Tools
+
Agent Capability Profile
```

Conceptually:

```text
GeneratedRolePrompt =
    RoleTemplate
  + ProjectContext
  + SphereContext
  + TeamContext
  + AuthorityContext
  + TaskContext
```

This allows the same role to behave differently in banking, web development, scientific research, game development, or 3D production without duplicating the underlying role definition.

---

# 15. Team Archetype Library

Create `teams/` as reusable organizational templates.

Initial software archetypes:

```text
web-product-small
web-product-medium
web-product-large
saas-product
backend-service
mobile-app
open-source-library
game-indie
game-medium
research-software
security-heavy-system
data-project
```

Each archetype should define:

- typical capability coverage;
- recommended team size range;
- default role candidates;
- conditions for activating optional roles;
- default communication topology;
- default verification policy;
- default workspace model;
- scaling rules;
- anti-patterns.

---

# 16. TeamSpec

Introduce a machine-readable team specification.

Suggested first schema:

```yaml
team:
  id: ndim-product-team
  archetype: web-product-medium
  version: 1
  objective: Deliver and maintain NDim.

  project:
    id: ndim
    domain: social_discovery

  topology:
    style: centralized
    interaction_modes:
      manager-engineer: x-as-a-service
      architect-engineer: collaboration
      designer-engineer: collaboration
      qa-engineer: verification

  roles:
    - id: manager
      template: manager
      count: 1

    - id: architect
      template: system-architect
      count: 0..1
      activation:
        complexity: medium_or_higher

    - id: designer
      template: ux-designer
      count: 0..1
      activation:
        ui_complexity: medium_or_higher

    - id: engineer
      template: fullstack-engineer
      count: auto
      scaling:
        based_on:
          - parallelizable_work
          - dependency_density

    - id: verifier
      template: qa-verifier
      count: 1

  workspace:
    provider: git-worktree
    isolation: required

  gates:
    - task_acceptance
    - implementation_verification
    - integration_verification

  adaptation:
    enabled: true
    triggers:
      - capability_gap
      - prolonged_blocker
      - repeated_rework
      - excessive_coordination
      - verification_failure_pattern
```

The exact schema should be validated and versioned.

---

# 17. Team Constitution

Every deployed team must receive a generated human-readable constitution.

Suggested artifact:

```text
TEAM_CONSTITUTION.md
```

Minimum contents:

1. Team mission.
2. Team members.
3. Role descriptions.
4. Authority boundaries.
5. Communication protocol.
6. Assignment protocol.
7. Escalation protocol.
8. Definition of done.
9. Verification rules.
10. Git/worktree rules.
11. Integration rules.
12. Human escalation rules.
13. Team status protocol.
14. Reconfiguration policy.
15. Retrospective protocol.

This artifact becomes the canonical organizational document for the deployed team.

---

# 18. Communication Protocol

The first implementation should use structured messages.

Suggested event types:

```text
TASK_ASSIGNMENT
TASK_ACCEPTED
TASK_REJECTED
TASK_BLOCKED
TASK_COMPLETED
REVIEW_REQUESTED
VERIFICATION_PASSED
VERIFICATION_FAILED
ARCHITECTURE_CONFLICT
REQUIREMENT_GAP
CAPABILITY_GAP
INTEGRATION_CONFLICT
ESCALATION
TEAM_RECONFIGURATION
```

Messages should be concise and structured.

Example:

```yaml
message:
  type: TASK_BLOCKED
  from: backend-engineer-02
  to: manager
  task: auth-refactor
  reason: external_dependency
  blocking_resource: firebase-config
  proposed_action: request-owner-input
```

Avoid unrestricted conversational fan-out.

---

# 19. Interaction Modes

Borrow the Team Topologies vocabulary as a useful organizational abstraction.

Supported modes:

### Collaboration

Two roles work closely for a bounded objective where the interface is still being discovered.

### X-as-a-Service

One role provides a stable output/interface consumed by another role with limited coordination.

### Facilitation

A specialist temporarily enables another role to acquire or use a capability.

These modes must be explicit where useful, and may change over the project lifecycle.

---

# 20. Worktree Deployment

For software projects, each implementation role instance that requires independent repository modifications should normally receive an isolated Git worktree.

Example:

```text
/project
/project-worktrees/
    manager/
    backend-01/
    backend-02/
    frontend-01/
    qa/
```

Rules:

1. Agents do not modify another agent's worktree.
2. Agents commit their own coherent changes.
3. Integration is centrally controlled.
4. Verification occurs before merge where practical.
5. Shared mutable state outside Git must be explicitly identified.

The actual infrastructure adapter should remain separate from the organizational model so future workspace providers can be supported.

---

# 21. Dependency-Aware Planning

The Team Designer / Manager must produce a task dependency graph when meaningful parallelism exists.

Example:

```text
A: Define data model
        │
        ├────→ B: Backend implementation
        │             │
        │             └────→ D: Integration
        │
        └────→ C: UI implementation
                      │
                      └────→ D: Integration
```

The manager should dispatch independent tasks in parallel waves.

Conceptually:

```text
Wave 0: A
Wave 1: B + C
Wave 2: D
```

Do not force parallelism where dependencies make it unsafe.

---

# 22. Team Sizing Algorithm — Version 1

The initial algorithm should be heuristic and explainable.

## Step 1 — Estimate work graph

Estimate:

- total work units;
- independent work units;
- critical path;
- dependency density;
- expected integration overlap.

## Step 2 — Identify mandatory capabilities

Mandatory capabilities become required role coverage.

## Step 3 — Merge compatible capabilities

Combine capabilities into one role when:

- they naturally belong together;
- cognitive load remains acceptable;
- the work volume is insufficient for separate staffing.

## Step 4 — Split overloaded roles

Create separate role instances when:

- parallel work is high;
- domain contexts differ strongly;
- one role would become overloaded;
- independence is required.

## Step 5 — Add verification capacity

Ensure risk-appropriate verification capacity exists.

## Step 6 — Apply team-size guardrails

The first implementation should prefer small teams and require evidence before scaling upward.

Example heuristic:

```text
Low complexity        → 1–2 agents
Medium complexity     → 3–6 agents
High complexity       → 5–9 agents initially
Very high complexity  → staged deployment
```

These are **starting heuristics**, not universal truths. They must be measured and revised.

## Step 7 — Calculate coordination risk

Reject a proposed structure if additional agents create more coordination cost than useful parallel work.

---

# 23. Dynamic Scaling

Team size should be adjustable.

Possible actions:

```text
ADD_ROLE
ADD_INSTANCE
REMOVE_INSTANCE
SUSPEND_ROLE
MERGE_ROLES
SPLIT_ROLE
REASSIGN_TASKS
ACTIVATE_SPECIALIST
RETIRE_SPECIALIST
```

The Manager should request a reconfiguration when a trigger occurs.

Suggested trigger thresholds:

```text
capability gap discovered
3+ repeated task blocks caused by same missing capability
high verification failure concentration
agent idle while critical-path work remains
coordination overhead exceeds configurable threshold
specialist need appears only temporarily
```

---

# 24. Agent Capability Profiles

The organizational layer should not assume every model is equally capable at every task.

Each available agent/model may eventually have a capability profile:

```yaml
agent_profile:
  model: claude-opus
  capabilities:
    coding: high
    architecture: high
    research: high
    visual_reasoning: medium
    repetitive_execution: high
  cost_class: high
```

This enables future role-to-model assignment.

For 2.4, it is sufficient to support an optional static capability profile.

---

# 25. Team Lifecycle

Implement a simple state machine.

```text
DRAFT
  ↓
DESIGNED
  ↓
DEPLOYED
  ↓
PLANNING
  ↓
EXECUTING
  ↓
VERIFYING
  ↓
INTEGRATING
  ↓
RECONFIGURING ↔ EXECUTING
  ↓
RELEASING
  ↓
RETROSPECTIVE
  ↓
ARCHIVED
```

The exact transitions may be simplified in the first implementation.

---

# 26. Verification Architecture

Use two distinct conceptual gates where appropriate.

## Planning validation

Before execution:

- Does every task have an owner?
- Are dependencies acyclic?
- Is required capability covered?
- Is work actually parallelizable?
- Are acceptance criteria defined?
- Are integration points explicit?

## Execution validation

After execution:

- Does the implementation satisfy acceptance criteria?
- Do tests pass?
- Does integration work?
- Did the change introduce regressions?
- Does the implementation violate architecture or product canon?

This mirrors the useful distinction investigated in SPOQ. [2]

---

# 27. Team Health Metrics

KAIF 2.4 should begin collecting lightweight team metrics.

## Flow

- lead time;
- critical-path duration;
- parallel work ratio;
- blocked time;
- queue time.

## Quality

- verification failure rate;
- escaped defects;
- rework rate;
- integration conflicts;
- rollback rate.

## Coordination

- number of cross-role requests;
- repeated questions;
- manager bottlenecks;
- unresolved dependencies;
- message volume.

## Capacity

- active time;
- idle time;
- work imbalance;
- specialization utilization.

Do not interpret token consumption or number of commits as direct measures of productivity.

---

# 28. Team Retrospective

After a milestone, the team should produce:

```text
TEAM_RETROSPECTIVE.md
```

Suggested questions:

```text
Was the team correctly staffed?
Which roles were overloaded?
Which roles were underutilized?
Which capabilities were missing?
Which capabilities were duplicated?
Where did coordination become a bottleneck?
Which dependencies were discovered too late?
Which verification gates caught meaningful defects?
Which role boundaries caused friction?
Which agent assignments were ineffective?
What should change in the next team configuration?
```

The retrospective should produce explicit proposed changes, not generic observations.

---

# 29. Team Experience

Persist validated lessons in a reusable store.

Suggested artifact:

```text
TEAM_EXPERIENCE.md
```

Example:

```yaml
experience:
  project_type: web-product-medium
  stack: typescript-firebase
  domain: social-discovery

  observations:
    - role: fullstack-engineer
      finding: two concurrent instances produced excessive overlap in shared auth code
      recommendation: split by feature boundary rather than technical layer

    - role: qa-verifier
      finding: independent verification caught integration regressions
      recommendation: keep verifier independent
```

Experience should not blindly become doctrine. It should be treated as evidence for future team design.

---

# 30. Project Artifacts Created by Deployment

A successful deployment should create a predictable structure.

Suggested structure:

```text
.kaif/
  team/
    TEAM_SPEC.yaml
    TEAM_CONSTITUTION.md
    TEAM_TOPOLOGY.md
    TEAM_STATUS.md
    TEAM_RETROSPECTIVE.md
    TEAM_EXPERIENCE.md

    roles/
      manager.md
      architect.md
      engineer-01.md
      engineer-02.md
      qa.md

    tasks/
      TASK-001.yaml
      TASK-002.yaml

    communication/
      protocol.yaml

    workspaces/
      registry.yaml
```

Adapt the exact location to KAIF's current filesystem conventions.

---

# 31. Suggested KAIF Repository Structure

Do not duplicate concepts already represented elsewhere in KAIF. Extend the existing architecture.

A possible target structure:

```text
KAIF/
├── skills/
│   └── team-deployment/
│       ├── SKILL.md
│       ├── README.md
│       ├── templates/
│       ├── schemas/
│       ├── prompts/
│       └── examples/
│
├── teams/
│   ├── web-product-small.yaml
│   ├── web-product-medium.yaml
│   ├── game-medium.yaml
│   └── research-software.yaml
│
├── roles/
│   ├── manager.yaml
│   ├── architect.yaml
│   ├── engineer.yaml
│   ├── qa-verifier.yaml
│   └── ...
│
└── capabilities/
    ├── software.yaml
    ├── research.yaml
    └── creative.yaml
```

The exact repository layout must be reconciled with the current KAIF codebase before implementation.

---

# 32. Team Archetype: Web Product Medium

This should be the first complete reference implementation.

Suggested default:

```text
Manager                     1
System Architect            0–1
Product/UX Designer         0–1
Engineer                    2–4
Verifier                    1
```

Activation examples:

```text
Architect:
  activate if architecture_complexity >= medium

Designer:
  activate if UI/product interaction complexity >= medium

Additional Engineer:
  activate if parallelizable work exceeds one engineer's sustainable capacity

Security Reviewer:
  activate if security risk >= high

Performance Engineer:
  activate if performance risk >= high
```

---

# 33. NDim as First Dogfooding Target

The current NDim worktree development setup should be used as the reference migration target.

The existing setup already contains many useful primitives:

- manager role;
- designer role;
- QA role;
- multiple developer worktrees;
- centralized coordination;
- worktree isolation;
- status reporting;
- escalation;
- merge discipline;
- independent verification.

The goal is NOT to throw this structure away.

The goal is to express it in the new KAIF Team Deployment model and let KAIF generate the equivalent organization.

Target outcome:

```text
NDim
  ↓
KAIF Team Deployment
  ↓
Project Profile
  ↓
Web Product Medium Archetype
  ↓
Generated TeamSpec
  ↓
Generated Team Constitution
  ↓
Generated role prompts
  ↓
NDim worktree deployment
```

Then compare the generated team with the manually designed team.

---

# 34. NDim Experimental Variants

Run controlled experiments rather than assuming the current six-agent configuration is optimal.

Suggested variants:

### Variant A — current baseline

```text
Manager
Designer
QA
Developer ×3
```

### Variant B — capability-oriented

```text
Manager / Product
Architect
Designer
Engineer ×2
Verifier
```

### Variant C — compact

```text
Manager / Architect
Full-stack Engineer ×2
Verifier
```

### Variant D — dynamic

Start compact and allow the Manager to activate specialists only when triggered.

Compare:

- delivery time;
- defects;
- rework;
- coordination volume;
- integration conflicts;
- agent utilization;
- human intervention frequency.

This turns NDim into a living experimental benchmark for KAIF team design.

---

# 35. Implementation Phases

## Phase 0 — Architecture Reconnaissance

**Goal:** Align Team Deployment with actual KAIF architecture.

Tasks:

- inspect current KAIF skill loading;
- inspect Sphere architecture;
- inspect Agent abstractions;
- inspect canonical knowledge structures;
- inspect existing prompt conventions;
- inspect existing filesystem/config conventions;
- identify where optional skills are registered;
- identify integration points with Claude Code.

Deliverables:

```text
TEAM_DEPLOYMENT_ARCHITECTURE.md
```

Acceptance:

- no duplicate concept is introduced accidentally;
- extension points are identified;
- Team Deployment can exist as optional capability.

---

## Phase 1 — Data Model

Implement:

- Capability;
- Role;
- RoleInstance;
- Agent;
- Workspace;
- TeamSpec;
- TeamArchetype;
- RoleContract;
- TeamState;
- TeamEvent.

Deliverables:

```text
schemas/team-spec.schema.yaml
schemas/role-contract.schema.yaml
schemas/team-event.schema.yaml
```

Acceptance:

- schemas validate example files;
- examples can be loaded and rendered without ambiguity.

---

## Phase 2 — Role Library

Implement a small initial role library.

Minimum roles:

```text
manager
architect
engineer
ux-designer
qa-verifier
```

For each role provide:

- mission;
- capabilities;
- authority;
- responsibilities;
- inputs;
- outputs;
- communication contract;
- verification requirements;
- escalation rules;
- prompt template.

Acceptance:

- a role can be instantiated from a template without manual prompt rewriting.

---

## Phase 3 — Team Archetype Library

Implement:

```text
web-product-small
web-product-medium
```

Do not attempt ten domains yet.

Acceptance:

- archetype can be selected from a project profile;
- archetype produces a valid TeamSpec;
- optional roles have explicit activation conditions.

---

## Phase 4 — Team Designer

Implement the first Team Designer behavior.

Inputs:

```text
project description
KAIF Sphere
project Canon
available roles
team archetypes
available agent profiles
```

Outputs:

```text
Project Profile
Capability Graph
Candidate Team Design
Sizing rationale
Risk notes
```

The design decision must be explainable.

Acceptance:

Given the same project context and constraints, the system should produce a deterministic or at least reproducibly justified team design under the same configuration.

---

## Phase 5 — TeamSpec Generation

Convert the Team Designer output into validated TeamSpec.

Generate:

```text
TEAM_SPEC.yaml
TEAM_TOPOLOGY.md
TEAM_CONSTITUTION.md
```

Acceptance:

- schema validates;
- role authority is internally consistent;
- communication graph does not contain unintended unrestricted broadcast paths;
- all required capabilities are covered.

---

## Phase 6 — Agent Deployment Adapter

Integrate with the actual agent execution environment.

For software projects:

```text
TeamSpec
  ↓
Workspace Planner
  ↓
Git worktrees
  ↓
Agent launch configuration
```

The adapter should manage:

- workspace naming;
- branch naming;
- registration;
- role prompt materialization;
- status registry.

Acceptance:

- an entire small team can be created from TeamSpec with minimal manual intervention.

---

## Phase 7 — Dependency-Aware Task Dispatch

Implement:

- task graph;
- dependency validation;
- parallel waves;
- assignment;
- task status transitions.

Acceptance:

- independent tasks execute concurrently;
- dependent tasks do not start prematurely;
- blocked tasks propagate clear state to the manager.

---

## Phase 8 — Verification Gates

Implement:

```text
planning validation
execution verification
integration verification
```

Acceptance:

- invalid plans are rejected before dispatch;
- failed verification prevents unreviewed integration where configured;
- failures become structured team events.

---

## Phase 9 — Dynamic Reconfiguration

Implement a small controlled subset:

```text
ADD_INSTANCE
REMOVE_INSTANCE
ACTIVATE_SPECIALIST
REASSIGN_TASK
```

Reconfiguration must require a reason and produce an event.

Acceptance:

- team can react to a missing capability without redeploying from scratch.

---

## Phase 10 — Retrospective and Experience

Implement:

```text
TEAM_RETROSPECTIVE.md
TEAM_EXPERIENCE.md
```

Capture:

- staffing errors;
- coordination bottlenecks;
- quality outcomes;
- useful role-boundary changes;
- next-deployment recommendations.

Acceptance:

- retrospective output can inform the next Team Design.

---

## Phase 11 — NDim Dogfooding

Run at least one real NDim development milestone under Team Deployment.

Record:

```text
baseline
team design
team topology
agent count
worktree count
work completed
verification failures
integration conflicts
human interventions
retrospective
```

Compare with the current hand-designed NDim team.

Acceptance:

- KAIF-generated team can complete a real milestone;
- differences from manually designed team are documented;
- at least one team configuration is measurably better on a defined metric or is demonstrably simpler without quality loss.

---

# 36. Testing Strategy

## Unit tests

Test:

- schema validation;
- capability matching;
- role activation conditions;
- sizing heuristics;
- communication permissions;
- dependency graph validation.

## Golden tests

Given known project profiles, compare Team Designer output to expected ranges rather than exact strings.

Example:

```text
Small web app
→ 1–3 role instances
→ verifier optional or shared
```

## Integration tests

Deploy a synthetic repository with several independent tasks and verify:

- worktree isolation;
- concurrent execution;
- dependency ordering;
- merge behavior;
- verification gate behavior.

## Dogfood tests

Use NDim as a real-world integration environment.

---

# 37. Anti-Patterns to Detect

Team Deployment should explicitly detect and warn about:

### Agent Explosion

Adding agents without enough independent work.

### Role Duplication

Multiple agents performing effectively the same reasoning task.

### Manager Bottleneck

All useful work waiting on one overloaded manager.

### Unbounded Collaboration

Permanent high-bandwidth communication between many roles.

### Shared Workspace Mutation

Multiple agents directly modifying the same workspace.

### Verification Collapse

No independent verification despite elevated risk.

### Authority Ambiguity

Two roles believing they own the same decision.

### Orphan Capability

Required capability exists in the project profile but is unassigned.

### Specialist Hoarding

Specialists remain active after the capability need disappears.

### Bureaucratic Overengineering

The team structure is more complex than the project requires.

---

# 38. Security / Trust Requirements

Because Team Deployment grants agents organizational authority, it must make permissions explicit.

Minimum requirements:

- no agent may silently elevate its own authority;
- team reconfiguration must be logged;
- human approval gates must remain enforceable;
- product-owner decisions must not be fabricated by engineering roles;
- security/compliance roles may reject high-risk actions where configured;
- all merges remain traceable to role and agent instance.

---

# 39. Human Role

Human involvement should be a configurable part of the team topology.

The human may act as:

```text
Owner
Product Authority
Domain Expert
Approval Gate
High-Risk Reviewer
Strategic Decision Maker
```

The system should not automatically assume the human has delegated every decision to the Team Manager.

Recommended default:

```text
Human
  ↓
Team Manager
  ↓
Specialists / Workers
```

with explicit escalation for:

- major product decisions;
- irreversible architectural changes;
- security-sensitive decisions;
- legal/compliance questions;
- destructive data operations;
- ambiguous requirements.

---

# 40. Initial Skill Prompt Responsibilities

The `team-deployment` skill should teach the agent to:

1. Analyze the project before proposing a team.
2. Identify required capabilities.
3. Avoid unnecessary specialists.
4. Prefer explicit responsibility boundaries.
5. Design communication pathways.
6. Separate roles from agent instances.
7. Separate agents from workspaces.
8. Prefer isolated execution for parallel software work.
9. Build dependency-aware plans.
10. Include verification capacity appropriate to risk.
11. Explain team sizing decisions.
12. Generate TeamSpec and Team Constitution.
13. Detect team anti-patterns.
14. Reconfigure the team when evidence justifies it.
15. Record lessons after milestones.

The skill should repeatedly prefer **simple adequate organization** over elaborate organization.

---

# 41. Definition of Done for KAIF 2.4

Team Deployment is complete for 2.4 when all of the following are true:

- [ ] Optional `team-deployment` skill exists and is documented.
- [ ] TeamSpec schema exists and validates.
- [ ] RoleContract schema exists and validates.
- [ ] Capability model exists.
- [ ] At least 5 reusable software roles exist.
- [ ] At least 2 web-product team archetypes exist.
- [ ] Team Designer generates an explainable candidate team.
- [ ] Team Constitution is generated automatically.
- [ ] Communication topology is explicit.
- [ ] Agent instances can be mapped to role instances.
- [ ] Software role instances can receive isolated worktrees.
- [ ] Dependency-aware task dispatch is supported.
- [ ] Planning and execution verification gates exist.
- [ ] Basic dynamic reconfiguration exists.
- [ ] Team retrospective exists.
- [ ] Team experience can be persisted.
- [ ] NDim has been used as a real dogfooding case.
- [ ] At least one baseline comparison has been collected.
- [ ] Documentation explains that the system produces adaptive evidence-informed designs rather than universally optimal teams.

---

# 42. Future Versions

## KAIF 2.5

Potential extensions:

- more software team archetypes;
- research team archetype;
- game development archetype;
- data/ML team archetype;
- model capability profiles;
- cost-aware routing;
- stronger automatic reconfiguration;
- team health dashboards.

## KAIF 2.6+

Potential extensions:

- cross-project organizational learning;
- empirical team optimization;
- specialized domain packs;
- dynamic model selection;
- team simulation before deployment;
- organizational benchmarking;
- automated A/B experiments between team topologies;
- human-agent mixed teams;
- multi-repository organizational deployment.

---

# 43. Research Position

KAIF Team Deployment should be presented as an engineering framework informed by emerging research, not as a scientifically proven universal optimal-team generator.

The strongest evidence currently supports several concrete design choices:

1. centralized delegation can help coordinate long-horizon multi-agent software work;
2. isolated workspaces are useful for concurrent software agents;
3. dependency-aware task scheduling improves parallel execution efficiency;
4. planning and post-execution validation are useful structural gates;
5. dynamic team composition is a credible design for continuous software development;
6. mature organizational patterns emphasize explicit ownership, constrained interaction modes, cognitive-load awareness, and continuous adaptation.

The uncertain part is the exact optimal team composition for a particular project. KAIF should therefore treat team design as a **measurable adaptive hypothesis**.

---

# 44. Design Mantra

The feature should be guided by the following principles:

> **Do not spawn agents because you can. Spawn them because the work graph justifies them.**

> **Do not define roles by title. Define them by responsibility, authority, inputs, outputs, and interactions.**

> **Do not optimize agents independently. Optimize the organization.**

> **Do not freeze the organization. Measure it and adapt it.**

> **Do not claim optimality without evidence.**

---

# 45. Primary References

1. Jiayi Geng, Graham Neubig. *Effective Strategies for Asynchronous Software Engineering Agents*. arXiv:2603.21489, 2026. Introduces Centralized Asynchronous Isolated Delegation (CAID) using centralized delegation, asynchronous execution, isolated workspaces, and structured integration.  
   https://arxiv.org/abs/2603.21489

2. Royce Carbowitz, Dheeraj Kumar. *SPOQ: Specialist Orchestrated Queuing for Multi-Agent Software Engineering*. arXiv:2606.03115, 2026. Introduces wave-based topological dispatch, planning/code validation gates, specialist tiers, and human-as-agent participation.  
   https://arxiv.org/abs/2606.03115

3. Wenhan Lyu, Yue Xiao, Yixuan Zhang, Yifan Sun. *Self-Organizing Multi-Agent Systems for Continuous Software Development*. arXiv:2603.25928, 2026. Explores Strategy → Execution → Verification and dynamically hired/assigned/fired agents.  
   https://arxiv.org/abs/2603.25928

4. Matthew Skelton, Manuel Pais. *Team Topologies*. IT Revolution Press, 2019; current Team Topologies reference material. Defines four fundamental team types and three team interaction modes, with emphasis on cognitive load and continuous evolution.  
   https://teamtopologies.com/key-concepts

---

# 46. Final Implementation Direction

The first implementation should remain deliberately small.

Do **not** attempt to build a universal AI HR system in KAIF 2.4.

Build the minimum organizational substrate that allows this transformation:

```text
Manual team design
        ↓
Reusable role contracts
        ↓
Reusable team archetypes
        ↓
Project-aware Team Designer
        ↓
Generated TeamSpec
        ↓
Generated Team Constitution
        ↓
Automated worktree deployment
        ↓
Measured execution
        ↓
Retrospective
        ↓
Better next team
```

The first proof of value should be simple:

> **Can KAIF 2.4 take the NDim project, understand its work profile, generate a sensible team, deploy that team into isolated worktrees, and complete a real milestone with measurable coordination and quality outcomes?**

If the answer is yes, Team Deployment is no longer a concept. It becomes a reusable KAIF capability from which domain-specific organizational systems can grow.
