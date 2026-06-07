FROM i386/python:2.7-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .
COPY database.py .
COPY features/ ./features/
COPY features/health ./features/health/
COPY features/health/routes.py ./features/health/
COPY features/decibels ./features/decibels/
COPY features/decibels/routes.py ./features/decibels/
COPY features/decibels/repository.py ./features/decibels/

RUN mkdir -p /app/data

CMD ["python", "app.py"]