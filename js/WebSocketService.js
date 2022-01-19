var WebSocketService = function (model, webSocket) {
    var webSocketService = this;
    var socketServer = model.settings.socketServer;
    var fenArrowFlag = true;
    var fenSpeakFlag = false;
    var fanyiTo = null;
    var fanyiFrom = null;
    var webSocket = webSocket;
    var webSocket1 = null;
    var webSocket2 = null;
    var webSocket3 = null;
    var webSocket4 = null;
    var interval1 = null;
    var interval2 = null;
    var interval3 = null;
    var interval4 = null;
    var len = 50;
    var aroundR = 200;
    var model = model;
    var flag = false;
    var notifyFlag = false;
    var pauseMsg = false;
    var storageMsg = new LinkedQueue(500)
    var delUserID;
    var dackuser = [];
    var gouserList = [];
    var flashInterval = null;
    var flashCacheIcon = null
    var flashCacheSex = null
    var connectTime = null
    var specialAttentionUser = null
    var emojiDict = {
        "xiao": '0x1F606',
        "ku": '0x1F62D',
        'xiaoku': '0x1F602',
        'liuhan': '0x1F605',
        'qinqin': '0x1F618',
        'aixin': '0x1F970',
        'guilian': '0x1F92A',
        'kun': '0x1F634',
        'tu': '0x1F92E',
        'biti': '0x1F927',
        'xu': '0x1F92B',
        'yinchen': '0x1F612',
        'baiyan': '0x1F644',
        'kelian': '0x1F97A',
        'jingle': '0x1F633'

    }


    this.hasConnection = false;

    this.welcomeHandler = function (data) {
        webSocketService.hasConnection = true;

        model.userTadpole.id = data.id;
        model.tadpoles[data.id] = model.tadpoles[-1];
        delete model.tadpoles[-1];

        $("#chat").initChat();
        if ($.cookie("todpole_name")) {
            changeName($.cookie("todpole_name"))
        } else {
            changeName("迷路蝌蚪" + getNow());
        }
        if ($.cookie("todpole_Color")) {
            webSocketService.sendMessage("rgb" + $.cookie("todpole_Color"));
        }
        if ($.cookie("todpole_sex")) {
            webSocketService.sendMessage("我是" + $.cookie("todpole_sex"));
        }
        if ($.cookie("todpole_notify")) {
            notifyFlag = true;
        }
        if ($.cookie("close_introduction")) {
            watchIntroduction(false);
        }
        connectTime = new Date();
    };

    this.updateHandler = function (data) {
        var newtp = false;

        if (!model.tadpoles[data.id]) {
            newtp = true;
            model.tadpoles[data.id] = new Tadpole();
            model.arrows[data.id] = new Arrow(
                model.tadpoles[data.id],
                model.camera
            );
        }
        for (let i = 0; i < dackuser.length; i++) {
            if (dackuser[i] == data.id) {
                newtp = false;
            }
        }

        var tadpole = model.tadpoles[data.id];

        if (flag && dackuser != null) {
            for (let i = 0; i < dackuser.length; i++) {
                // console.log(dackuser[i])
                delete model.tadpoles[dackuser[i]];
                delete model.arrows[dackuser[i]];
            }
        }

        if (tadpole.id == model.userTadpole.id) {
            tadpole.name = data.name;
            return;
        } else {
            tadpole.name = data.name;
        }

        if (newtp) {
            tadpole.x = data.x;
            tadpole.y = data.y;
            vmLog.updateUsers(model.tadpoles);
            if (!pauseMsg) {
                vmLog.addLog({
                    type: "connect",
                    user: tadpole,
                });
            }
            if (notifyFlag && specialAttentionUser === tadpole.name) {
                sendNotify(specialAttentionUser + ' 已上线')
            }
        } else {
            tadpole.targetX = data.x;
            tadpole.targetY = data.y;
        }

        tadpole.angle = data.angle;
        tadpole.sex = data.sex;
        tadpole.momentum = data.momentum;
        tadpole.icon = data.icon;

        tadpole.timeSinceLastServerUpdate = 0;
    };

    this.messageHandler = function (data) {
        var tadpole = model.tadpoles[data.id];
        if (!tadpole) {
            return;
        }

        console.log('data:', data)
        let tadpole1 = new Tadpole();
        // console.log(tadpole1.draw());
        tadpole.timeSinceLastServerUpdate = 0;
        data.message = handleMsg(data.message)
        tadpole.messages.push(new Message(data.message));

        let log = {
            user: tadpole,
            message: {
                content: data.message,
                // content: String.fromCodePoint('0x1f601'),
                time: new Date(),
                x: parseInt(tadpole.x),
                y: parseInt(tadpole.y),
            },
            type: "message",
        };

        if (pauseMsg) {
            storageMsg.push(log);
        } else {
            vmLog.addLog(log);
        }


        console.log('model.userTadpole:', model.userTadpole)
        if (notifyFlag && data.message.startsWith('@' + model.userTadpole.name + ' ')) {
            //通知
            var msg = data.message
            if (msg > 100) {
                msg = msg.substring(0, 100) + '...'
            }
            sendNotify(msg)
        }
    };

    this.closedHandler = function (data) {
        if (model.tadpoles[data.id]) {
            if (!pauseMsg) {
                vmLog.addLog({
                    type: "disconnect",
                    message: model.tadpoles[data.id].name + "离开了池塘",
                });
            }
            delete model.tadpoles[data.id];
            delete model.arrows[data.id];
            vmLog.updateUsers(model.tadpoles);
        }
    };

    this.redirectHandler = function (data) {
        if (data.url) {
            if (authWindow) {
                authWindow.document.location = data.url;
            } else {
                document.location = data.url;
            }
        }
    };

    this.processMessage = function (data) {
        var fn = webSocketService[data.type + "Handler"];
        if (fn) {
            fn(data);
        }
    };

    this.connectionClosed = function () {
        webSocketService.hasConnection = false;
        $("#cant-connect").fadeIn(300);
    };

    this.sendUpdate = function (tadpole) {
        var sendObj = {
            type: "update",
            x: tadpole.x.toFixed(1),
            y: tadpole.y.toFixed(1),
            angle: tadpole.angle.toFixed(3),
            momentum: tadpole.momentum.toFixed(3),
            sex: tadpole.sex,
            icon: tadpole.icon
        };

        if (tadpole.name) {
            sendObj['name'] = tadpole.name;
        }

        if (fenArrowFlag) {
            if (webSocket1) {
                createFenshen(webSocket1, 1);
            }
            if (webSocket2) {
                createFenshen(webSocket2, 2);
            }
            if (webSocket3) {
                createFenshen(webSocket3, 3);
            }
            if (webSocket4) {
                createFenshen(webSocket4, 4);
            }
        }

        webSocket.send(JSON.stringify(sendObj));
    };


    this.sendMessage = function (msg) {
        let regexp = /^(\s我叫|name[:：;；]|我叫)(.+)/i;
        if (regexp.test(msg)) {
            let name = msg.match(regexp)[2];
            sendmsg(model.userTadpole.name + ' 改名为:【' + name + '】')
            changeName(name)
            return;
        }

        regexp = /^(\s我是|我是|sex)(男生|女生|-1|0|1|3|男|女)/;
        if (regexp.test(msg)) {
            let sex = msg.match(regexp)[2];
            if (sex === "女生" || sex === "0") {
                model.userTadpole.sex = 0;
            } else if (sex === "男生" || sex === "1") {
                model.userTadpole.sex = 1;
            } else {
                model.userTadpole.sex = 3;
                // return;
            }
            $.cookie("todpole_sex", model.userTadpole.sex, {
                expires: 14,
            });
            return;
        }

        regexp = /^跟随(.+)/i;
        if (regexp.test(msg)) {

            let _this = this;
            let gouserByname = msg.match(regexp)[1];
            console.log(gouserByname);

            var gousergo = setInterval(function () {

                var gouser = queryByName(gouserByname);
                let xx = /x: ?(.+)y/i;
                let yy = /y: ?(.+)/i;
                // console.log(gouser+"-"+xx+"-"+yy);
                if (gouser != null) {
                    model.userTadpole.x = parseFloat(gouser.match(xx)[1] - 12);
                    model.userTadpole.y = parseFloat(gouser.match(yy)[1] - 12);
                    _this.sendUpdate(model.userTadpole);
                } else {
                    clearInterval(gousergo);
                    app.sendMessage("他跑了！！");
                }

                gouserList.push(gousergo);
                // console.log(gouserList);

            }, 500);

            return;
        }

        regexp = /^(停止|stop)(挂机|跟随)/;
        if (regexp.test(msg)) {

            let gouserByname = msg.match(regexp)[2];
            // console.log(gouserByname);
            if (gouserByname == "挂机" || gouserByname == "跟随") {
                // console.log(gouserList);
                gouserList.forEach((item, index) => {
                    clearInterval(item);
                })
                gouserList = [];
                gousergo = 0;
                return;

            }
        }

        regexp = /^屏蔽(.+)/;
        if (regexp.test(msg)) {
            let name = msg.match(regexp)[1];
            console.log(name);
            let users = vmLog.queryByName(name)
            console.log(users)
            if (users.length > 0){
                for (let i in users){
                    console.log('屏蔽',users[i]);
                    vmLog.onClickDelUser(users[i])
                }
            }
            return;
        }

        regexp = /^取消屏蔽(.+)/;
        if (regexp.test(msg)) {
            let name = msg.match(regexp)[1];
            console.log(name);
            let users = vmLog.queryByName(name)
            console.log(users)
            if (users.length > 0){
                for (let i in users){
                    console.log('取消屏蔽',users[i]);
                    vmLog.onClickCancelDack(users[i])
                }
            }
            return;
        }

        regexp = /^-?(\d+)[,，]-?(\d+)$/i;
        if (regexp.test(msg)) {
            let pos = msg.match(regexp);
            // console.log(pos)
            app.deliveryTo(pos[1], pos[2]);
            return;
        }

        // regexp = /^速度(\d+)$/i;
        // if (regexp.test(msg)) {
        //     let num = msg.match(regexp);
        //     let speed = parseInt(num[1]) > 0 ? parseInt(num[1]) : 1;
        //     app.speed(speed);
        // }

        regexp = /^开始挂$/;
        if (regexp.test(msg)) {
            model.userTadpole.targetY = model.userTadpole.x.toFixed(1);
            model.userTadpole.targetX = model.userTadpole.y.toFixed(1);
            model.userTadpole.targetMomentum = 10;
            return;
        }

        regexp = /^停止挂$/;
        if (regexp.test(msg)) {
            model.userTadpole.targetY = 0;
            model.userTadpole.targetX = 0;
            model.userTadpole.targetMomentum = 0;
            return;
        }
        regexp = /^关注\[(.+)]$/;
        if (regexp.test(msg)) {
            specialAttentionUser = msg.match(regexp)[1]
            console.log(specialAttentionUser)
            $.cookie("todpole_attention", specialAttentionUser, {
                expires: 14,
            });
            sendNotify('您已关注【' + specialAttentionUser + '】的上线提醒')
            return;
        }

        regexp = /^不再关注$/;
        if (regexp.test(msg)) {
            specialAttentionUser = null;
            $.cookie("todpole_attention", null, {
                expires: -1,
            });
            return;
        }

        regexp = /^关介绍$/;
        if (regexp.test(msg)) {
            watchIntroduction(false);
            $.cookie("close_introduction", true, {
                expires: 14,
            });
            return;
        }

        regexp = /^看介绍$/;
        if (regexp.test(msg)) {
            watchIntroduction(true);
            $.cookie("close_introduction", false, {
                expires: -1,
            });
            return;
        }

        regexp = /^分身间隔(\d+)$/i;
        if (regexp.test(msg)) {
            let num = msg.match(regexp);
            len = parseInt(num[1]) > 0 ? parseInt(num[1]) : 1;
            return;
        }

        regexp = /^分身环绕半径(\d+)$/i;
        if (regexp.test(msg)) {
            let num = msg.match(regexp);
            aroundR = parseInt(num[1]) > 0 ? parseInt(num[1]) : 1;
            return;
        }

        regexp = /^circle(\d+)$/;
        if (regexp.test(msg)) {
            let match = msg.match(regexp);
            let r = match[1] >= 10 ? parseInt(match[1]) : 50;
            vmLog.setCircleRadius(r);
            console.log(model.tadpoles);
            return;
        }

        regexp = /^circle(\d+)[,，](\d+)[,，]?(\d+)?$/;
        if (regexp.test(msg)) {
            if (typeof circleInterval !== "undefined") {
                clearInterval(circleInterval);
            }
            let match = msg.match(regexp);
            let x0 = parseInt(match[1]);
            let y0 = parseInt(match[2]);
            let r =
                match[3] !== undefined && match[3] >= 10
                    ? parseInt(match[3])
                    : 100;
            let degree = 0;
            circleInterval = setInterval(() => {
                degree += 10;
                let hudu = ((2 * Math.PI) / 360) * degree;
                let x1 = x0 + Math.sin(hudu) * r;
                let y1 = y0 - Math.cos(hudu) * r;
                model.userTadpole.x = x1;
                model.userTadpole.y = y1;
            }, 300);
            return;
        }

        regexp = /^stop circle$/;
        if (regexp.test(msg)) {
            clearInterval(circleInterval);
            return;
        }

        regexp = /^时长$/
        if (regexp.test(msg)) {
            if (!connectTime) {
                connectTime = new Date();
            }
            let time = getTimeInterval(new Date() / 1000 - connectTime / 1000)
            msg = '【系统】已持续在线' + time;
            sendmsg(msg)
            return;
        }

        regexp = /^-?(\d+)[,，]-?(\d+)$/i;
        if (regexp.test(msg)) {
            let pos = msg.match(regexp);
            let str = pos[0].split(/[,，]/);
            app.deliveryTo(parseInt(str[0]), parseInt(str[1]));
            return;
        }

        regexp = /^(\s速度|速度)(\d+)$/i;
        if (regexp.test(msg)) {
            let num = msg.match(regexp)[2];
            let speed = parseInt(num) > 0 ? parseInt(num) : 1;
            speed = Math.min(30, speed)
            app.speed(speed);
        }

        regexp = /^(\srgb|rgb)(.+)/i;
        if (regexp.test(msg)) {
            let userColor = msg.match(regexp)[2];
            model.userTadpole.icon = "/images/default.png";
            model.userTadpole.icon += "?Color=" + userColor;
            $.cookie("todpole_Color", userColor, {
                expires: 14,
            });
            return;
        }

        regexp = /^(\sdelcolor|delcolor)$/;
        if (regexp.test(msg)) {
            model.userTadpole.icon = "/images/default.png";
            document.cookie = "todpole_Color=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            return;
        }

        regexp = /^闪烁$/;
        if (regexp.test(msg)) {
            if (flashInterval) {
                return;
            }
            let color1 = '#0000FF'
            let color2 = '#FF0000'
            this.flashColor(color1, color2)
            return;
        }

        regexp = /^闪烁\((#[0-9A-Fa-f]{6})-(#[0-9A-Fa-f]{6})\)$/;
        if (regexp.test(msg)) {
            if (flashInterval) {
                return;
            }
            let color1 = msg.match(regexp)[1];
            let color2 = msg.match(regexp)[2];
            console.log(color1)
            console.log(color2)
            this.flashColor(color1, color2)
            return;
        }

        regexp = /^闪烁关$/;
        if (regexp.test(msg)) {
            clearInterval(flashInterval);
            if (flashCacheIcon) {
                model.userTadpole.icon = flashCacheIcon;
                // $.cookie("todpole_Color", model.userTadpole.icon, {
                //     expires: 14,
                // });
            }
            if (flashCacheSex) {
                model.userTadpole.sex = flashCacheSex;
                // $.cookie("todpole_sex", model.userTadpole.sex, {
                //     expires: 14,
                // });
            }
            flashInterval = null;
            return;
        }

        regexp = /^分身开$/;
        if (regexp.test(msg)) {
            if (!webSocket1) {
                webSocket1 = createFenshen(new WebSocket(socketServer), 1);
            }
            if (!webSocket2) {
                webSocket2 = createFenshen(new WebSocket(socketServer), 2);
            }
            if (!webSocket3) {
                webSocket3 = createFenshen(new WebSocket(socketServer), 3);
            }
            if (!webSocket4) {
                webSocket4 = createFenshen(new WebSocket(socketServer), 4);
            }
            console.log(webSocket1);
            console.log(webSocket2);
            console.log(webSocket3);
            console.log(webSocket4);
            //定时关闭
            // setTimeout(function (){
            //     app.sendMessage('分身收')
            // },10000)
            return;
        }

        regexp = /^分身收$/;
        if (regexp.test(msg)) {
            if (webSocket1) {
                webSocket1.close();
                webSocket1 = null;
            }
            if (webSocket2) {
                webSocket2.close();
                webSocket2 = null;
            }
            if (webSocket3) {
                webSocket3.close();
                webSocket3 = null;
            }
            if (webSocket4) {
                webSocket4.close();
                webSocket4 = null;
            }
            return;
        }


        regexp = /^分身跟$/;
        if (regexp.test(msg)) {
            fenArrowFlag = true;
            return;
        }

        regexp = /^分身定$/;
        if (regexp.test(msg)) {
            fenArrowFlag = false;

            clearInterval(interval1);
            clearInterval(interval2);
            clearInterval(interval3);
            clearInterval(interval4);
            return;
        }

        regexp = /^分身说$/;
        if (regexp.test(msg)) {
            fenSpeakFlag = true;
            return;
        }

        regexp = /^翻译-([a-z]+)$/;
        if (regexp.test(msg)) {
            fanyiTo = msg.match(regexp)[1];
            return;
        }

        regexp = /^解译[-]?([a-z]+)?$/;
        if (regexp.test(msg)) {
            fanyiFrom = msg.match(regexp)[1] || 'auto';
            alert(fanyiFrom)
            return;
        }

        regexp = /^翻译off$/;
        if (regexp.test(msg)) {
            fanyiTo = null;
            fanyiFrom = null;
            return;
        }

        regexp = /^分身禁$/;
        if (regexp.test(msg)) {
            fenSpeakFlag = false;
            return;
        }

        regexp = /^分身环绕$/;
        if (regexp.test(msg)) {
            let degree1 = 0;
            let degree2 = 90;
            let degree3 = 180;
            let degree4 = 270;
            if (webSocket1) {
                interval1 = aroundFenshen(webSocket1, degree1);
            }
            if (webSocket2) {
                interval2 = aroundFenshen(webSocket2, degree2);
            }
            if (webSocket3) {
                interval3 = aroundFenshen(webSocket3, degree3);
            }
            if (webSocket4) {
                interval4 = aroundFenshen(webSocket4, degree4);
            }
            return;
        }


        //instructions
        regexp = /^whosyourdaddy$/;
        if (regexp.test(msg)) {
            cleanDomBody('hidden-instructions')
            //'分身说、分身禁、分身环绕、分身间隔50、分身环绕半径150'
            insertTagAndText('hidden-instructions', 'p', '*. 分身功能，包括:分身开、分身收、分身跟、分身定、')
            insertTagAndText('hidden-instructions', 'p', '&nbsp;&nbsp;分身说、分身禁、分身环绕、分身间隔50、分身环绕半径150')
            insertTagAndText('hidden-instructions', 'p', '*. 输入 闪烁 和 闪烁关 来实现闪烁, 输入闪烁(颜色1+中划线+颜色2)')
            insertTagAndText('hidden-instructions', 'p', '&nbsp;&nbsp;还可自定义闪烁颜色(仅私服可见),如 闪烁(#FFF123-#123123)')
            return;
        }

        regexp = /^whosyourdaddyoff$/;
        if (regexp.test(msg)) {
            cleanDomBody('hidden-instructions')
            return;
        }

        regexp = /^\[(.+)]$/;
        if (regexp.test(msg)) {
            let address = msg.match(regexp)[1];
            console.log(address)
            // let base64str = btoa(encodeURIComponent(address));
            // let uu = base64str.split("").join('#')
            let uu = btoa(escape(address))
            msg = '[' + uu + ']';
            console.log(msg)
        }

        regexp = /^暂停$/;
        if (regexp.test(msg)) {
            pauseMsg = true;
            return;
        }
        regexp = /^暂停关$/;
        if (regexp.test(msg)) {
            let log = {
                user: model.userTadpole,
                message: {
                    content: handleMsg('----恢复消息----'),
                    // content: String.fromCodePoint('0x1f601'),
                    time: new Date(),
                    x: parseInt(model.userTadpole.x),
                    y: parseInt(model.userTadpole.y),
                },
                type: "message",
            };
            vmLog.addLog(log)
            console.log('length: ' + storageMsg.size())
            while (storageMsg.size() > 0) {
                let d = storageMsg.pop()
                console.log(d)
                vmLog.addLog(d)
            }
            let log2 = {
                user: model.userTadpole,
                message: {
                    content: handleMsg('----恢复消息完毕----'),
                    // content: String.fromCodePoint('0x1f601'),
                    time: new Date(),
                    x: parseInt(model.userTadpole.x),
                    y: parseInt(model.userTadpole.y),
                },
                type: "message",
            };
            vmLog.addLog(log2)
            pauseMsg = false;
            return;
        }

        regexp = /^通知开$/;
        if (regexp.test(msg)) {
            notifyFlag = true
            $.cookie("todpole_notify", true, {
                expires: 14,
            });
            if (window.Notification) { //判断浏览器是否支持Notification
                Notification.requestPermission().then(permission => { //向浏览器请求允许通知
                    if (permission == 'granted') {
                        sendNotify('蝌蚪聊天室-开启消息通知')
                    }
                });
            }
            return;
        }

        regexp = /^通知关$/;
        if (regexp.test(msg)) {
            $.cookie("todpole_notify", false, {
                expires: -1,
            });
            notifyFlag = false;
            return;
        }

        if (fanyiTo) {
            msg = getfanyi(null, fanyiTo, msg)
        }

        //发送消息
        sendmsg(msg);

        if (fenSpeakFlag) {
            let sendObj = {
                type: "message",
                message: msg,
            };
            if (webSocket1) {
                webSocket1.send(JSON.stringify(sendObj));
            }
            if (webSocket2) {
                webSocket2.send(JSON.stringify(sendObj));
            }
            if (webSocket3) {
                webSocket3.send(JSON.stringify(sendObj));
            }
            if (webSocket4) {
                webSocket4.send(JSON.stringify(sendObj));
            }
        }

    }
    this.flashColor = function (color1, color2) {
        flashCacheIcon = model.userTadpole.icon
        flashCacheSex = model.userTadpole.sex;

        flashInterval = setInterval(() => {
            //红黄
            if (model.userTadpole.icon === '/images/default.png?Color=' + color1) {
                model.userTadpole.icon = '/images/default.png?Color=' + color2;
            } else {
                model.userTadpole.icon = '/images/default.png?Color=' + color1;
            }

            //如果是原版, 切换性别
            if (model.userTadpole.sex === 0) {
                model.userTadpole.sex = 1;
            } else {
                model.userTadpole.sex = 0;
            }
            console.log(model.userTadpole.sex)
            console.log(model.userTadpole.icon)
            this.sendUpdate(model.userTadpole);
        }, 500);

        this.sendUpdate(model.userTadpole);
    };

    this.authorize = function (token, verifier) {
        var sendObj = {
            type: "authorize",
            token: token,
            verifier: verifier,
        };

        webSocket.send(JSON.stringify(sendObj));
    };

    this.deleteUser = function (name, e) {
        // let userid = queryIdByName(name);
        console.log(name);
        console.log(model.userTadpole.id);
        if (name == model.userTadpole.id) {
            flag = false;
            return;
        }
        flag = true;
        if (e) {
            // delete dackuser[userid];
            dackuser.pop(name);
            // console.log(dackuser);
            return;
        }
        delUserID = name;
        // console.log(user);
        dackuser.push(name);
        // console.log(dackuser)
        for (let i = 0; i < dackuser.length; i++) {
            delete model.tadpoles[dackuser[i]];
            delete model.arrows[dackuser[i]];
        }
        return;
    };

    var queryIdByName = function (name) {
        var userid = JSON.stringify(model.tadpoles);
        userid = JSON.parse(userid);

        for (var j in userid) {
            if (userid[j].name == name) {
                return j;
            }
        }

        return null;
    };


    var queryByName = function (name) {
        var x;
        var y;
        var userid = JSON.stringify(model.tadpoles);
        userid = JSON.parse(userid);

        for (var j in userid) {

            if (userid[j].name == name || j == name) {
                x = userid[j].x;
                y = userid[j].y;

                return "x:" + x + "y:" + y;
            }
        }

        return null;
    }

    var sendmsg = function (msg, type) {
        if (!type) {
            type = 'message';
        }
        var sendObj = {
            type: type,
            message: msg,
        };
        console.log('json: ' + JSON.stringify(sendObj))
        webSocket.send(JSON.stringify(sendObj));
    }


    var changeName = function (name) {
        model.userTadpole.name = name;
        $.cookie("todpole_name", model.userTadpole.name, {
            expires: 14,
        });
    }

    var watchIntroduction = function (boo) {
        var inst = document.getElementById('instructions')
        inst.setAttribute('style', boo ? 'display:show;' : 'display:none;')
    }


    var aroundFenshen = function (newWebSocket, degree) {
        var thisWebSocket = null;
        if (newWebSocket) {
            thisWebSocket = newWebSocket;
        } else {
            thisWebSocket = new WebSocket(socketServer);
        }
        var tadpole = model.userTadpole;
        return setInterval(function () {
            degree += 10;
            let hudu = 2 * Math.PI / 360 * degree;
            let x1 = Number(tadpole.x.toFixed(1)) + Math.sin(hudu) * aroundR;
            let y1 = Number(tadpole.y.toFixed(1)) - Math.cos(hudu) * aroundR;

            var sendObj = {
                type: 'update',
                x: x1,
                y: y1,
                angle: tadpole.angle.toFixed(3),
                momentum: tadpole.momentum.toFixed(3),
                sex: tadpole.sex,
                icon: tadpole.icon
            };

            if (tadpole.name) {
                sendObj['name'] = tadpole.name;
            }
            if (thisWebSocket.readyState == 1) {
                thisWebSocket.send(JSON.stringify(sendObj));
            } else {
                thisWebSocket.onopen = function (event) {
                    thisWebSocket.send(JSON.stringify(sendObj));
                }
            }
        }, 500)
    }

    var createFenshen = function (newWebSocket, position) {
        var thisWebSocket = null;
        if (newWebSocket) {
            thisWebSocket = newWebSocket;
        } else {
            thisWebSocket = new WebSocket(socketServer);
        }
        var tadpole = model.userTadpole;
        var x = 0;
        var y = 0;

        if (position == 1) {
            x = Number(tadpole.x.toFixed(1)) - Number(len);
            y = Number(tadpole.y.toFixed(1)) + Number(len);
        } else if (position == 2) {
            x = Number(tadpole.x.toFixed(1)) + Number(len);
            y = Number(tadpole.y.toFixed(1)) + Number(len);
        } else if (position == 3) {
            x = Number(tadpole.x.toFixed(1)) - Number(len);
            y = Number(tadpole.y.toFixed(1)) - Number(len);
        } else if (position == 4) {
            x = Number(tadpole.x.toFixed(1)) + Number(len);
            y = Number(tadpole.y.toFixed(1)) - Number(len);
        }

        var sendObj = {
            type: 'update',
            x: x,
            y: y,
            angle: tadpole.angle.toFixed(3),
            momentum: tadpole.momentum.toFixed(3),
            sex: tadpole.sex,
            icon: tadpole.icon
        };

        if (tadpole.name) {
            sendObj['name'] = tadpole.name + position;
        }

        if (thisWebSocket.readyState == 1) {
            thisWebSocket.send(JSON.stringify(sendObj));
        } else {
            thisWebSocket.onopen = function (event) {
                thisWebSocket.send(JSON.stringify(sendObj));
            }
        }
        return thisWebSocket;
    }

    var handleMsg = function (content) {
        // console.log(content)
        content = transEmoji(content)
        // console.log(content)
        content = parseUrl(content)
        // console.log(content)
        content = transfer2CN(content)
        return content;
    }

    var transEmoji = function (content) {
        if (content.startsWith('(') && content.endsWith(')')) {
            var code = content.substring(1, content.length - 1)
            var emoji = emojiDict[code]
            if (emoji) {
                var aa = String.fromCodePoint(emoji)
                return aa;
            }
        }
        return content;
    }

    var parseUrl = function (text) {
        // console.log(text)
        if (text.startsWith("[") && text.endsWith("]")) {
            let urlcode = text.substring(1, text.length - 1)
            console.log(urlcode)
            let url = urlcode;
            // try {
            //     urlcode = urlcode.replaceAll('#','')
            //     let decodestr = atob(urlcode)
            //     if (btoa(decodestr) === urlcode) {
            //         //    说明是base64
            //         url = decodeURIComponent(atob(decodestr))
            //     }
            // } catch
            //     (e) {
            //     console.error(e)
            // }
            url = unescape(atob(url))
            text = '[' + url + ']';
        }
        return text;
    }

    var transfer2CN = function (text) {
        if (fanyiFrom) {
            return getfanyi(fanyiFrom, "zh", text)
        }
        return text;
    }

    var sendNotify = function (msg) {
        //发起一条新通知
        var myNotification = new Notification('蝌蚪-新消息通知', {
            body: msg,
            // icon: 'static/img/icon_logo.png'
        });
        myNotification.onclick = function () {
            window.focus(); //点击消息通知后回到相应窗口
            myNotification.close(); //关闭清除通知
        }
    }

    var getNow = function () {
        //时间戳转换方法    date:时间戳数字
        var date = new Date();
        var YY = date.getFullYear().toString().substring(2);
        var MM = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
        var DD = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate());
        var hh = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours());
        var mm = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
        var ss = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
        return YY + MM + DD + hh + mm + ss;
    }

    var getTimeInterval = function (second_time) {
        console.log('秒:' + second_time)
        var time = parseInt(second_time) + "秒";
        if (parseInt(second_time) > 60) {

            var second = parseInt(second_time) % 60;
            var min = parseInt(second_time / 60);
            time = min + "分" + second + "秒";

            if (min > 60) {
                min = parseInt(second_time / 60) % 60;
                var hour = parseInt(parseInt(second_time / 60) / 60);
                time = hour + "小时" + min + "分" + second + "秒";

                if (hour > 24) {
                    hour = parseInt(parseInt(second_time / 60) / 60) % 24;
                    var day = parseInt(parseInt(parseInt(second_time / 60) / 60) / 24);
                    time = day + "天" + hour + "小时" + min + "分" + second + "秒";
                }
            }


        }

        return time;
    }


    var getfanyi = function (from, to, message) {
        let msg = message;
        $.ajaxSettings.async = false;
        $.post("http://localhost:8080/demo/fanyi2", {query: message, from: from, to: to},
            function (data, textStatus) {
                console.log(data)
                if (textStatus == "success" && data.code == 0) {
                    msg = data.msg;
                    return;
                }
            });
        $.ajaxSettings.async = true;
        console.log('msg-=>', msg)
        return msg;
    }
}