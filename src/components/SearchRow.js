import { Form } from 'react-bootstrap';
import { PlusCircle, XCircle } from 'react-bootstrap-icons';

// TODO: Consider Adding a Minus or X button after the Plus button to remove search fields that are no longer wanted.
// todo: This could be a difficult thing. If the user wants to remove any field but the last field, then their should be a handle delete
// todo: function that transfer the state of fields that exist after the one being deleted to down to the prior ones to maintain state object order
// todo: Another idea might be to only allow the deletion of the last row...that way, no other state would be affected
// todo: This would add an element of frustration for the user potentially in having to redo their search a bit...might be worth it

const SearchRow = ({
    FIELDS, // Mapping over this to fill out the Select dropdown box
    rowNumber, // Alias for numberOfSearchRows used to derive IDs for JSX elements and to limit row increase to 6
    // Will likely just pass an integer for derived value, and pass the state number for limiting row growth
    numberOfSearchRows, // State to limit row growth to 6
    setNumberOfSearchRows,
    searchField, // Alias for the numbered searchField that gets passed in
    setSearchField,
}) => {
    const handleIncreaseSearchFields = () => {
        if (numberOfSearchRows < 6) setNumberOfSearchRows((n) => n + 1);
    };

    const handleDeleteSearchField = () => {
        // todo when deleting a field, set the state of the field back to empty
        if (numberOfSearchRows !== 1 && rowNumber === numberOfSearchRows) setNumberOfSearchRows((n) => n - 1);
        setSearchField({ field: '', searchTerm: '' }); // Set this searchField back to default
    };

    return (
        <>
            <div className="row">
                <div className="col-4">
                    <label htmlFor={`select-${rowNumber}`}>Select Field</label>
                    <Form.Select
                        id={`select-${rowNumber}`}
                        aria-label="Select Field to Search"
                        onChange={(e) =>
                            setSearchField({
                                ...searchField,
                                field: e.target.value,
                            })
                        }
                    >
                        <option>Select a Field to Search</option>
                        {Object.entries(FIELDS).map(([field, name]) => (
                            <option key={`${field}-${rowNumber}`} value={field}>
                                {name}
                            </option>
                        ))}
                    </Form.Select>
                </div>
                <div className="col-5">
                    <label htmlFor={`search-${rowNumber}`}>Search Tracks</label>
                    <input
                        className="w-100"
                        id={`search-${rowNumber}`}
                        type="text"
                        placeholder="Search Tracks"
                        // Not sure if this is the corrct way to make an element in an object a part of a controlled form
                        value={searchField.searchTerm}
                        onChange={(e) =>
                            setSearchField({
                                ...searchField,
                                searchTerm: e.target.value,
                            })
                        }
                    />
                </div>
                {numberOfSearchRows === 6 ? (
                    <></>
                ) : (
                    <div className="col icon-width pt-1">
                        <PlusCircle onClick={handleIncreaseSearchFields} />
                    </div>
                )}
                {numberOfSearchRows !== 1 && rowNumber === numberOfSearchRows ? (
                    <div className="col icon-width pt-1">
                        <XCircle onClick={handleDeleteSearchField} />
                    </div>
                ) : (
                    <></>
                )}
            </div>
        </>
    );
};

export default SearchRow;
