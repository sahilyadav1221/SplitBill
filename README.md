# SplitMint 💸
> A smart group expense splitting application powered by Graph Algorithms and Generative AI.
> **Built for the Karbon Engineering Internship Challenge 2026.**

![SplitMint Banner](https://via.placeholder.com/1200x600?text=SplitMint+Dashboard+Preview) 
*(Replace this link with a screenshot of your dashboard)*

## 🚀 Live Demo
**Website:** [https://split-mint-gamma.vercel.app/](https://split-mint-gamma.vercel.app/)

---

## 🛠️ Tech Stack
* **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, ShadCN UI
* **Backend:** Python FastAPI, Pydantic
* **Database:** PostgreSQL (Production) / SQLite (Dev), SQLAlchemy ORM
* **AI Engine:** Google Gemini API (`gemini-1.5-flash`)
* **Visualization:** Recharts

---

## 🧠 Key Engineering Features

### 1. The Balance Engine (Graph Algorithm)
Instead of simple "you owe me" lists, SplitMint treats users as nodes and debts as directed edges in a graph.
* **Problem:** $O(N^2)$ transactions in a complex group.
* **Solution:** Implemented a **Greedy Minimization Algorithm**.
    1.  Calculate **Net Flow** (Credit - Debit) for every user.
    2.  Separate users into `Creditors` and `Debtors`.
    3.  Iteratively match the largest Creditor with the largest Debtor.
* **Result:** Reduces transactions to $O(N)$, ensuring the mathematically minimal way to settle up.

### 2. MintSense (AI Integration)
Integrated Google's **Gemini 1.5 Flash** to solve data entry friction.
* **Input:** "Lunch 4500 paid by Bob for everyone except Charlie."
* **Process:** The backend sends the natural language string + dynamic list of group members to the LLM.
* **Output:** Structured JSON `{ "amount": 4500, "payer": "Bob", "split": ["Alice", "Bob", "Dave"] }` mapped to database IDs.

---

## ⚡ Features
- **Smart Splitting:** Support for Equal, Exact Amount, and Percentage splits.
- **Real-time Dashboard:** Visual bar charts showing "Who owes you" vs "Who you owe".
- **Settlement Suggestions:** Automated recommendations for the most efficient way to pay back friends.
- **Group Management:** Create groups, manage members, and track shared histories.

---



### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt

# Create .env file
echo "GEMINI_API_KEY=your_api_key" > .env
echo "DATABASE_URL=sqlite:///./splitmint.db" >> .env
echo "SECRET_KEY=dev_secret" >> .env

# Run Server
uvicorn app.main:app --reload
```
Backend runs on: http://localhost:8000 API Docs: http://localhost:8000/docs

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: http://localhost:3000

## 🧪 Testing
We use pytest for backend logic verification.

```bash
cd backend
pytest tests/
```

## 📄 License
MIT License. Created by Sahil Yadav.
