FROM node:18-slim

# Install required dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user with home directory
RUN groupadd -r claude && useradd -r -g claude -m claude

# Set home directory permissions
RUN chown -R claude:claude /home/claude

# Install Claude Code SDK
RUN npm install -g @anthropic-ai/claude-code@1.0.43

# Create workspace directory and set ownership
WORKDIR /workspace
RUN chown claude:claude /workspace

# Copy project files and set ownership
COPY --chown=claude:claude . .

# Switch to non-root user
USER claude

# Set default command
CMD ["bash"]
