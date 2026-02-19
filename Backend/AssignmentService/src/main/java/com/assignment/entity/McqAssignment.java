package com.assignment.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "mcq_assignments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class McqAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;
    @Column(nullable = false)
    private Integer passingPercentage;
    @Column(nullable = false)
    private Boolean showCorrectAnswers;
    @Column
    private Integer timeLimit;
}
