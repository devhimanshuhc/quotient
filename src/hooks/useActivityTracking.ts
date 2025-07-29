import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

export function useActivityTracking() {
  const { data: session } = useSession();
  const lastActivityRef = useRef<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!session?.user) return;

    const updateActivity = async () => {
      try {
        await fetch("/api/user-activity", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        console.error("Failed to update user activity:", error);
      }
    };

    const handleUserActivity = () => {
      lastActivityRef.current = Date.now();
    };

    // Track various user activities
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      document.addEventListener(event, handleUserActivity, true);
    });

    // Update activity every 2 minutes if user is active
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;

      // Only update if user was active in the last 2 minutes
      if (timeSinceLastActivity < 2 * 60 * 1000) {
        updateActivity();
      }
    }, 2 * 60 * 1000); // Every 2 minutes

    // Initial activity update
    updateActivity();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleUserActivity, true);
      });

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [session?.user]);
}
