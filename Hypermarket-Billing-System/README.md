# Hypermarket Billing System

A full-stack desktop billing application built with **React** (frontend) and **Python/Flask** (backend) connected to a **MySQL** database.

## Features
- Real-time billing with barcode scanning
- Inventory management with low-stock alerts for 200+ products
- Auto reorder when stock falls critically low
- Customer loyalty points tracking
- Multi-language support (5 languages)
- Transaction history and warehouse order tracking

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS, Vite |
| Backend | Python 3.10+, Flask |
| Database | MySQL |

---

## Prerequisites
- **Node.js** v18+
- **Python** 3.10+
- **MySQL** 8.0+

---

## Setup & Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/your-username/hypermarket-billing-system.git
cd hypermarket-billing-system
```

### 2. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env` and fill in your MySQL credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=billing_app
JWT_SECRET=your_secret_key
```

### 3. Start the Python backend
```bash
pip install -r requirements.txt
python server.py
```
Backend runs on → http://localhost:3000

### 4. Start the React frontend (new terminal)
```bash
npm install
npm run dev:frontend
```
Frontend runs on → http://localhost:5173

> The Vite dev server automatically proxies all `/api` requests to the Flask backend.

---

## Production Build
```bash
npm run build        # builds React into /dist
python server.py     # Flask serves /dist as static files
```
Visit → http://localhost:3000

---

## Project Structure
```
├── src/
│   ├── App.tsx          # Main React application
│   ├── main.tsx         # React entry point
│   └── index.css        # Tailwind CSS
├── server.py            # Flask backend + MySQL
├── requirements.txt     # Python dependencies
├── package.json         # Node/React dependencies
├── vite.config.ts       # Vite config with API proxy
├── tsconfig.json        # TypeScript config
├── index.html           # HTML entry point
└── .env.example         # Environment variable template
```
