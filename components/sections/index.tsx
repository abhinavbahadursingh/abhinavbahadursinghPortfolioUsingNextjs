import { useState, useEffect } from "react";

const Home: React.FC = () => {
  const [showLogin, setShowLogin] = useState<boolean>(true);

  useEffect(() => {
    // Show the login screen for 2 seconds, then hide it
    const timer = setTimeout(() => {
      setShowLogin(false);
    }, 2000);

    return () => clearTimeout(timer); // Cleanup timer
  }, []);

  return showLogin ? <LoginScreen /> : <MainPage />;
};

const LoginScreen: React.FC = () => (
  <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
    <h1 className="text-3xl">Welcome! Loading...</h1>
  </div>
);

const MainPage: React.FC = () => (
  <div className="flex h-screen items-center justify-center">
    <h1 className="text-3xl">Main Page</h1>
  </div>
);

export default Home;
