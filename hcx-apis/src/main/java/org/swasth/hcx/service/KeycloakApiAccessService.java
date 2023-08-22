package org.swasth.hcx.service;
import org.apache.commons.lang3.RandomStringUtils;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.swasth.common.exception.ClientException;
import javax.ws.rs.core.Response;
import java.security.SecureRandom;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class KeycloakApiAccessService {

    private static final Logger logger = LoggerFactory.getLogger(KeycloakApiAccessService.class);
    @Value("${keycloak.base-url}")
    private String keycloakURL;
    @Value("${keycloak.admin-password}")
    private String keycloakAdminPassword;
    @Value("${keycloak.admin-user}")
    private String keycloakAdminUserName;
    @Value("${keycloak.master-realm}")
    private String keycloakMasterRealm;
    @Value("${keycloak.protocol-access-realm}")
    private String keycloackProtocolAccessRealm;
    @Value("${keycloak.admin-client-id}")
    private String keycloackClientId;
    @Value("${email.user-token-message}")
    private String userEmailMessage;
    @Value("${email.user-token-subject}")
    private String emailSub;
    @Autowired
    private EmailService emailService;

    public void addUserWithParticipant(String email, String participantCode, String name) throws ClientException {
        try (Keycloak keycloak = Keycloak.getInstance(keycloakURL, keycloakMasterRealm, keycloakAdminUserName, keycloakAdminPassword, keycloackClientId)) {
            RealmResource realmResource = keycloak.realm(keycloackProtocolAccessRealm);
            UsersResource usersResource = realmResource.users();
            String userName = String.format("%s:%s", participantCode, email);
            List<UserRepresentation> existingUsers = usersResource.search(userName);
            if (!existingUsers.isEmpty()) {
                logger.info("user name  : {} is already exists", userName);
            } else {
                String password = generateRandomPassword();
                UserRepresentation user = createUserRequest(userName, name, password);
                Response response = usersResource.create(user);
                if (response.getStatus() == 201) {
                    String message = userEmailMessage;
                    message = message.replace("NAME", name).replace("USER_ID", email).replace("PASSWORD", password).replace("PARTICIPANT_CODE", participantCode);
                    emailService.sendMail(email, emailSub, message);
                }
            }
        } catch (Exception e) {
            throw new ClientException("Unable to add user and participant record to Keycloak: " + e.getMessage());
        }
    }

    private UserRepresentation createUserRequest(String userName, String name, String password) {
        UserRepresentation user = new UserRepresentation();
        user.setUsername(userName);
        user.setFirstName(name);
        user.setEnabled(true);
        Map<String, List<String>> attributes = new HashMap<>();
        attributes.put("entity", List.of("api-access"));
        user.setAttributes(attributes);
        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue(password);
        credential.setTemporary(false);
        user.setCredentials(List.of(credential));
        return user;
    }

    private String generateRandomPassword(){
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#&*";
        SecureRandom secureRandom = new SecureRandom();
        StringBuilder password = new StringBuilder(16);
        for (int i = 0; i < 16; i++) {
            int randomIndex = secureRandom.nextInt(characters.length());
            password.append(characters.charAt(randomIndex));
        }
        return password.toString();
    }


    public void removeUserWithParticipant(String participantCode, String email) throws ClientException {
        try (Keycloak keycloak = Keycloak.getInstance(keycloakURL, keycloakMasterRealm, keycloakAdminUserName, keycloakAdminPassword, keycloackClientId)) {
            String userName = String.format("%s:%s", participantCode, email);
            RealmResource realmResource = keycloak.realm(keycloackProtocolAccessRealm);
            UsersResource usersResource = realmResource.users();
            List<UserRepresentation> existingUsers = usersResource.search(userName);
            if (existingUsers.isEmpty()) {
                return;
            }
            String userId = existingUsers.get(0).getId();
            usersResource.get(userId).remove();
        } catch (Exception e) {
            throw new ClientException(e.getMessage());
        }
    }

}