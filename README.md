# SplitBill AI - In-Depth Architecture Overview

This document provides a comprehensive overview of the architecture for the SplitBill AI application. It is a modern web application built with Next.js that leverages Google's Gemini model for its core AI functionality. This guide is intended for developers to understand the project structure, data flow, state management, and key components.

## 1. Technology Stack

The application is built on a modern, type-safe, and component-driven stack.

- **Framework**: **[Next.js](https://nextjs.org/) (App Router)** - Provides server-side rendering, routing, and Server Actions for a performant and scalable foundation.
- **Language**: **[TypeScript](https://www.typescriptlang.org/)** - Ensures type safety across the entire application, reducing bugs and improving developer experience.
- **AI/Generative**: **[Genkit](https://firebase.google.com/docs/genkit) with Google Gemini** - Manages the interaction with the AI model. Genkit provides a structured way to define prompts, schemas, and server-side AI "flows".
- **UI Components**: **[ShadCN UI](https://ui.shadcn.com/)** - A collection of beautifully designed, accessible, and unstyled components that are copied into the project, allowing for full customization.
- **Styling**: **[Tailwind CSS](https://tailwindcss.com/)** - A utility-first CSS framework for rapidly building custom user interfaces.
- **State Management**: **React Hooks (`useState`, `useReducer`)** - The application uses a client-centric state model. Simple state is managed with `useState`, while complex, interconnected state is managed with `useReducer` for predictable updates.
- **Schema & Validation**: **[Zod](https://zod.dev/)** - Used to define the data structures for both the AI flow inputs/outputs and for ensuring type safety in client-side code.
- **Image Handling**:
    - **`browser-image-compression`**: Compresses receipt images on the client-side *before* uploading to reduce bandwidth and improve AI processing speed.
    - **`html-to-image`**: Converts the final DOM-based summary into a downloadable PNG image.

## 2. Project Structure

The project is organized into several key directories within the `src/` folder, following best practices for a Next.js application.

```
/
├── src/
│   ├── ai/                 # Genkit AI flows and configuration
│   │   ├── flows/          # Individual AI tasks (e.g., receipt extraction)
│   │   └── init.ts         # Genkit initialization and configuration
│   ├── app/                # Next.js App Router pages and layouts
│   ├── components/         # Reusable React components
│   │   ├── app/            # Application-specific, high-level components
│   │   └── ui/             # ShadCN UI primitive components
│   ├── hooks/              # Custom React hooks for shared logic
│   ├── lib/                # Libraries, utilities, and type definitions
│   └── public/             # Static assets (images, manifest, etc.)
├── package.json
└── tsconfig.json
```

---

## 3. Core Data Flow: Receipt Processing

This is the primary user journey and showcases how the frontend, backend (Server Actions), and AI model interact.

1.  **Upload (`src/app/App.tsx`)**: The user selects a receipt image from their device or camera. The `handleFileChange` function is triggered.
2.  **Client-Side Compression**: The `browser-image-compression` library resizes and compresses the image to a manageable size (max 1MB). This is a crucial optimization step.
3.  **Base64 Conversion**: The compressed image `File` object is converted into a Base64-encoded string.
4.  **Service Call (`src/components/services/geminiService.ts`)**: The Base64 string is passed to the `parseReceipt` function. This service acts as a clean bridge between the UI and the Server Action.
5.  **Server Action (`src/ai/flows/extract-receipt-data.ts`)**: The `parseReceipt` function calls the `extractReceiptData` Server Action. This is where the context switches from the client to the server.
6.  **Genkit Flow Execution**:
    *   The `extractReceiptData` function invokes the Genkit flow (`extractReceiptDataFlow`).
    *   Genkit takes the image data and a carefully engineered prompt, which instructs the AI on exactly how to analyze the receipt.
    *   The prompt specifies the desired output structure using a Zod schema (`ExtractReceiptDataOutputSchema`), a powerful feature of Genkit that enables reliable JSON output.
    *   Genkit sends this payload to the **Google Gemini model** (`gemini-2.0-flash`).
7.  **AI Processing & Response**: The Gemini model analyzes the image and returns a structured JSON object that matches the requested schema.
8.  **Return to Client**: The JSON data is passed back through the Server Action to the original `await parseReceipt()` call in `App.tsx`.
9.  **State Initialization**:
    *   The `processParsedData` function in `App.tsx` takes the AI's response.
    *   It creates the initial `BillData` object, setting defaults for people, currency (detecting from the AI response or browser locale), and preparing the item structures.
    *   This initial state is passed as a prop to the `<MainApp />` component.
10. **Render Interactive UI**: `<MainApp />` renders the main bill-splitting interface, pre-populated with the data extracted by the AI, ready for the user to start assigning items.

---

## 4. State Management Strategy

The application uses a combination of React hooks to manage state, avoiding the need for a heavy external library like Redux.

- **Global UI State (`src/app/App.tsx`)**: The top-level `App` component uses `useState` to manage the primary view of the application. This state determines whether the user sees the `'upload'`, `'loading'`, `'main'`, or `'error'` screen. It acts as a simple state machine for the overall UI.

- **Complex Business Logic (`src/components/app/MainApp.tsx`)**: The `MainApp` component is the heart of the interactive experience. It uses a **`useReducer` hook** to manage all complex bill-related state. This is a critical architectural choice for several reasons:
    - **Centralized Logic**: All state transitions (adding a person, assigning an item, updating a fee) are handled by the `reducer` function. This keeps the logic predictable and easy to debug, as opposed to scattering `useState` calls throughout many components.
    - **Predictable State**: Actions (e.g., `{ type: 'ADD_PERSON', payload: ... }`) are dispatched to the reducer, which produces a new state object. This immutability prevents a wide range of bugs.
    - **Decoupled Components**: Child components don't modify state directly. They only dispatch actions (e.g., `dispatch({ type: 'UPDATE_ITEM_PRICE', ... })`). This makes the components more reusable and less aware of the overall state structure.

The `AppState` interface in `MainApp.tsx` defines the entire shape of this complex state object, including items, people, fees, discounts, currency information, and UI settings.

---

## 5. Error Handling & Edge Cases
A robust application must gracefully handle failures.

**AI Processing Failure**: If the Gemini model fails to return data or returns it in an unexpected format, the Server Action will catch the error. It will return a specific error object to the client. App.tsx will then transition the UI to the 'error' state, displaying a user-friendly message.

**Network Failure**: `try/catch` blocks around all fetch calls (including Server Action invocations) are used to handle network issues. The UI will inform the user that the request could not be completed.

**Database Operations**: All interactions with Firestore (reads, writes, updates) are wrapped in `try/catch` blocks to handle potential security rule violations or network interruptions. The user will be notified of any failure to save data.

---

## 6. Key File & Directory Deep Dive

### `src/ai` - AI and Genkit Integration

This directory contains all the server-side code for interacting with the Gemini model.

- **`src/ai/init.ts`**: This file initializes the global Genkit `ai` instance. It configures the `googleAI` plugin and specifies which Gemini model (`gemini-2.0-flash`) will be used by default. **Crucially, it does not have the `'use server'` directive.**

- **`src/ai/flows/`**: This directory holds the server-side logic for the AI agents.
    - **`extract-receipt-data.types.ts`**: This file **only** defines the input and output data structures for the receipt extraction flow using **Zod**. By isolating the schemas here, they can be safely imported by both server (`'use server'`) and client components without violating Next.js rules.
    - **`extract-receipt-data.ts`**: This is the core AI flow.
        - It is marked with **`'use server'`**, making its exported functions available as Server Actions.
        - `ai.definePrompt`: Defines the structured prompt sent to Gemini. It includes detailed instructions and uses Handlebars syntax (`{{media url=...}}`) to embed the image. It references the Zod schemas from the `.types.ts` file to enforce structured output.
        - `ai.defineFlow`: Wraps the prompt execution in a Genkit "flow," which can be monitored and traced.
        - `extractReceiptData()`: The async function that is exported and called by the client-side service.

### `src/app` - Routing and Pages

- **`src/app/App.tsx`**: The main client-side component that manages the application's top-level view state (`upload`, `loading`, `main`). It handles the initial receipt upload, compression, and the call to the AI service. It is responsible for creating the initial `BillData` object.
- **`src/app/page.tsx`**: The main entry point of the application. It's a simple server component that renders the top-level `<App />` component.
- **`src/app/layout.tsx`**: The root layout for the application, defining the HTML structure, fonts, and including the `Toaster` for notifications.

### `src/components/app` - High-Level Application Components

These are the major building blocks of the user experience.

- **`MainApp.tsx`**: As described in *State Management*, this is the core of the interactive bill-splitting interface. It initializes the `useReducer` and passes the `state` and `dispatch` function down to its children. It also handles fetching FX rates when the currency changes.
- **`SetupPage.tsx`**: Renders the primary configuration interface where users assign items, manage people, and add adjustments. It's a container for the smaller, more focused components below.
- **`Summary.tsx`**: Renders the final shareable summary image. It contains all the logic for calculating per-person totals and breakdowns. It uses the `html-to-image` library to convert the rendered DOM into a PNG file for download.
- **`ItemAssignment.tsx`**: The component responsible for rendering the list of editable bill items and the buttons for assigning each item to a person.
- **`ManagePeople.tsx`**: The component for adding and removing people from the bill.
- **`Adjustments.tsx`**: The component for adding, removing, and editing fees, discounts, and tips.
- **`ReconciliationDetails.tsx` & `Reconciliation.tsx`**: These components provide real-time feedback to the user, comparing the calculated total from assigned items against the `billTotal` extracted from the receipt. This guides the user to a "perfect match."

### `src/lib` & `src/hooks` - Shared Logic

- **`src/lib/types.ts`**: Defines the core TypeScript types used throughout the application, such as `BillData`, `Person`, and `BillItem`.
- **`src/hooks/use-toast.ts`**: A custom hook for displaying toast notifications, providing a clean API for the rest of the app.
- **`src/hooks/usePinnedCurrencies.ts`**: Manages user-pinned currencies in `localStorage` for quick access in the currency selection dropdowns.
- **`src/hooks/useUsageTracker.tsx`**: A simple hook to track app usage (e.g., number of receipts processed) using `localStorage`.

This detailed structure provides a clear separation of concerns, making the application robust, maintainable, and easier to scale.
