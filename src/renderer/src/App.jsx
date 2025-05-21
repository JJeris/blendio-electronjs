import React, { useEffect } from 'react';
import { HashRouter as Router, useLocation, useNavigate } from 'react-router-dom';
import AppRouter from './router';
import TitleBar from './components/titleBar/TitleBar';


const RedirectFromQuery = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const targetRoute = searchParams.get('route');
        if (targetRoute && location.pathname === '/') {
            navigate(targetRoute, { replace: true });
        }
    }, [location]);

    return null;
};

const AppContent = () => {
    const location = useLocation();
    const showTitleBar = !location.pathname.startsWith('/popup');

    return (
        <>
            <RedirectFromQuery />
            {showTitleBar && <TitleBar />}
            <AppRouter />
        </>
    );
};

const App = () => (
    <Router>
        <AppContent />
    </Router>
);
export default App;
