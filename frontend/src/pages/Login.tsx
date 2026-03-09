export default function Login() {
  return (
    <div>
      <h2>Welcome to ChefItUp</h2>
      <p>Log in to access your saved recipes.</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
        <input type="email" placeholder="Student Email" className="form-input" />
        <input type="password" placeholder="Password" className="form-input" />
        <button className="primary-btn" onClick={() => alert('Backend Auth Pending!')}>
          Log In / Register
        </button>
      </div>
    </div>
  );
}