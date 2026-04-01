const Badge = ({ children, variant = 'gray' }) => (
  <span className={`badge badge-${variant}`}>{children}</span>
);

export const paymentStatusBadge = (status) => {
  const map = { Paid: 'success', Pending: 'warning', Partial: 'info' };
  return <Badge variant={map[status] || 'gray'}>{status}</Badge>;
};

export default Badge;
