import { Link } from 'react-router-dom';
import Header from './Header';
import { Container } from 'react-bootstrap';
import useAuth from '../hooks/useAuth';

const Home = () => {
    const { auth } = useAuth();

    return (
        <div id="ob-wrap">
            <Header />
            <main className="p-0">
                <Container className="jumbotron text-center p-5 m-0 min-vw-100">
                    <h1 className="mt-5">Welcome to the FLai Lab Database</h1>
                    <p>
                        This is a repository of file locations and details for the Lai Lab at Memorial Sloan Kettering
                    </p>
                    {Object.keys(auth).length ? (
                        <></>
                    ) : (
                        <>
                            <Link to="/login" className="me-3 btn btn-primary" role="button">
                                Sign In
                            </Link>
                            <Link to="/register" className="btn btn-primary" role="button">
                                Register
                            </Link>
                        </>
                    )}
                </Container>
            </main>
        </div>
    );
};

export default Home;
