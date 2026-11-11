import axios from "axios"
import { API_SERVER_URL_DEV } from "../../config"

export const getPatientProfile = () => async (dispatch) => {

    const response = await axios.get(
        `${API_SERVER_URL_DEV}/api/v1/patient/profile`,
        {
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        })

    dispatch({
        type: 'FETCH_PATIENT_PROFILE',
        payload: response.data
    })
}

export const updatePatientProfile = (patientId , patientUpdateDto) => async (dispatch) => {
    
    const response = await axios.put(
        `${API_SERVER_URL_DEV}/api/v1/patient/update/${patientId}`, patientUpdateDto,
        {
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        })

    dispatch({
        type: 'UPDATE_PATIENT_PROFILE',
        payload: response.data
    })
}