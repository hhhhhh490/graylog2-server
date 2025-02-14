/*
 * Copyright (C) 2020 Graylog, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Server Side Public License, version 1,
 * as published by MongoDB, Inc.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Server Side Public License for more details.
 *
 * You should have received a copy of the Server Side Public License
 * along with this program. If not, see
 * <http://www.mongodb.com/licensing/server-side-public-license>.
 */
package org.graylog.plugins.views.search.searchtypes.pivot.buckets;

import org.graylog.plugins.views.search.searchtypes.pivot.BucketSpec;

import java.util.Comparator;
import java.util.List;

public class ValuesBucketComparator<T extends BucketSpec> implements Comparator<T> {
    private final List<String> sortFields;

    public ValuesBucketComparator(List<String> sortFields) {
        this.sortFields = sortFields;
    }

    @Override
    public int compare(T s1, T s2) {
        if (sortFields.isEmpty()) {
            return 0;
        }
        int s1Index = sortFields.indexOf(s1.field());
        int s2Index = sortFields.indexOf(s2.field());
        if (s1Index == s2Index) {
            return 0;
        }
        if (s1Index == -1) {
            return 1;
        }
        if (s2Index == -1) {
            return -1;
        }
        return Integer.compare(s1Index, s2Index);
    }
}
