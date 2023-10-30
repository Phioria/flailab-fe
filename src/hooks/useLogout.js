import axios from '../api/axios';
import useAuth from './useAuth';

const useLogout = () => {
    const { setAuth } = useAuth();

    const logout = async () => {
        setAuth({});
        try {
            const response = await axios.get('/logout', {
                withCredentials: true,
            });
            // Putting this in to stop the no-unused-vars warning
            console.log(`Server Response: ${JSON.stringify(response)}`);
        } catch (err) {
            console.error(err);
        }
    };

    return logout;
};

export default useLogout;
