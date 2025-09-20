export default function PageHeader({ title, subtitle, right }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle mt-1">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
