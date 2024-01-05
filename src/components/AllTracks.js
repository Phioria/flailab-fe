import { useState, useEffect, useRef } from 'react';
import Header from './Header';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { newAbortSignal } from '../api/axios';
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import { Container, Button } from 'react-bootstrap';
import Badge from 'react-bootstrap/Badge';
import Stack from 'react-bootstrap/Stack';
import { XCircle } from 'react-bootstrap-icons';
import SearchRow from './SearchRow';
import useWindowSize from '../hooks/useWindowSize';
import Modal from 'react-bootstrap/Modal';
import EditTracks from './partials/EditTracks';
const RECORDS_URL = '/records';

const AllTracks = () => {
    const { pageNumber } = useParams();

    const LIMIT = 500; // Number of tracks per page...might change later to be changable on site

    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const location = useLocation();
    const { width } = useWindowSize();
    const errRef = useRef();
    const successRef = useRef();
    const [isLoading, setIsLoading] = useState(true);

    const [tracks, setTracks] = useState([]);
    const [pages, setPages] = useState([]);
    const [numberOfRecords, setNumberOfRecords] = useState();

    // State for Searching
    // { field: 'field', searchTerm: 'term' }
    const [currentSearchTerm, setCurrentSearchTerm] = useState({ column: '', value: '' });
    const [searchTerms, setSearchTerms] = useState([]);
    const [searching, setSearching] = useState(false);

    // State for Editing, Deleting, Checkboxes
    const [selectedTracks, setSelectedTracks] = useState([]);
    const [successMsg, setSuccessMsg] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [showDelete, setShowDelete] = useState(false);
    const [showEdit, setShowEdit] = useState(false);

    // State for managing shift clicking checkboxes
    const [previousBox, setPreviousBox] = useState(null); // Anytime you regular click on a box set this
    // Anytime you unclick a box, clear this
    // Anytime you search also clear this

    const FIELDS = {
        dataset: 'Dataset',
        species: 'Species',
        track_name: 'Track Name',
        sequencing_type: 'Sequencing Type',
        file_location: 'File Location',
        notes: 'Notes',
        mutant: 'Mutant',
        tissue: 'Tissue',
        cell_line: 'Cell Line',
        development_stage: 'Development Stage',
        sex: 'Sex',
        paper: 'Paper',
        srr_id: 'SRR ID',
        total_mapped: 'Total Mapped',
        percent_aligned: 'Percent Aligned',
        percent_uniquely_mapped: 'Percent Uniquely Mapped',
        submitted_by: 'Submitted By',
        author: 'Author',
        project: 'Project',
        file_type: 'File Type',
        file_name: 'File Name',
        paired_single_ended: 'Paired/Single Ended',
        unmapped_reads: 'Unmapped Reads',
        splice_reads: 'Splice Reads',
        non_splice_reads: 'Non-Splice Reads',
        reads_mapped_to_plus: 'Reads Mapped to +',
        reads_mapped_to_minus: 'Reads Mapped to -',
    };

    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);

        // todo update to dynamic
        // setting these manually for now. will change for pagenation after testing
        const offset = pageNumber == null ? 0 : (pageNumber - 1) * LIMIT;

        const getTracks = async () => {
            try {
                const response = searching
                    ? await axiosPrivate.post(`${RECORDS_URL}/${LIMIT}/${offset}`, JSON.stringify({ searchTerms }), {
                          signal: newAbortSignal(5000),
                      })
                    : await axiosPrivate.get(`${RECORDS_URL}/${LIMIT}/${offset}`, {
                          signal: newAbortSignal(5000), // Abort after 5 seconds
                      });

                // TODO: If there is a problem with fetching, perhaps set this differently
                setNumberOfRecords(response.data.count);
                const numberOfPages = Math.ceil(response.data.count / LIMIT);
                // Creates an array of sequential integers from 1 to the number of pages
                // This will be used to generate the pagenation links on the page
                const pagesArray = Array.from({ length: numberOfPages }, (v, i) => i + 1);
                isMounted && setPages(pagesArray);
                isMounted && setTracks(response.data.rows);
            } catch (err) {
                console.error(err);
                // TODO: instead of going to login page when there's an error, perhaps we should display an error
                // todo: maybe based on the type of error we can decide if we should navigate to login or display an error
                navigate('/login', {
                    state: { from: location },
                    replace: true,
                });
            } finally {
                setIsLoading(false);
            }
        };

        //! What is the best way to do this
        //! If we link to a different page with /search in the path,
        //! Then do we need to have the search params listed in the url?
        //! This could be problematic for multi part searches
        //!
        //! Maybe we don't use a separate path for searching
        //! Maybe once we click search, we just change the following:
        //! tracks, track count, number of pages, pages array, links to pagination
        //! the problem comes in when we click on a second page

        if (searching) {
            console.log('made it here');
            console.log(`searchTerms: ${JSON.stringify(searchTerms)}`);
        }

        getTracks();

        return () => {
            isMounted = false;
            newAbortSignal(); // Abort immediately
        };
    }, [axiosPrivate, location, navigate, searching]);

    // The tracks selected are handled in two places
    // One is by using this function when the boxes change by being clicked
    // The other is in the useEffect() below when the 'select-all' box is checked
    const handleSingleSelectedTrack = (e) => {
        const currentBox = parseInt(e.target.name);
        if (e.target.checked) {
            if (previousBox === null) {
                setSelectedTracks([...selectedTracks, e.target.id]);
                setPreviousBox(currentBox);
            } else {
                // A box has previously been checked...now check to see if shift is down
                if (e.nativeEvent.shiftKey && Math.abs(currentBox - previousBox) !== 1) {
                    // Shift key is down. Now set the checkboxes for every box after the previous box up until this box.
                    // The !== 1 part is making sure the boxes aren't side by side...if they are, then just handle the new box like normal
                    // And add each of those to selectedTracks
                    const startIndex = previousBox < currentBox ? previousBox + 1 : currentBox + 1; // Since the previousBox has been added to selectedTracks and already checked
                    const endIndex = previousBox < currentBox ? currentBox - 1 : previousBox - 1; // Since the currentBox will have been checked already HOWEVER it won't have been added to selected tracks yet
                    console.log(`Start: ${startIndex} | End: ${endIndex}`);
                    let newIds = [];
                    for (let i = startIndex; i <= endIndex; i++) {
                        const boxName = i.toString();
                        const box = document.getElementsByName(boxName)[0];
                        box.checked = true;
                        if (!selectedTracks.includes(box.id)) {
                            // This if statement stops duplicates from being added to selectedTracks if the user is shift clicking in multiple directions
                            newIds.push(box.id);
                        }
                    }
                    setSelectedTracks([...selectedTracks, ...newIds, e.target.id]); // Have to add the e.target.id since the current box hasn't been added to the selectedTracks yet either
                    setPreviousBox(currentBox); // reset previousBox
                } else {
                    // Shift key not pressed. Reset the previous box to this box and set the selectedTracks like normal
                    setSelectedTracks([...selectedTracks, e.target.id]);
                    setPreviousBox(currentBox);
                }
            }
        } else {
            // Handle unchecking a box
            // previousBox can't be null if you're deselecting a box...no need to check for it
            console.log(`currentBox: ${currentBox} | previousBox: ${previousBox}`);
            if (e.nativeEvent.shiftKey && Math.abs(currentBox - previousBox) !== 1) {
                console.log('true');
                const startIndex = previousBox < currentBox ? previousBox + 1 : currentBox + 1;
                const endIndex = previousBox < currentBox ? currentBox - 1 : previousBox - 1;
                console.log(`Start: ${startIndex} | End: ${endIndex}`);
                let removeIds = [];
                for (let i = startIndex; i <= endIndex; i++) {
                    const boxName = i.toString();
                    const box = document.getElementsByName(boxName)[0];
                    box.checked = false;
                    if (!removeIds.includes(box.id)) {
                        removeIds.push(box.id);
                    }
                }
                if (!removeIds.includes(e.target.id)) removeIds.push(e.target.id);
                const previousBoxElement = document.getElementsByName(previousBox)[0];
                if (!removeIds.includes(previousBoxElement.id)) removeIds.push(previousBoxElement.id);
                if (previousBoxElement.checked) previousBoxElement.checked = false;

                const remainingTracks = selectedTracks.filter((track) => !removeIds.includes(track));
                setSelectedTracks(remainingTracks);
                setPreviousBox(null); // Might keep this at null for the unchecking case
            } else {
                const remainingTracks = selectedTracks.filter((track) => track !== e.target.id);
                setSelectedTracks(remainingTracks);
                setPreviousBox(currentBox);
            }
        }
    };

    // Runs once tracks are populated
    // Adds event listener to the select all box to handle toggling of checkboxes
    useEffect(() => {
        const checkboxes = Array.from(document.getElementsByClassName('select-box'));
        const selectbox = document.getElementById('select-all');

        // Any time tracks change, we need to either:
        // A: Reset both the checkboxes and the selectedTracks OR
        // B: Map through the selectedTracks, and
        //    If they don't exist in the new tracks, then remove them
        // Probably safest to just reset them all.
        // Looks like the checkboxes reset when they aren't in the current search results
        // Just need to reset the selectedTracks and current checkboxes
        setSelectedTracks([]);
        checkboxes.map((box) => (box.checked = false));

        const handleToggleCheckboxes = (e) => {
            const checked = e.target.checked;
            checkboxes.map((box) => (box.checked = checked));
            if (checked) {
                const ids = checkboxes.map((c) => c.id);
                setSelectedTracks(ids);
            } else {
                setSelectedTracks([]);
            }
        };

        if (selectbox !== null) {
            selectbox.addEventListener('change', handleToggleCheckboxes);
        }

        return () => {
            document.removeEventListener('change', handleToggleCheckboxes);
        };
    }, [tracks]);

    const handleDeleteTracks = async () => {
        if (!selectedTracks.length) {
            return;
        }
        try {
            await axiosPrivate.delete(RECORDS_URL, {
                data: {
                    ids: selectedTracks,
                },
                signal: newAbortSignal(5000), // Aborts request after 5 seconds
            });

            const remainingTracks = tracks.filter((track) => !selectedTracks.includes(track.rid));
            //console.log(`Remaining Tracks: ${remainingTracks.length}`);
            setTracks(remainingTracks);
            setSuccessMsg(
                selectedTracks.length > 1
                    ? `Successfully deleted ${selectedTracks.length} tracks.`
                    : `Successfully deleted ${selectedTracks.length} track.`
            );
            successRef.current.focus();
        } catch (err) {
            console.log(err);
            setErrMsg(err.message);
            errRef.current.focus();
        }
        handleClose();
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
        handleMsgReset();
    };

    const handleDownloadTracks = () => {
        if (!selectedTracks.length) {
            return;
        }

        const rawCsvTracks = tracks.filter((track) => selectedTracks.includes(track.rid));

        const csvTracks = rawCsvTracks.map((track) => {
            delete track.rid;
            delete track.submitted_by;
            return track;
        });

        let csvArray = [];

        const csv_headers = Object.keys(csvTracks[0]);
        csvArray.push(csv_headers);

        csvTracks.map((track) => {
            csvArray.push(Object.values(track));
        });

        let csvContent = '';

        csvArray.map((row) => {
            csvContent += row.join(',') + '\n';
        });

        const csvFile = new Blob([csvContent], { type: 'text/csv;charset=utf-8,' });

        const element = document.createElement('a');
        element.href = URL.createObjectURL(csvFile);
        element.download = 'flailab-tracks-' + Date.now() + '.csv';
        document.body.appendChild(element);
        element.click();
    };

    const handleMsgReset = () => {
        setTimeout(() => {
            setErrMsg('');
            setSuccessMsg('');
        }, 10000); // Clean error or success messages after 5 seconds
    };

    const handleClose = () => {
        setSelectedTracks([]);
        setShowDelete(false);
        setShowEdit(false);
    };

    const handleEditTracks = () => {
        console.log(selectedTracks);
        setShowEdit(true);
    };

    const handleSearch = () => {
        console.log(`currentSearchTerm: ${JSON.stringify(currentSearchTerm)}`);
        console.log(`searchTerms: ${searchTerms}`);

        // TODO: We need to add in a way to clear the search terms when we're no longer using them
        // todo: perhaps add this into the primary useEffect and check to see if we're searching or not
        // todo: also add in badges showing what we're searching for...they should have an x on them to delete the search term
        setSearchTerms([...searchTerms, currentSearchTerm]);
        setCurrentSearchTerm({ column: '', value: '' }); // Reset the currentSearchTerm once it's been used
        setSearching(true);
    };

    const handleRemoveSearchTerm = (column) => {
        const remainingSearchTerms = searchTerms.filter((term) => term.column !== column);
        setSearchTerms(remainingSearchTerms);
    };

    return (
        <div id="ob-wrap">
            <Header />
            {showEdit ? (
                <EditTracks
                    tracks={tracks}
                    setTracks={setTracks}
                    selectedTracks={selectedTracks}
                    setSelectedTracks={setSelectedTracks}
                    errMsg={errMsg}
                    setErrMsg={setErrMsg}
                    errRef={errRef}
                    successRef={successRef}
                    setSuccessMsg={setSuccessMsg}
                    handleMsgReset={handleMsgReset}
                    handleClose={handleClose}
                />
            ) : (
                <>
                    <main className="mt-3">
                        <Modal show={showDelete} onHide={handleClose}>
                            <Modal.Header closeButton>
                                <Modal.Title>Delete Tracks</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                Are you sure you want to delete{' '}
                                {selectedTracks.length > 1
                                    ? `these ${selectedTracks.length} tracks?`
                                    : `this ${selectedTracks.length} track?`}
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleClose}>
                                    Cancel
                                </Button>
                                <Button variant="danger" onClick={handleDeleteTracks}>
                                    DELETE
                                </Button>
                            </Modal.Footer>
                        </Modal>
                        <Container>
                            <p
                                ref={errRef}
                                className={errMsg ? 'errmsg w-50 fade-5' : 'offscreen'}
                                aria-live="assertive"
                            >
                                {errMsg}
                            </p>
                            <p ref={successRef} className={successMsg ? 'successmsg w-50 fade-5' : 'offscreen'}>
                                {successMsg}
                            </p>
                            <form className="searchForm" onSubmit={(e) => e.preventDefault()}>
                                <SearchRow
                                    FIELDS={FIELDS}
                                    currentSearchTerm={currentSearchTerm}
                                    setCurrentSearchTerm={setCurrentSearchTerm}
                                    handleSearch={handleSearch}
                                />
                                {searching && (
                                    <Stack direction="horizontal" gap={2}>
                                        {searchTerms.map((term) => (
                                            <Badge pill bg="primary" className="mt-2">
                                                {`${term.column}: ${term.value}`}
                                                <XCircle
                                                    className="ms-1"
                                                    onClick={() => handleRemoveSearchTerm(term.column)}
                                                />
                                            </Badge>
                                        ))}
                                    </Stack>
                                )}
                            </form>
                        </Container>
                        {isLoading ? (
                            <div
                                className="d-flex justify-content-center"
                                aria-label="Spinning DNA molecule representing that tracks are loading"
                            >
                                <img src="/dna.svg" alt="DNA molecule" />
                            </div>
                        ) : tracks.length ? (
                            <>
                                <div className="d-inline-block mb-2 ms-3">
                                    <p className="mb-1">{`${numberOfRecords} Records`}</p>
                                    {pages.map((page) => (
                                        <Link
                                            to={`/records/${page}`}
                                            className={
                                                pageNumber == null && page == 1
                                                    ? 'link-dark me-3 text-decoration-none'
                                                    : page == pageNumber
                                                    ? 'link-dark me-3 text-decoration-none'
                                                    : 'link-dark me-3'
                                            }
                                        >
                                            {page}
                                        </Link>
                                    ))}
                                </div>
                                <Table
                                    striped
                                    bordered
                                    hover
                                    className={selectedTracks.length ? 'table-footer-spacing' : 'mb-0'}
                                >
                                    <thead>
                                        <tr>
                                            <th>
                                                <div>
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        value=""
                                                        id="select-all"
                                                    />
                                                    <label className="form-check-label offscreen" htmlFor="select-all">
                                                        Select All
                                                    </label>
                                                </div>
                                            </th>
                                            <th>#</th>
                                            <th>
                                                Dataset
                                                {/* {sortIcon === 'down' ? (
                                                    <SortUp className="ms-3" onClick={() => setColumn({ dataset: 'up' })} />
                                                ) : (
                                                    <SortDown className="ms-3" onClick={() => setColumn({ dataset: 'down' })} />
                                                )} */}
                                            </th>
                                            <th>
                                                Species
                                                {/* {sortIcon === 'down' ? (
                                                    <SortUp className="ms-3" onClick={() => setColumn({ species: 'up' })} />
                                                ) : (
                                                    <SortDown className="ms-3" onClick={() => setColumn({ species: 'down' })} />
                                                )} */}
                                            </th>
                                            <th>Track Name</th>
                                            <th>Sequencing Type</th>
                                            <th>File Location</th>
                                            <th>Notes</th>
                                            <th>Mutant</th>
                                            <th>Tissue</th>
                                            <th>Cell Line</th>
                                            <th>Development Stage</th>
                                            <th>Sex</th>
                                            <th>Paper</th>
                                            <th>SRR ID</th>
                                            <th>Total Mapped</th>
                                            <th>Percent Aligned</th>
                                            <th>Percent Uniquely Mapped</th>
                                            <th>Submitted By</th>
                                            <th>Author</th>
                                            <th>Project</th>
                                            <th>File Type</th>
                                            <th>File Name</th>
                                            <th>Paired/Single Ended</th>
                                            <th>Unmapped Reads</th>
                                            <th>Splice Reads</th>
                                            <th>Non-Splice Reads</th>
                                            <th>Reads Mapped to +</th>
                                            <th>Reads Mapped to -</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tracks.map((track, i) => (
                                            <tr key={track.rid}>
                                                <td>
                                                    <div>
                                                        <input
                                                            className="form-check-input select-box"
                                                            type="checkbox"
                                                            value=""
                                                            id={track.rid}
                                                            name={i}
                                                            onChange={handleSingleSelectedTrack}
                                                        />
                                                        <label
                                                            className="form-check-label offscreen"
                                                            htmlFor={track.rid}
                                                        >
                                                            Select All
                                                        </label>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="td-content">
                                                        {pageNumber == null ? i + 1 : i + 1 + (pageNumber - 1) * LIMIT}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="td-content">{track.dataset}</div>
                                                </td>
                                                <td>
                                                    <div className="td-content">{track.species}</div>
                                                </td>
                                                <td>
                                                    <div className="td-content">{track.track_name}</div>
                                                </td>
                                                <td>
                                                    <div className="td-content">{track.sequencing_type}</div>
                                                </td>
                                                <td>
                                                    <div className="td-content">{track.file_location}</div>
                                                </td>
                                                <td>
                                                    <div className="td-content">{track.notes}</div>
                                                </td>
                                                <td>
                                                    <div className="td-content">{track.mutant}</div>
                                                </td>
                                                <td>
                                                    <div className="td-content">{track.tissue}</div>
                                                </td>
                                                <td>
                                                    <div className="td-content">{track.cell_line}</div>
                                                </td>
                                                <td>
                                                    <div className="td-content">{track.development_stage}</div>
                                                </td>
                                                <td>
                                                    <div className="td-content">{track.sex}</div>
                                                </td>
                                                <td>
                                                    <div className="td-content">{track.paper}</div>
                                                </td>
                                                <td>
                                                    <div className="td-content">{track.srr_id}</div>
                                                </td>
                                                <td>
                                                    <div className="td-content">{track.total_mapped}</div>
                                                </td>
                                                <td>
                                                    <div className="td-content">{track.percent_aligned}</div>
                                                </td>
                                                <td>
                                                    <div className="td-content">{track.percent_uniquely_mapped}</div>
                                                </td>
                                                <td>
                                                    <div className="td-content">{track.submitted_by}</div>
                                                </td>
                                                <td>
                                                    <div className="td-content">{track.author}</div>
                                                </td>
                                                <td>
                                                    <div className="td-content">{track.project}</div>
                                                </td>
                                                <td>
                                                    <div className="td-content">{track.file_type}</div>
                                                </td>
                                                <td>
                                                    <div className="td-content">{track.file_name}</div>
                                                </td>
                                                <td>
                                                    <div className="td-content">{track.paired_single_ended}</div>
                                                </td>
                                                <td>
                                                    <div className="td-content">{track.unmapped_reads}</div>
                                                </td>
                                                <td>
                                                    <div className="td-content">{track.splice_reads}</div>
                                                </td>
                                                <td>
                                                    <div className="td-content">{track.non_splice_reads}</div>
                                                </td>
                                                <td>
                                                    <div className="td-content">{track.reads_mapped_to_plus}</div>
                                                </td>
                                                <td>
                                                    <div className="td-content">{track.reads_mapped_to_minus}</div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </>
                        ) : (
                            <p style={{ marginTop: '2rem' }}>No tracks to display.</p>
                        )}
                    </main>
                    {selectedTracks.length && (
                        <footer expand="lg" className="fixed-bottom bg-dark">
                            <div className="container-fluid d-sm-flex flex-row justify-content-center align-items-center">
                                <h5 className="mt-2" style={{ color: 'white' }}>
                                    {selectedTracks.length === 1
                                        ? `${selectedTracks.length} track selected`
                                        : `${selectedTracks.length} tracks selected`}
                                </h5>
                                <button
                                    className={
                                        width < 576 ? 'btn btn-primary mt-0 mb-2 me-3' : 'btn btn-primary my-3 mx-3'
                                    }
                                    onClick={handleEditTracks}
                                >
                                    Edit
                                </button>
                                <button
                                    className={
                                        width < 576 ? 'btn btn-primary mt-0 mb-2 me-3' : 'btn btn-primary my-3 me-3'
                                    }
                                    onClick={handleDownloadTracks}
                                >
                                    Download
                                </button>
                                <button
                                    className={width < 576 ? 'btn btn-danger mt-0 mb-2' : 'btn btn-danger my-3'}
                                    onClick={() => setShowDelete(true)}
                                >
                                    Delete
                                </button>
                            </div>
                        </footer>
                    )}
                </>
            )}
        </div>
    );
};

export default AllTracks;
