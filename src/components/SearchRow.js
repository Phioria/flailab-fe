import { Form } from 'react-bootstrap';

const SearchRow = ({
    FIELDS, // Mapping over this to fill out the Select dropdown box
    currentSearchTerm,
    setCurrentSearchTerm,
    handleSearch,
}) => {
    return (
        <>
            <div className="row">
                <div className="col-4">
                    <label htmlFor="select-field">Select Field</label>
                    <Form.Select
                        id="select-field"
                        aria-label="Select Field to Search"
                        onChange={(e) =>
                            setCurrentSearchTerm({
                                ...currentSearchTerm,
                                column: e.target.value,
                            })
                        }
                    >
                        <option>Select a Field to Search</option>
                        {Object.entries(FIELDS).map(([field, name]) => (
                            <option key={field} value={field}>
                                {name}
                            </option>
                        ))}
                    </Form.Select>
                </div>
                <div className="col-5">
                    <label htmlFor="search-field">Search Tracks</label>
                    <input
                        className="w-100"
                        id="search-field"
                        type="text"
                        placeholder="Search Tracks"
                        value={currentSearchTerm.value}
                        onChange={(e) =>
                            setCurrentSearchTerm({
                                ...currentSearchTerm,
                                value: e.target.value,
                            })
                        }
                    />
                </div>
                <button className="col-1 btn btn-primary" onClick={handleSearch}>
                    Search
                </button>
            </div>
        </>
    );
};

export default SearchRow;
