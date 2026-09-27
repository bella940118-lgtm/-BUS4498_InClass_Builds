# Flag missing-data issue Task Specification

## Basic Information
- **Task ID:** T5
- **Task name:** Flag missing-data issue
- **Task type:** Act
- **Task owner:** HackTrack data quality owner

## 1. Task Description

Convert a failed retrieval or validation result into a clear exception record for organizer review. This task does not create an attendance forecast or repair source data.

## 2. Inputs

### Input 1
- **Input name:** Retrieval or validation issue
- **Contents and format:** Structured failure status, failed checks, affected sources or fields, and available evidence.
- **Source:** T2 Retrieve individual registration records and attendance signals in parallel or T4 Validate data quality and required fields.
- **If a required input is missing or invalid:** Record an unresolved exception and send it to the CPVC AI Hackathon organizer.

## 3. Outputs

### Output 1
- **Output name:** Missing-data exception report
- **Contents and format:** Issue type, affected data, evidence, timestamp, recommended human action, and `forecast_not_created` status.
- **Next task or recipient:** CPVC AI Hackathon organizer and T10 Display report for organizer review.
- **Complete when:** The exception report identifies the missing or unreliable information and has been made available for review.

## 4. Planned Tools

### Tool 1
- **Tool name:** `create_missing_data_report`
- **Input:** Retrieval or validation issue
- **Output:** Missing-data exception report
- **Implementation Route:** functions/scripts
- **Integration approach:** direct integration
- **Role in this task:** Applies a fixed exception-report template without changing source data.
- **Task timeout:** 60 seconds per run.
- **Maximum retries:** 1
- **Retry only when:** Report creation or storage has a transient error and no report identifier was created.
- **On timeout, exhausted retries, or an error that cannot be retried:** Preserve issue evidence and send the case to the CPVC AI Hackathon organizer.
