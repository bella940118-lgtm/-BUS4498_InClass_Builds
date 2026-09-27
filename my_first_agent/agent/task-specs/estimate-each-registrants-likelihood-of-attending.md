# Estimate each registrant's likelihood of attending Task Specification

## Basic Information
- **Task ID:** T6
- **Task name:** Estimate each registrant's likelihood of attending
- **Task type:** Reason
- **Task owner:** HackTrack forecast operations owner

## 1. Task Description
Use the approved predictive model and validated de-identified data to produce one supported attendance probability for each eligible registrant.

## 2. Inputs
### Input 1
- **Input name:** Validated de-identified forecasting dataset
- **Contents and format:** Structured pseudonymous records, approved forecasting fields, and validation status.
- **Source:** T4 Validate data quality and required fields.
- **If a required input is missing or invalid:** Send the case to T5 Flag missing-data issue.

## 3. Outputs
### Output 1
- **Output name:** Individual attendance likelihood estimates
- **Contents and format:** Pseudonymous record ID, attendance probability, model version, timestamp, and status.
- **Next task or recipient:** T7 Calculate low expected and high attendance forecasts.
- **Complete when:** Each eligible record has a supported probability or a documented exclusion.

## 4. Planned Tools
### Tool 1
- **Tool name:** `estimate_attendance_likelihood`
- **Input:** Validated de-identified forecasting dataset
- **Output:** Individual attendance likelihood estimates
- **Implementation Route:** functions/scripts and approved model inference service
- **Integration approach:** direct integration
- **Role in this task:** Applies the approved model without changing source records.
- **Task timeout:** 90 seconds per run.
- **Maximum retries:** 1
- **Retry only when:** A transient inference failure occurs before any result is saved; retry once after 10 seconds.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record evidence and send the case to T5 and the forecast operations owner.
