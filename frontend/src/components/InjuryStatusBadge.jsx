function InjuryStatusBadge({ severity, status }) {
  let color = "bg-gray-400";
  let text = `${status} (${severity})`;

  if (status === "Resolved") color = "bg-green-500";
  else if (status === "Recovering") color = "bg-yellow-400";
  else if (status === "Active") {
    if (severity === "Severe") color = "bg-red-600";
    else if (severity === "Moderate") color = "bg-orange-500";
    else color = "bg-yellow-400";
  }

  return (
    <span
      className={`inline-block text-xs text-white px-2 py-1 rounded ${color}`}
    >
      {text}
    </span>
  );
}

export default InjuryStatusBadge;
