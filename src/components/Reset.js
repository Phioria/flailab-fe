import { useState, useRef } from 'react';
import Header from './Header';
import axios from '../api/axios';
const RESET_URL = '/auth/revocer';

// This user regex tests for valid email addresses
// eslint-disable-next-line
const USER_REGEX = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

const Reset = () => {
    const [user, setUser] = useState();
    const [success, setSuccess] = useState(false);
    const [errMsg, setErrMsg] = useState();
    const userRef = useRef();
    const errRef = useRef();

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Handle Submit');

        const v1 = USER_REGEX.test(user);
        if (!v1) {
            setErrMsg('Invalid Entry');
            return;
        }
        try {
            // eslint-disable-next-line
            const response = await axios.post(
                RESET_URL,
                JSON.stringify({
                    user,
                }),
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true,
                }
            );

            setSuccess(true);
        } catch (err) {
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else {
                setErrMsg('Reset Request Failed');
            }
            errRef.current.focus();
        }
    };

    return (
        <>
            <Header />
            {success ? (
                <main className="container-fluid d-flex flex-column justify-content-start">
                    <section className="container-fluid d-flex flex-grow-1 flex-column mt-5 mx-4 px-4">
                        <h1>E-mail Sent!</h1>
                        <p>Check your E-mail for a link to reset your password.</p>
                    </section>
                </main>
            ) : (
                <main>
                    <section className="container-fluid d-flex flex-grow-1 flex-column mt-5 px-4">
                        <p ref={errRef} className={errMsg ? 'errmsg' : 'offscreen'} aria-live="assertive">
                            {errMsg}
                        </p>
                        <h1>Reset Your Password</h1>
                        <form onSubmit={handleSubmit}>
                            <label htmlFor="username">E-mail Address:</label>
                            <input
                                type="text"
                                id="username"
                                ref={userRef}
                                autoComplete="off"
                                onChange={(e) => setUser(e.target.value)}
                                required
                            />
                            <button className="mt-4 w-50 btn btn-warning">Reset</button>
                        </form>
                    </section>
                </main>
            )}
        </>
    );
};

export default Reset;
