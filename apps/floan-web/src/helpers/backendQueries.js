import axios from 'axios';


// FIXME: for some reason, axios instance doesn't work
// const baseBackendRequest = axios.create({
//     baseURL: process.env.REACT_APP_BACKEND_BASE_URL | 'http://localhost:5000/',
//     headers: {
//         Accept: 'application/json',
//     },
// });

export async function getLoans() {
    try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_BASE_URL}/getloans`);
        return res.data.loans;
    } catch (e) {
        console.error(e);
    }
}
