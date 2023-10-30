import { useLocation, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import {
    House as HomeIcon,
    ListUl as TracksIcon,
    CloudArrowUp as UploadIcon,
    PersonPlus as RegisterIcon,
    BoxArrowInRight as SignInIcon,
    BoxArrowRight as SignOutIcon,
} from 'react-bootstrap-icons';
import useAuth from '../hooks/useAuth';
import useLogout from '../hooks/useLogout';

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const logout = useLogout();
    const { auth } = useAuth();
    document.title = 'OmicsBase';

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <Navbar expand="lg" className="navbar fixed-top navbar-dark bg-dark">
            <Container className="ms-3">
                <span>
                    <Navbar.Brand className="align-items-center" href="/">
                        OmicsBase
                    </Navbar.Brand>
                </span>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto" defaultActiveKey={location.pathname} as="ul">
                        <Nav.Item as="li" className="d-flex">
                            <Nav.Link href="/" className="d-flex align-items-center">
                                <HomeIcon className="me-1" /> Home
                            </Nav.Link>
                        </Nav.Item>
                        {/* Always Show Home */}
                        {/* Only Show /records, /upload, /logout when signed in */}
                        {/* Only Show /register, /login when signed out */}
                        {/* Object.keys(auth).length will evaluate to a truthy value if the object has data in it */}
                        {Object.keys(auth).length ? (
                            <>
                                <Nav.Item as="li" className="d-flex">
                                    <Nav.Link href="/records" className="d-flex align-items-center">
                                        <TracksIcon className="me-1" /> All Tracks
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item as="li" className="d-flex">
                                    <Nav.Link href="/upload" className="d-flex align-items-center">
                                        <UploadIcon className="me-1" /> Upload
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item as="li" className="d-flex">
                                    <Nav.Link onClick={handleLogout} className="d-flex align-items-center">
                                        <SignOutIcon className="me-1" /> Sign Out
                                    </Nav.Link>
                                </Nav.Item>
                            </>
                        ) : (
                            <>
                                <Nav.Item as="li" className="d-flex">
                                    <Nav.Link href="/register" className="d-flex align-items-center">
                                        <RegisterIcon className="me-1" /> Register
                                    </Nav.Link>
                                </Nav.Item>

                                <Nav.Item as="li" className="d-flex">
                                    <Nav.Link href="/login" className="d-flex align-items-center">
                                        <SignInIcon className="me-1" /> Sign In
                                    </Nav.Link>
                                </Nav.Item>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;
