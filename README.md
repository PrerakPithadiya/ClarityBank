# ClarityBank - A Modern Banking Application

Welcome to ClarityBank, a feature-rich personal banking web application built with Next.js, Firebase, and Google's Generative AI. This project simulates a real-world banking experience with a focus on user engagement, data visualization, and gamification.

## ✨ Key Features

*   **Firebase Authentication**: Secure user sign-up and login with email and password.
*   **Firestore Database**: Real-time data synchronization for bank accounts and transactions, protected by robust security rules.
*   **Interactive Dashboard**: A central hub for visualizing financial activity with charts for monthly breakdowns and deposit vs. withdrawal comparisons.
*   **AI-Powered Insights**: A "Smart Summary" card, powered by Google's Generative AI (Genkit), that provides a natural language overview of recent transaction history.
*   **Gamified Achievements**: A rewarding badge system that encourages positive financial habits like consistent saving, smart spending, and app engagement.
*   **Dynamic Theming**: Bank-specific themes on the balance card and a light/dark mode toggle for the entire application.
*   **Modern UI**: Built with Next.js, React, ShadCN UI components, and Tailwind CSS for a responsive, clean, and modern user interface.

## 🛠️ Tech Stack

*   **Framework**: [Next.js](https://nextjs.org/) (App Router)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [ShadCN UI](https://ui.shadcn.com/)
*   **Backend & Database**: [Firebase](https://firebase.google.com/) (Authentication & Firestore)
*   **Generative AI**: [Genkit (Google AI)](https://firebase.google.com/docs/genkit)
*   **Deployment**: Firebase App Hosting

## 🚀 Getting Started

Follow these steps to get the project up and running on your local machine.

### Prerequisites

*   Node.js (v18 or later)
*   npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-name>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Firebase:**
    *   This project is configured to work with Firebase. Ensure your Firebase project is set up and the configuration in `src/firebase/config.ts` matches your project's credentials.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## 📁 Project Structure

*   `src/app/`: Main application routes (pages) using the Next.js App Router.
*   `src/components/`: Reusable React components, including UI elements from ShadCN.
*   `src/firebase/`: Firebase configuration, providers, and custom hooks (`useUser`, `useCollection`).
*   `src/ai/`: Contains Genkit flows for generative AI features.
*   `src/lib/`: Shared utilities, type definitions, and static data (like bank info and badge definitions).
*   `src/services/`: Business logic, such as the badge earning service.
*   `firestore.rules`: Security rules for the Firestore database.
*   `docs/backend.json`: A blueprint of the app's data structures and entities.
