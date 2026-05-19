FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=7860

# Create a non-root user (Hugging Face requires user 1000 for security)
RUN useradd -m -u 1000 user
WORKDIR /app
RUN chown user:user /app


# Install system dependencies (build-essential, g++, python3-dev needed to compile C-extensions like chromadb)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    g++ \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy project files and set ownership to our non-root user
COPY --chown=user:user . /app

# Switch to the non-root user
USER user

# Pre-upgrade build system tools and install package dependencies
RUN pip install --no-cache-dir --user --upgrade pip setuptools wheel && \
    pip install --no-cache-dir --user .


# Ensure the local bin is in PATH so uvicorn can be found
ENV PATH="/home/user/.local/bin:${PATH}"

# Expose Hugging Face's default port
EXPOSE 7860

# Run the FastAPI app using the factory pattern
CMD ["uvicorn", "finrag.api.app:create_app", "--host", "0.0.0.0", "--port", "7860", "--factory"]

