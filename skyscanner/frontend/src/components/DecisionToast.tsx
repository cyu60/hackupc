
import { useEffect, useState } from "react";

interface DecisionToastProps {
  message: string | null;
}

const DecisionToast: React.FC<DecisionToastProps> = ({ message }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!message || !isVisible) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-black bg-opacity-70 text-white px-6 py-3 rounded-full shadow-lg z-50">
      {message}
    </div>
  );
};

export default DecisionToast;
