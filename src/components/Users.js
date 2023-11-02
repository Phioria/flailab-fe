import { useState, useEffect } from 'react';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { newAbortSignal } from '../api/axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { OverlayTrigger, Table, Tooltip } from 'react-bootstrap';
import { Pen, Trash } from 'react-bootstrap-icons';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import useAuth from '../hooks/useAuth';

const Users = () => {
    const [users, setUsers] = useState();
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const location = useLocation();
    const { auth } = useAuth();

    // State for Editing users
    const [editUser, setEditUser] = useState({});
    const [showEdit, setShowEdit] = useState(false);
    const [newRoles, setNewRoles] = useState([]);

    // State for Deleting users
    const [showDelete, setShowDelete] = useState(false);
    const [deleteUser, setDeleteUser] = useState({});

    useEffect(() => {
        let isMounted = true;

        const getUsers = async () => {
            try {
                const response = await axiosPrivate.get('/users', {
                    signal: newAbortSignal(5000),
                });
                console.log(response.data);
                isMounted && setUsers(response.data);
            } catch (err) {
                console.error(err);
                navigate('/login', {
                    state: { from: location },
                    replace: true,
                });
            }
        };

        getUsers();

        return () => {
            isMounted = false;
            newAbortSignal();
        };
    }, [axiosPrivate, location, navigate]);

    const editTooltip = <Tooltip id="edit-tooltip">Edit Roles</Tooltip>;

    const deleteTooltip = <Tooltip id="delet-tooltip">Delete User</Tooltip>;

    const getDate = (d) => {
        let date = d.split('T')[0];
        date = date.split('-');
        const yyyy = date[0];
        const mm = date[1];
        const dd = date[2];
        const dateString = `${mm}/${dd}/${yyyy}`;
        return dateString;
    };

    const getRoles = (d) => {
        return Object.keys(d);
    };

    const handleDeleteUser = (u) => {
        // Set the current user to be deleted
        // Show the Modal
        setDeleteUser({
            id: u.uid,
            username: u.username,
        });
        setShowDelete(true);
    };

    const handleConfirmDelete = async () => {
        try {
            const DELETE_URL = `/users/${deleteUser.id}`;

            const response = await axiosPrivate.delete(DELETE_URL, {
                signal: newAbortSignal(5000),
            });
            setUsers(users.filter((user) => user.uid !== deleteUser.id));
            console.log(response.data);
        } catch (err) {
            console.log(err);
        }
        setDeleteUser({});
        handleClose();
    };

    const handleEditUser = (u) => {
        // Set the current user to be edited
        // Show the Modal
        setEditUser({
            id: u.uid,
            username: u.username,
        });
        setShowEdit(true);
    };

    const handleConfirmEdit = async () => {
        try {
            const UPDATE_URL = `/users/${editUser.id}`;

            let PAYLOAD = {
                User: 1500,
            };
            if (newRoles.includes('editor')) {
                PAYLOAD['Editor'] = 1999;
            }
            if (newRoles.includes('admin')) {
                PAYLOAD['Admin'] = 2600;
            }

            console.log(PAYLOAD);

            const response = await axiosPrivate.put(UPDATE_URL, PAYLOAD, {
                signal: newAbortSignal(5000),
            });
            console.log(response);
            // TODO: Update the user in state to have the correct new roles
        } catch (err) {
            console.log(err);
        }
        setEditUser({});
        setNewRoles({});
        handleClose();
    };

    const handleClose = () => {
        setShowDelete(false);
        setShowEdit(false);
    };

    const updateRoles = (role) => {
        if (newRoles.includes(role)) {
            // If the role is already in the array, then remove it
            setNewRoles(newRoles.filter((n) => n !== role));
        } else {
            // If the role isn't in the array, then add it
            setNewRoles([...newRoles, role]);
        }
    };

    return (
        <article>
            <Modal show={showDelete} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete User</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete user: {deleteUser.username}?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleConfirmDelete}>
                        DELETE
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showEdit} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Update User Priviledges</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Select the new roles {editUser.username} should have: <br />
                    <form>
                        <div className="inline-flex align-middle">
                            <input
                                className="me-3"
                                id="editor"
                                type="checkbox"
                                onChange={() => updateRoles('editor')}
                            />
                            <label htmlFor="editor">Editor</label>
                        </div>
                        <div className="inline-flex align-middle">
                            <input className="me-3" id="admin" type="checkbox" onChange={() => updateRoles('admin')} />
                            <label htmlFor="admin">Admin</label>
                        </div>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleConfirmEdit}>
                        Update Roles
                    </Button>
                </Modal.Footer>
            </Modal>
            <h3 className="my-2">User List</h3>
            {users?.length ? (
                <Table bordered striped hover>
                    <thead className="dashboard-table-head">
                        <tr>
                            <th>#</th>
                            <th>User</th>
                            <th>Last Login</th>
                            <th>Privileges</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, i) => (
                            <tr key={user.uid}>
                                <td className="align-middle">{i + 1}</td>
                                <td className="align-middle">{user?.username}</td>
                                <td className="align-middle">{getDate(user?.updatedAt)}</td>
                                <td>
                                    {getRoles(user?.roles).map((role, rid) => (
                                        <div key={rid}>
                                            {role} <br />
                                        </div>
                                    ))}
                                </td>
                                <td className="align-middle">
                                    {user?.username !== auth.username && (
                                        <>
                                            <OverlayTrigger placement="top" overlay={editTooltip}>
                                                <Pen onClick={() => handleEditUser(user)} className="mx-2 dash-edit" />
                                            </OverlayTrigger>
                                            <OverlayTrigger placement="top" overlay={deleteTooltip}>
                                                <Trash
                                                    onClick={() => handleDeleteUser(user)}
                                                    className="me-2 dash-delete"
                                                />
                                            </OverlayTrigger>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            ) : (
                <p>No users to display.</p>
            )}
        </article>
    );
};

export default Users;
