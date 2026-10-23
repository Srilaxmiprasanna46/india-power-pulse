# India Power Pulse

India Power Pulse is a dashboard for exploring Indian state energy data, emissions forecasts, and renewable-energy policy scenarios. Its React frontend uses a local FastAPI service for emissions predictions, policy simulations, and insights.

## Frontend

The repository root contains the Vite application. Install dependencies and start the development server:

```sh
npm ci
npm run dev
```

Run the frontend tests and production build with:

```sh
npm test
npm run build
```

## Backend

The backend is in `backend/` and requires Python. From the repository root:

```sh
cd backend
python -m venv .venv
```

Activate the virtual environment, then install dependencies and start the API:

```sh
pip install -r requirements.txt
uvicorn app:app --reload
```

The frontend expects the API at `http://127.0.0.1:8000`. Keep the backend running while using frontend features that need predictions, simulations, or insights.
