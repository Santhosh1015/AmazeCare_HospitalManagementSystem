import { configureStore } from "@reduxjs/toolkit";
import PatientReducer from "./reducers/PatientReducer";
import AdminReducer from "./reducers/AdminReducers";

export const Store = configureStore({
    reducer : { 
        patientData: PatientReducer ,
        adminData: AdminReducer
    }
})