export function Card({ className = "", children }) {
  return <div className={`card ${className}`}>{children}</div>;
}
export function CardHeader({ title, meta }) {
  return (
    <div className="px-5 pt-5">
      <div className="text-base font-semibold">{title}</div>
      {meta && <div className="text-sm text-base-subtle mt-1">{meta}</div>}
    </div>
  );
}
export function CardContent({ children }) {
  return <div className="px-5 pb-5 pt-4">{children}</div>;
}
