import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
import { extractTokenFromUrl } from './services/gmailService';
extractTokenFromUrl(); // app load hote hi token save ho jaayega
