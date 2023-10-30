import { useState, useEffect } from 'react';
import EditTracksRow from './EditTracksRow';
import { Container, Modal, Table, Button } from 'react-bootstrap';

// Receive the tracks to be edited from AllTracks.js
// Display them in a form table for editing
const EditTracks = ({ tracks, setTracks, selectedTracks, setSelectedTracks, handleClose }) => {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [editTracks, setEditTracks] = useState([]);
    const [submitTracks, setSubmitTracks] = useState([]);

    // Once component loads, filter the 'tracks' array for rids that match the ids in selectedTracks
    useEffect(() => {
        const filteredTracks = tracks.filter((track) => selectedTracks.includes(track.rid));
        setEditTracks(filteredTracks); // This is for passing to the individual rows for initial state
        setSubmitTracks(filteredTracks); // This is for maintaining what will be submitted to the server
        // ! Could I possibly do this with a single state? Worried about an endless loop here with some of these useEffects in the individual row component
    }, [tracks, selectedTracks]);

    const handleEditTracks = () => {};

    return (
        <main className="mt-3">
            <Modal show={showConfirmation} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Tracks</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to edit{' '}
                    {selectedTracks.length > 1 ? `these ${selectedTracks.length} tracks?` : `this ${selectedTracks.length} track?`}
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
                            <EditTracksRow track={track} submitTracks={submitTracks} setSubmitTracks={setSubmitTracks} key={i} />
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
