FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# minimal system deps for building some wheels
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       build-essential \
       ca-certificates \
       gcc \
    && rm -rf /var/lib/apt/lists/*

# copy only requirements first for better layer caching
COPY resort_backend/requirements.txt /app/resort_backend/requirements.txt

RUN python -m pip install --upgrade pip setuptools wheel
RUN pip install --no-cache-dir -r /app/resort_backend/requirements.txt

# copy project
COPY . /app

# install entrypoint and make executable
COPY resort_backend/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 8000

ENV MONGODB_URL=""
ENV DATABASE_NAME="resort_db"
ENV ADMIN_API_KEY=""

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["uvicorn", "resort_backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
