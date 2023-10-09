package org.swasth.hcx.models;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.*;

@SpringBootTest(classes = { Participant.class })
public class ParticipantTests {

    @Test
    void generate_participant_code_with_payor_role() {
        Participant participant = new Participant(getPayorRequestBody(),getSpecificProviderRoles());
        System.out.println(participant.getParticipantName());
        String code = participant.generateCode("_", "swasth-hcx");
        System.out.println(code);
        Assertions.assertTrue(code.contains("payr_rakshi"));
    }

    @Test
    void generate_participant_code_with_provider_role() {
        Participant participant = new Participant(getProviderRequestBody(), getSpecificProviderRoles());
        String code = participant.generateCode("_", "swasth-hcx");
        Assertions.assertEquals("hosp_rakshi_012345@swasth-hcx", code);
    }

    private List<String> getSpecificProviderRoles() {
        return List.of("provider.hospital", "provider.clinic", "provider.practitioner",
                "provider.diagnostics", "provider.pharmacy");
    }

    private Map<String,Object> getPayorRequestBody() {
        Map<String, Object> obj = new HashMap<>();
        obj.put("participant_name", "Rakshith Insurance");
        obj.put("primary_mobile", "9493347239");
        obj.put("primary_email", "rakshith123@gmail.com");
        obj.put("roles", new ArrayList<>(Collections.singleton("payor")));
        obj.put("scheme_code", "default");
        obj.put("address", new HashMap<>() {{
            put("plot", "5-4-199");
            put("street", "road no 12");
            put("landmark", "");
            put("village", "Nampally");
            put("district", "Hyd");
            put("state", "Telangana");
            put("pincode", "500805");
        }});
        obj.put("phone", new ArrayList<>(Collections.singleton("040-387658992")));
        obj.put("status", "Created");
        obj.put("endpoint_url", "http://localhost:8095");
        obj.put("payment_details", new HashMap<>() {{
            put("account_number", "4707890099809809");
            put("ifsc_code", "ICICLE");
        }});
        obj.put("signing_cert_path", "urn:isbn:0-476-27557-4");
        obj.put("linked_registry_codes", new ArrayList<>(Collections.singleton("22344")));
        obj.put("encryption_cert", "urn:isbn:0-4234");
        return obj;
    }

    private Map<String,Object> getProviderRequestBody() {
        Map<String, Object> obj = new HashMap<>();
        obj.put("participant_name", "Rakshith Hospital");
        obj.put("primary_mobile", "9493347239");
        obj.put("primary_email", "rakshith123@gmail.com");
        obj.put("roles", new ArrayList<>(Collections.singleton("provider")));
        obj.put("applicant_code", "012345");
        obj.put("address", new HashMap<>() {{
            put("plot", "5-4-199");
            put("street", "road no 12");
            put("landmark", "");
            put("village", "Nampally");
            put("district", "Hyd");
            put("state", "Telangana");
            put("pincode", "500805");
        }});
        obj.put("phone", new ArrayList<>(Collections.singleton("040-387658992")));
        obj.put("status", "Created");
        obj.put("endpoint_url", "http://localhost:8095");
        obj.put("payment_details", new HashMap<>() {{
            put("account_number", "4707890099809809");
            put("ifsc_code", "ICICLE");
        }});
        obj.put("signing_cert_path", "urn:isbn:0-476-27557-4");
        obj.put("linked_registry_codes", new ArrayList<>(Collections.singleton("22344")));
        obj.put("encryption_cert", "urn:isbn:0-4234");
        return obj;
    }
}
