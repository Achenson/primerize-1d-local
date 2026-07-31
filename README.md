# Primerize 1D (Local - Python WASM)

A Web application for running Primerize 1D algorithm entirely inside your browser. By utilizing WebAssembly (WASM), this tool runs the core scientific Python algorithms locally on the user's machine — eliminating the need for a backend server or external API calls.

## 🚀 Key Features

*   Powered by Pyodide and WebAssembly to run Python natively in the browser thread.
*   No sequence data is ever transmitted to an external server.
*   Implements mock wrappers to skip heavy visualization libraries, ensuring rapid initialization.
*   Retains all biophysical and design parameters from the original Stanford web tool.

## 🛠️ Tech Stack

*   **Frontend**: React, TypeScript, Vite, Tailwind CSS (v4)
*   **WASM Core**: Pyodide (v0.26.1)
*   **Scientific Backing**: Python

## 📦 Getting Started (Local Development)

To run the application locally on your machine, follow these steps:

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/achenson/primerize-1d-local
    cd primerize-1d-local
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Launch the development server**:
    ```bash
    npm run dev
    ```

4.  **Open the application**:
    Navigate to the local address displayed in your terminal (typically `http://localhost:5173`).

## 📜 Acknowledgments & Attribution

Powered by the Primerize 1D Engine (Developed by Das Lab, Stanford University) via WebAssembly.

This implementation builds directly on the core biological and thermodynamic models developed by Stanford University's Das Lab, making their scientific utilities universally available via client-side WebAssembly execution contexts. We thank the original authors for open-sourcing their bioinformatic architecture.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
