export default function StatusBadge({ status }) {
  const key = (status || '').toLowerCase();
  return <span className={`badge badge-${key}`}>{status}</span>;
}
