#!/bin/bash
pip install -r requirements.txt
uvicorn backend:app --host 0.0.0.0 --port 7860 --reload
