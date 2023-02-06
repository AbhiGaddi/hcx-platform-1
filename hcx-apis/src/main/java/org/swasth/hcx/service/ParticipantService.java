package org.swasth.hcx.service;

import kong.unirest.HttpResponse;
import org.apache.commons.validator.routines.EmailValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.swasth.ICloudService;
import org.swasth.common.dto.ParticipantResponse;
import org.swasth.common.dto.Response;
import org.swasth.common.dto.Sponsor;
import org.swasth.common.exception.*;
import org.swasth.common.utils.HttpUtils;
import org.swasth.common.utils.JSONUtils;
import org.swasth.common.utils.JWTUtils;
import org.swasth.hcx.controllers.BaseController;
import org.swasth.postgresql.IDatabaseService;
import org.swasth.redis.cache.RedisCache;

import java.io.IOException;
import java.security.cert.CertificateException;
import java.sql.ResultSet;
import java.text.MessageFormat;
import java.util.*;
import java.util.stream.Collectors;

import static org.swasth.common.response.ResponseMessage.*;
import static org.swasth.common.utils.Constants.*;

@Service
public class ParticipantService extends BaseController {
    @Value("${certificates.bucketName}")
    private String bucketName;

    @Value("${postgres.onboardingOtpTable}")
    private String onboardOtpTable;

    @Value("${postgres.onboardingTable}")
    private String onboardingTable;

    @Autowired
    protected IDatabaseService postgreSQLClient;
    @Autowired
    private JWTUtils jwtUtils;
    @Autowired
    private ICloudService cloudClient;
    @Autowired
    private RedisCache redisCache;

    public ResponseEntity<Object> invite(Map<String, Object> requestBody, String registryUrl, HttpHeaders header, String participantCode) throws Exception {
        String url = registryUrl + "/api/v1/Organisation/invite";
        Map<String, String> headersMap = new HashMap<>();
        headersMap.put(AUTHORIZATION, Objects.requireNonNull(header.get(AUTHORIZATION)).get(0));
        HttpResponse<String> response = HttpUtils.post(url, JSONUtils.serialize(requestBody), headersMap);
        if (response.getStatus() == 200) {
            Map<String, Object> cdata = new HashMap<>();
            cdata.put(ACTION, PARTICIPANT_CREATE);
            cdata.putAll(requestBody);
            eventHandler.createAudit(eventGenerator.createAuditLog(participantCode, PARTICIPANT, cdata,
                    getEData(CREATED, "", Collections.emptyList())));
        }
        return responseHandler(response, participantCode);
    }

    public ResponseEntity<Object> update(Map<String, Object> requestBody, Map<String, Object> participant, String registryUrl, HttpHeaders header, String participantCode) throws Exception {
        String url = registryUrl + "/api/v1/Organisation/" + participant.get(OSID);
        Map<String, String> headersMap = new HashMap<>();
        headersMap.put(AUTHORIZATION, Objects.requireNonNull(header.get(AUTHORIZATION)).get(0));
        HttpResponse<String> response = HttpUtils.put(url, JSONUtils.serialize(requestBody), headersMap);
        if (response.getStatus() == 200) {
            deleteCache(participantCode);
        }
        return responseHandler(response, participantCode);
    }

    public ResponseEntity<Object> search(Map<String, Object> requestBody, String registryUrl, String fields) throws Exception {
        String url = registryUrl + "/api/v1/Organisation/search";
        HttpResponse<String> response = HttpUtils.post(url, JSONUtils.serialize(requestBody), new HashMap<>());
        if (fields != null && fields.toLowerCase().contains(SPONSORS)) {
            ArrayList<Map<String, Object>> participantsList = JSONUtils.deserialize(response.getBody(), ArrayList.class);
            return getSponsors(participantsList);
        }
        return responseHandler(response, null);
    }
    public  ResponseEntity<Object> participantSearchBody(String participantCode, String registryUrl) throws Exception {
        return search(JSONUtils.deserialize("{ \"filters\": { \"participant_code\": { \"eq\": \" " + participantCode + "\" } } }", Map.class),registryUrl,"");
    }
    public ResponseEntity<Object> read(String fields, String participantCode, String registryUrl, String pathParam) throws Exception {
        Map<String, Object> searchReq = JSONUtils.deserialize("{ \"filters\": { \"participant_code\": { \"eq\": \" " + participantCode + "\" } } }", Map.class);
        ResponseEntity<Object> response = search(searchReq, registryUrl, pathParam);
        ParticipantResponse searchResp = (ParticipantResponse) response.getBody();
        if (fields != null && fields.toLowerCase().contains(VERIFICATIONSTATUS) && searchResp != null) {
            ((Map<String, Object>) searchResp.getParticipants().get(0)).putAll(getVerificationStatus(participantCode));
        }
        return getSuccessResponse(searchResp);
    }

