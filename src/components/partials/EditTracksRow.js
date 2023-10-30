import { useState, useEffect } from 'react';

const EditTracksRow = ({ track, submitTracks, setSubmitTracks }) => {
    const [row, setRow] = useState(track);
    const id = track.rid;

    // Set the row state to the track passed in. Then use the row, setRow state to handle the form changes
    // useEffect(() => {
    //     setRow(track);
    // }, [track]);

    // Anytime the row changes, update the parent rows object
    useEffect(() => {
        // Having an issue here where this is endlessly running because all the rows think they're changing
        // Going to try an if statement to see if the initial track matches the row and only update when then don't
        // The problem seems to be with the dependency array
        // submitTracks is causing the problem
        // Not sure what the best solution is yet
        // possibly useRef or

        if (row !== track) {
            console.log('running');
            const otherTracks = submitTracks.filter((track) => track.rid !== id);
            setSubmitTracks([...otherTracks, row]);
            //console.log(submitTracks);
        }
    }, [row]);

    // Admin Required Fields = dataset, species, sequencing_type, file_location, tissue
    // Editor Required Fields = dataset, species, track_name, sequencing_type, file_location, mutant, tissue,
    //                          sex, total_mapped, percent_aligned, percent_uniquely_mapped, author
    return (
        <tr>
            <td>
                <input
                    id={`${id}-dataset`}
                    form="edit-form"
                    type="text"
                    autoComplete="off"
                    value={row.dataset}
                    onChange={(e) => setRow({ ...row, dataset: e.target.value })}
                    required
                />
            </td>
            <td>
                <input
                    id={`${id}-species`}
                    form="edit-form"
                    type="text"
                    autoComplete="off"
                    value={row.species}
                    onChange={(e) => setRow({ ...row, species: e.target.value })}
                    required
                />
            </td>
            <td>
                <input
                    id={`${id}-track_name`}
                    form="edit-form"
                    type="text"
                    autoComplete="off"
                    value={row.track_name}
                    onChange={(e) => setRow({ ...row, track_name: e.target.value })}
                />
            </td>
            <td>
                <input
                    id={`${id}-sequencing_type`}
                    form="edit-form"
                    type="text"
                    autoComplete="off"
                    value={row.sequencing_type}
                    onChange={(e) => setRow({ ...row, sequencing_type: e.target.value })}
                    required
                />
            </td>
            <td>
                <input
                    id={`${id}-file_location`}
                    form="edit-form"
                    type="text"
                    autoComplete="off"
                    value={row.file_location}
                    onChange={(e) => setRow({ ...row, file_location: e.target.value })}
                    required
                />
            </td>
            <td>
                <input
                    id={`${id}-notes`}
                    form="edit-form"
                    type="text"
                    autoComplete="off"
                    value={row.notes}
                    onChange={(e) => setRow({ ...row, notes: e.target.value })}
                />
            </td>
            <td>
                <input
                    id={`${id}-mutant`}
                    form="edit-form"
                    type="text"
                    autoComplete="off"
                    value={row.mutant}
                    onChange={(e) => setRow({ ...row, mutant: e.target.value })}
                />
            </td>
            <td>
                <input
                    id={`${id}-tissue`}
                    form="edit-form"
                    type="text"
                    autoComplete="off"
                    value={row.tissue}
                    onChange={(e) => setRow({ ...row, tissue: e.target.value })}
                    required
                />
            </td>
            <td>
                <input
                    id={`${id}-cell_line`}
                    form="edit-form"
                    type="text"
                    autoComplete="off"
                    value={row.cell_line}
                    onChange={(e) => setRow({ ...row, cell_line: e.target.value })}
                />
            </td>
            <td>
                <input
                    id={`${id}-development_stage`}
                    form="edit-form"
                    type="text"
                    autoComplete="off"
                    value={row.development_stage}
                    onChange={(e) => setRow({ ...row, development_stage: e.target.value })}
                />
            </td>
            <td>
                <input
                    id={`${id}-sex`}
                    form="edit-form"
                    type="text"
                    autoComplete="off"
                    value={row.sex}
                    onChange={(e) => setRow({ ...row, sex: e.target.value })}
                />
            </td>
            <td>
                <input
                    id={`${id}-paper`}
                    form="edit-form"
                    type="text"
                    autoComplete="off"
                    value={row.paper}
                    onChange={(e) => setRow({ ...row, paper: e.target.value })}
                />
            </td>
            <td>
                <input
                    id={`${id}-srr_id`}
                    form="edit-form"
                    type="text"
                    autoComplete="off"
                    value={row.srr_id}
                    onChange={(e) => setRow({ ...row, srr_id: e.target.value })}
                />
            </td>
            <td>
                <input
                    id={`${id}-total_mapped`}
                    form="edit-form"
                    type="text"
                    autoComplete="off"
                    value={row.total_mapped}
                    onChange={(e) => setRow({ ...row, total_mapped: e.target.value })}
                />
            </td>
            <td>
                <input
                    id={`${id}-percent_aligned`}
                    form="edit-form"
                    type="text"
                    autoComplete="off"
                    value={row.percent_aligned}
                    onChange={(e) => setRow({ ...row, percent_aligned: e.target.value })}
                />
            </td>
            <td>
                <input
                    id={`${id}-percent_uniquely_mapped`}
                    form="edit-form"
                    type="text"
                    autoComplete="off"
                    value={row.percent_uniquely_mapped}
                    onChange={(e) => setRow({ ...row, percent_uniquely_mapped: e.target.value })}
                />
            </td>
            <td>
                <input
                    id={`${id}-submitted_by`}
                    form="edit-form"
                    type="email"
                    autoComplete="off"
                    value={row.submitted_by}
                    onChange={(e) => setRow({ ...row, submitted_by: e.target.value })}
                />
            </td>
            <td>
                <input
                    id={`${id}-author`}
                    form="edit-form"
                    type="text"
                    autoComplete="off"
                    value={row.author}
                    onChange={(e) => setRow({ ...row, author: e.target.value })}
                />
            </td>
            <td>
                <input
                    id={`${id}-project`}
                    form="edit-form"
                    type="text"
                    autoComplete="off"
                    value={row.project}
                    onChange={(e) => setRow({ ...row, project: e.target.value })}
                />
            </td>
        </tr>
    );
};

export default EditTracksRow;
