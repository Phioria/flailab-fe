import { useState, useEffect } from 'react';
import EditTracksRow from './EditTracksRow';
import { Container, Modal, Table, Button } from 'react-bootstrap';
import useAuth from '../../hooks/useAuth';
import { newAbortSignal } from '../../api/axios';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
const UPDATE_URL = '/records';

// Receive the tracks to be edited from AllTracks.js
// Display them in a form table for editing
const EditTracks = ({
    tracks,
    setTracks,
    selectedTracks,
    setSelectedTracks,
    errMsg,
    setErrMsg,
    errRef,
    setSuccessMsg,
    successRef,
    handleMsgReset,
    handleClose,
}) => {
    const axiosPrivate = useAxiosPrivate();
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [editTracks, setEditTracks] = useState([]);
    const [submitTracks, setSubmitTracks] = useState([]);
    const { auth } = useAuth();

    const allowedKeys = [
        'rid',
        'dataset',
        'species',
        'track_name',
        'sequencing_type',
        'file_location',
        'notes',
        'mutant',
        'tissue',
        'cell_line',
        'development_stage',
        'sex',
        'paper',
        'srr_id',
        'total_mapped',
        'percent_aligned',
        'percent_uniquely_mapped',
        'submitted_by',
        'author',
        'project',
    ];

    // Once component loads, filter the 'tracks' array for rids that match the ids in selectedTracks
    useEffect(() => {
        const filteredTracks = tracks.filter((track) => selectedTracks.includes(track.rid));
        setEditTracks(filteredTracks); // This is for passing to the individual rows for initial state
        setSubmitTracks(filteredTracks); // This is for maintaining what will be submitted to the server
        // ! Could I possibly do this with a single state? Worried about an endless loop here with some of these useEffects in the individual row component
    }, [tracks, selectedTracks]);

    const isValidKeys = (track) => {
        const keys = Object.keys(track);

        // Test to make sure all object keys are allowed
        const result = keys.every((key) => allowedKeys.includes(key));

        return result;
    };

    const isNotNullOrUndefined = (track, field) => {
        const result = (track[field] !== null) & (track[field] !== undefined);
        return result;
    };

    const isValidNumber = (input) => {
        console.info(`Number Input: ${input}`);
        return !isNaN(parseFloat(input.replace('%', '')));
    };

    const isValidAdminTrack = (track) => {
        // Admin Required Fields  = dataset, species, sequencing_type, file_location, tissue

        const datasetResult = isNotNullOrUndefined(track, 'dataset') && track.dataset.trim().length;
        const speciesResult = isNotNullOrUndefined(track, 'species') && track.species.trim().length;
        const sequencingTypeResult =
            isNotNullOrUndefined(track, 'sequencing_type') && track.sequencing_type.trim().length;
        const fileLocationResult = isNotNullOrUndefined(track, 'file_location') && track.file_location.trim().length;
        const tissueResult = isNotNullOrUndefined(track, 'tissue') && track.tissue.trim().length;

        return datasetResult && speciesResult && sequencingTypeResult && fileLocationResult && tissueResult;
    };

    const isValidEditorTrack = (track) => {
        // Editor Required Fields = dataset, species, sequencing_type, file_location, tissue, (These 5 checked by isValidAdminTrack())
        //                          track_name, mutant, sex, author,
        //                          total_mapped, percent_aligned, percent_uniquely_mapped

        // We can re-use the admin function here so we don't have to rewrite those particular checks
        const adminResult = isValidAdminTrack(track);
        const trackNameResult = isNotNullOrUndefined(track, 'track_name') && track.track_name.trim().length;
        const mutantResult = isNotNullOrUndefined(track, 'mutant') && track.mutant.trim().length;
        const sexResult = isNotNullOrUndefined(track, 'sex') && track.sex.trim().length;
        const authorResult = isNotNullOrUndefined(track, 'author') && track.author.trim().length;

        // Extra check here to ensure the input is actually a number
        const totalMappedResult =
            isNotNullOrUndefined(track, 'total_mapped') &&
            track.total_mapped.trim().length &&
            isValidNumber(track.total_mapped);
        const percentAlignedResult =
            isNotNullOrUndefined(track, 'percent_aligned') &&
            track.percent_aligned.trim().length &&
            isValidNumber(track.percent_aligned);
        const percentUniquelyMappedResult =
            isNotNullOrUndefined(track, 'percent_uniquely_mapped') &&
            track.percent_uniquely_mapped.trim().length &&
            isValidNumber(track.percent_uniquely_mapped);

        return (
            adminResult &&
            trackNameResult &&
            mutantResult &&
            sexResult &&
            authorResult &&
            totalMappedResult &&
            percentAlignedResult &&
            percentUniquelyMappedResult
        );
    };

    const handleEditTracks = async () => {
        // TODO: Add in data validation here
        // Grab the user roles, and with that determine which fields are allowed to be null
        // psuedo code: map over all the submitTracks, check each field to see if it's null, and if so, is that allowed by role?
        // If any problems arise, set an errorMsg and allow the user to correct the problem
        // We can deal with most of these issues directly in the EditTracksRow component by using validation there before they are even submitted
        // But this will be a good final check before it heads to the server
        // If everything looks good, then use axiosprivate to submit a put request with the data object set in the second param
        //console.log(submitTracks);

        const roles = auth?.roles;
        console.log(`Roles: ${JSON.stringify(roles)}`);

        const highestRole = Math.max(...Object.values(roles));
        if (highestRole !== 2600 && highestRole !== 1999) {
            console.info(`highestRole: ${highestRole}`);
            console.warn('How did you get here?');
        }

        const tracksHaveValidKeys = submitTracks.every((track) => isValidKeys(track));
        if (!tracksHaveValidKeys) {
            // Set error message and return
            // Just console.warning for now
            console.warn("Tracks don't have valid keys for some reason.");
            return;
        }

        const tracksAreValid =
            highestRole === 2600
                ? submitTracks.every((track) => isValidAdminTrack(track))
                : submitTracks.every((track) => isValidEditorTrack(track));

        if (!tracksAreValid) {
            // Set error message and return
            // Just console.warn for now
            console.warn('Not all submitted tracks were valid');
            return;
        }
        // If we make it to here, lets try to submit the tracks to the server for updating
        try {
            const response = await axiosPrivate.put(UPDATE_URL, submitTracks, {
                signal: newAbortSignal(5000),
            });
            // Now we need to update the existing tracks in state to make sure the changes are reflected locally
            const submitTracksRids = submitTracks.map((track) => track.rid);
            const remainingTracks = tracks.filter((track) => !submitTracksRids.includes(track.rid));
            setTracks([...submitTracks, ...remainingTracks]);

            setSuccessMsg(response.data.message || 'Success');
            //successRef.current.focus(); // ! Right now, the reference doesn't exist in this modal and won't exist until handleClose();
            // ! Consider setting successRef or errRef after handleClose
        } catch (err) {
            // TODO: Consider keeping the selected tracks on this page and not closing the modal if we get an error
            // todo: Would need to move the handleClose() and handleMsgReset() functions into the try block and
            // todo: have our own custom handling here.
            console.error(err.message);
            setErrMsg(err.message);
            //errRef.current.focus(); // ! same as above
        }

        handleClose();
        //errMsg ? errRef.current.focus() : successRef.current.focus();
        handleMsgReset();
    };

    return (
        <main className="mt-3">
            <Modal show={showConfirmation} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Tracks</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to edit{' '}
                    {selectedTracks.length > 1
                        ? `these ${selectedTracks.length} tracks?`
                        : `this ${selectedTracks.length} track?`}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmation(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleEditTracks}>
                        EDIT
                    </Button>
                </Modal.Footer>
            </Modal>
            <Container>
                <form id="edit-form"></form> {/* onSubmit={console.log('Testing')} */}
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Dataset</th>
                            <th>Species</th>
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
                        </tr>
                    </thead>
                    <tbody>
                        {editTracks.map((track, i) => (
                            <EditTracksRow
                                track={track}
                                submitTracks={submitTracks}
                                setSubmitTracks={setSubmitTracks}
                                key={i}
                            />
                        ))}
                    </tbody>
                </Table>
                <button className="btn btn-primary mx-3" onClick={() => setShowConfirmation(true)}>
                    Submit Edits
                </button>
                <button className="btn btn-secondary mx-3" onClick={handleClose}>
                    Cancel
                </button>
            </Container>
        </main>
    );
};

export default EditTracks;
