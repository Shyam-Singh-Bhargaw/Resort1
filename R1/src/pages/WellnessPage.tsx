import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Old Wellness page removed — redirecting to new Programs > Wellness listing.
export default function WellnessPageRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/programs/wellness', { replace: true });
  }, [navigate]);

  return null;
}
