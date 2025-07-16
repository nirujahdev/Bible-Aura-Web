import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function useAuthPrompt() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const requireAuth = (action: string = "access this feature") => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: `Please sign in to ${action}`,
        action: {
          altText: "Sign In",
          onClick: () => navigate("/auth"),
          children: "Sign In"
        },
      });
      return false;
    }
    return true;
  };

  const requireAuthForCreation = (featureName: string) => {
    return requireAuth(`create ${featureName}`);
  };

  return {
    user,
    isAuthenticated: !!user,
    requireAuth,
    requireAuthForCreation
  };
} 