// 此文件下载者不用更改，兼容其他域名使用
var Settings = function() {
	// 如果是workerman.net phpgame.cn域名 则采用多个接入端随机负载均衡
	var domain_arr = ['kedou.workerman.net'];
	this.socketServer = 'ws://'+domain_arr[Math.floor(Math.random() * domain_arr.length + 1)-1]+':8280';

	//如果是想要在https的域名下使用, 参考https://zzzgd.blog.csdn.net/article/details/118224893
	// var domain_arr = ['zzzgd.info'];
	// this.socketServer = 'wss://'+domain_arr[Math.floor(Math.random() * domain_arr.length + 1)-1]+'/wss';
}
