import Header from './Header';
import Users from './Users';

const Admin = () => {
    return (
        <>
            <Header />
            <main className="container-fluid d-flex flex-grow-1 flex-column justify-content-start p-5">
                <div className="callout callout-info ps-5 pe-5">
                    <Users />
                    <br />
                </div>
            </main>
        </>
    );
};

export default Admin;
