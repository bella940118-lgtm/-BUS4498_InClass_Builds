# Prepare and send one reminder Task Specification

## Basic Information
- **Task ID:** T12
- **Task name:** Prepare and send one reminder
- **Task type:** Act
- **Task owner:** CPVC AI Hackathon organizer

## 1. Task Description
After explicit organizer approval, generate and send one approved confirmation reminder to eligible registered students. The task records delivery status and prevents duplicate reminders.

## 2. Inputs
### Input 1
- **Input name:** Organizer-approved reminder request
- **Contents and format:** Organizer approval, approved message template, eligible recipient criteria, workflow run ID, and reminder status.
- **Source:** CPVC AI Hackathon organizer after T10 review.
- **If a required input is missing or invalid:** Do not send a reminder; send the case to the CPVC AI Hackathon organizer.

## 3. Outputs
### Output 1
- **Output name:** Reminder delivery record
- **Contents and format:** Workflow run ID, recipient count, delivery status, send timestamp, message-template version, and failures without unnecessary personal data.
- **Next task or recipient:** CPVC AI Hackathon organizer; a new T1 run if organizers request an updated forecast after new RSVP responses.
- **Complete when:** Exactly one delivery attempt per approved workflow run is recorded with confirmed status or documented uncertainty.

## 4. Planned Tools
### Tool 1
- **Tool name:** `send_confirmation_reminder`
- **Input:** Organizer-approved reminder request
- **Output:** Reminder delivery record
- **Implementation Route:** web API calls
- **Integration approach:** direct integration
- **Role in this task:** Sends the approved template once to eligible recipients and records an idempotency key before sending.
- **Task timeout:** 5 minutes per run.
- **Maximum retries:** 1
- **Retry only when:** A transient sending error occurs and the idempotency key confirms no message was accepted or sent. Wait 30 seconds before retrying.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record delivery as uncertain or failed; do not send another reminder automatically; hand the case to the CPVC AI Hackathon organizer.
