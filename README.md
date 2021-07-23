# 蝌蚪聊天室2021修改 
## 示例地址：
[https://zzzgd.info/kedou/](https://zzzgd.info/kedou/)
# 请在界面上保留作者链接信息


## 命令
```
1.输入 我叫XX 则会设置你的昵称为XX
2.输入 我是男生/女生/3 可以设置小蝌蚪为蓝色/粉色/白色
3.(仅私服可见)输入 rgb+颜色参数即可设置对应颜色，支持十六进制与rgba
 如rgb(41,182,216,0.5)或rgb#29F666,输入 delcolor 删除颜色
4.输入 速度10 则会调整移动速度为10 初始速度为5
5.输入 10,10 则可移动到坐标10,10
6.使用[ ]包含链接,可在世界动态中点击访问
7.(仅私服可见) 使用()包含拼音发送表情,有xiao(笑),ku(哭),xiaoku(笑哭),liuhan(流汗)
qinqin(亲亲),aixin(爱心),guilian(鬼脸),kun(困),tu(吐),biti(鼻涕),xu(嘘),
yinchen(阴沉),baiyan(白眼),kelian(可怜),(jingle)惊了
8.(仅私服,电脑浏览器可用) 输入 通知开 开启接收信息弹窗, 输入 通知关 关闭,
开启后可以接收其他人的艾特信息, 艾特格式: @名字+空格+信息
9.输入 暂停 可以暂停刷新世界动态,方便看历史记录,输入 暂停关 恢复
10.输入 时长 可以发送时长信息
```

### Forked from [fmwww/workerman-todpole-web](https://github.com/fmwww/workerman-todpole-web)
以及
### Forked from [mnmnmssd/my-todpole-web](https://github.com/mnmnmssd/my-todpole-web)

最近几天接触到了这个, 挺有意思的, 然后也发现了[mnmnmssd](https://github.com/mnmnmssd) 这位的修改版, 
也看到他借鉴了(From [华仔]( https://www.zjh336.cn/)), 于是我又从华仔这搞了点其他的功能, 搬运工.

## 主要功能

在fmwww的基础上修改而来 ，基于fmwww的版本

- [x] 世界动态（展示所有用户的发言，并显示在线用户数）
- [x] 瞬移（世界动态中点击用户名称或发言坐标可以瞬移，聊天输入x,y可以瞬移）
- [x] 改名指令优化 (name:xxx或我叫xxx)
- [x] 速度调整（输入速度10，可以设置速度）
- [x] 改变颜色（可以根据性别显示不同的颜色）
- [x] 在线列表（显示当前在线用户，同时可以跟随某个用户）
- [x] 增加与修复了一些bug

## mnmnmssd的功能

- [x] 独立的颜色设置 ， 现在每只蝌蚪都有自己的颜色啦
- [x] 修复了fmwww的负坐标传送bug
- [x] 增加了黑名单 ， 遇到不想看见的人就屏蔽他吧！！
- [x] 去除了跟随指令
- [x] 添加链接可点击  (From [华仔]( https://www.zjh336.cn/))

## 新增功能
- [x] 分身功能(隐藏功能)  (From [华仔]( https://www.zjh336.cn/))

[Demo地址](http://zzzgd.info/kedou/)

- [x] 增加了最大速度限制. 避免速度太大会炸房, 这个无意中发现, 数字超过一定值就会整个房间卡住几分钟.
- [x] 有一些可能会被人捣乱的命令, 不会直接在页面上展示了, 输入命令`whosyourdaddy`的话可以展示,`whosyourdaddyoff`关闭.
- [x] 增加部分表情emoji, 和颜色一样, 只有该页面私服的人可以有效
- [x] 增加介绍的隐藏和开启, 输入 看介绍 和 关介绍
- [x] 增加点击进行@人, 并发送浏览器弹窗的通知信息, 通知开 和 通知关 进行开关
- [x] 解除发送字数45字限制  
- [x] 增加颜色闪烁功能(隐藏功能)
- [x] 修改游客名字, 从Guest改为迷路蝌蚪+时间戳
- [x] 增加改名发送消息提示的功能
- [x] 增加随时暂停世界动态, 看历史消息的功能
- [x] 增加不蒜子统计
- [x] 增加时长累计
- [ ] 其他

## 修复问题
- [x] 修复分身开,颜色不同步的问题
- [x] 修复发送url的时候, 一些特定的url会导致掉线的问题, 解决办法是先转base64, 再转回来
- [x] 优化手机适配
- [ ] 其他

# 在自己的服务器上安装部署


1、下载或者clone代码到你的虚拟主机任意目录并且能够访问index.html即可

2、浏览器访问地址 虚拟主机域名或者ip 如图：

![image-20200822223922899](https://cdn.jsdelivr.net/gh/mnmnmssd/hexoBlogimg/blog/2020/image-20200822223922899.png)


请在界面上保留作者链接信息,不然会被你的域名会被workerman主机屏蔽，导致无法使用。

# 非常感谢Rumpetroll

本程序是由 [Rumpetroll](http://rumpetroll.com/) 修改而来。非常感谢Rumpetroll出色的工作。
原 [Repo: https://github.com/danielmahal/Rumpetroll](https://github.com/danielmahal/Rumpetroll)
