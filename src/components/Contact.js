import { useState, useRef } from 'react';

const Contact = () => {
    const [success, setSuccess] = useState(false);
    const [errMsg, setErrMsg] = useState('');

    const errRef = useRef();

    return (
        <main>
            <section className="container-fluid d-flex flex-grow-1 flex-column mt-5 px-4">
                <p ref={errRef} className={errMsg ? 'errmsg' : 'offscreen'} aria-live="assertive">
                    {errMsg}
                </p>
                <h1>Contact Us</h1>
                <form>
                    <label htmlFor="a">a</label>
                </form>
            </section>
        </main>
    );
};

export default Contact;
