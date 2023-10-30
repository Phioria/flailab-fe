import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import axios from '../api/axios';
import Header from './Header';
const URL = '/auth';
const UPDATE_PWD_URL = '/auth/teser';

const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

const ResetLink = () => {
    const { id, token } = useParams();

    const [success, setSuccess] = useState(false); // For token validation
    const [resetSuccess, setResetSuccess] = useState(false); // For pwd reset success
    const [errMsg, setErrMsg] = useState('');

    const [pwd, setPwd] = useState('');
    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);

    const [matchPwd, setMatchPwd] = useState('');
    const [validMatch, setValidMatch] = useState(false);
    const [matchFocus, setMatchFocus] = useState(false);

    // Using to place focus on the password in put when page loads
    const pwdRef = useRef();
    // Using to place focus on the error in case one occurs
    const errRef = useRef();

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        if (!id || !token) {
            setErrMsg('Malformed Reset Link');
            return;
        }

        const sendResetRequest = async () => {
            try {
                const response = await axios.get(`${URL}/${id}/${token}`, {
                    signal: controller.signal,
                });
                console.log(response);
                isMounted && setSuccess(true);
            } catch (err) {
                console.error(err);
                navigate('/login', {
                    state: { from: location },
                    replace: true,
                });
            }
        };

        sendResetRequest();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, []);

    // When success is set, set focus on password input
    useEffect(() => {
        if (success === true) pwdRef.current.focus();
    }, [success]);

    useEffect(() => {
        const result = PWD_REGEX.test(pwd);
        setValidPwd(result);
        const match = pwd === matchPwd;
        setValidMatch(match);
    }, [pwd, matchPwd]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrMsg('');
        const v1 = PWD_REGEX.test(pwd);
        if (!v1) {
            setErrMsg('Invalid Entry');
            return;
        }
        try {
            // eslint-disable-next-line
            const response = await axios.post(
                UPDATE_PWD_URL,
                JSON.stringify({
                    id,
                    pwd,
                }),
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true,
                }
            );
            setResetSuccess(true);
        } catch (err) {
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else {
                setErrMsg('Password update failed.');
            }
            errRef.current.focus();
        }
    };

    // Nested success structure:
    // If resetSuccess is true => Show Reset Success message component
    //                   false => Then if Success is true => Show Password update form
    //                                              false => Show Error State
    return (
        <>
            <Header />
            {resetSuccess ? (
                <main className="contain-fluid d-flex flex-column justify-content-start">
                    <section className="contain-fluid d-flex flex-grow-1 flex-column mt-5 px-4">
                        {errMsg ? (
                            <p className="errmsg">{errMsg}</p>
                        ) : (
                            <>
                                <p className="py-4">Your password has been updated successfully!</p>
                                <button className="mt-4 w-50 btn btn-primary">
                                    <Link to="/login">Sign In</Link>
                                </button>
                            </>
                        )}
                    </section>
                </main>
            ) : (
                <>
                    {success ? (
                        <main className="container-fluid d-flex flex-column justify-content-start">
                            <section className="container-fluid d-flex flex-grow-1 flex-column mt-5 px-4">
                                <p ref={errRef} className={errMsg ? 'errmsg' : 'offscreen'} aria-live="assertive">
                                    {errMsg}
                                </p>
                                <h1>Reset Your Password</h1>
                                <form onSubmit={handleSubmit}>
                                    <label htmlFor="password">
                                        Password:
                                        <span className={validPwd ? 'valid' : 'hide'}>
                                            <FontAwesomeIcon icon={faCheck} />
                                        </span>
                                        <span className={validPwd || !pwd ? 'hide' : 'invalid'}>
                                            <FontAwesomeIcon icon={faTimes} />
                                        </span>
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        ref={pwdRef}
                                        onChange={(e) => setPwd(e.target.value)}
                                        required
                                        aria-invalid={validPwd ? 'false' : 'true'}
                                        aria-describedby="pwdnote"
                                        onFocus={() => setPwdFocus(true)}
                                        onBlur={() => setPwdFocus(false)}
                                    />
                                    <p id="pwdnote" className={pwdFocus && pwd && !validPwd ? 'instructions' : 'offscreen'}>
                                        <FontAwesomeIcon icon={faInfoCircle} />
                                        8 - 24 characters.
                                        <br />
                                        Must include upper and lowercase letters, a number and a special character.
                                        <br />
                                        Allowed special characters: <span aria-label="exclamation mark">!</span>
                                        <span aria-label="at symbol">@</span>
                                        <span aria-label="hashtag">#</span>
                                        <span aria-label="dollar sign">$</span>
                                        <span aria-label="percent">%</span>
                                    </p>
                                    <label htmlFor="confirm_pwd">
                                        Confirm Password:
                                        <span className={validMatch && matchPwd ? 'valid' : 'hide'}>
                                            <FontAwesomeIcon icon={faCheck} />
                                        </span>
                                        <span className={validMatch || !matchPwd ? 'hide' : 'invalid'}>
                                            <FontAwesomeIcon icon={faTimes} />
                                        </span>
                                    </label>
                                    <input
                                        type="password"
                                        id="confirm_pwd"
                                        onChange={(e) => setMatchPwd(e.target.value)}
                                        required
                                        aria-invalid={validMatch ? 'false' : 'true'}
                                        aria-describedby="confirmnote"
                                        onFocus={() => setMatchFocus(true)}
                                        onBlur={() => setMatchFocus(false)}
                                    />
                                    <p id="confirmnote" className={matchFocus && !validMatch ? 'instructions' : 'offscreen'}>
                                        <FontAwesomeIcon icon={faInfoCircle} />
                                        Must match the first password input field.
                                    </p>

                                    <button className="mt-4 w-50 btn btn-primary" disabled={!validPwd || !validMatch}>
                                        Reset
                                    </button>
                                </form>
                            </section>
                        </main>
                    ) : (
                        <main className="container-fluid d-flex flex-column justify-content-start">
                            <section className="container-fluid d-flex flex-grow-1 flex-column mt-5 px-4">
                                {errMsg ? <p className="errmsg">{errMsg}</p> : <p className="errmsg">Password Reset Validation Failed</p>}
                            </section>
                        </main>
                    )}
                </>
            )}
        </>
    );
};

export default ResetLink;
