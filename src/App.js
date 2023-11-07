import Register from './components/Register';
import Login from './components/Login';
import Admin from './components/Admin';
import Missing from './components/Missing';
import Unauthorized from './components/Unauthorized';
import Home from './components/Home';
import AllTracks from './components/AllTracks';
import RequireAuth from './components/RequireAuth';
import PersistLogin from './components/PersistLogin';
import ValidateEmail from './components/ValidateEmail';

import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Upload from './components/Upload';
import Reset from './components/Reset';
import ResetLink from './components/ResetLink';

// todo consider not including these codes here so people can't infer info from it
const ROLES = {
    User: 1500,
    Editor: 1999,
    Admin: 2600,
};

function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route element={<PersistLogin />}>
                    {/* public routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="reset" element={<Reset />} />
                    <Route path="reset/:id/:token" element={<ResetLink />} />
                    <Route path="verify-email/:id/:token" element={<ValidateEmail />} />
                    <Route path="unauthorized" element={<Unauthorized />} />

                    {/* private routes */}
                    <Route element={<RequireAuth allowedRoles={[ROLES.User]} />}>
                        <Route path="/records" element={<AllTracks />} />
                    </Route>
                    <Route element={<RequireAuth allowedRoles={[ROLES.Editor]} />}></Route>
                    <Route element={<RequireAuth allowedRoles={[ROLES.Admin]} />}>
                        <Route path="/admin" element={<Admin />} />
                    </Route>
                    <Route element={<RequireAuth allowedRoles={[ROLES.Editor, ROLES.Admin]} />}>
                        <Route path="/upload" element={<Upload />} />
                    </Route>
                </Route>

                {/* catch all */}
                <Route path="*" element={<Missing />} />
            </Route>
        </Routes>
    );
}

export default App;
