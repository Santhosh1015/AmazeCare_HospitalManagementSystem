package com.hms.amazecare.repository;

import com.hms.amazecare.model.Executive;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExecutiveRepository extends JpaRepository<Executive , Long> {
}
