## 1. Workflow Overview

### 1.1 Workflow Goal

This workflow supports the HackTrack system goal defined in `my_first_agent/README.md`: improve CPVC AI Hackathon planning by forecasting actual attendance accurately enough to support food, drink, and swag decisions, while collecting only the minimum necessary personal information and sending no more than one organizer-approved confirmation reminder.

### 1.2 Workflow Trigger

The workflow starts automatically at 9:00 AM each day during the two weeks before the CPVC AI Hackathon. It also starts when registration closes and when organizers manually request an updated forecast after a material change, such as a venue-capacity change, a change in the food budget, or a large increase in registrations.

A reminder response or a correction to approved registration or attendance data may also trigger a new workflow run when organizers request an updated forecast.

### 1.3 Completion Condition at Runtime

One workflow run is complete when HackTrack has either:

1. Retrieved and validated the minimum necessary, de-identified individual-level registration and historical attendance data; calculated low, expected, and high attendance forecasts; created supply recommendations when uncertainty is acceptable; and delivered a forecast report for organizer review; or
2. Recorded that required data is missing, inaccessible, unreliable, or insufficient; created an exception report describing the unresolved issue; and delivered that report to organizers for review.

HackTrack does not create a forecast when required data is unavailable or unreliable. It sends one confirmation reminder only after explicit organizer approval. If organizers correct data or adjust assumptions, the updated work begins as a new workflow run.

### 1.4 General Workflow

HackTrack begins by retrieving authorized current registration records, voluntary RSVP responses, and historical CPVC attendance signals. The registration and historical-attendance retrieval steps run in parallel when both approved sources are available.

The system removes unnecessary personal information and retains only the de-identified fields needed for attendance forecasting. HackTrack then validates data quality by checking required fields, duplicate records, matching quality, registration status, RSVP consistency, and the availability of historical attendance outcomes.

If required data is missing, inaccessible, unmatched, incomplete, or unreliable, HackTrack does not estimate attendance. Instead, it records the issue, creates an exception report, and delivers it to organizers for review. If organizers correct the source data, the next workflow run returns to data retrieval and validation.

When sufficient validated data is available, HackTrack estimates each registrant's likelihood of attending using de-identified registration, RSVP, and permitted historical attendance signals. The system then aggregates individual likelihood estimates into low, expected, and high event-attendance forecasts.

HackTrack evaluates forecast uncertainty by comparing the low and high estimates. If uncertainty is acceptable, the system calculates recommended quantities of food, drinks, and swag using the expected attendance estimate. If uncertainty is high, HackTrack creates a forecast report that clearly identifies the uncertainty and does not create automatic supply recommendations.

Organizers review the forecast report. If they do not accept it, they may correct data or adjust planning assumptions. Data corrections begin a new run at retrieval and validation; assumption changes begin a new run at the attendance-estimation step. If organizers accept the forecast, they may explicitly approve one confirmation reminder for registered students. HackTrack sends the reminder only after approval. Any new RSVP information may be used in a later organizer-requested forecast run.

The workflow ends when the approved forecast report is delivered to organizers, with any explicitly approved reminder completed. Exception cases end when the exception report is delivered and HackTrack has stopped autonomous processing pending organizer action.


~~~mermaid
flowchart TD
 T1[Start] --> T2[Retrieve authorized data in parallel] --> T3[Remove unnecessary personal data] --> T4[Validate data] --> D1{Data reliable?}
 D1 -->|No| T5[Report issue] --> T11[Correct data] --> T2
 D1 -->|Yes| T6[Estimate attendance likelihood] --> T7[Aggregate forecasts] --> D2{Uncertainty high?}
 D2 -->|No| T8[Calculate supply recommendations] --> T9[Create report]
 D2 -->|Yes| T9
 T9 --> T10[Organizer review] --> D3{Accept forecast?}
 D3 -->|No| T11
 T11 -->|Adjust assumptions| T6
 D3 -->|Yes| D4{Approve one reminder?}
 D4 -->|Yes| T12[Send one reminder] --> E1[Deliver report]
 D4 -->|No| E1
~~~
