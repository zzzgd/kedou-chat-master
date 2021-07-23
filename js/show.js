var isMobile = function (){
    if (window.navigator.userAgent.match(/(phone|pad|pod|iPhone|iPad|iPod|ios|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)) {
        return true
    } else {
        return false
    }
}

var cleanDomBody = function (elementId) {
    var inst = document.getElementById(elementId)
    if (inst != null) {
        console.log(inst)
        while (inst.hasChildNodes()) //当div下还存在子节点时 循环继续
        {
            inst.removeChild(inst.firstChild);
        }
    }
}

var insertTagAndText = function (parentId, tagName, text) {
    var parent = document.getElementById(parentId)
    var tag = document.createElement(tagName);
    tag.innerHTML = text
    parent.appendChild(tag)
}

window.onload = function(){
    if (isMobile()) {
        cleanDomBody('more-instructions')
        cleanDomBody('online-users')
        var parent = document.getElementById('more-instructions')
        var a = document.createElement('a');
        a.setAttribute("href","https://zzzgd.info/archives/ke-dou-liao-tian-shi-zi-ji-zeng-jia-le-dian-gong-neng");
        a.setAttribute('target','_blank')
        a.appendChild(document.createTextNode("更多功能看介绍"));
        parent.appendChild(a);
    }

}