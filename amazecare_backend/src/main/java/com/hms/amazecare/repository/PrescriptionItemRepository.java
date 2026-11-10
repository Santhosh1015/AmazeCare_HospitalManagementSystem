package com.hms.amazecare.repository;

import com.hms.amazecare.dto.response.PrescribedItemResDto;
import com.hms.amazecare.model.PrescriptionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PrescriptionItemRepository extends JpaRepository<PrescriptionItem, Long> {
   @Query("""
           select pi
           from PrescriptionItem pi
           where pi.prescription.id = ?1
           """)
   List<PrescriptionItem> fetchPrescribedDataById(Long prescriptionId);
}
