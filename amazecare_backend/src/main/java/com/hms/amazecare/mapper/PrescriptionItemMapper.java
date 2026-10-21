package com.hms.amazecare.mapper;

import com.hms.amazecare.dto.request.PrescribedItemsReqDto;
import com.hms.amazecare.model.Prescription;
import com.hms.amazecare.model.PrescriptionItem;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class PrescriptionItemMapper {
    public static PrescriptionItem createPrescriptionItem(@Valid PrescribedItemsReqDto prescribedItemsReqDto, Prescription prescription) {
        PrescriptionItem prescriptionItem = new PrescriptionItem();
        prescriptionItem.setMedicineName(prescribedItemsReqDto.medicineName());
        prescriptionItem.setDosage(prescribedItemsReqDto.dosage());
        prescriptionItem.setFrequency(prescribedItemsReqDto.frequency());
        prescriptionItem.setFoodTiming(prescribedItemsReqDto.foodTiming());
        prescriptionItem.setDurationDays(prescribedItemsReqDto.durationDays());
        prescriptionItem.setPrescription(prescription);
        return prescriptionItem;
    }
}
