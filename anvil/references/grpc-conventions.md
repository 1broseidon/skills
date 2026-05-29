# gRPC conventions

Load on **service-scope** grpc builds.

## Server setup

- Register service + health + reflection (dev) in one place
- Unary interceptors: logging, recovery, optional auth
- Propagate `metadata` request-id

## Deadlines

Document client deadline expectations in service godoc / README. Server respects `context.Deadline`.

## Streaming

Server-stream: backpressure-aware send; client cancel → stop promptly.

## Proto + code

Generated code lives in project-standard path (`gen/go/...`). Do not hand-edit generated files.
