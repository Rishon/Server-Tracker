#!/bin/bash

FRONTEND_PORT="${FRONTEND_PORT:-3006}"

bun next telemetry disable
bun run start -- -H 0.0.0.0 -p "$FRONTEND_PORT"
