export default function Table({ head, children }) {
  return (
    <div className="overflow-x-auto rounded-2xl border">
      <table className="w-full text-sm">
        {head && (
          <thead className="bg-base-muted/50">
            <tr>
              {head.map((h, i) => (
                <th key={i} className="px-4 py-3 text-left font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="[&>tr:nth-child(even)]:bg-base-muted/30">
          {children}
        </tbody>
      </table>
    </div>
  );
}
