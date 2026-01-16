package com.du.gis_project.domain.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "population")
public class Population {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "gu")
    private String gu;

    @Column(name = "dong")
    private String dong;

    @Column(name = "lat")
    private Double lat;

    @Column(name = "lng")
    private Double lng;

    @Column(name = "total_pop")
    private Integer totalPop;

    @Column(name = "male_pop")
    private Integer malePop;

    @Column(name = "female_pop")
    private Integer femalePop;

    @Column(name = "over19_total")
    private Integer over19Total;

    @Column(name = "over65_total")
    private Integer over65Total;

    @Column(name = "households")
    private Integer households;

    @Column(name = "foreigners")
    private Integer foreigners;

    @Column(name = "data_date")
    private LocalDate dataDate;

    // ===== Getter / Setter =====
    public Integer getId() { return id; }
    public String getGu() { return gu; }
    public String getDong() { return dong; }
    public Double getLat() { return lat; }
    public Double getLng() { return lng; }
    public Integer getTotalPop() { return totalPop; }
    public Integer getMalePop() { return malePop; }
    public Integer getFemalePop() { return femalePop; }
    public Integer getOver19Total() { return over19Total; }
    public Integer getOver65Total() { return over65Total; }
    public Integer getHouseholds() { return households; }
    public Integer getForeigners() { return foreigners; }
    public LocalDate getDataDate() { return dataDate; }
}
