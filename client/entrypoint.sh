#!/bin/bash

FRONTEND_PORT="${FRONTEND_PORT:-3001}"

~/.bun/bin/bun install
~/.bun/bin/bun next telemetry disable
~/.bun/bin/bun run build
~/.bun/bin/bun run start -- -H 0.0.0.0 -p "$FRONTEND_PORT"