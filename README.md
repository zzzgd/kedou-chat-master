# 蝌蚪聊天室2021修改 

### Forked from [fmwww/workerman-todpole-web](https://github.com/fmwww/workerman-todpole-web)
以及
### Forked from [mnmnmssd/my-todpole-web](https://github.com/mnmnmssd/my-todpole-web)

最近几天接触到了这个, 挺有意思的, 然后也发现了[mnmnmssd](https://github.com/mnmnmssd) 这位的修改版, 
也看到他借鉴了(From [华仔]( https://www.zjh336.cn/)), 于是我又从华仔这搞了点其他的功能, 搬运工.

## 主要功能

在fmwww的基础上修改而来 ，基于fmwww的版本

- [x] 世界动态（展示所有用户的发言，并显示在线用户数）
- [x]  瞬移（世界动态中点击用户名称或发言坐标可以瞬移，聊天输入x,y可以瞬移）
-  [x] 改名指令优化 (name:xxx或我叫xxx)
-  [x] 速度调整（输入速度10，可以设置速度）
-  [x] 改变颜色（可以根据性别显示不同的颜色）
-  [x] 在线列表（显示当前在线用户，同时可以跟随某个用户）
-  [x] 增加与修复了一些bug

## mnmnmssd的功能

-  [x] 独立的颜色设置 ， 现在每只蝌蚪都有自己的颜色啦
-  [x] 修复了fmwww的负坐标传送bug
-  [x] 增加了黑名单 ， 遇到不想看见的人就屏蔽他吧！！
-  [x] 去除了跟随指令
-  [x] 添加链接可点击  (From [华仔]( https://www.zjh336.cn/))

## 新增功能
- [x] 分身功能  (From [华仔]( https://www.zjh336.cn/))

[Demo地址](http://zzzgd.info/kedou/)

- [x] 增加了最大速度限制. 避免速度太大会炸房, 这个无意中发现, 数字超过一定值就会整个房间卡住几分钟.
- [x] 有一些可能会被人捣乱的命令, 不会直接在页面上展示了, 输入命令`whosyourdaddy`的话可以展示,`whosyourdaddyoff`关闭.
- [x] 增加部分表情emoji, 和颜色一样, 只有该页面私服的人可以有效
- [x] 增加介绍的隐藏和开启, 输入 看介绍 和 关介绍
- [x] 增加点击进行@人, 并发送浏览器弹窗的通知信息, 通知开 和 通知关 进行开关
- [x] 解除发送字数45字限制  
- [x] 修复分身开,颜色不同步的问题
- [x] 增加颜色闪烁功能
- [ ] 其他


# 在自己的服务器上安装部署

1、下载或者clone代码到你的虚拟主机任意目录并且能够访问index.html即可

2、浏览器访问地址 虚拟主机域名或者ip 如图：

![image-20200822223922899](https://cdn.jsdelivr.net/gh/mnmnmssd/hexoBlogimg/blog/2020/image-20200822223922899.png)

3、示例地址：
[zzzgd](https://zzzgd.info/kedou/)
# 请在界面上保留作者链接信息

请在界面上保留作者链接信息,不然会被你的域名会被workerman主机屏蔽，导致无法使用。

# 非常感谢Rumpetroll

本程序是由 [Rumpetroll](http://rumpetroll.com/) 修改而来。非常感谢Rumpetroll出色的工作。
原 [Repo: https://github.com/danielmahal/Rumpetroll](https://github.com/danielmahal/Rumpetroll)
