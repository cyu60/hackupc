import { useNavigate } from "react-router-dom";

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#01294D] text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-center">
        SkyScanner x The Perfect Reunion
      </h1>
      <p className="text-lg text-gray-300 mb-8 text-center">
        Presented by Precept
      </p>
      <button
        onClick={() => navigate("/preferences")}
        className="border border-white text-white px-6 py-2 rounded hover:bg-white hover:text-[#01294D] transition"
      >
        Get Started
      </button>
    </div>
  );
}
