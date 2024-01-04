import { Form } from 'react-bootstrap';

const SearchRow = ({
    FIELDS, // Mapping over this to fill out the Select dropdown box
    searchField, // Alias for the numbered searchField that gets passed in
    setSearchField,
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
                            setSearchField({
                                ...searchField,
                                field: e.target.value,
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
                        value={searchField.searchTerm}
                        onChange={(e) =>
                            setSearchField({
                                ...searchField,
                                searchTerm: e.target.value,
                            })
                        }
                    />
                </div>
                <div className="btn-primary">Search</div>
                {/* Insert Search Button Here */}
            </div>
        </>
    );
};

export default SearchRow;
