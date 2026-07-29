// import React from 'react';
// export default function App(): React.JSX.Element {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-50">
//     <h1 className="text-4xl font-bold tracking-tight text-red-700 drop-shadow-sm">
//     Hello World
//     </h1>
//     </div>
//   );
// }

import React from 'react';
import PrimerizeWasmPython from './components/PrimerizeWasmPython';

function App() {
  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <main>
        <PrimerizeWasmPython />
      </main>
    </div>
  );
}

export default App;
