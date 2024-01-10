import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { faCheck, faTimes, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from '../api/axios';
import Header from './Header';

// This user regex tests for valid email addresses
// eslint-disable-next-line
const USER_REGEX = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

// Pwd Regex Explanation:
// ^(?=.*[a-z]) Must contain at least 1 lowercase letter
// (?=.*[A-Z]) Must contain at least 1 uppercase letter
// (?=.*[0-9]) Must contain at least 1 digit
// (?=.*[!@#$%]) Must contain at least 1 of the listed special characters
// .{8,24}$ The total length of the password must be between 8 and 24 characters
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

// Allow for First or Last names to be between 1 and 20 characters
// Allow any characters except the ones below
// This allows for foreign characters from other languages
const NAME_REGEX = /^[^±!@£$%^&*_+§¡€#¢§¶•ªº«\\/<>?:;|=.,]{1,20}$/;

const REGISTER_URL = '/register';

const Register = () => {
    // Using to place focus on the user input when page loads
    const userRef = useRef();
    // Using to place focus on the error in case one occurs
    const errRef = useRef();

    // State for waiting for registration response
    const [isLoading, setIsLoading] = useState(false);

    const [user, setUser] = useState('');
    const [validName, setValidName] = useState(false);
    const [userFocus, setUserFocus] = useState(false);

    const [pwd, setPwd] = useState('');
    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);

    const [matchPwd, setMatchPwd] = useState('');
    const [validMatch, setValidMatch] = useState(false);
    const [matchFocus, setMatchFocus] = useState(false);

    // Add in state for first name and last name
    const [firstName, setFirstName] = useState('');
    const [validFirstName, setValidFirstName] = useState(true);
    const [firstNameFocus, setFirstNameFocus] = useState(false);

    const [lastName, setLastName] = useState('');
    const [validLastName, setValidLastName] = useState(true);
    const [lastNameFocus, setLastNameFocus] = useState(false);

    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);

    // When page loads, set focus on user input
    useEffect(() => {
        userRef.current.focus();
    }, []);

    useEffect(() => {
        const result = NAME_REGEX.test(firstName);
        setValidFirstName(result);
    }, [firstName]);

    useEffect(() => {
        const result = NAME_REGEX.test(lastName);
        setValidLastName(result);
    }, [lastName]);

    useEffect(() => {
        const result = USER_REGEX.test(user);
        setValidName(result); // If username passes the regex test, then set the validName state to true
    }, [user]); // Anytime the user state changes, run this validation useEffect

    useEffect(() => {
        const result = PWD_REGEX.test(pwd);
        setValidPwd(result);
        const match = pwd === matchPwd;
        setValidMatch(match);
    }, [pwd, matchPwd]);

    // Anytime the user, pwd, or matchPwd changes, clear the error message if there was one
    // As they are changing things and they don't need to be reminded of the error at this point
    // Until the next validation check occurs
    useEffect(() => {
        setErrMsg('');
    }, [user, pwd, matchPwd]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // if button enabled with js hack
        const v1 = USER_REGEX.test(user);
        const v2 = PWD_REGEX.test(pwd);
        const v3 = NAME_REGEX.test(firstName);
        const v4 = NAME_REGEX.test(lastName);
        if (!v1 || !v2 || !v3 || !v4) {
            setErrMsg('Invalid Entry');
            return;
        }
        try {
            setIsLoading(true);
            // eslint-disable-next-line
            const response = await axios.post(
                REGISTER_URL,
                JSON.stringify({
                    // Since they have the same name in front and back end,
                    // You can just destructure like this
                    user,
                    pwd,
                    firstName,
                    lastName,
                }),
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true,
                }
            );

            setSuccess(true);
            // TODO Clear Input Fields
        } catch (err) {
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response?.status === 409) {
                setErrMsg('Username Taken');
            } else {
                setErrMsg('Registration Failed');
            }
            errRef.current.focus();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Header />
            {isLoading ? (
                <div
                    className="d-flex justify-content-center mt-5"
                    aria-label="Spinning DNA molecule representing that tracks are loading"
                >
                    <img src="/dna.svg" alt="DNA molecule" />
                </div>
            ) : success ? (
                <main className="container-fluid d-flex flex-column justify-content-start">
                    <section className="container-fluid d-flex flex-grow-1 flex-column mt-5 mx-4">
                        <h1 className="text-center">Success!</h1>
                        <p className="text-center">
                            Thanks for signing up! <br />
                            Please check your Email for a link to validate your Email address.
                        </p>
                        <p className="text-center">
                            <Link to="/login" className="mt-4 w-50 btn btn-warning text-dark" role="button">
                                Sign In
                            </Link>
                        </p>
                    </section>
                </main>
            ) : (
                <main>
                    <section className="container-fluid d-flex flex-grow-1 flex-column mt-5 px-4">
                        <p ref={errRef} className={errMsg ? 'errmsg' : 'offscreen'} aria-live="assertive">
                            {errMsg}
                        </p>
                        <h1>Register</h1>
                        <form onSubmit={handleSubmit}>
                            <label htmlFor="username">
                                Email Address:
                                <span className={validName ? 'valid' : 'hide'}>
                                    <FontAwesomeIcon icon={faCheck} />
                                </span>
                                <span className={validName || !user ? 'hide' : 'invalid'}>
                                    <FontAwesomeIcon icon={faTimes} />
                                </span>
                            </label>
                            <input
                                type="text"
                                id="username"
                                ref={userRef}
                                autoComplete="off"
                                onChange={(e) => setUser(e.target.value)}
                                required
                                aria-invalid={validName ? 'false' : 'true'}
                                aria-describedby="uidnote"
                                onFocus={() => setUserFocus(true)}
                                onBlur={() => setUserFocus(false)}
                            />
                            <p id="uidnote" className={userFocus && user && !validName ? 'instructions' : 'offscreen'}>
                                <FontAwesomeIcon icon={faInfoCircle} />
                                Must be a valid E-mail address.
                            </p>

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
                                onChange={(e) => setPwd(e.target.value)}
                                required
                                aria-invalid={validPwd ? 'false' : 'true'}
                                aria-describedby="pwdnote"
                                onFocus={() => setPwdFocus(true)}
                                onBlur={() => setPwdFocus(false)}
                            />
                            <p id="pwdnote" className={pwdFocus && !validPwd ? 'instructions' : 'offscreen'}>
                                <FontAwesomeIcon icon={faInfoCircle} />
                                8 to 24 characters.
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
                            <label htmlFor="first_name">
                                First Name:
                                <span className={validFirstName ? 'valid' : 'hide'}>
                                    <FontAwesomeIcon icon={faCheck} />
                                </span>
                                <span className={validFirstName || !firstName ? 'hide' : 'invalid'}>
                                    <FontAwesomeIcon icon={faTimes} />
                                </span>
                            </label>
                            <input
                                type="text"
                                id="first_name"
                                autoComplete="off"
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                aria-invalid={validFirstName ? 'false' : 'true'}
                                aria-describedby="firstNameNote"
                                onFocus={() => setFirstNameFocus(true)}
                                onBlur={() => setFirstNameFocus(false)}
                            />
                            <p
                                id="firstNameNote"
                                className={
                                    firstNameFocus && firstName && !validFirstName ? 'instructions' : 'offscreen'
                                }
                            >
                                <FontAwesomeIcon icon={faInfoCircle} />
                                Name must be between 1 and 20 characters with no special characters used.
                            </p>
                            <label htmlFor="last_name">
                                Last Name:
                                <span className={validLastName ? 'valid' : 'hide'}>
                                    <FontAwesomeIcon icon={faCheck} />
                                </span>
                                <span className={validLastName || !lastName ? 'hide' : 'invalid'}>
                                    <FontAwesomeIcon icon={faTimes} />
                                </span>
                            </label>
                            <input
                                type="text"
                                id="last_name"
                                autoComplete="off"
                                onChange={(e) => setLastName(e.target.value)}
                                required
                                aria-invalid={validLastName ? 'false' : 'true'}
                                aria-describedby="lastNameNote"
                                onFocus={() => setLastNameFocus(true)}
                                onBlur={() => setLastNameFocus(false)}
                            />
                            <p
                                id="lastNameNote"
                                className={lastNameFocus && lastName && !validLastName ? 'instructions' : 'offscreen'}
                            >
                                <FontAwesomeIcon icon={faInfoCircle} />
                                Name must be between 1 and 20 characters with no special characters used.
                            </p>

                            <button
                                className="mt-4 w-50 btn btn-warning"
                                disabled={
                                    !validName || !validPwd || !validMatch || !firstName || !lastName ? true : false
                                }
                            >
                                Sign Up
                            </button>
                        </form>
                        <p>
                            Already registered?
                            <br />
                            <span className="line">
                                <Link to="/login">Sign In</Link>
                            </span>
                        </p>
                    </section>
                </main>
            )}
        </>
    );
};

export default Register;
