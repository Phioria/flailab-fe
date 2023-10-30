import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useRefreshToken from '../hooks/useRefreshToken';
import useAuth from '../hooks/useAuth';

const PersistLogin = () => {
    const [isLoading, setIsLoading] = useState(true);
    const refresh = useRefreshToken();
    const { auth, persist } = useAuth();

    useEffect(() => {
        let isMounted = true;

        const verifyRefreshToken = async () => {
            try {
                await refresh();
            } catch (err) {
                console.error(err);
            } finally {
                isMounted && setIsLoading(false);
            }
        };

        !auth?.accessToken ? verifyRefreshToken() : setIsLoading(false);

        return () => (isMounted = false);
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        console.log(`isLoading: ${isLoading}`);
        console.log(`aT: ${JSON.stringify(auth?.accessToken)}`);
        console.log(`Roles: ${JSON.stringify(auth?.roles)}`);
        console.log(`Auth Object: ${JSON.stringify(auth)}`);
        // eslint-disable-next-line
    }, [isLoading]);

    return (
        <>
            {!persist ? (
                <Outlet />
            ) : isLoading ? (
                <p>Loading...</p> // Good spot for a spinner
            ) : (
                <Outlet />
            )}
        </>
    );
};

export default PersistLogin;
