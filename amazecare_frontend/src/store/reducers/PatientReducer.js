const initialState = {
    patient: null
}

const PatientReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'FETCH_PATIENT_PROFILE':
            return {
                ...state,
                patient: action.payload
            }
        case 'UPDATE_PATIENT_PROFILE':
            return { 
                ...state,
                 patient: action.payload 
                }
                
    
        default:
            return state
    }
}
export default PatientReducer