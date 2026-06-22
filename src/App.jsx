import { useState } from "react";
import { testGeminiConnection } from "./services/gemini/geminiService";

function App() {
  const [result, setResult] = useState("");

  const handleTest = async () => {
    const response = await testGeminiConnection();
    setResult(response);
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Samadhan AI 🚀</h1>

      <button onClick={handleTest}>
        Test Gemini Connection
      </button>

      <p>{result}</p>
    </div>
  );
}

export default App;