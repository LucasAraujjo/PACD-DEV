import { useTheme } from '../context/ThemeContext';
import '../styles/ThemeToggleButton.css';

const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle-button"
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'}
      title={theme === 'light' ? 'Tema Escuro' : 'Tema Claro'}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

export default ThemeToggleButton;
