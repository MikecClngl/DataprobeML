# Dockerfile - Backend
# Python image
FROM python:3.12.2-slim

# Working directory
WORKDIR /dataprobeML

# Install git before installing Python dependencies
RUN apt-get update && apt-get install -y git

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install -r requirements.txt

# Copy app
COPY . .

# Expose port 8000
EXPOSE 8000

# Start Django application
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

