package com.library.lms.aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

/**
 * Cross-cutting logging aspect that records all successful
 * write operations (create/update/delete) performed through
 * the service layer for audit and traceability purposes.
 */
@Aspect
@Component
@Slf4j
public class AuditAspect {

    @AfterReturning(pointcut = "execution(* com.library.lms.service.impl.*.create*(..)) || " +
            "execution(* com.library.lms.service.impl.*.update*(..)) || " +
            "execution(* com.library.lms.service.impl.*.delete*(..)) || " +
            "execution(* com.library.lms.service.impl.*.issue*(..)) || " +
            "execution(* com.library.lms.service.impl.*.return*(..))",
            returning = "result")
    public void logAfterWrite(JoinPoint joinPoint, Object result) {
        log.info("[AUDIT-AOP] Method '{}' executed successfully by class '{}'",
                joinPoint.getSignature().getName(),
                joinPoint.getTarget().getClass().getSimpleName());
    }
}
