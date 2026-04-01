import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('Page crashed:', error, info); }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{ padding:'40px', maxWidth:600, margin:'0 auto' }}>
        <div style={{ background:'#FDECEB', border:'1.5px solid #F2A49E', borderRadius:14, padding:'24px 28px' }}>
          <div style={{ fontWeight:800, fontSize:16, color:'#C0392B', marginBottom:8 }}>
            This page encountered an error
          </div>
          <div style={{ fontSize:13, color:'#7B1B14', marginBottom:16, fontFamily:'monospace', background:'#FEF2F2', padding:'10px 14px', borderRadius:8 }}>
            {this.state.error?.message || 'Unknown error'}
          </div>
          <button
            style={{ background:'#C0392B', color:'white', border:'none', padding:'8px 18px', borderRadius:8, fontWeight:700, cursor:'pointer', fontSize:13 }}
            onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
