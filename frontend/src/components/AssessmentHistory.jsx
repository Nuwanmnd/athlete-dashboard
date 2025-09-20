function AssessmentHistory({ assessments }) {
  return (
    <div className="border p-4 rounded shadow">
      <h3 className="font-bold text-xl mb-2">Recent Assessments</h3>
      <ul className="space-y-2">
        {assessments.slice(0, 2).map((a) => (
          <li key={a.id} className="border p-2 rounded">
            <p>Date: {a.date}</p>
            <p>
              CMP L/R: {a.cmp_left} / {a.cmp_right}
            </p>
            <p>
              Ratio L/R: {a.ratio_left} / {a.ratio_right}
            </p>
            <p className="italic text-sm">Comment: {a.coach_comment}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AssessmentHistory;
