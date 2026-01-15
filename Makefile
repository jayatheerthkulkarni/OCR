SHELL := /bin/bash

.PHONY: all install run clean

# Default target: Run the application
all: run

install:
	@echo "Installing Backend Dependencies..."
	cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
	@echo "Installing Frontend Dependencies..."
	cd frontend && npm install

run:
	@echo "Starting OCR App..."
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:5173"
	@echo "Press Ctrl+C to stop both."
	@(trap 'kill 0' SIGINT; \
	cd backend && venv/bin/uvicorn main:app --reload --port 8000 & \
	cd frontend && npm run dev & \
	wait)
