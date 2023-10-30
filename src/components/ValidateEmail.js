import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from '../api/axios';
import Header from './Header';
const VALIDATE_URL = '/register';

const ValidateEmail = () => {
    const { id, token } = useParams();
    const navigate = useNavigate();

    const [success, setSuccess] = useState(false);
    const [errMsg, setErrMsg] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        if (!id || !token) {
            setErrMsg('Malformed Validation Link');
            return;
        }

        const sendValidationRequest = async () => {
            try {
                const response = await axios.get(`${VALIDATE_URL}/${id}/${token}`, {
                    signal: controller.signal,
                });

                console.log(response);
                isMounted && setSuccess(true);
            } catch (err) {
                console.error(err);
                setErrMsg(err.message);
            }
        };

        sendValidationRequest();
        setIsLoading(false);
        return () => {
            isMounted = false;
            controller.abort();
            setIsLoading(false);
        };
    }, []);

    const gotoLogin = () => {
        navigate('/login');
    };

    return (
        <>
            <Header />
            {isLoading && <img src="dna.svg" alt="DNA Double Helix Roatating" />}
            {success ? (
                <main className="contain-fluid d-flex flex-column justify-content-start">
                    <section className="contain-fluid d-flex flex-grow-1 flex-column mt-5 px-4">
                        <h3 className="py-4">Account Validated!</h3>
                        <button onClick={gotoLogin} className="mt-4 w-50 btn btn-primary">
                            Sign In
                        </button>
                    </section>
                </main>
            ) : (
                <main className="contain-fluid d-flex flex-column justify-content-start">
                    <section className="contain-fluid d-flex flex-grow-1 flex-column mt-5 px-4">
                        <p className="py-4 errormsg">{errMsg ? `Error: ${errMsg}` : 'An error has occurred.'}</p>
                        <button className="mt-4 w-50 btn btn-primary">
                            <Link to="/">Home</Link>
                        </button>
                    </section>
                </main>
            )}
        </>
    );
};

export default ValidateEmail;
