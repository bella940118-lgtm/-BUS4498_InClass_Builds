# [Exact task name] Task Specification

*BUS 4498 Team Build Milestone 1. Create one copy for each L3 task. Save it in `our_team_agent/agent/task-specs/` in `BUS4498_Team_Build`. Use the task name in lowercase with hyphens between words; replace `&` with `and` and remove other punctuation.*

*Keep the exact task ID and name from the workflow. Complete all six sections, including Tool Permissions and Boundaries. The reason for assigning L3 belongs only in the team worksheet. Replace prompts and remove template instructions before submitting. Tool scripts are not required.*

```yaml
# BASIC INFORMATION
task_id: "[Exact workflow task ID]"
task_name: "[Exact workflow task name]"
task_owner: "[Person or role accountable for this task]"

# Agent Inference Configuration
Provider: [e.g., Groq, OpenAI, Claude, Google Gemini]
Model: "[Exact supported API model ID.]"
Role: [permitted subtasks the model supports]
Maximum inference requests per task run: "[Whole-number limit.]"
On inference failure or exhausted limits: Record the unresolved status and hand the case to [human role].
```

## 1. Task Goal

- **Objective:** [What business result should this task produce?]

## 2. Inbound Inputs

*Describe what the enclosing workflow must provide. Specify the structure of each input; do not invent customer, employee, or event data. Copy the Input block as needed.*

### Input 1

- **Input name:** [Short name.]
- **What it contains:** [Information the agent receives, including required fields and format.]
- **Source:** [Task ID and name, person, or other permitted source.]

## 3. Tool Permissions and Boundaries

*Name each planned tool and specify its permitted use. Use verb-object names, such as `retrieve_records`, usually matching the task or permitted subtask it supports. Tool name identifies the capability; tool type identifies the proposed implementation. No scripts or working integrations are required.*

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

*Define permitted kinds of work rather than a fixed sequence. The agent selects its next subtask using intermediate findings and may skip, repeat, or combine permitted subtasks within Section 3's limits. Individual subtasks do not all have to be L3. Copy the Permitted Subtask block as needed.*

### Permitted Subtask 1

- **Subtask name:** [Use a verb-object name.]
- **Subtask description:** [What information does it examine and what finding or intermediate result does it produce?]
- **Subtask boundary:** [What may and may not be done, including prerequisites and required approval?]
- **Retry limits:** [Maximum additional attempts after the initial attempt; 0 means no retries. Repetition must also stay within Section 3's limits.]

- **Decision guidance:** After each subtask, use its findings to select the permitted subtask most likely to resolve the most important remaining uncertainty. Do not follow a fixed sequence. If no permitted subtask can make useful progress, stop and hand the case to a person.

## 5. When to Stop or Hand Off to a Human

- **Stop successfully when:** [What evidence shows that the required result is complete and acceptable? Confidence alone is not enough.]
- **Hand off early when:** [What missing evidence, lack of progress, failure, or out-of-scope finding requires human review?]
- **Hand off to:** [Specific person, role, or review queue.]

Stop at the first applicable budget limit or handoff condition. While awaiting review, take no further autonomous action.

## 6. Outbound Deliverable

*Revise these default items if your task needs a more specific deliverable, or retain them if they fit.*

- **Status:** Completed or escalated to human.
- **Result or recommendation:** The completed result. If escalated before reaching a supported result, write undetermined.
- **Evidence summary:** The most important evidence supporting the result or explaining why no result could be reached.
- **Subtasks performed:** Permitted subtasks completed, including repeated attempts.
- **Unresolved issues:** Remaining uncertainties or questions; use none only if no unresolved issue remains.
- **Handoff note:** Reason for stopping, unresolved questions, and what the reviewer needs to decide; write "Not applicable" for a completed task.
- **Next task or recipient:** Who receives the completed output? Unresolved cases go to the handoff recipient above.
