import { useState, useEffect, useRef } from 'react';
import Header from './Header';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { newAbortSignal } from '../api/axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import { Container, Button } from 'react-bootstrap';
//import Button from 'react-bootstrap';
//import { SortDown, SortUp } from 'react-bootstrap-icons';
//import { sort } from 'fast-sort';
import SearchRow from './SearchRow';
import useWindowSize from '../hooks/useWindowSize';
import Modal from 'react-bootstrap/Modal';
import EditTracks from './partials/EditTracks';
const RECORDS_URL = '/records';

const AllTracks = () => {
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
    // Mapping through an unknown number of search fields in an array proved to be problematic
    // Was getting massive amounts of duplicate results
    // Switching to 6 maximum search fields so it can be hard coded
    // { field: 'field', searchTerm: 'term' }
    const [searchRow1, setSearchRow1] = useState({ field: '', searchTerm: '' });
    const [searchRow2, setSearchRow2] = useState({ field: '', searchTerm: '' });
    const [searchRow3, setSearchRow3] = useState({ field: '', searchTerm: '' });
    const [searchRow4, setSearchRow4] = useState({ field: '', searchTerm: '' });
    const [searchRow5, setSearchRow5] = useState({ field: '', searchTerm: '' });
    const [searchRow6, setSearchRow6] = useState({ field: '', searchTerm: '' });
    const [numberOfSearchRows, setNumberOfSearchRows] = useState(1);
    const [searchResults, setSearchResults] = useState([]);

    // State for Sorting
    //const [column, setColumn] = useState({});
    //const [sortIcon, setSortIcon] = useState('down');

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

        // todo update to dynamic
        // setting these manually for now. will change for pagenation after testing
        const limit = 500;
        const offset = 0;

        const getTracks = async () => {
            try {
                const response = await axiosPrivate.get(`${RECORDS_URL}/${limit}/${offset}`, {
                    signal: newAbortSignal(5000), // Abort after 5 seconds
                });

                console.log(`Total Rows: ${response.data.count}`);
                // TODO: If there is a problem with fetching, perhaps set this differently
                setNumberOfRecords(response.data.count);
                const numberOfPages = Math.ceil(response.data.count / limit);
                // Creates an array of sequential integers from 1 to the number of pages
                // This will be used to generate the pagenation links on the page
                const pagesArray = Array.from({ length: numberOfPages }, (v, i) => i + 1);
                isMounted && setPages(pagesArray);
                isMounted && setTracks(response.data.rows);
            } catch (err) {
                console.error(err);
                navigate('/login', {
                    state: { from: location },
                    replace: true,
                });
            } finally {
                setIsLoading(false);
            }
        };

        getTracks();

        return () => {
            isMounted = false;
            newAbortSignal(); // Abort immediately
        };
    }, [axiosPrivate, location, navigate]);

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

    // Runs once searchResults are populated
    // Adds event listener to the select all box to handle toggling of checkboxes
    useEffect(() => {
        const checkboxes = Array.from(document.getElementsByClassName('select-box'));
        const selectbox = document.getElementById('select-all');

        // Any time searchResults change, we need to either:
        // A: Reset both the checkboxes and the selectedTracks OR
        // B: Map through the selectedTracks, and
        //    If they don't exist in the new searchResults, then remove them
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
    }, [searchResults]);

    // Adding numberOfSearchRows to the dependencies made it more responsive, but now when you add a new field, it shows no results until you add a field
    // Gonna need to add some more if statements i think instead of optional chaining
    useEffect(() => {
        // We need a case for global search
        // Perhaps have a toggle for field versus global search
        // For now just run a field search

        // Helper function to test if the search.field is empty or at the default
        const searchIsEmpty = (obj) => {
            return obj.field.length === 0 || obj.field === 'Select a Field to Search';
        };

        const searchOrTrue = (obj, track) => {
            if (searchIsEmpty(obj)) {
                return true;
            } else {
                return track[obj.field].toLowerCase().includes(obj.searchTerm.toLowerCase());
            }
        };

        if (numberOfSearchRows === 1) {
            if (searchIsEmpty(searchRow1)) {
                const filteredResults = tracks.filter((track) => {
                    const trackContent = Object.values(track).join(' ');
                    return trackContent.toLowerCase().includes(searchRow1.searchTerm.toLowerCase());
                });
                setSearchResults(filteredResults);
            } else {
                // 1 Search Row but there is a field present
                const filteredResults = tracks.filter((track) => {
                    return track[searchRow1.field].toLowerCase().includes(searchRow1.searchTerm.toLowerCase());
                });
                setSearchResults(filteredResults);
            }
        } else {
            // For any number of rows over 1
            const filteredResults = tracks.filter((track) => {
                return (
                    searchOrTrue(searchRow1, track) &&
                    searchOrTrue(searchRow2, track) &&
                    searchOrTrue(searchRow3, track) &&
                    searchOrTrue(searchRow4, track) &&
                    searchOrTrue(searchRow5, track) &&
                    searchOrTrue(searchRow6, track)
                );
            });
            setSearchResults(filteredResults);
        }
    }, [
        tracks,
        searchRow1,
        searchRow2,
        searchRow3,
        searchRow4,
        searchRow5,
        searchRow6,
        setSearchResults,
        numberOfSearchRows,
    ]);

    // useEffect(() => {
    //     // todo consider changing the column object to an array with 2 items instead of an object
    //     // todo this would save time on having to run Object.keys etc

    //     const columnIsEmpty = () => {
    //         return Object.keys(column).length === 0;
    //     };

    //     if (searchResults) {
    //         const col = Object.keys(column)[0];
    //         const val = Object.values(column)[0];

    //         // Adding in toLowerCase() since it was sorting words that started with lower case 'a' after capitalized 'Z'k
    //         const sortedResults = val === 'up' ? sort(searchResults).desc((t) => t[col].toLowerCase()) : sort(searchResults).asc((t) => t[col].toLowerCase());

    //         setSearchResults(sortedResults);
    //         setSortIcon(val);
    //     }
    // }, [column]);

    const renderSearchRows = () => {
        switch (numberOfSearchRows) {
            case 1:
                return (
                    <SearchRow
                        FIELDS={FIELDS}
                        rowNumber={1}
                        numberOfSearchRows={numberOfSearchRows}
                        setNumberOfSearchRows={setNumberOfSearchRows}
                        searchField={searchRow1}
                        setSearchField={setSearchRow1}
                    ></SearchRow>
                );
            case 2:
                return (
                    <>
                        <SearchRow
                            FIELDS={FIELDS}
                            rowNumber={1}
                            numberOfSearchRows={numberOfSearchRows}
                            setNumberOfSearchRows={setNumberOfSearchRows}
                            searchField={searchRow1}
                            setSearchField={setSearchRow1}
                        ></SearchRow>
                        <SearchRow
                            FIELDS={FIELDS}
                            rowNumber={2}
                            numberOfSearchRows={numberOfSearchRows}
                            setNumberOfSearchRows={setNumberOfSearchRows}
                            searchField={searchRow2}
                            setSearchField={setSearchRow2}
                        ></SearchRow>
                    </>
                );
            case 3:
                return (
                    <>
                        <SearchRow
                            FIELDS={FIELDS}
                            rowNumber={1}
                            numberOfSearchRows={numberOfSearchRows}
                            setNumberOfSearchRows={setNumberOfSearchRows}
                            searchField={searchRow1}
                            setSearchField={setSearchRow1}
                        ></SearchRow>
                        <SearchRow
                            FIELDS={FIELDS}
                            rowNumber={2}
                            numberOfSearchRows={numberOfSearchRows}
                            setNumberOfSearchRows={setNumberOfSearchRows}
                            searchField={searchRow2}
                            setSearchField={setSearchRow2}
                        ></SearchRow>
                        <SearchRow
                            FIELDS={FIELDS}
                            rowNumber={3}
                            numberOfSearchRows={numberOfSearchRows}
                            setNumberOfSearchRows={setNumberOfSearchRows}
                            searchField={searchRow3}
                            setSearchField={setSearchRow3}
                        ></SearchRow>
                    </>
                );
            case 4:
                return (
                    <>
                        <SearchRow
                            FIELDS={FIELDS}
                            rowNumber={1}
                            numberOfSearchRows={numberOfSearchRows}
                            setNumberOfSearchRows={setNumberOfSearchRows}
                            searchField={searchRow1}
                            setSearchField={setSearchRow1}
                        ></SearchRow>
                        <SearchRow
                            FIELDS={FIELDS}
                            rowNumber={2}
                            numberOfSearchRows={numberOfSearchRows}
                            setNumberOfSearchRows={setNumberOfSearchRows}
                            searchField={searchRow2}
                            setSearchField={setSearchRow2}
                        ></SearchRow>
                        <SearchRow
                            FIELDS={FIELDS}
                            rowNumber={3}
                            numberOfSearchRows={numberOfSearchRows}
                            setNumberOfSearchRows={setNumberOfSearchRows}
                            searchField={searchRow3}
                            setSearchField={setSearchRow3}
                        ></SearchRow>
                        <SearchRow
                            FIELDS={FIELDS}
                            rowNumber={4}
                            numberOfSearchRows={numberOfSearchRows}
                            setNumberOfSearchRows={setNumberOfSearchRows}
                            searchField={searchRow4}
                            setSearchField={setSearchRow4}
                        ></SearchRow>
                    </>
                );
            case 5:
                return (
                    <>
                        <SearchRow
                            FIELDS={FIELDS}
                            rowNumber={1}
                            numberOfSearchRows={numberOfSearchRows}
                            setNumberOfSearchRows={setNumberOfSearchRows}
                            searchField={searchRow1}
                            setSearchField={setSearchRow1}
                        ></SearchRow>
                        <SearchRow
                            FIELDS={FIELDS}
                            rowNumber={2}
                            numberOfSearchRows={numberOfSearchRows}
                            setNumberOfSearchRows={setNumberOfSearchRows}
                            searchField={searchRow2}
                            setSearchField={setSearchRow2}
                        ></SearchRow>
                        <SearchRow
                            FIELDS={FIELDS}
                            rowNumber={3}
                            numberOfSearchRows={numberOfSearchRows}
                            setNumberOfSearchRows={setNumberOfSearchRows}
                            searchField={searchRow3}
                            setSearchField={setSearchRow3}
                        ></SearchRow>
                        <SearchRow
                            FIELDS={FIELDS}
                            rowNumber={4}
                            numberOfSearchRows={numberOfSearchRows}
                            setNumberOfSearchRows={setNumberOfSearchRows}
                            searchField={searchRow4}
                            setSearchField={setSearchRow4}
                        ></SearchRow>
                        <SearchRow
                            FIELDS={FIELDS}
                            rowNumber={5}
                            numberOfSearchRows={numberOfSearchRows}
                            setNumberOfSearchRows={setNumberOfSearchRows}
                            searchField={searchRow5}
                            setSearchField={setSearchRow5}
                        ></SearchRow>
                    </>
                );
            case 6:
                return (
                    <>
                        <SearchRow
                            FIELDS={FIELDS}
                            rowNumber={1}
                            numberOfSearchRows={numberOfSearchRows}
                            setNumberOfSearchRows={setNumberOfSearchRows}
                            searchField={searchRow1}
                            setSearchField={setSearchRow1}
                        ></SearchRow>
                        <SearchRow
                            FIELDS={FIELDS}
                            rowNumber={2}
                            numberOfSearchRows={numberOfSearchRows}
                            setNumberOfSearchRows={setNumberOfSearchRows}
                            searchField={searchRow2}
                            setSearchField={setSearchRow2}
                        ></SearchRow>
                        <SearchRow
                            FIELDS={FIELDS}
                            rowNumber={3}
                            numberOfSearchRows={numberOfSearchRows}
                            setNumberOfSearchRows={setNumberOfSearchRows}
                            searchField={searchRow3}
                            setSearchField={setSearchRow3}
                        ></SearchRow>
                        <SearchRow
                            FIELDS={FIELDS}
                            rowNumber={4}
                            numberOfSearchRows={numberOfSearchRows}
                            setNumberOfSearchRows={setNumberOfSearchRows}
                            searchField={searchRow4}
                            setSearchField={setSearchRow4}
                        ></SearchRow>
                        <SearchRow
                            FIELDS={FIELDS}
                            rowNumber={5}
                            numberOfSearchRows={numberOfSearchRows}
                            setNumberOfSearchRows={setNumberOfSearchRows}
                            searchField={searchRow5}
                            setSearchField={setSearchRow5}
                        ></SearchRow>
                        <SearchRow
                            FIELDS={FIELDS}
                            rowNumber={6}
                            numberOfSearchRows={numberOfSearchRows}
                            setNumberOfSearchRows={setNumberOfSearchRows}
                            searchField={searchRow6}
                            setSearchField={setSearchRow6}
                        ></SearchRow>
                    </>
                );
            default:
                return null;
        }
    };

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
                                {renderSearchRows()}
                            </form>
                        </Container>
                        {isLoading ? (
                            <div
                                className="d-flex justify-content-center"
                                aria-label="Spinning DNA molecule representing that tracks are loading"
                            >
                                <img src="dna.svg" alt="DNA molecule" />
                            </div>
                        ) : searchResults.length ? (
                            <>
                                <div className="d-inline-block mb-2 ms-3">
                                    <p className="mb-1">{`${numberOfRecords} Records`}</p>
                                    {pages.map((page) => (
                                        <Link to={`/records/${page}`} className="link-dark me-2">
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
                                        {searchResults.map((track, i) => (
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
                                                    <div className="td-content">{i + 1}</div>
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
