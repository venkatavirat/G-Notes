import { useState, useEffect } from "react";
import Auth from "./components/Auth";
import UploadForm from "./components/UploadForm";
import NoteList from "./components/NoteList";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <div>
      <nav>
        <h1>G-NOTES</h1>
        {user ? (
          <div>
            <span style={{ marginRight: "15px", fontWeight: "bold" }}>Welcome, {user.name}</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : null}
      </nav>

      {!user ? (
        <Auth onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />
      ) : (
        <main>
          <UploadForm />
          <NoteList />
        </main>
      )}
    </div>
  );
}

export default App;