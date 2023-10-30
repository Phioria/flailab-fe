import { useState, useEffect } from 'react';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import Header from './Header';

const Upload = () => {
    const axiosPrivate = useAxiosPrivate();
    const [uploadFile, setUploadFile] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [badHeaders, setBadHeaders] = useState([]);
    const [badRowNumbers, setBadRowNumbers] = useState([]);

    useEffect(() => {
        // Clear out previous error state
        setErrorMsg('');
        setBadHeaders([]);
        setBadRowNumbers([]);
        setSuccessMsg('');
    }, [uploadFile]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const controller = new AbortController();

        const formData = new FormData();
        formData.append('newFile', uploadFile);

        try {
            const response = await axiosPrivate.post('/records', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
                signal: controller.signal,
            });

            setSuccessMsg(response.data.message);
        } catch (err) {
            if (!err?.response) {
                setErrorMsg('No Server Response');
            } else if (err.response?.status === 400) {
                setErrorMsg(err.response.data.message);
                if (err.response.data.reason === 'file-type' || err.response.data.reason === 'empty') {
                    console.log('Empty or file type problem');
                } else if (err.response.data.reason === 'headers') {
                    setBadHeaders(err.response.data.badHeaders);
                    console.log('Bad headers problem');
                } else if (err.response.data.reason === 'rows') {
                    setBadRowNumbers(err.response.data.badRowNumbers);
                    console.log('Bad rows problem');
                } else if (err.response.data.reason === 'headers-and-rows') {
                    setBadHeaders(err.response.data.badHeaders);
                    setBadRowNumbers(err.response.data.badRowNumbers);
                    console.log('Bad headers and rows problem');
                } else {
                    console.log('some problems');
                }
            } else {
                setErrorMsg(err.response?.data.message || 'Some unknown error has occurred.');
            }
        } finally {
            //setUploadFile(null);
        }
    };

    return (
        <>
            <Header />
            <main className="container-fluid d-flex flex-grow-1 flex-column justify-content-start">
                <div className="callout callout-info">
                    <h1>Upload Tracks</h1>
                    <br />
                    <p>
                        <strong>CSV File Upload Guidelines:</strong>
                        <br />
                        The file must be a properly formatted csv file. It must have headers that correspond <br />
                        to the data in its respective column. The following are the headers that must be present. <br />
                        <br />
                        <strong>Spelling is important, though column order is not.</strong>
                        <br />
                        <br />
                        <u>dataset</u>, <u>species</u>, <u>track_name</u>, <u>sequencing_type</u>, <u>file_location</u>, <u>mutant</u>, <u>tissue</u>,{' '}
                        <u>sex</u>, <br />
                        <u>total_mapped</u>, <u>percent_aligned</u>, <u>percent_uniquely_mapped</u>, <u>author</u>, cell_line, <br />
                        development_stage, project, paper, srr_id, notes <br />
                        <br />
                        All column headers listed above are required to be present in the submitted file, however <br />
                        only the underlined headers are required to have data present in each corresponding cell. <br />
                        If you feel you need to upload data that does not meet these requirements, feel free to
                        <br />
                        contact us, and arrangements can be made.
                    </p>
                    <p className={errorMsg ? 'errmsg' : 'offscreen'} aria-live="assertive">
                        {errorMsg}
                        <br />
                        {badHeaders.length ? (
                            <>
                                Headers: {JSON.stringify(badHeaders)}
                                <br />
                            </>
                        ) : (
                            <></>
                        )}
                        {badRowNumbers.length ? (
                            <>
                                Rows: {JSON.stringify(badRowNumbers)}
                                <br />
                            </>
                        ) : (
                            <></>
                        )}
                    </p>
                    <p className={successMsg ? 'successmsg' : 'offscreen'} aria-live="assertive">
                        {successMsg}
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="formFile">Upload a CSV file</label>
                            <input
                                className="form-control w-75 mt-2"
                                type="file"
                                id="formFile"
                                accept=".csv"
                                onChange={(e) => setUploadFile(e.target.files[0])}
                            />
                            <button type="submit" className="btn btn-primary">
                                Submit
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
};

export default Upload;
