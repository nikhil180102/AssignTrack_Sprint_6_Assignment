package com.assignment.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "mcq_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class McqQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mcq_assignment_id", nullable = false)
    private McqAssignment mcqAssignment;
    @Column(nullable = false)
    private Integer questionNumber;

    @Column(nullable = false, length = 1000)
    private String questionText;

    @Column(nullable = false)
    private Integer marks;
    @Column(nullable = false, columnDefinition = "JSON")
    private String optionsJson;
    @Column(nullable = false, columnDefinition = "JSON")
    private String correctAnswersJson;
}
