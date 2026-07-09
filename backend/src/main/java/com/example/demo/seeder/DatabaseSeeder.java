package com.example.demo.seeder;

import com.example.demo.model.*;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.repository.ProjectRepository;
import com.example.demo.repository.TaskRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Collections;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            System.out.println("Seeding database with demo data...");

            // 1. Create Users
            User admin = User.builder()
                    .email("usuario@fumilar.co.mz")
                    .password(passwordEncoder.encode("password"))
                    .fullName("Utilizador Demo")
                    .role("admin")
                    .status(UserStatus.ACTIVE)
                    .build();

            User member = User.builder()
                    .email("colaborador@fumilar.co.mz")
                    .password(passwordEncoder.encode("password"))
                    .fullName("Membro da Equipa")
                    .role("member")
                    .status(UserStatus.ACTIVE)
                    .build();

            userRepository.save(admin);
            userRepository.save(member);

            // 2. Create Project
            Project project = Project.builder()
                    .name("Plataforma CyberCore")
                    .description("Desenvolvimento do sistema de gestão de projectos e tarefas corporativo.")
                    .status(ProjectStatus.ACTIVE)
                    .responsible(admin.getEmail())
                    .startDate("2026-07-01")
                    .dueDate("2026-12-31")
                    .members(Arrays.asList(admin.getEmail(), member.getEmail()))
                    .createdBy(admin.getEmail())
                    .updatedBy(admin.getEmail())
                    .build();

            projectRepository.save(project);

            // 3. Create Tasks
            Task task1 = Task.builder()
                    .projectId(project.getId())
                    .name("Definir Arquitetura do Sistema")
                    .description("Definição de pacotes do Spring Boot, JPA, e JWT.")
                    .assignee(admin.getEmail())
                    .priority(TaskPriority.CRITICAL_PRIORITY)
                    .status(TaskStatus.DONE)
                    .dueDate("2026-07-15")
                    .createdBy(admin.getEmail())
                    .updatedBy(admin.getEmail())
                    .build();

            Task task2 = Task.builder()
                    .projectId(project.getId())
                    .name("Implementar API de Autenticação")
                    .description("Configuração de Spring Security e filtros JWT.")
                    .assignee(admin.getEmail())
                    .priority(TaskPriority.HIGH_PRIORITY)
                    .status(TaskStatus.IN_PROGRESS)
                    .dueDate("2026-07-30")
                    .createdBy(admin.getEmail())
                    .updatedBy(admin.getEmail())
                    .build();

            Task task3 = Task.builder()
                    .projectId(project.getId())
                    .name("Construir Painel Front-end")
                    .description("Desenho de componentes do dashboard do Next.js.")
                    .assignee(member.getEmail())
                    .priority(TaskPriority.MEDIUM_PRIORITY)
                    .status(TaskStatus.TODO)
                    .dueDate("2026-08-15")
                    .createdBy(admin.getEmail())
                    .updatedBy(admin.getEmail())
                    .build();

            taskRepository.save(task1);
            taskRepository.save(task2);
            taskRepository.save(task3);

            // 4. Create Notifications
            Notification notif1 = Notification.builder()
                    .userId(admin.getEmail())
                    .type("welcome")
                    .title("Bem-vindo ao CyberCore")
                    .message("O seu espaço de trabalho foi configurado e está pronto para uso.")
                    .read(false)
                    .build();

            Notification notif2 = Notification.builder()
                    .userId(admin.getEmail())
                    .type("task_assigned")
                    .title("Nova tarefa atribuída")
                    .message("Você foi designado para a tarefa 'Definir Arquitetura do Sistema'.")
                    .read(true)
                    .build();

            notificationRepository.save(notif1);
            notificationRepository.save(notif2);

            System.out.println("Demo database seeded successfully!");
        }
    }
}
