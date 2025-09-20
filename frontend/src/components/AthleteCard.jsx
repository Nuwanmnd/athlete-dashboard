// Athlete Card Component
import { Link } from "react-router-dom";
import InjuryStatusBadge from "./InjuryStatusBadge";


function AthleteCard({ athlete, latestInjury }) {
  return (
    <div className="border rounded p-4 shadow hover:shadow-lg">
      <h3 className="text-xl font-semibold">{athlete.name}</h3>
      <p>Age: {athlete.age}</p>
      <p>Sport: {athlete.sport}</p>
      {latestInjury && (
        <div className="mt-2">
          <InjuryStatusBadge
            status={latestInjury.status}
            severity={latestInjury.severity}
          />
        </div>
      )}
      <Link
        to={`/athletes/${athlete.id}`}
        className="text-blue-600 hover:underline mt-2 inline-block"
      >
        View Profile →
      </Link>
    </div>
  );
}

export default AthleteCard;

<InjuryStatusBadge status="Active" severity="Moderate" />;
