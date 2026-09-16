# Retrieve individual registration records and attendance signals in parallelTask Specification

```yaml
# BASIC INFORMATION
task_id: "T2"
task_name: "Retrieve individual registration records and attendance signals in parallel"
task_owner: "HackTrack forecast operations owner"

# Agent Inference Configuration
Provider:  OpenAI
Model: "GPT-5.6"
Role: "Identify approved sources and retrieve permitted registration and attendance records"
Maximum inference requests per task run: "3"
On inference failure or exhausted limits: Record the unresolved status and hand the case to the CPVC AI Hackathon or organizer.
```

## 1. Task Goal

- **Objective:** Provide complete, authorized individual-level registration and attendance information so HackTrack can remove unnecessary personal data, validate required fields, and estimate each registrant’s likelihood of attending the CPVC AI Hackathon.

## 2. Inbound Inputs

### Input 1

- **Input name:** Current registration records
- **What it contains:** Structured records for current CPVC AI Hackathon registrants, including a permitted unique record identifier, registration status, registration date or time, and any available voluntary RSVP response.
- **Source:** CPVC AI Hackathon registration system

### Input 2

- **Input name:** Historical attendance signals
- **What it contains:** Structured, permitted attendance outcomes from previous CPVC events, including a record identifier or approved matching field, event identifier, attendance status, and related RSVP status where available.
- **Source:** CPVC historical event attendance records
  
## 3. Tool Permissions and Boundaries



### Task-Wide Limits

- **Total task timeout:** [Maximum elapsed time for one task run, with units; include tool calls, retries, and waiting.]
- **Maximum tool calls:** [Maximum total calls across all tools during one task run; retries count toward this total.]

### Tool 1

- **Tool name:** [Proposed verb-object name, used consistently throughout the project.]
- **Tool type:** [For example: Python script, pretrained model, API request, database query, or language-model call.]
- **Supports these permitted subtasks:** [Names from Section 4.]
- **Allowed use:** [What the tool may read, create, change, or send; identify permitted data sources and destinations.]
- **Prohibited use:** [Actions, data, or destinations outside this tool's authority.]
- **Approval required:** [What requires approval, who provides it, and when. Write "None within the allowed use" if applicable.]
- **Timeout per call:** [Maximum duration of a single attempt, with units.]
- **Maximum retries per call:** [Nonnegative whole number of additional attempts after the first; 0 means no retries.]
- **Retry conditions and failure response:** [When a retry is allowed, any waiting interval, and what happens on timeout or exhausted retries. For actions that change state, avoid duplicate actions and hand off if the outcome is uncertain.]

*Copy the Tool block as needed. Tool-specific and task-wide limits both apply; stop at whichever is reached first. Naming a tool does not authorize uses outside its stated permissions.*

## 4. How the Agent Should Reason


### Permitted Subtask 1

- **Subtask name:** Identify available sources
- **Subtask description:** Examine the permitted registration, RSVP, and historical attendance sources to determine which sources are available and which fields can support attendance forecasting.
- **Subtask boundary:** May inspect only approved source metadata and available field structures. May not change source records, request unapproved data, or access data outside the HackTrack workflow.
- **Retry limits:** 1 additional attempt. If required source availability remains unclear, hand off to the organizer.

### Permitted Subtask 2

- **Subtask name:** Retrieve registration records
- **Subtask description:** Retrieve current individual registration records and voluntary RSVP responses from available approved sources. Produce a structured set of retrieved registration records and identify any unavailable source or field.
- **Subtask boundary:** May retrieve only the records and fields permitted for this workflow. May not modify registration records or send messages to registrants.
- **Retry limits:** 1 additional attempt. If retrieval still fails, record the failure and hand off to the organizer.

### Permitted Subtask 3

- **Subtask name:** Retrieve attendance signals
- **Subtask description:** Retrieve permitted historical CPVC attendance results and related attendance signals. Produce a structured set of retrieved attendance records and identify unavailable or incomplete signals.
- **Subtask boundary:** May retrieve only approved historical attendance information needed for forecasting. May not modify historical records or infer missing attendance outcomes.
- **Retry limits:** 1 additional attempt. If retrieval still fails, record the failure and hand off to the organizer.

### Permitted Subtask 4

- **Subtask name:** Assess retrieval completeness
- **Subtask description:** Compare retrieved registration records and attendance signals against the information required by the next workflow task. Determine whether the available individual-level data is sufficient to continue to T3 and T4.
- **Subtask boundary:** May identify missing, duplicate, inaccessible, or unmatched records. May not remove personal data, validate final data quality, estimate attendance, or create a forecast; those actions belong to later tasks.
- **Retry limits:** 0 additional attempts. If required data is missing or unreliable, report the issue for T5 and organizer review.

- **Decision guidance:** After each subtask, use its findings to select the permitted subtask most likely to resolve the most important remaining uncertainty. Do not follow a fixed sequence. If no permitted subtask can make useful progress, stop and hand the case to a person.

## 5. When to Stop or Hand Off to a Human

- **Stop successfully when:** The task has retrieved the available, permitted current registration records and attendance signals; recorded the source, retrieval status, and available fields for each result; and produced a structured retrieval result for T3 Remove unnecessary personal data.
- **Hand off early when:** A required approved source is unavailable; required individual-level registration or attendance information cannot be retrieved after the permitted retry limit; records cannot be matched using approved fields; access appears to exceed the workflow's authority; or the available data is insufficient or unreliable for the next task.
- **Hand off to:** CPVC AI Hackathon organizer.

Stop at the first applicable budget limit or handoff condition. While awaiting review, take no further autonomous action.

## 6. Outbound Deliverable

- **Status:** Completed or escalated to human.
- **Result or recommendation:** A structured retrieval result containing the available current registration records, voluntary RSVP responses, and historical attendance signals; if escalated before a supported result is reached, write undetermined.
- **Evidence summary:** Sources checked, retrieval status for each source, record counts where available, available fields, and the most important missing or inaccessible information.
- **Subtasks performed:** Permitted subtasks completed, including repeated attempts.
- **Unresolved issues:** Missing, inaccessible, unmatched, incomplete, or unreliable records or fields; use none only if no unresolved issue remains.
- **Handoff note:** Reason for stopping, unresolved questions, and what the CPVC AI Hackathon organizer needs to decide; write "Not applicable" for a completed task.
- **Next task or recipient:** T3 Remove unnecessary personal data. Unresolved cases go to the CPVC AI Hackathon organizer.
