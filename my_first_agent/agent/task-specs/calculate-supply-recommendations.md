# Calculate supply recommendations Task Specification

## Basic Information
- **Task ID:** T8
- **Task name:** Calculate supply recommendations
- **Task type:** Reason
- **Task owner:** CPVC event operations owner

## 1. Task Description
Apply approved per-attendee quantities and buffers to an acceptable expected attendance forecast to recommend food, drinks, and swag.

## 2. Inputs
### Input 1
- **Input name:** Acceptable attendance forecast
- **Contents and format:** Expected attendance, uncertainty status, and forecast timestamp.
- **Source:** T7 Calculate low expected and high attendance forecasts.
- **If a required input is missing or invalid:** Do not calculate supplies; send the case to T5 Flag missing-data issue.

## 3. Outputs
### Output 1
- **Output name:** Supply recommendations
- **Contents and format:** Recommended food, drink, and swag quantities, assumptions, buffer, and timestamp.
- **Next task or recipient:** T9 Create forecast report.
- **Complete when:** Quantities and assumptions are recorded.

## 4. Planned Tools
### Tool 1
- **Tool name:** `calculate_supply_recommendations`
- **Input:** Acceptable attendance forecast
- **Output:** Supply recommendations
- **Implementation Route:** functions/scripts
- **Integration approach:** direct integration
- **Role in this task:** Applies fixed approved quantity and buffer rules.
- **Task timeout:** 30 seconds per run.
- **Maximum retries:** 0
- **Retry only when:** Not applicable.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the error and send the case to the CPVC event operations owner.
