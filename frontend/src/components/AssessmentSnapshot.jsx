function AssessmentSnapshot({ latest }) {
  if (!latest) return null;
  return (
    <div className="border p-4 rounded shadow">
      <h3 className="font-bold text-xl mb-2">Current Performance</h3>
      <p>
        <strong>CMP Left:</strong> {latest.cmp_left} W
      </p>
      <p>
        <strong>CMP Right:</strong> {latest.cmp_right} W
      </p>
      <p>
        <strong>CMF Left:</strong> {latest.cmf_left} N
      </p>
      <p>
        <strong>CMF Right:</strong> {latest.cmf_right} N
      </p>
      <p>
        <strong>Ratio Left:</strong> {latest.ratio_left}
      </p>
      <p>
        <strong>Ratio Right:</strong> {latest.ratio_right}
      </p>
    </div>
  );
}

export default AssessmentSnapshot;
