import axios from 'axios';


// FIXME: for some reason, axios instance doesn't work
// const baseBackendRequest = axios.create({
//     baseURL: process.env.REACT_APP_BASE_URL | 'http://localhost:5000/',
//     headers: {
//         Accept: 'application/json',
//     },
// });

export async function getLoans() {
    try {
        const res = await axios.get('http://localhost:5000/getloans');
        return res.data.loans;
    } catch (e) {
        console.error(e);
    }
}
