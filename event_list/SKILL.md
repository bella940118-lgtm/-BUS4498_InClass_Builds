---
name: "event-list"
description: "\"List the events from the earliest to latest, including event name, time, location, attend requirement and other important information.\""
---

# event-list

## User inputs
On each run, the user supplies the key word for the event or date of the event, if the key word or date is missing, ask user for key word until is not empty before continuing.

## Procedure
1. Read the event key word or event date. 
2. If only event key word is provided, find the event from most relevant to least relevant. If only the date is provided, list the event on the date from the earliest to latest. If both are provided, prioritize the date and list the event on the date from the one that most relevant to key word to least relevant.

## Output
Return a list with event, event date, time, location, information of the event

## Boundaries
If none of the events are applicable, list none.
Do not list more than 30 events
