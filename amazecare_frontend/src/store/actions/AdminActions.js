
import axios from "axios"
import { API_SERVER_URL_DEV } from "../../config"
export const getAdminDoctors = (page = 0, size = 5, specialization, date) => async (dispatch) => {

    const response = await axios.get(
        `${API_SERVER_URL_DEV}/api/v1/doctors`,
        {
            params: {
                page,
                size,
                ...(specialization && { specialization }),
                ...(date && { date })
            },
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        }
    )
    

    dispatch({
        type: 'FETCH_ADMIN_DOCTORS',
        payload: response.data
    })
}

export const getAdminPatients = (page = 0, size = 5) => async (dispatch) => {

    console.log("inside patined");
    
    const response = await axios.get(
        `${API_SERVER_URL_DEV}/api/v1/patients`,
        {
            params: {
                page,
                size
            },
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        }
    )
    

    dispatch({
        type: 'FETCH_ADMIN_PATIENTS',
        payload: response.data
    })
}

export const getAdminAppointments = (page = 0, size = 10, status, fromDate, toDate) => async (dispatch) => {

    const response = await axios.get(
        `${API_SERVER_URL_DEV}/api/v1/appointments/admin`,
        {
            params: {
                page,
                size,
                ...(status && { status }),
                ...(fromDate && { fromDate }),
                ...(toDate && { toDate })
            },
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        }
    )

    dispatch({
        type: 'FETCH_ADMIN_APPOINTMENTS',
        payload: response.data
    })
}
