# Workflow of Tasks

HackTrack retrieves authorized registration records and historical attendance signals in parallel, removes unnecessary personal data, validates de-identified records, and forecasts attendance. Missing or unreliable data is reported to organizers and, after correction, returns to retrieval and validation. Supply recommendations are made only when forecast uncertainty is acceptable. One reminder is sent only after organizer approval.

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
