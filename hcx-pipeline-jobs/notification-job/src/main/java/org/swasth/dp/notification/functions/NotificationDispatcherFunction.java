package org.swasth.dp.notification.functions;

import org.apache.commons.lang3.StringUtils;
import org.apache.flink.streaming.api.functions.ProcessFunction;
import org.apache.flink.util.Collector;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.Producer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.swasth.dp.core.function.DispatcherResult;
import org.swasth.dp.core.function.ErrorResponse;
import org.swasth.dp.core.util.Constants;
import org.swasth.dp.core.util.JSONUtil;
import org.swasth.dp.notification.task.NotificationConfig;
import scala.Option;

import java.util.*;

public class NotificationDispatcherFunction extends BaseNotificationFunction {

    private final Logger logger = LoggerFactory.getLogger(NotificationDispatcherFunction.class);

    public NotificationDispatcherFunction(NotificationConfig config) {
        super(config);
    }

    Producer<String, String> kafkaProducer = new KafkaProducer<>(kafkaProperties());
    @Override
    public void processElement(Map<String, Object> inputEvent, ProcessFunction<Map<String, Object>, Map<String,Object>>.Context context, Collector<Map<String,Object>> collector) throws Exception {
        Map<String,Object> actualEvent = (Map<String, Object>) inputEvent.get(Constants.INPUT_EVENT());
        List<Map<String, Object>> participantDetails = (List<Map<String, Object>>) inputEvent.get(Constants.PARTICIPANT_DETAILS());
        notificationDispatcher(participantDetails, actualEvent);
    }

    private void notificationDispatcher(List<Map<String, Object>> participantDetails, Map<String,Object> event) throws Exception {
        int successfulDispatches = 0;
        int failedDispatches = 0;
        Long expiry = getProtocolLongValue(Constants.EXPIRY(), event);
        for(Map<String,Object> participant: participantDetails) {
            String participantCode = (String) participant.get(Constants.PARTICIPANT_CODE());
            String endpointUrl = (String) participant.get(Constants.END_POINT());
            String email =  (String) participant.get(Constants.PRIMARY_EMAIL());
            if (Constants.INVALID_STATUS().contains(participant.get(Constants.STATUS()))) {
                failedDispatches = getFailedDispatches(event, failedDispatches, participantCode, getErrorResponse(Constants.ERR_INVALID_RECIPIENT(), "Recipient is blocked or inactive as per the registry", ""));
            } else if (expiry != null && isExpired(expiry)) {
                failedDispatches = getFailedDispatches(event, failedDispatches, participantCode, getErrorResponse(Constants.ERR_NOTIFICATION_EXPIRED(), "Notification is expired", ""));
            } else if (Constants.VALID_STATUS().contains(participant.get(Constants.STATUS())) && !(participantCode).contains("null") && endpointUrl != null) {
                participant.put(Constants.END_POINT(), endpointUrl + event.get(Constants.ACTION()));
                String payload = getPayload(event);
                DispatcherResult result = dispatcherUtil.dispatch(participant, payload);
                System.out.printf("Email ---------" + email);
                pushNotificationToMessageTopic(email);
                System.out.println("Recipient code: " + participantCode + " :: Dispatch status: " + result.success());
                logger.debug("Recipient code: " + participantCode + " :: Dispatch status: " + result.success());
                auditService.indexAudit(createNotificationAuditEvent(event, participantCode, createErrorMap(result.error() != null ? result.error().get() : null)));
                if(result.success()) successfulDispatches++; else failedDispatches++;
            }
        }
        int totalDispatches = successfulDispatches + failedDispatches;
        System.out.println("Total number of notifications dispatched: " + totalDispatches + " :: successful dispatches: " + successfulDispatches + " :: failed dispatches: " + failedDispatches);
        logger.debug("Total number of notifications dispatched: " + totalDispatches + " :: successful dispatches: " + successfulDispatches + " :: failed dispatches: " + failedDispatches);
    }

    private ErrorResponse getErrorResponse(String errCode, String errMsg, String errCause) {
        return new ErrorResponse(Option.apply(errCode), Option.apply(errMsg), Option.apply(errCause));
    }

    private int getFailedDispatches(Map<String, Object> event, int failedDispatches, String participantCode, ErrorResponse error) {
        failedDispatches++;
        System.out.println("Recipient code: " + participantCode + " :: Dispatch status: false");
        logger.debug("Recipient code: " + participantCode + " :: Dispatch status: false");
        auditService.indexAudit(createNotificationAuditEvent(event, participantCode, createErrorMap(error)));
        return failedDispatches;
    }

    private String getPayload(Map<String,Object> event) throws Exception {
        Map<String, Object> payload = new HashMap<>();
        payload.put(Constants.PAYLOAD(), event.get(Constants.PAYLOAD()));
        return JSONUtil.serialize(payload);
    }

    private void pushNotificationToMessageTopic(String email) throws Exception {
        System.out.println("-----pushed notification ---------");
        System.out.println("------email-----------------"+ email);
        if (!StringUtils.isEmpty(email)) {
            String emailEvent = getEmailMessageEvent("This is to test the notifications triggered to the email", "Testing Email Notification", List.of(email), new ArrayList<>(), new ArrayList<>());
            System.out.println("----email event -------" + emailEvent);
            kafkaProducer.send(new ProducerRecord<>("dev.hcx.request.message", "email", emailEvent));
            System.out.println("Email event is pushed to kafka :: " + emailEvent);
            logger.debug("Email event is pushed to kafka :: " + emailEvent);
        }
    }

    public String getEmailMessageEvent(String message, String subject, List<String> to, List<String> cc, List<String> bcc) throws Exception {
        Map<String, Object> event = new HashMap<>();
        event.put("eid", "MESSAGE");
        event.put("mid", UUID.randomUUID());
        event.put("ets", System.currentTimeMillis());
        event.put("channel", "email");
        event.put("subject", subject);
        event.put("message", message);
        Map<String, Object> recipients = new HashMap<>();
        recipients.put("to", to);
        recipients.put("cc", cc);
        recipients.put("bcc", bcc);
        event.put("recipients", recipients);
        return JSONUtil.serialize(event);
    }

    public Properties kafkaProperties(){
        String kafkaBootstrapServers = "kafka.kafka.svc.cluster.local:9092";  // Replace with your Kafka bootstrap servers
        Properties kafkaProperties = new Properties();
        kafkaProperties.put("bootstrap.servers", kafkaBootstrapServers);
        kafkaProperties.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
        kafkaProperties.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");
        return kafkaProperties;
    }
}
