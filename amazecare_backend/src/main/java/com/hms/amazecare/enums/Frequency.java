package com.hms.amazecare.enums;

import lombok.Getter;

@Getter
public enum Frequency {
    ONE_ZERO_ZERO("1-0-0"),
    ZERO_ONE_ZERO("0-1-0"),
    ZERO_ZERO_ONE("0-0-1"),
    ONE_ONE_ZERO("1-1-0"),
    ONE_ZERO_ONE("1-0-1"),
    ZERO_ONE_ONE("0-1-1"),
    ONE_ONE_ONE("1-1-1");

    private final String label;

    Frequency(String label) {
        this.label = label;
    }
}
