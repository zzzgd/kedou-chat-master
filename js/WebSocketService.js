var WebSocketService = function (model, webSocket) {
    var webSocketService = this;
    var socketServer=model.settings.socketServer;
    var fenArrowFlag=true;
    var fenSpeakFlag=false;
    var webSocket = webSocket;
    var webSocket1 = null;
    var webSocket2 = null;
    var webSocket3 = null;
    var webSocket4 = null;
    var interval1 = null;
    var interval2 = null;
    var interval3 = null;
    var interval4 = null;
    var len=50;
    var aroundR=200;
    var model = model;
    var flag = false;
    var delUserID;
    var dackuser = [];
    var gouserList = [];
    var emojiDict = {
        "xiao":'0x1F606',
        "ku":'0x1F62D',
        'xiaoku':'0x1F602',
        'liuhan':'0x1F605',
        'qinqin':'0x1F618',
        'aixin':'0x1F970',
        'guilian':'0x1F92A',
        'kun':'0x1F634',
        'tu':'0x1F92E',
        'biti':'0x1F927',
        'xu':'0x1F92B',
        'yinchen':'0x1F612',
        'baiyan':'0x1F644',
        'kelian':'0x1F97A',
        'jingle':'0x1F633'

    }


    
    this.hasConnection = false;

    this.welcomeHandler = function (data) {
        webSocketService.hasConnection = true;

        model.userTadpole.id = data.id;
        model.tadpoles[data.id] = model.tadpoles[-1];
        delete model.tadpoles[-1];

        $("#chat").initChat();
        if ($.cookie("todpole_name")) {
            webSocketService.sendMessage("name:" + $.cookie("todpole_name"));
        }
        if ($.cookie("todpole_Color")) {
            webSocketService.sendMessage("rgb" + $.cookie("todpole_Color"));
        }
        if ($.cookie("todpole_sex")) {
            webSocketService.sendMessage("我是" + $.cookie("todpole_sex"));
        }
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
            vmLog.addLog({
                type: "connect",
                user: tadpole,
            });
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
        let tadpole1 = new Tadpole();
        // console.log(tadpole1.draw());
        tadpole.timeSinceLastServerUpdate = 0;
        tadpole.messages.push(new Message( transEmoji(data.message)));
        vmLog.addLog({
            user: tadpole,
            message: {
                content: transEmoji(data.message),
                // content: String.fromCodePoint('0x1f601'),
                time: new Date(),
                x: parseInt(tadpole.x),
                y: parseInt(tadpole.y),
            },
            type: "message",
        });
    };

    this.closedHandler = function (data) {
        if (model.tadpoles[data.id]) {
            vmLog.addLog({
                type: "disconnect",
                message: model.tadpoles[data.id].name + "离开了池塘",
            });
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
            icon: tadpole.icon,
            x: tadpole.x.toFixed(1),
            y: tadpole.y.toFixed(1),
            angle: tadpole.angle.toFixed(3),
            momentum: tadpole.momentum.toFixed(3),
            sex: tadpole.sex,
        };

        if (tadpole.name) {
            sendObj['name'] = tadpole.name;
        }
        
        if(fenArrowFlag){
                if(webSocket1){
                    createFenshen(webSocket1,1);
                }
                if(webSocket2){
                    createFenshen(webSocket2,2);
                }
                if(webSocket3){
                    createFenshen(webSocket3,3);
                }
                if(webSocket4){
                    createFenshen(webSocket4,4);
                }
        }

        webSocket.send(JSON.stringify(sendObj));
    };

    this.sendMessage = function (msg) {
        let regexp = /^(\s我叫|name[:：;；]|我叫)(.+)/i;
        if (regexp.test(msg)) {
            model.userTadpole.name = msg.match(regexp)[2];
            $.cookie("todpole_name", model.userTadpole.name, {
                expires: 14,
            });
            return;
        }

        regexp = /^(\s我是|我是|sex)(男生|女生|0|1|3|男|女)/;
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

            }, 10);

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

        regexp = /^-?(\d+)[,，]-?(\d+)$/i;
        if (regexp.test(msg)) {
            let pos = msg.match(regexp);
            // console.log(pos)
            app.deliveryTo(pos[1], pos[2]);
            return;
        }

        regexp = /^速度(\d+)$/i;
        if (regexp.test(msg)) {
            let num = msg.match(regexp);
            let speed = parseInt(num[1]) > 0 ? parseInt(num[1]) : 1;
            app.speed(speed);
        }
        
        regexp = /^开始挂/;;
        if (regexp.test(msg)) {
            model.userTadpole.targetY = model.userTadpole.x.toFixed(1);
            model.userTadpole.targetX = model.userTadpole.y.toFixed(1);
            model.userTadpole.targetMomentum=10;
            return;
        }
        
        regexp = /^停止挂/;;
        if (regexp.test(msg)) {
            model.userTadpole.targetY = 0;
            model.userTadpole.targetX = 0;
            model.userTadpole.targetMomentum=0;
            return;
        }

        regexp = /^关介绍$/;
        if (regexp.test(msg)) {
            var inst = document.getElementById('instructions')
            inst.setAttribute('style','display:none;')
            return;
        }

        regexp = /^看介绍$/;
        if (regexp.test(msg)) {
            var inst = document.getElementById('instructions')
            inst.setAttribute('style','display:show;')
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
            }, 50);
            return;
        }

        regexp = /^stop circle$/;
        if (regexp.test(msg)) {
            clearInterval(circleInterval);
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
            speed = Math.min(1000,speed)
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

        regexp = /^flicker$/;
        if (regexp.test(msg)) {
            let sex = model.userTadpole.sex;
            let interval = setInterval(() => {
                if (model.userTadpole.sex === -1) {
                    model.userTadpole.sex = 1;
                }
                model.userTadpole.sex = model.userTadpole.sex ^ 1;
                $.cookie("todpole_sex", model.userTadpole.sex, {
                    expires: 14,
                });
                this.sendUpdate(model.userTadpole);
            }, 500);
            setTimeout(function () {
                clearInterval(interval);
                model.userTadpole.sex = sex;
                $.cookie("todpole_sex", model.userTadpole.sex, {
                    expires: 14,
                });
            }, 60000);
            return;
        }

        regexp = /^分身开/;
        if (regexp.test(msg)) {
            if(!webSocket1){
                 webSocket1=createFenshen(new WebSocket(socketServer),1);
            }
            if(!webSocket2){
                 webSocket2=createFenshen(new WebSocket(socketServer),2);
            }
            if(!webSocket3){
                 webSocket3=createFenshen(new WebSocket(socketServer),3);
            }
            if(!webSocket4){
                 webSocket4=createFenshen(new WebSocket(socketServer),4);
            }
            console.log(webSocket1);
            console.log(webSocket2);
            console.log(webSocket3);
            console.log(webSocket4);
           return;
        }
        
        regexp = /^分身收/;
        if (regexp.test(msg)) {
            if(webSocket1){
                webSocket1.close();
                webSocket1=null;
            }
            if(webSocket2){
                webSocket2.close();
                webSocket2=null;
            }
            if(webSocket3){
                webSocket3.close();
                webSocket3=null;
            }
            if(webSocket4){
                webSocket4.close();   
                webSocket4=null;
            }
            return;
        }
        
        
        regexp = /^分身跟/;
        if (regexp.test(msg)) {
            fenArrowFlag=true;
            return;
        }

        regexp = /^分身定/;
        if (regexp.test(msg)) {
            fenArrowFlag=false;
            
            clearInterval(interval1);
            clearInterval(interval2);
            clearInterval(interval3);
            clearInterval(interval4);
            return;
        }
        
        regexp = /^分身说/;
        if (regexp.test(msg)) {
            fenSpeakFlag=true;
            return;
        }
        
        regexp = /^分身禁/;
        if (regexp.test(msg)) {
            fenSpeakFlag=false;
            return;
        }
        
        regexp = /^分身环绕/;
        if (regexp.test(msg)) {
            let degree1 = 0;
            let degree2 = 90;
            let degree3 = 180;
            let degree4 = 270;
            if(webSocket1){
                interval1=aroundFenshen(webSocket1,degree1);
            }
            if(webSocket2){
                interval2=aroundFenshen(webSocket2,degree2);
            }
            if(webSocket3){
                interval3=aroundFenshen(webSocket3,degree3);
            }
            if(webSocket4){
                interval4=aroundFenshen(webSocket4,degree4);
            }
            return;
        }


        //instructions
        regexp = /^whosyourdaddy$/;
        if (regexp.test(msg)) {
            cleanDomBody('hidden-instructions')
            //'分身说、分身禁、分身环绕、分身间隔50、分身环绕半径150'
            insertTagAndText('hidden-instructions','p','*. 分身功能，包括:分身开、分身收、分身跟、分身定、')
            insertTagAndText('hidden-instructions','p','分身说、分身禁、分身环绕、分身间隔50、分身环绕半径150')
            return;
        }

        regexp = /^whosyourdaddyoff$/;
        if (regexp.test(msg)) {
            cleanDomBody('hidden-instructions')
            return;
        }

        var sendObj = {
            type: "message",
            message: msg,
        };

        webSocket.send(JSON.stringify(sendObj));
        
        if(fenSpeakFlag){
             if(webSocket1){
                 webSocket1.send(JSON.stringify(sendObj));
             }
             if(webSocket2){
                 webSocket2.send(JSON.stringify(sendObj));
             }
             if(webSocket3){
                 webSocket3.send(JSON.stringify(sendObj));
             }
             if(webSocket4){
                 webSocket4.send(JSON.stringify(sendObj));
             }
        }

       
    }

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

    var cleanDomBody = function (elementId){
        var inst = document.getElementById(elementId)
        if (inst != null){
            console.log(inst)
            while(inst.hasChildNodes()) //当div下还存在子节点时 循环继续
            {
                inst.removeChild(inst.firstChild);
            }
        }
    }

    var insertTagAndText = function (parentId,tagName,text){
        var parent = document.getElementById(parentId)
        var tag = document.createElement(tagName);
        tag.innerText =text
        parent.appendChild(tag)
    }

    var aroundFenshen = function(newWebSocket,degree){
        var thisWebSocket=null;
        if(newWebSocket){
            thisWebSocket=newWebSocket;
        }else{
            thisWebSocket=new WebSocket(socketServer);
        }
        var tadpole=model.userTadpole;
        return setInterval(function(){
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
                sex: tadpole.sex
            };

            if (tadpole.name) {
                sendObj['name'] = tadpole.name;
            }
            if(thisWebSocket.readyState==1){
                thisWebSocket.send(JSON.stringify(sendObj));
            }else{
                thisWebSocket.onopen=function(event){
                    thisWebSocket.send(JSON.stringify(sendObj));
                }
            }
        }, 50)
    }

    var createFenshen = function(newWebSocket,position){
        var thisWebSocket=null;
        if(newWebSocket){
            thisWebSocket=newWebSocket;
        }else{
            thisWebSocket=new WebSocket(socketServer);
        }
        var tadpole=model.userTadpole;
        var x=0;
        var y=0;

        if(position==1){
            x=Number(tadpole.x.toFixed(1))-Number(len);
            y=Number(tadpole.y.toFixed(1))+Number(len);
        }else if(position==2){
            x=Number(tadpole.x.toFixed(1))+Number(len);
            y=Number(tadpole.y.toFixed(1))+Number(len);
        }else if(position==3){
            x=Number(tadpole.x.toFixed(1))-Number(len);
            y=Number(tadpole.y.toFixed(1))-Number(len);
        }else if(position==4){
            x=Number(tadpole.x.toFixed(1))+Number(len);
            y=Number(tadpole.y.toFixed(1))-Number(len);
        }

        var sendObj = {
            type: 'update',
            x: x,
            y: y,
            angle: tadpole.angle.toFixed(3),
            momentum: tadpole.momentum.toFixed(3),
            sex: tadpole.sex
        };

        if (tadpole.name) {
            sendObj['name'] = tadpole.name+position;
        }

        if(thisWebSocket.readyState==1){
            thisWebSocket.send(JSON.stringify(sendObj));
        }else{
            thisWebSocket.onopen=function(event){
                thisWebSocket.send(JSON.stringify(sendObj));
            }
        }
        return thisWebSocket;
    }

    var transEmoji = function (content){
        if (content.startsWith('(') && content.endsWith(')')){
            var code = content.substring(1,content.length-1)
            var emoji = emojiDict[code]
            if (emoji){
                var aa  = String.fromCodePoint(emoji)
                return aa;
            }
        }
        return content;
    }
};
