ARG NODE_VERSION=24
FROM node:${NODE_VERSION}-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /work
COPY bench-in-container.sh /usr/local/bin/bench-in-container
RUN chmod +x /usr/local/bin/bench-in-container
ENTRYPOINT ["bench-in-container"]
