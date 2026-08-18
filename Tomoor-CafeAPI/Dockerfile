FROM python:3.13-slim

WORKDIR /app

COPY Tomoor-CafeAPI/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY Tomoor-CafeAPI/ .
COPY Tomoor-CafeUI/src/assets/seed_images/ /app/seed-assets/seed_images/

EXPOSE 8000

CMD ["sh", "-c", "alembic upgrade head && exec python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"]
