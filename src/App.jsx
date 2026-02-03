import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import NovaAtividade from './pages/NovaAtividade';
import MinhasAtividades from './pages/MinhasAtividades';

function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e6dae0',
        color: '#1A1A1A'
      }}>
        <p>Carregando...</p>
      </div>
    );
  }

  return isAuthenticated() ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/nova-atividade"
            element={
              <PrivateRoute>
                <NovaAtividade />
              </PrivateRoute>
            }
          />
          <Route
            path="/minhas-atividades"
            element={
              <PrivateRoute>
                <MinhasAtividades />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/nova-atividade" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
