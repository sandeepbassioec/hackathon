export default function StatTile({ label, value, suffix }) {
  return (
    <div className="stat-tile">
      <div className="kicker">{label}</div>
      <div className="value">
        {value}
        {suffix ? <span style={{ fontSize: 16, marginLeft: 4 }}>{suffix}</span> : null}
      </div>
    </div>
  );
}