    public ResponseEntity<Object> delete(Map<String, Object> participant, String registryUrl, HttpHeaders header, String participantCode) throws Exception {
        String url = registryUrl + "/api/v1/Organisation/" + participant.get(OSID);
        Map<String, String> headersMap = new HashMap<>();
        headersMap.put(AUTHORIZATION, Objects.requireNonNull(header.get(AUTHORIZATION)).get(0));
        HttpResponse<String> response = HttpUtils.delete(url, headersMap);
        if (response.getStatus() == 200) {
            deleteCache(participantCode);
            Map<String, Object> cdata = new HashMap<>();
            cdata.put(ACTION, PARTICIPANT_DELETE);
            cdata.putAll(participant);
            eventHandler.createAudit(eventGenerator.createAuditLog(participantCode, PARTICIPANT, cdata,
                    getEData(INACTIVE, (String) participant.get(AUDIT_STATUS), Collections.emptyList())));
        }
        return responseHandler(response, participantCode);
    }

    public void getCertificates(Map<String, Object> requestBody, String participantCode, String key) {
        if (requestBody.getOrDefault(key, "").toString().startsWith("-----BEGIN CERTIFICATE-----") && requestBody.getOrDefault(key, "").toString().endsWith("-----END CERTIFICATE-----")) {
            String certificateData = requestBody.getOrDefault(key, "").toString().replace(" ", "\n").replace("-----BEGIN\nCERTIFICATE-----", "-----BEGIN CERTIFICATE-----").replace("-----END\nCERTIFICATE-----", "-----END CERTIFICATE-----");
            cloudClient.putObject(participantCode, bucketName);
            cloudClient.putObject(bucketName, participantCode + "/signing_cert_path.pem", certificateData);
            cloudClient.putObject(bucketName, participantCode + "/encryption_cert_path.pem", certificateData);
            requestBody.put(SIGNING_CERT_PATH, cloudClient.getUrl(bucketName, participantCode + "/signing_cert_path.pem").toString());
            requestBody.put(ENCRYPTION_CERT, cloudClient.getUrl(bucketName, participantCode + "/encryption_cert_path.pem").toString());
        }
    }

    public Map<String, Object> getVerificationStatus(String participantCode) throws Exception {
        String selectQuery = String.format("SELECT status FROM %s WHERE participant_code ='%s'", onboardOtpTable, participantCode);
        ResultSet resultSet = (ResultSet) postgreSQLClient.executeQuery(selectQuery);
        Map<String, Object> responseMap = new HashMap<>();
        while (resultSet.next()) {
            responseMap.put(FORMSTATUS, resultSet.getString("status"));
        }
        return Collections.singletonMap(VERIFICATIONSTATUS, responseMap);
    }

    public ResponseEntity<Object> getSponsors(List<Map<String, Object>> participantsList) throws Exception {
        String primaryEmailList = participantsList.stream().map(participant -> participant.get(PRIMARY_EMAIL)).collect(Collectors.toList()).toString();
        String primaryEmailWithQuote = getPrimaryEmailWithQuote(primaryEmailList);
        String selectQuery = String.format("SELECT * FROM %S WHERE applicant_email IN (%s)",onboardingTable,primaryEmailWithQuote);
        ResultSet resultSet = (ResultSet) postgreSQLClient.executeQuery(selectQuery);
        Map<String, Object> sponsorMap = new HashMap<>();
        while (resultSet.next()) {
            Sponsor sponsorResponse = new Sponsor(resultSet.getString("applicant_email"), resultSet.getString(APPLICANT_CODE), resultSet.getString(SPONSOR_CODE), resultSet.getString(FORMSTATUS), resultSet.getLong("createdon"), resultSet.getLong("updatedon"));
            sponsorMap.put(resultSet.getString("applicant_email"), sponsorResponse);
        }
        ArrayList<Object> modifiedResponseList = new ArrayList<>();
        filterSponsors(sponsorMap, participantsList, modifiedResponseList);
        return getSuccessResponse(new ParticipantResponse(modifiedResponseList));
    }

