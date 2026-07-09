package com.example.demo.repository;

import com.example.demo.model.Task;
import com.example.demo.model.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, String> {
    @Query("SELECT t FROM Task t WHERE " +
           "(:projectId IS NULL OR t.projectId = :projectId) AND " +
           "(:assignee IS NULL OR t.assignee = :assignee) AND " +
           "(:status IS NULL OR t.status = :status)")
    Page<Task> findFilteredTasks(@Param("projectId") String projectId,
                                 @Param("assignee") String assignee,
                                 @Param("status") TaskStatus status,
                                 Pageable pageable);

    @Query("SELECT t FROM Task t WHERE " +
           "(:projectId IS NULL OR t.projectId = :projectId) AND " +
           "(:assignee IS NULL OR t.assignee = :assignee) AND " +
           "(:status IS NULL OR t.status = :status)")
    List<Task> findFilteredTasks(@Param("projectId") String projectId,
                                 @Param("assignee") String assignee,
                                 @Param("status") TaskStatus status);
}
