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
package org.graylog.testing.utils;

import io.restassured.specification.RequestSpecification;
import org.graylog.plugins.views.search.rest.MappedFieldTypeDTO;
import org.graylog.testing.backenddriver.SearchDriver;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.function.Consumer;
import java.util.stream.Collectors;

public final class SearchUtils {

    private SearchUtils() {
    }

    public static List<String> searchForAllMessages(RequestSpecification requestSpecification) {
        List<String> messages = new ArrayList<>();

        WaitUtils.waitFor(() -> captureMessages(messages::addAll, requestSpecification), "Timed out waiting for messages to be present");

        return messages;
    }

    public static boolean waitForMessage(RequestSpecification requestSpecification, String message) {
        WaitUtils.waitFor(() -> captureMessage(requestSpecification, message), "Timed out waiting for message to be present");
        return true;
    }

    private static boolean captureMessage(RequestSpecification requestSpecification, String message) {
        return SearchDriver.searchAllMessages(requestSpecification).contains(message);
    }

    private static boolean captureMessages(Consumer<List<String>> messagesCaptor,
                                           RequestSpecification requestSpecification) {
        List<String> messages = SearchDriver.searchAllMessages(requestSpecification);
        if (!messages.isEmpty()) {
            messagesCaptor.accept(messages);
            return true;
        }
        return false;
    }

    public static Set<MappedFieldTypeDTO> waitForFieldTypeDefinitions(RequestSpecification requestSpecification, String... fieldName) {
        final Set<String> expectedFields = Arrays.stream(fieldName).collect(Collectors.toSet());
        return WaitUtils.waitForObject(() -> {
            final List<MappedFieldTypeDTO> knownTypes = SearchDriver.getFieldTypes(requestSpecification);
            final Set<MappedFieldTypeDTO> filtered = knownTypes.stream().filter(t -> expectedFields.contains(t.name())).collect(Collectors.toSet());
            if (filtered.size() == expectedFields.size()) {
                return Optional.of(filtered);
            } else {
                return Optional.empty();
            }
        }, "Timed out waiting for field definition");
    }
}
