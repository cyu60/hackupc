import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function WelcomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate("/preferences");
    }, 2000); // redirect after 2 seconds

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#01294D] text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-center">
        SkyScanner x BrainScanner
      </h1>
      <p className="text-lg text-gray-300 mb-8 text-center">
        Presented by Precept
      </p>
    </div>
  );
}