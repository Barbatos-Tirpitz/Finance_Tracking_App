import { useState } from "react";
import Dashboard from "./components/Dashboard";
import LandingPage from "./components/LandingPage";

function App() {
  const [user, setUser] = useState(null);

  return (
    <>
      {user ? (
        <Dashboard />
      ) : (
        <LandingPage onAuth={setUser} />
      )}
    </>
  );
}

export default App;
