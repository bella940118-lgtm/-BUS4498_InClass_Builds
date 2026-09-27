# Calculate low expected and high attendance forecasts Task Specification

## Basic Information
- **Task ID:** T7
- **Task name:** Calculate low expected and high attendance forecasts
- **Task type:** Reason
- **Task owner:** HackTrack forecast operations owner

## 1. Task Description
Aggregate supported individual probabilities into low, expected, and high event-attendance forecasts using approved uncertainty settings.

## 2. Inputs
### Input 1
- **Input name:** Individual attendance likelihood estimates
- **Contents and format:** Structured probabilities, estimation statuses, and model version.
- **Source:** T6 Estimate each registrant's likelihood of attending.
- **If a required input is missing or invalid:** Send the case to T5 Flag missing-data issue.

## 3. Outputs
### Output 1
- **Output name:** Attendance forecast range
- **Contents and format:** Low, expected, and high estimates; uncertainty range; method version; timestamp; and status.
- **Next task or recipient:** T8 Calculate supply recommendations or T9 Create forecast report.
- **Complete when:** All three estimates and uncertainty are recorded.

## 4. Planned Tools
### Tool 1
- **Tool name:** `calculate_attendance_forecast_range`
- **Input:** Individual attendance likelihood estimates
- **Output:** Attendance forecast range
- **Implementation Route:** functions/scripts
- **Integration approach:** direct integration
- **Role in this task:** Aggregates probabilities with the approved uncertainty method.
- **Task timeout:** 60 seconds per run.
- **Maximum retries:** 1
- **Retry only when:** A transient calculation failure occurs before a result is saved.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the failure and send the case to T5 and the forecast operations owner.
