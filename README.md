# SplitBill AI - Architecture Overview

This document provides a high-level overview of the architecture for the SplitBill AI application. It is a modern web application built with Next.js and leverages Google's Gemini model for its core AI functionality.

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (using the App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **AI/Generative**: [Genkit](https://firebase.google.com/docs/genkit) with Google's Gemini models
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: React Hooks (`useState`, `useReducer`)

## Project Structure

The project is organized into several key directories within the `src/` folder:

```
/
├── src/
│   ├── ai/                 # Genkit AI flows and configuration
│   ├── app/                # Next.js App Router pages and layouts
│   ├── components/         # Reusable React components
│   │   ├── app/            # Application-specific components
│   │   └── ui/             # ShadCN UI components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Libraries, utilities, and type definitions
│   └── public/             # Static assets
├── package.json
└── tsconfig.json
```

### `src/ai` - AI and Genkit Integration

This directory contains all the code related to the application's generative AI features, powered by **Genkit**.

- **`src/ai/init.ts`**: This file initializes the global Genkit `ai` instance and configures the `googleAI` plugin. It specifies which Gemini model (`gemini-2.0-flash`) will be used by default for generative tasks.

- **`src/ai/flows/`**: This directory holds the server-side logic for interacting with the Gemini model. Each flow is defined in its own file and marked with the `'use server'` directive, making it a Next.js Server Action.
    - **`extract-receipt-data.ts`**: This is the core AI flow. It defines a structured prompt that instructs the Gemini model how to analyze a receipt image. It specifies the input (a data URI of the image) and the desired JSON output structure.
    - **`extract-receipt-data.types.ts`**: This file defines the input and output data structures for the receipt extraction flow using the **Zod** library. This ensures type safety and provides a clear schema for the AI model to follow.

### `src/app` - Routing and Pages

This directory follows the Next.js App Router convention.

- **`src/app/page.tsx`**: The main entry point of the application. It renders the top-level `<App />` component.
- **`src/app/App.tsx`**: This is the main client-side component. It manages the application's view state (`upload`, `loading`, `main`, `error`) and handles the initial receipt upload process. It uses the Browser Image Compression library to optimize images before sending them to the AI.
- **`src/app/layout.tsx`**: The root layout for the application, defining the HTML structure, fonts, and including the `Toaster` for notifications.
- **Static Pages (`/about`, `/contact`, `/terms`)**: These folders contain simple, static informational pages.

### `src/components` - React Components

This directory is divided into two main sub-folders:

- **`src/components/app/`**: Contains high-level, application-specific components that are composed to build the user experience.
    - **`MainApp.tsx`**: The core of the interactive bill-splitting interface. It uses a `useReducer` hook to manage all complex bill-related state (items, people, fees, totals, etc.). This is where all the logic for calculating splits and totals resides.
    - **`SetupPage.tsx`**: Renders the primary configuration interface where users assign items, manage people, and add adjustments.
    - **`Summary.tsx`**: Renders the final shareable summary image. It uses the `html-to-image` library to convert the rendered DOM into a PNG file for download.
    - **`ItemAssignment.tsx`**, **`ManagePeople.tsx`**, **`Adjustments.tsx`**: These are the building blocks of the `SetupPage`, each handling a specific part of the bill configuration.

- **`src/components/ui/`**: This folder contains the reusable, low-level UI components provided by **ShadCN UI** (e.g., `Button`, `Card`, `Input`).

### `src/hooks` - Custom Hooks

- **`src/hooks/use-toast.ts`**: A custom hook for displaying toast notifications.
- **`src/hooks/usePinnedCurrencies.ts`**: Manages user-pinned currencies in `localStorage` for quick access.
- **`src/hooks/useUsageTracker.tsx`**: A simple hook to track app usage (e.g., number of receipts processed).

### `src/lib` - Utilities and Types

- **`src/lib/types.ts`**: Defines the core TypeScript types used throughout the application, such as `BillData`, `Person`, and `BillItem`.
- **`src/lib/utils.ts`**: Contains utility functions, most notably the `cn` function from ShadCN for merging Tailwind CSS classes.

## State Management

The application employs a client-centric state management approach using React's built-in hooks.

- **`App.tsx` (`useState`)**: Manages the top-level UI state (e.g., which view to show).
- **`MainApp.tsx` (`useReducer`)**: The heart of the application's business logic. A `useReducer` hook is used to manage the complex, interconnected state of the bill. This includes all items, people, fees, discounts, currencies, and totals. All state modifications are handled through dispatched actions, which keeps the logic centralized and predictable.

## Data Flow for Receipt Processing

1.  **Upload**: The user uploads a receipt image via `src/app/App.tsx`.
2.  **Compression**: The image is compressed in the browser using `browser-image-compression` to reduce its size.
3.  **API Call**: The compressed image is converted to a Base64 data URI and sent to the `parseReceipt` function in `src/components/services/geminiService.ts`.
4.  **Server Action**: `parseReceipt` calls the `extractReceiptData` Server Action located in `src/ai/flows/extract-receipt-data.ts`.
5.  **Genkit Flow**: The Genkit flow executes, sending the image and the structured prompt to the **Gemini 2.0 Flash** model.
6.  **AI Processing**: The Gemini model analyzes the image and returns a structured JSON object based on the schema defined in `extract-receipt-data.types.ts`.
7.  **State Update**: The JSON data is returned to the client, where `App.tsx` uses it to initialize the state for `MainApp.tsx`.
8.  **Render**: `MainApp.tsx` renders the interactive bill-splitting interface, pre-populated with the data extracted by the AI.
