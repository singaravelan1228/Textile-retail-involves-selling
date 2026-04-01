const Loader = ({ fullscreen }) => {
  if (fullscreen) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }
  return (
    <div className="loader-wrap">
      <div className="spinner" />
    </div>
  );
};

export default Loader;
