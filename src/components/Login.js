import { useRef, useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';

import axios from '../api/axios';
const LOGIN_URL = '/auth';
const RESEND_URL = '/register/resend';

const Login = () => {
    const { setAuth, persist, setPersist } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    const userRef = useRef();
    const errRef = useRef();

    const [user, setUser] = useState('');
    const [pwd, setPwd] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [needsReset, setNeedsReset] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    useEffect(() => {
        userRef.current.focus();
    }, []);

    // Clear out the error message since they've read it and are making adjustments
    useEffect(() => {
        setErrMsg('');
    }, [user, pwd]);

    // We don't have to pass the event object to this function
    // Since it will receive it automatically from the submit action
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(LOGIN_URL, JSON.stringify({ user, pwd }), {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true,
            });
            const accessToken = response?.data?.accessToken;
            const roles = response?.data?.roles;
            setAuth({ user, pwd, roles, accessToken });
            setUser('');
            setPwd('');
            navigate(from, { replace: true });
        } catch (err) {
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response?.status === 400) {
                setErrMsg('Missing Username or Password');
            } else if (err.response?.status === 401) {
                if (err.response?.data?.reason === 'email') {
                    setErrMsg('Email has not been validated');
                    setNeedsReset(true);
                } else {
                    setErrMsg('Unauthorized');
                }
            } else {
                setErrMsg('Login Failed');
            }
            errRef.current.focus();
        }
    };

    const togglePersist = () => {
        setPersist((prev) => !prev);
    };

    useEffect(() => {
        localStorage.setItem('persist', persist);
    }, [persist]);

    const handleReset = async () => {
        // Username validation has already happend if we make it to this point
        try {
            const response = await axios.post(RESEND_URL, JSON.stringify({ user }), {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true,
            });

            setEmailSent(true);
            setNeedsReset(false);
        } catch (err) {
            console.log(err.message); // Should we implement some sort of view at this point for this error?
            setErrMsg(err.message);
        }
    };

    return (
        <>
            <Header />
            <main>
                <section className="container-fluid d-flex flex-grow-1 flex-column mt-5 px-4">
                    <p ref={errRef} className={errMsg ? 'errmsg' : 'offscreen'} aria-live="assertive">
                        {errMsg}
                    </p>
                    <button onClick={handleReset} className={needsReset ? 'mt-2 mb-3 w-75 btn btn-primary' : 'offscreen'}>
                        Resend Email
                    </button>
                    {emailSent && <p className="successmsg">E-mail Sent!</p>}
                    <h1>Sign In</h1>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="username">E-mail Address:</label>
                        <input type="text" id="username" ref={userRef} autoComplete="off" onChange={(e) => setUser(e.target.value)} value={user} required />
                        <label htmlFor="password">Password:</label>
                        <input type="password" id="password" onChange={(e) => setPwd(e.target.value)} value={pwd} required />
                        <button className="mt-4 w-50 btn btn-primary">Sign In</button>
                        <div className="persistCheck">
                            <input type="checkbox" id="persist" onChange={togglePersist} checked={persist} />
                            <label htmlFor="persist">Trust this device</label>
                        </div>
                    </form>
                    <p>
                        Need an Account?
                        <br />
                        <span className="line mb-3">
                            <Link to="/register">Sign Up</Link>
                        </span>
                        <br />
                        Trouble Signing In?
                        <br />
                        <span className="line">
                            <Link to="/reset">Reset Password</Link>
                        </span>
                    </p>
                </section>
            </main>
        </>
    );
};

export default Login;
