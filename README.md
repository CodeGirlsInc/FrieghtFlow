FrieghtFlow is a decentralized stellar logistics and freight management platform built to streamline freight and cargo operations for **small businesses**, **large enterprises**, and **independent shippers** using Web3 technologies. It integrates with blockchain infrastructure to enhance transparency, traceability, and efficiency in shipment tracking and freight workflows.

---

## Table of Contents

1. **About**
2. **Key Features**
3. **Tech Stack**
4. **Getting Started**
5. **Usage**
6. **Project Structure**
7. **Contributing**

---

## About

FrieghtFlow aims to modernize traditional freight operations by incorporating blockchain and Web3 principles into logistics workflows. It provides tools and interfaces that improve traceability, automate core logistics processes, and offer enhanced data provenance for shipment actions across the ecosystem.

This repository contains both frontend and backend components — each designed with scalability, modularity, and developer experience in mind.

---

## Key Features

- **Freight & Shipment Management** — Build and track freight jobs from start to finish.
- **Web3 Integration** — Smart contracts and blockchain logic for secure, auditable freight events.
- **Dashboard & Analytics** — UI components for stakeholders to view freight status and performance.
- **Modular Services** — Backend built to support extensible services (APIs, logic modules).
- **Developer-Friendly** — Issue templates and modular architecture to help new contributors onboard quickly.

---

## Tech Stack

| Layer      | Technology                                                                                         |     |
| ---------- | -------------------------------------------------------------------------------------------------- | --- |
| Frontend   | **Next.js**, React, TypeScript, zustand, react query, react hook form, axios, api client, zod, etc |
| Backend    | **NestJS**, Typeorm, postgresql, etc                                                               |     |
| Blockchain | **Stellar (Rust)**,                                                                                |     |
| Languages  | TypeScript, JavaScript, Stellar                                                                    |     |
| Deployment | Modern CI/CD (GitHub Actions)                                                                      |     |

---

## Getting Started

These steps will help you **run the project locally**.

### Prerequisites

Ensure your environment has:

- Node.js (recommended v18+)
- npm / Yarn
- PostgreSQL or similar (if backend uses a relational database)

---

### 📥 Installation

1. **Clone the repository**

```bash
git clone https://github.com/CodeGirlsInc/FrieghtFlow.git
cd FrieghtFlow
```

2. **Install dependencies**

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Update environment variables as needed, such as:

- `DATABASE_URL`
- `JWT_SECRET`
- Any Web3 provider keys

---

## Usage

**Run backend:**

```bash
cd backend
npm run start:dev
```

**Run frontend:**

```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` to view the app. Adjust ports and proxies if necessary.

---

## 📁 Project Structure

```plaintext
FrieghtFlow/
├── backend/        # NestJS backend
├── frontend/       # Next.js UI & client
├── contracts/      # Stellar smart contracts
├── .github/        # CI/CD workflows and templates
├── README.md       # Project documentation
```

- **backend/** — API controllers, services, modules, tests
- **frontend/** — Next.js pages, components, hooks, styling
- **contracts/** — blockchain logic and contract definitions
- **.github/** — workflows for GitHub Actions

---

## Contributing

We welcome collaboration! Here’s how you can help:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Implement your changes
4. Open a Pull Request

Make sure your commits are descriptive and follow the project conventions.
