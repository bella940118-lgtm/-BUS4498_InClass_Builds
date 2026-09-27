# Create forecast report Task Specification

## Basic Information
- **Task ID:** T9
- **Task name:** Create forecast report
- **Task type:** Act
- **Task owner:** HackTrack forecast operations owner

## 1. Task Description
Create a structured organizer report containing the forecast, uncertainty, assumptions, data-quality concerns, and supply recommendations when available.

## 2. Inputs
### Input 1
- **Input name:** Forecast results
- **Contents and format:** Forecast range, uncertainty status, and evidence from T7.
- **Source:** T7 Calculate low expected and high attendance forecasts.
- **If a required input is missing or invalid:** Create an exception report through T5.

## 3. Outputs
### Output 1
- **Output name:** Forecast report
- **Contents and format:** Report with forecast values, uncertainty, assumptions, concerns, and optional supply recommendations.
- **Next task or recipient:** T10 Display report for organizer review.
- **Complete when:** A report identifier and complete report content are available.

## 4. Planned Tools
### Tool 1
- **Tool name:** `create_forecast_report`
- **Input:** Forecast results
- **Output:** Forecast report
- **Implementation Route:** functions/scripts
- **Integration approach:** direct integration
- **Role in this task:** Fills the approved report template without altering source data.
- **Task timeout:** 60 seconds per run.
- **Maximum retries:** 1
- **Retry only when:** Report creation fails before a report ID exists.
- **On timeout, exhausted retries, or an error that cannot be retried:** Preserve evidence and send the case to the forecast operations owner.
