import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function ProgressChart({ data }) {
  // Convert backend ISO date to labels
  const chartData = data.map((a) => ({
    date: a.date,
    cmp_left: a.cmp_left,
    cmp_right: a.cmp_right,
    cmf_left: a.cmf_left,
    cmf_right: a.cmf_right,
    ratio_left: a.ratio_left,
    ratio_right: a.ratio_right,
  }));

  return (
    <div className="border p-4 rounded shadow space-y-6">
      <h3 className="font-bold text-xl mb-2">Progress Over Time</h3>

      {/* CMP Chart */}
      <div>
        <h4 className="font-semibold mb-1">CMP (Power Output)</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="cmp_left"
              stroke="#8884d8"
              name="CMP Left"
            />
            <Line
              type="monotone"
              dataKey="cmp_right"
              stroke="#82ca9d"
              name="CMP Right"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* CMF Chart */}
      <div>
        <h4 className="font-semibold mb-1">CMF (Force Output)</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="cmf_left"
              stroke="#ff7300"
              name="CMF Left"
            />
            <Line
              type="monotone"
              dataKey="cmf_right"
              stroke="#387908"
              name="CMF Right"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Ratio Chart */}
      <div>
        <h4 className="font-semibold mb-1">CMP / CMF Ratio</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 1.2]} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="ratio_left"
              stroke="#6a1b9a"
              name="Ratio Left"
            />
            <Line
              type="monotone"
              dataKey="ratio_right"
              stroke="#00acc1"
              name="Ratio Right"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ProgressChart;
