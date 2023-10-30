import { useNavigate, Link } from 'react-router-dom';
import Header from './Header';
import { Container } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import useAuth from '../hooks/useAuth';

const Home = () => {
    const { auth } = useAuth();

    return (
        <div id="ob-wrap">
            <Header />
            <main className="p-0">
                <Container className="jumbotron text-center p-5 m-0 min-vw-100">
                    <h1>Welcome to OmicsBase</h1>
                    <p>
                        This is a repository of file locations and details for
                        the Lai Lab at Memorial Sloan Kettering
                    </p>
                    {Object.keys(auth).length ? (
                        <></>
                    ) : (
                        <>
                            <Button
                                className="me-3"
                                variant="primary"
                                href="/login"
                            >
                                Sign In
                            </Button>{' '}
                            <Button variant="primary" href="/register">
                                Register
                            </Button>{' '}
                        </>
                    )}
                </Container>
            </main>
        </div>
    );
};

export default Home;
