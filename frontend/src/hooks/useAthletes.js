import { useEffect, useState } from "react";

export function useAthletes() {
  const [athletes, setAthletes] = useState([]);

  useEffect(() => {
    fetch("/api/athletes/")
      .then((res) => res.json())
      .then((data) => setAthletes(data))
      .catch((err) => console.error("Failed to fetch athletes", err));
  }, []);

  return athletes;
}
