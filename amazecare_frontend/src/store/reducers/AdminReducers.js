
const initialState = {
    doctors: [],
    patients: [],
    appointments: []
}

function AdminReducer(state = initialState, action) {

    switch (action.type) {

        case "FETCH_ADMIN_DOCTORS":
            return {
                ...state,
                doctors: action.payload
            }

        case "FETCH_ADMIN_PATIENTS":
            return {
                ...state,
                patients: action.payload
            }

        case "FETCH_ADMIN_APPOINTMENTS":
            return {
                ...state,
                appointments: action.payload
            }
        default:
            return state
    }
}

export default AdminReducer
