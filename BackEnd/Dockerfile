FROM python:3.11

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

EXPOSE 8000

CMD ["/wait-for-it.sh", "db:3306", "--", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]