    private static String getPrimaryEmailWithQuote(String primaryEmailList) {
        return "'" + primaryEmailList.replace("[", "").replace("]", "").replace(" ", "").replace(",", "','") + "'";
    }

    private static void filterSponsors(Map<String, Object> sponsorMap, List<Map<String, Object>> participantsList, ArrayList<Object> modifiedResponseList) {
        for (Map<String, Object> responseList : participantsList) {
            String email = (String) responseList.get(PRIMARY_EMAIL);
            if (sponsorMap.containsKey(email)) {
                responseList.put(SPONSORS, Collections.singletonList(sponsorMap.get(email)));
            } else {
                responseList.put(SPONSORS, new ArrayList<>());
            }
            modifiedResponseList.add(responseList);
        }
    }
    public static ResponseEntity<Object> getSuccessResponse(Object response) {
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    private static String getErrorMessage(HttpResponse<String> response) throws Exception {
        Map<String, Object> result = JSONUtils.deserialize(response.getBody(), HashMap.class);
        return (String) ((Map<String, Object>) result.get("params")).get("errmsg");
    }

    public void validateUpdateParticipant(Map<String, Object> requestBody) throws ClientException, CertificateException, IOException {
        List<String> notAllowedUrls = env.getProperty(HCX_NOT_ALLOWED_URLS, List.class, new ArrayList<String>());
        if (notAllowedUrls.contains(requestBody.getOrDefault(ENDPOINT_URL, "")))
            throw new ClientException(ErrorCodes.ERR_INVALID_PAYLOAD, INVALID_END_POINT);
        if (requestBody.containsKey(ENCRYPTION_CERT))
            requestBody.put(ENCRYPTION_CERT_EXPIRY, jwtUtils.getCertificateExpiry((String) requestBody.get(ENCRYPTION_CERT)));
        if (requestBody.containsKey(SIGNING_CERT_PATH))
            requestBody.put(SIGNING_CERT_PATH_EXPIRY, jwtUtils.getCertificateExpiry((String) requestBody.get(SIGNING_CERT_PATH)));
    }

    public void validateCertificates(Map<String, Object> requestBody) throws ClientException, CertificateException, IOException {
        if (!requestBody.containsKey(ENCRYPTION_CERT) || !(requestBody.get(ENCRYPTION_CERT) instanceof String))
            throw new ClientException(ErrorCodes.ERR_INVALID_PARTICIPANT_DETAILS, INVALID_ENCRYPTION_CERT);
        else if (!requestBody.containsKey(SIGNING_CERT_PATH) || !(requestBody.get(SIGNING_CERT_PATH) instanceof String))
            throw new ClientException(ErrorCodes.ERR_INVALID_PARTICIPANT_DETAILS, INVALID_SIGNING_CERT_PATH);
        requestBody.put(ENCRYPTION_CERT_EXPIRY, jwtUtils.getCertificateExpiry((String) requestBody.get(ENCRYPTION_CERT)));
        requestBody.put(SIGNING_CERT_PATH_EXPIRY, jwtUtils.getCertificateExpiry((String) requestBody.get(SIGNING_CERT_PATH)));
    }

    public ResponseEntity<Object> responseHandler(HttpResponse<String> response, String participantCode) throws Exception {
        if (response.getStatus() == HttpStatus.OK.value()) {
            if (response.getBody().isEmpty()) {
                return getSuccessResponse("");
            } else {
                if (response.getBody().startsWith("["))
                    return getSuccessResponse(new ParticipantResponse(JSONUtils.deserialize(response.getBody(), ArrayList.class)));
                else
                    return getSuccessResponse(new ParticipantResponse(participantCode));
            }
        } else if (response.getStatus() == HttpStatus.BAD_REQUEST.value()) {
            throw new ClientException(getErrorMessage(response));
        } else if (response.getStatus() == HttpStatus.UNAUTHORIZED.value()) {
            throw new AuthorizationException(getErrorMessage(response));
        } else if (response.getStatus() == HttpStatus.NOT_FOUND.value()) {
            throw new ResourceNotFoundException(getErrorMessage(response));
        } else {
            throw new ServerException(getErrorMessage(response));
        }
    }

    public void deleteCache(String participantCode) throws Exception {
        if (redisCache.isExists(participantCode))
            redisCache.delete(participantCode);
    }

    public Map<String, Object> getEData(String status, String prevStatus, List<String> props) {
        Map<String, Object> data = new HashMap<>();
        data.put(AUDIT_STATUS, status);
        data.put(PREV_STATUS, prevStatus);
        if (!props.isEmpty())
            data.put(PROPS, props);
        return data;
    }

    public void validateCreateParticipant(Map<String, Object> requestBody) throws ClientException {
        List<String> notAllowedUrls = env.getProperty(HCX_NOT_ALLOWED_URLS, List.class, new ArrayList<String>());
        if (!requestBody.containsKey(ROLES) || !(requestBody.get(ROLES) instanceof ArrayList) || ((ArrayList<String>) requestBody.get(ROLES)).isEmpty())
            throw new ClientException(ErrorCodes.ERR_INVALID_PARTICIPANT_DETAILS, INVALID_ROLES_PROPERTY);
        else if (((ArrayList<String>) requestBody.get(ROLES)).contains(PAYOR) && !requestBody.containsKey(SCHEME_CODE))
            throw new ClientException(ErrorCodes.ERR_INVALID_PARTICIPANT_DETAILS, MISSING_SCHEME_CODE);
        else if (!((ArrayList<String>) requestBody.get(ROLES)).contains(PAYOR) && requestBody.containsKey(SCHEME_CODE))
            throw new ClientException(ErrorCodes.ERR_INVALID_PARTICIPANT_DETAILS, UNKNOWN_PROPERTY);
        else if (notAllowedUrls.contains(requestBody.get(ENDPOINT_URL)))
            throw new ClientException(ErrorCodes.ERR_INVALID_PAYLOAD, INVALID_END_POINT);
        else if (!requestBody.containsKey(PRIMARY_EMAIL) || !(requestBody.get(PRIMARY_EMAIL) instanceof String)
                || !EmailValidator.getInstance().isValid((String) requestBody.get(PRIMARY_EMAIL)))
            throw new ClientException(ErrorCodes.ERR_INVALID_PARTICIPANT_DETAILS, INVALID_EMAIL);
    }

    public void getCertificatesUrl(Map<String, Object> requestBody, String participantCode) {
        getCertificates(requestBody, participantCode, SIGNING_CERT_PATH);
        getCertificates(requestBody, participantCode, ENCRYPTION_CERT);
    }

    public boolean isParticipantCodeExists(String participantCode, String registryUrl) throws Exception {
        ResponseEntity<Object> searchResponse = participantSearchBody(participantCode,registryUrl);
        Object responseBody = searchResponse.getBody();
        if (responseBody != null) {
            if (responseBody instanceof Response) {
                Response response = (Response) responseBody;
                throw new ServerException(MessageFormat.format(PARTICIPANT_ERROR_MSG, response.getError().getMessage()));
            } else {
                ParticipantResponse participantResponse = (ParticipantResponse) responseBody;
                return !participantResponse.getParticipants().isEmpty();
            }
        } else {
            throw new ServerException(INVALID_REGISTRY_RESPONSE);
        }
    }

    public Map<String, Object> getParticipant(String participantCode, String registryUrl) throws Exception {
        ResponseEntity<Object> searchResponse = participantSearchBody(participantCode,registryUrl);
        ParticipantResponse participantResponse = (ParticipantResponse) Objects.requireNonNull(searchResponse.getBody());
        if (participantResponse.getParticipants().isEmpty())
            throw new ClientException(ErrorCodes.ERR_INVALID_PARTICIPANT_CODE, INVALID_PARTICIPANT_CODE);
        return (Map<String, Object>) participantResponse.getParticipants().get(0);
    }

}
