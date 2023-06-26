package top.oldmoon.cashbook.cloud.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import top.oldmoon.cashbook.cloud.model.Auth;
import top.oldmoon.cashbook.cloud.model.AuthInfo;
import top.oldmoon.cashbook.cloud.model.Data;
import top.oldmoon.cashbook.cloud.model.System;
import top.oldmoon.cashbook.cloud.service.OnlineService;
import top.oldmoon.cashbook.cloud.util.CommonUtils;

import java.io.IOException;
import java.security.NoSuchAlgorithmException;

/**
 * 在线同步相关接口
 *
 * @author dingdangdog
 * @since 1.0
 */
@RestController
@RequestMapping("/online")
public class OnlineController {
    Logger logger = LoggerFactory.getLogger(OnlineController.class);
    @Autowired
    OnlineService onlineService;

    @Autowired
    private System system;

    @PostMapping("/upload")
    public boolean upload(Data data) throws IOException {
        Auth auth = checkAuth(data.getKey());
        if (!auth.isFlag()) {
            return false;
        }
        onlineService.upload(auth, data);
        return true;
    }

    @GetMapping("/download")
    public Data download(String key) throws IOException {
        return onlineService.download(key);
    }

    @GetMapping("/checkAuth")
    public Auth checkAuth(String key) {
        AuthInfo auth = onlineService.getAuth(key);
        boolean flag = auth != null && auth.getState() == 1 && auth.getLimit() != 0 && auth.getDay() != 0;
        Auth auths = new Auth();
        auths.setAuth(auth);
        auths.setFlag(flag);
        return auths;
    }

    @GetMapping("/generateAuth")
    public boolean generateAuth(Integer sum, @RequestHeader("auth") String auth) throws NoSuchAlgorithmException {
        if (!CommonUtils.verifyPassword(auth, system.getKey(), system.getSalt())) {
            return false;
        }
        if (sum == null || sum < 1 || sum > 50) {
            return false;
        }
        return onlineService.generateAuth(sum);
    }

    @GetMapping("/resetSystem")
    public String resetSystem(@RequestHeader("auth") String auth) throws NoSuchAlgorithmException {
        if (CommonUtils.verifyPassword(auth, system.getKey(), system.getSalt())) {
            String newKey = CommonUtils.getSystem();
            String newPass = CommonUtils.hashPassword(newKey, system.getSalt());
            logger.info("******NEW SYSTEM({})******", newPass);
            system.setKey(newKey);
            return "OK";
        }
        return "FAIL";
    }
}
