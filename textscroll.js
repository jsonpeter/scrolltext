/**
 * Created by Xie on 2017/7/21.
 */
(function (global) {
    var _scroll= function (config) {
      //一些默认配置...
      var Config=config|| {};
      this.context=Config.con;
      this.conbox=Config.conbox;
      this.body=document.querySelector('body');
      this.scrollBot=Config.scrollbot;
      this.scrollRight=Config.scrollright;
      this.scrollBotSpan=Config.scrollbot.querySelector('span');
      this.pageCount=0; //总页数
      this.currPage=1;//当前页码
      this.stepPage=0;//拖动一步长度
      this.stepPageRight=0;//右边一步长度
      this.eventName={Down:'mousedown',Up:'mouseup',Move:'mousemove'};
      //移动设备事件
      if(navigator.userAgent.match(/(iPhone|iPod|Android|ios|SymbianOS)/i)){
          this.eventName={Down:'touchstart',Up:'touchend',Move:'touchmove'};
      }
  }
    _scroll.prototype={
      //初始化
      init:function () {
          var _conHeight=this.context.offsetHeight;
          var _bodyHeight=this.body.offsetHeight;
          //如果内容超过页面
          if(_conHeight>_bodyHeight){
              //如果超过页面则显示横向滚动
              this.scrollBot.setAttribute("class",'active');
              this.scrollBot.style.width=this.conbox.offsetWidth+'px';
              //计算总页数
              var _pageCount=Math.ceil(_conHeight/_bodyHeight);
              this.pageCount=_conHeight%_bodyHeight===0?_pageCount-1:_pageCount;
              //计算一步的长度
              this.stepPage=Math.ceil(this.scrollBot.offsetWidth/this.pageCount);
              this.stepPageRight=Math.ceil(this.conbox.offsetHeight/this.pageCount);
          }
      },
      //绑定事件
      event:function () {
           var that=this;
          //添加鼠标按下事件
          EventUtil(this.scrollBotSpan,that.eventName.Down,function () {
              //添加滚动事件
              EventUtil(document,that.eventName.Move,_move).addHandler();
              //鼠标松开移除事件
              EventUtil(document,that.eventName.Up,function () {
                  //移除移动事件
                  EventUtil(document,that.eventName.Move,_move).removeHandler();
                  //移除当前松开事件
                  EventUtil(document,that.eventName.Up,arguments.callee).removeHandler();
              }).addHandler();
          }).addHandler();
          //移动私有方法
          function _move(ev) {
              var _ev=ev||event;
              //当前获取不到则获取父级节点
              var offleft=that.scrollBot.offsetLeft===0?that.scrollBot.parentNode.offsetLeft: that.scrollBot.offsetLeft;
              //计算出鼠标坐标相对于父级的位置
              var moveX =(_ev.clientX||_ev.touches[0].clientX) - offleft;
              //拖动不能超出滚动条的长度
              if (moveX <= (that.scrollBot.offsetWidth - that.scrollBotSpan.offsetWidth) && moveX >= 0) {
                  if (moveX < that.stepPage * that.currPage) {
                      that.currPage = that.currPage === 1 ? 1 : that.currPage - 1;
                  }
                  if (moveX > that.stepPage * that.currPage) {
                      that.currPage = that.currPage === that.pageCount ? that.pageCount : that.currPage + 1;
                  }

                  //右边第一和最后一个靠顶底，其他居中
                  var _right=0;
                  if(that.currPage>= that.pageCount){
                      //容器高度减去自身高度
                      _right=that.conbox.offsetHeight-that.scrollBotSpan.offsetHeight;
                  }else if(that.currPage===1){
                      _right=0;
                  }else{
                      _right=(that.stepPageRight * that.currPage)/2
                  }
                  //位置移动不支持transform使用left属性
                  if (typeof document.body.style.webkitTransform === 'undefined' && typeof document.body.style.transform === 'undefined') {
                      that.scrollRight.style.top = _right + 'px';
                      that.context.style.marginTop = 0 - that.conbox.offsetHeight * (that.currPage - 1) + 'px';
                      that.scrollBotSpan.style.left = moveX + 'px';
                  } else {
                      that.scrollRight.style.transform = 'translate(0px,' +_right + 'px)';
                      that.context.style.transform = 'translate(0px, ' + (0 - that.conbox.offsetHeight * (that.currPage - 1)) + 'px)';
                      that.scrollBotSpan.style.transform = 'translate(' + moveX + 'px, 0px)';
                  }
                  that.scrollBotSpan.innerHTML = that.scrollRight.innerHTML = that.currPage;
              }
          }
      }
  }
    //事件兼容处理
    function EventUtil(element, type, handler) {
       return {
            addHandler: function(){
                if (element.addEventListener){
                    element.addEventListener(type, handler, false);
                } else if (element.attachEvent){
                    element.attachEvent("on" + type, handler);
                } else {
                    element["on" + type] = handler;
                }
            },
            removeHandler: function(){
                if (element.removeEventListener){
                    element.removeEventListener(type, handler, false);
                } else if (element.detachEvent){
                    element.detachEvent("on" + type, handler);
                } else {
                    element["on" + type] = null;
                }
            }
        }
    }
    global.scroll=_scroll;
})(this)