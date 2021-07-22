// 以构造函数的方式来实现  ,也可使用 class 来实现
var LinkedQueue = function () {
    // 定义一个节点结构
    let Node = function(ele) {
        this.ele = ele;
        this.next = null;
    }
    let length = 0, front, rear;
    // 队尾添加操作
    this.push = function(ele) {
        let node = new Node(ele);
        if(length === 0) {
            front = node;
        } else {
            let temp = rear;
            temp.next = node;
        }
        rear = node;
        length++;
        return true;
    }
    // 队首删除操作
    this.pop = function() {
        let temp = front;
        front = front.next;
        length--;
        temp.next = null;
        return temp.ele;
    }
    // 队列大小
    this.size = function() {
        return length;
    }
    // 获取头元素
    this.getFront = function() {
        return front;
    }
    // 获取尾元素
    this.getRear = function() {
        return rear;
    }
    // 读取队列元素 toString
    this.toString = function() {
        let str = '', temp = front;
        while(temp) {
            console.log(JSON.stringify(temp.ele))
            str = str + JSON.stringify(temp.ele) + ' ';
            temp = temp.next;
        }
        return str;
    }
    // 清空队列
    this.clear = function() {
        front = null;
        rear = null;
        length = 0;
        return true;
    }
}


