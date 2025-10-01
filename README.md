# SplitBill AI - In-Depth Architecture & Product Specification

This document provides a comprehensive overview of the architecture for the SplitBill AI application. It is a modern web application built with Next.js that leverages Google's Gemini model via Genkit for its core AI functionality, with Firebase for authentication and data persistence. This guide is intended for developers to understand the project structure, data flow, state management, and key components, enabling them to maintain, extend, or recreate the application.

## 1. Technology Stack

The application is built on a modern, type-safe, and component-driven stack.

- **Framework**: **[Next.js](https://nextjs.org/) (App Router)** - Provides server-side rendering, routing, and Server Actions for a performant and scalable foundation.
- **Language**: **[TypeScript](https://www.typescriptlang.org/)** - Ensures type safety across the entire application, reducing bugs and improving developer experience.
- **AI/Generative**: **[Genkit](https://firebase.google.com/docs/genkit) with Google Gemini** - Manages the interaction with the AI model. Genkit provides a structured way to define prompts, schemas, and server-side AI "flows". The primary model is `gemini-1.5-flash-latest`.
- **Backend-as-a-Service (BaaS)**: **[Firebase](https://firebase.google.com/)**
    - **Authentication**: Manages user sign-in and sessions via Google Sign-In.
    - **Cloud Firestore**: A NoSQL database used to persist saved bill summaries and their associated metadata.
    - **Cloud Storage**: Stores the generated summary images, making them accessible via a shareable URL.
- **UI Components**: **[ShadCN UI](https://ui.shadcn.com/)** - A collection of beautifully designed, accessible, and customizable components that are copied into the project.
- **Styling**: **[Tailwind CSS](https://tailwindcss.com/)** - A utility-first CSS framework for rapidly building custom user interfaces.
- **State Management**: **React Hooks (`useState`, `useReducer`)** - The application uses a client-centric state model. Simple state is managed with `useState`, while complex, interconnected bill state is managed with `useReducer` for predictable updates.
- **Schema & Validation**: **[Zod](https://zod.dev/)** - Used to define the data structures for both the AI flow inputs/outputs and for ensuring type safety in client-side code.
- **Image Handling**:
    - **`browser-image-compression`**: Compresses receipt images on the client-side *before* uploading to reduce bandwidth and improve AI processing speed.
    - **`html-to-image`**: Converts the final DOM-based summary into a downloadable PNG image.

---

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
│   ├── lib/                # Libraries, utilities, types, and Firebase config
│   └── public/             # Static assets (images, manifest, etc.)
├── package.json
└── tsconfig.json
```

---

## 3. Core Data Flow: Receipt Processing

This is the primary user journey and showcases how the frontend, backend (Server Actions), and AI model interact.

1.  **Authentication (`src/app/App.tsx`)**: The user first signs in with Google using Firebase Authentication. The UI remains disabled until a user session is active.
2.  **Upload (`src/app/App.tsx`)**: The user selects a receipt image from their device or camera. The `handleFileChange` function is triggered.
3.  **Client-Side Compression**: The `browser-image-compression` library resizes and compresses the image to a manageable size (max 1MB). This is a crucial optimization step.
4.  **Base64 Conversion**: The compressed image `File` object is converted into a Base64-encoded string.
5.  **Service Call (`src/components/services/geminiService.ts`)**: The Base64 string is passed to the `parseReceipt` function. This service acts as a clean bridge between the UI and the Server Action.
6.  **Server Action (`src/ai/flows/extract-receipt-data.ts`)**: The `parseReceipt` function calls the `extractReceiptData` Server Action. This is where the context switches from the client to the server.
7.  **Genkit Flow Execution**:
    *   The `extractReceiptData` function invokes the Genkit flow (`extractReceiptDataFlow`).
    *   Genkit takes the image data and a carefully engineered prompt, which instructs the AI on exactly how to analyze the receipt.
    *   The prompt specifies the desired output structure using a Zod schema (`ExtractReceiptDataOutputSchema`), a powerful feature of Genkit that enables reliable JSON output.
    *   Genkit sends this payload to the **Google Gemini model** (`gemini-1.5-flash-latest`).
8.  **AI Processing & Response**: The Gemini model analyzes the image and returns a structured JSON object that matches the requested schema.
9.  **Return to Client**: The JSON data is passed back through the Server Action to the original `await parseReceipt()` call in `App.tsx`.
10. **State Initialization**:
    *   The `processParsedData` function in `App.tsx` takes the AI's response.
    *   It creates the initial `BillData` object, setting defaults for people, currency (detecting from the AI response or browser locale), and preparing the item structures.
    *   This initial state is passed as a prop to the `<MainApp />` component.
11. **Render Interactive UI**: `<MainApp />` renders the main bill-splitting interface, pre-populated with the data extracted by the AI, ready for the user to start assigning items.

---

## 4. State Management Strategy

The application uses a combination of React hooks to manage state, avoiding the need for a heavy external library.

- **Global UI State (`src/app/App.tsx`)**: The top-level `App` component uses `useState` to manage the primary view of the application. This state determines whether the user sees the `'upload'`, `'loading'`, `'main'`, or `'error'` screen. It acts as a simple state machine for the overall UI.

- **Complex Business Logic (`src/components/app/MainApp.tsx`)**: The `MainApp` component is the heart of the interactive experience. It uses a **`useReducer` hook** to manage all complex bill-related state. This is a critical architectural choice for several reasons:
    - **Centralized Logic**: All state transitions (adding a person, assigning an item, updating a fee) are handled by the `reducer` function. This keeps the logic predictable and easy to debug, as opposed to scattering `useState` calls throughout many components.
    - **Predictable State**: Actions (e.g., `{ type: 'ADD_PERSON', payload: ... }`) are dispatched to the reducer, which produces a new state object. This immutability prevents a wide range of bugs.
    - **Decoupled Components**: Child components don't modify state directly. They only dispatch actions (e.g., `dispatch({ type: 'UPDATE_ITEM_PRICE', ... })`). This makes the components more reusable and less aware of the overall state structure.

The `AppState` interface in `MainApp.tsx` defines the entire shape of this complex state object, including items, people, fees, discounts, currency information, and UI settings.

---

## 5. Firebase Integration

Firebase is used for user authentication, data persistence, and file storage.

### 5.1. Authentication
- **`src/lib/firebase/config.ts`**: Initializes the Firebase app with the project's configuration credentials.
- **`src/hooks/useAuth.tsx`**: A custom React hook that provides an authentication context. It manages the user's sign-in state, exposes `user` and `loading` properties, and provides `signInWithGoogle` and `signOut` functions. The entire application is wrapped in its `AuthProvider`.

### 5.2. Firestore (Database) & Storage
This flow is triggered when the user clicks "Save & Get Share Link" in the Summary view.

1.  **Image Generation (`src/components/app/Summary.tsx`)**: The `handleSaveAndShare` function calls `generateImageDataUrl`, which uses the `html-to-image` library to convert the summary's DOM element into a PNG data URL.
2.  **Image Upload (`src/lib/firebase/storage.ts`)**:
    *   The data URL is passed to `uploadImageAndGetUrl`.
    *   This function generates a unique path in Firebase Storage: `summaries/{userId}/{date}/{timestamp}.png`.
    *   It uploads the image using `uploadString` and returns the public `downloadUrl`.
3.  **Data Persistence (`src/lib/firebase/firestore.ts`)**:
    *   The `downloadUrl` and a cleaned-up version of the bill data are passed to `saveBillToFirestore`.
    *   This function creates a new document in the `bills` collection in Firestore.
    *   The document contains the `BillData`, the `userId` of the owner, the `imageUrl`, and a `createdAt` timestamp.
4.  **UI Update**: The `downloadUrl` is set as the `shareableLink` in the UI, which is then displayed to the user for copying.

### 5.3. Security Rules
- **`storage.rules`**:
    - **Writes**: Only authenticated users are allowed to write files, and only to their own user-specific directory (`summaries/{userId}/...`). This is enforced by `allow write: if request.auth != null && request.auth.uid == userId;`.
    - **Reads**: All files under the `summaries/` path are publicly readable (`allow read;`). This is essential for the shareable links to work for anyone.

---

## 6. Key File & Component Deep Dive

### `src/ai` - AI and Genkit Integration
- **`src/ai/init.ts`**: Initializes the global Genkit `ai` instance, configuring the `googleAI` plugin and setting the default model to `gemini-1.5-flash-latest`.
- **`src/ai/flows/extract-receipt-data.types.ts`**: Isolates the Zod schemas (`ExtractReceiptDataInputSchema`, `ExtractReceiptDataOutputSchema`) for the receipt extraction flow. This allows them to be safely imported by both server and client components.
- **`src/ai/flows/extract-receipt-data.ts`**: The core AI flow, marked with `'use server'`.
    - `ai.definePrompt`: Defines the structured prompt sent to Gemini, including detailed instructions, Handlebars syntax for image embedding (`{{media url=...}}`), and a reference to the output schema to enforce structured JSON.
    - `extractReceiptData()`: The exported async function that acts as the Server Action called by the client-side service.

### `src/app` - Routing and Pages
- **`src/app/App.tsx`**: The main client-side component that manages the application's top-level view state (`upload`, `loading`, `main`, 'error'). It handles the initial receipt upload, compression, and the call to the AI service. It also wraps the main content in the `AuthProvider`.
- **`src/app/page.tsx`**: The main entry point of the application, rendering the top-level `<App />` component.
- **`src/app/layout.tsx`**: The root layout, defining the HTML structure, fonts, and including the `Toaster` for notifications.

### `src/components/app` - High-Level Application Components
- **`MainApp.tsx`**: As described in *State Management*, this is the core of the interactive bill-splitting interface. It initializes the `useReducer` and passes the `state` and `dispatch` function down to its children. It also handles fetching FX rates when the currency changes.
- **`SetupPage.tsx`**: Renders the primary configuration interface where users assign items, manage people, and add adjustments. It's a container for smaller, more focused components.
- **`Summary.tsx`**: Renders the final shareable summary image. It contains all the logic for calculating per-person totals and breakdowns. It uses the `html-to-image` library to convert the rendered DOM into a PNG for saving and downloading.
- **`ItemAssignment.tsx`**: Renders the list of editable bill items and the buttons for assigning each item to a person.
- **`ManagePeople.tsx`**: The component for adding and removing people from the bill.
- **`Adjustments.tsx`**: The component for adding, removing, and editing fees, discounts, and tips.
- **`ReconciliationDetails.tsx` & `Reconciliation.tsx`**: These components provide real-time feedback to the user, comparing the calculated total from assigned items against the `billTotal` extracted from the receipt. This guides the user to a "perfect match."

### `src/lib` & `src/hooks` - Shared Logic
- **`src/lib/types.ts`**: Defines the core TypeScript types used throughout the application, such as `BillData`, `Person`, and `BillItem`.
- **`src/hooks/use-toast.ts`**: A custom hook for displaying toast notifications, providing a clean API for the rest of the app.
- **`src/hooks/usePinnedCurrencies.ts`**: Manages user-pinned currencies in `localStorage` for quick access in the currency selection dropdowns.
- **`src/hooks/useAuth.tsx`**: Manages Firebase authentication state for the entire application.

This detailed structure provides a clear separation of concerns, making the application robust, maintainable, and easier to scale.
