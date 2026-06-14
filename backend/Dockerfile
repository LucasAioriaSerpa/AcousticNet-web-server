FROM i386/python:2.7-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends gcc && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .
COPY database.py .
COPY features/ ./features/

RUN mkdir -p /app/data

CMD ["python", "app.py"]
