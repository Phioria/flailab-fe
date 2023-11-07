import { Link, useLocation, useNavigate } from 'react-router-dom';
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
    // <Link to="/reset">Reset Password</Link>
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
                            <Link to="/" className="d-flex align-items-center n-link">
                                <HomeIcon className="me-1" /> Home
                            </Link>
                        </Nav.Item>
                        {/* Always Show Home */}
                        {/* Only Show /records, /upload, /logout when signed in */}
                        {/* Only Show /register, /login when signed out */}
                        {/* Object.keys(auth).length will evaluate to a truthy value if the object has data in it */}
                        {Object.keys(auth).length ? (
                            <>
                                <Nav.Item as="li" className="d-flex">
                                    <Link to="/records" className="d-flex align-items-center n-link">
                                        <TracksIcon className="me-1" /> All Tracks
                                    </Link>
                                </Nav.Item>
                                <Nav.Item as="li" className="d-flex">
                                    <Link to="/upload" className="d-flex align-items-center n-link">
                                        <UploadIcon className="me-1" /> Upload
                                    </Link>
                                </Nav.Item>
                                <Nav.Item as="li" className="d-flex">
                                    <Link onClick={handleLogout} className="d-flex align-items-center n-link">
                                        <SignOutIcon className="me-1" /> Sign Out
                                    </Link>
                                </Nav.Item>
                            </>
                        ) : (
                            <>
                                <Nav.Item as="li" className="d-flex">
                                    <Link to="/register" className="d-flex align-items-center n-link">
                                        <RegisterIcon className="me-1" /> Register
                                    </Link>
                                </Nav.Item>

                                <Nav.Item as="li" className="d-flex">
                                    <Link to="/login" className="d-flex align-items-center n-link">
                                        <SignInIcon className="me-1" /> Sign In
                                    </Link>
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
