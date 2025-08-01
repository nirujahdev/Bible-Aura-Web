import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Features = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to Bible Study as the default features page
    navigate("/features/bible-study", { replace: true });
  }, [navigate]);

  return null;
};

export default Features; 