# Start scheduled or requested run Task Specification

## Basic Information
- **Task ID:** T1
- **Task name:** Start scheduled or requested run
- **Task type:** Act
- **Task owner:** HackTrack forecast operations owner

## 1. Task Description

Start a new HackTrack workflow run when the daily pre-event schedule, registration-close event, or an authorized organizer request meets the configured trigger rule. This creates a run identifier and passes the trigger context to T2.

## 2. Inputs

### Input 1
- **Input name:** Workflow trigger
- **Contents and format:** Scheduled timestamp, registration-close event, or authenticated organizer request with trigger type and time.
- **Source:** HackTrack scheduler, registration system event, or CPVC AI Hackathon organizer.
- **If a required input is missing or invalid:** Record an invalid-trigger status and send the case to the HackTrack forecast operations owner.

## 3. Outputs

### Output 1
- **Output name:** Started workflow run
- **Contents and format:** Unique run ID, trigger type, timestamp, and `started` status.
- **Next task or recipient:** T2 Retrieve individual registration records and attendance signals in parallel.
- **Complete when:** A unique run ID and trigger record are available to T2.

## 4. Planned Tools

### Tool 1
- **Tool name:** `start_workflow_run`
- **Input:** Workflow trigger
- **Output:** Started workflow run
- **Implementation Route:** functions/scripts
- **Integration approach:** direct integration
- **Role in this task:** Applies predefined trigger rules and creates one workflow run.
- **Task timeout:** 30 seconds per run.
- **Maximum retries:** 1
- **Retry only when:** A transient scheduler or run-record creation error occurs; retry only after confirming no run ID was created, to avoid duplicates.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the trigger evidence and send the case to the HackTrack forecast operations owner.
