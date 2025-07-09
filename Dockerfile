FROM node:18-slim

# Install required dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Claude Code SDK
RUN npm install -g @anthropic-ai/claude-code@1.0.43

# Create workspace directory
WORKDIR /workspace

# Copy project files
COPY . .

# Set default command
CMD ["bash"]