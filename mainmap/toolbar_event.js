/*
顶部工具栏各个工具按钮所实现的功能事件
*/
//const $=require("../common/jquery-3.3.1.min.js");
//全局变量
var screenshot;
var mapCanvas; //画图容器
var ctx; //画图容器上下文
var map;
var center; //中间map+右侧菜单栏
var offTop;
//各个工具栏按钮
var barEBL ;
var barMeasure ;
var barAnchor;
var barCleanAnchor;
//各个工具按钮的标志量
var boolToolBar = {
  EBL:false,
  measure: false,
  anchor:false
};
//画电子方位线所需的参数，半径以及圆心的经纬度点
var paramOfEBL = {
  centerPosL: { x: 0, y: 0 },
  radiusPosL: { x: 0, y: 0 },
  draw: false
};
//画测距线所需参数
var paramMeasure = {
  PosLArray: [], //数组中存储一系列测距点，每个点由坐标x,y表示
};
//画锚点所需参数
var paramAnchor={
  PosLArray: [], //数"组中存储一系列测距点，每个点由坐标x,y表示
  img:{},
}
//添加航线所需参数

var baseNum = Math.pow(10, 8); //经纬度转地理坐标

//用户名
var username="";
var userCon;//用户名所在的span
/*
截屏功能
*/
function captureScreen() {
  console.log("capturescreen");
  // API_CutMapViewToImg(true, true, "capture",{w:200,h:200},null);//API有问题，截屏后的图片不能显示
}
/*
电子方位线
*/
function getElecBearLine() {
  var centerPos = { x: 0, y: 0 }; //圆心
  //使paramOfEBL.draw为false，
  //每次就算没有点击鼠标右键取消绘制，在每次画新的电子方位线时也要清除一下画布
  paramOfEBL.draw = false;
  if(!boolToolBar.EBL){
    map.onmousedown = function(ev) {
      API_ClearCurMouseMove(); //清除原有的地图的鼠标移动事件
      centerPos.x = ev.pageX;
      centerPos.y = ev.pageY - offTop;
      let posL = API_GetLonLatPoByScrnPo(centerPos.x, centerPos.y, null); //屏幕坐标转换成经纬度坐标
      paramOfEBL.centerPosL.x = posL.x;
      paramOfEBL.centerPosL.y = posL.y;
      paramOfEBL.draw = true;
      return false;
    };
    var mouseMove = function() {
      var ev = arguments[0];
      let radiusX = ev.pageX;
      let radiusY = ev.pageY - offTop;
      let radiusPos = { x: radiusX, y: radiusY };
      let posL = API_GetLonLatPoByScrnPo(radiusPos.x, radiusPos.y, null); //屏幕坐标转换成经纬度坐标;
      paramOfEBL.radiusPosL.x = posL.x;
      paramOfEBL.radiusPosL.y = posL.y;
      return false;
    };
    map.onmousemove = throttle(mouseMove, 200);
    map.onmouseup = function() {
      map.onmousedown = null;
      map.onmousemove = null;
      map.onmouseup=null;
    };
    boolToolBar.EBL=true;
    barEBL.title="取消电子方位线";
  }
  else{
    boolToolBar.EBL=false;
    barEBL.title="电子方位线";
  }
}
//测距和角度
function getDistAndAng() {
  if (!boolToolBar.measure) {
    API_ClearCurMouseMove(); //清除原有的地图的鼠标移动事件
    paramMeasure.PosLArray = [];
    //类才有原型，paramMeasure.PosLArray只是一个数组实例，没有原型，Array才有原型
    map.onclick = function(ev) {
      var posS = { x: 0, y: 0 };
      posS.x = ev.pageX;
      posS.y = ev.pageY - offTop;
      var posL = API_GetLonLatPoByScrnPo(posS.x, posS.y, null);
      paramMeasure.PosLArray.push(posL);
    };
    boolToolBar.measure = true;
    barMeasure.title = "取消测距";
  } else {
    paramMeasure.PosLArray = [];
    boolToolBar.measure = false;
    barMeasure.title = "测距";
  }
}

/*
添加锚点
以canvas贴image的方式标志锚点
*/
function addAnchor(){
  API_ClearCurMouseMove(); //清除原有的地图的鼠标移动事件
  boolToolBar.anchor=true;
  //paramAnchor.PosLArray = [];
  //类才有原型，paramMeasure.PosLArray只是一个数组实例，没有原型，Array才有原型
  map.onclick = function(ev) {
    var posS = { x: 0, y: 0 };
    var imageS = { x: 0, y: 0 };
    posS.x = ev.pageX;
    posS.y = ev.pageY - offTop;
    imageS.x=posS.x-10;
    imageS.y=posS.y-10;
    var posL = API_GetLonLatPoByScrnPo(posS.x, posS.y, null);
    paramAnchor.PosLArray.push(posL);
  };
}
//清除锚点
function cleanAchor(){
  paramAnchor.PosLArray = [];
  boolToolBar.anchor=false;
  console.log("clear");
  //发送get请求
 var xhr=new XMLHttpRequest();
 xhr.onreadystatechange=function()
        {
          console.log("路径正确");
            if (xhr.readyState==4 && xhr.status==200)
            {
                //获得来自服务器的响应
                var data = xhr.responseText;
                // data=JSON.parse(data);
                console.log(data);
            }
        }
        xhr.open("get","/dataFile/anchor.json?delete=all",true);//绝对路径，相对于服务器根目录
        xhr.send(null);

}


/*
*添加航线
*/
function addRoute(){

}


//更新Canvas
function refreshCanvas() {
  setInterval(function() {
    drawCanvas();
  }, 200);
}

/*
canvas画图，根据点击的工具按钮画不同的图，要有标志量
*/
function drawCanvas() {
  ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
  //电子方位线
  if (paramOfEBL.draw) {
    let centerPosL = paramOfEBL.centerPosL;
    let radiusPosL = paramOfEBL.radiusPosL;
    let centerPosS = API_GetScrnPoByLonLatPo(centerPosL.x, centerPosL.y, null);
    let radiusPosS = API_GetScrnPoByLonLatPo(radiusPosL.x, radiusPosL.y, null);
    let offX = radiusPosS.x - centerPosS.x;
    let offY = radiusPosS.y - centerPosS.y;
    let radius = Math.sqrt(offX * offX + offY * offY);
    ctx.beginPath(); //开始路径
    ctx.strokeStyle = "#f00"; //边框颜色
    ctx.arc(centerPosS.x, centerPosS.y, radius, 0, Math.PI * 2); //参数依次为圆心坐标x,y，半径，开始结束角，绘制方向顺时针
    ctx.stroke();
    ctx.closePath(); //关闭路径
    //画直线
    ctx.beginPath(); //开始路径
    ctx.strokeStyle = "#00f"; //边框颜色
    ctx.moveTo(centerPosS.x, centerPosS.y);
    ctx.lineTo(radiusPosS.x, radiusPosS.y);
    ctx.stroke();
    ctx.closePath(); //关闭路径
    //绘制两点之间的角度和距离
    let dist =API_GetDistBetwTwoPoint(
      centerPosL.x * baseNum,
      centerPosL.y * baseNum,
      radiusPosL.x * baseNum,
      radiusPosL.y * baseNum
    );
    let angle =API_GetDegreesBetwTwoPoint(
      centerPosL.x * baseNum,
      centerPosL.y * baseNum,
      radiusPosL.x * baseNum,
      radiusPosL.y * baseNum
    );
    dist = dist.toFixed(2).toString();
    angle = angle.toFixed(2).toString();
    ctx.fillStyle = "#f00";
    ctx.font = "16px Arial";
    ctx.fillText(" " + dist + "km " + angle + "度", radiusPosS.x, radiusPosS.y);
  }
  //测距
  if (boolToolBar.measure) {
    if (paramMeasure.PosLArray.length > 0) {
      let prePosL = paramMeasure.PosLArray[0];
      let prePosS = API_GetScrnPoByLonLatPo(prePosL.x, prePosL.y, null);
      ctx.beginPath();
      ctx.fillStyle = "#00f";
      ctx.arc(prePosS.x, prePosS.y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    }

    for (let i = 1, len = paramMeasure.PosLArray.length; i < len; i++) {
      let prePosL = paramMeasure.PosLArray[i - 1];
      let nextPosL = paramMeasure.PosLArray[i];
      let prePosS = API_GetScrnPoByLonLatPo(prePosL.x, prePosL.y, null);
      let nextPosS = API_GetScrnPoByLonLatPo(nextPosL.x, nextPosL.y, null);
      //画线
      ctx.beginPath();
      ctx.strokeStyle = "#f00";
      ctx.moveTo(prePosS.x, prePosS.y);
      ctx.lineTo(nextPosS.x, nextPosS.y);
      ctx.stroke();
      ctx.closePath();
      //画点，以画圆的方式实现
      ctx.beginPath();
      ctx.fillStyle = "#00f";
      ctx.arc(prePosS.x, prePosS.y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
      if(i==len-1){
        ctx.beginPath();
        ctx.fillStyle = "#00f";
        ctx.arc(nextPosS.x, nextPosS.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
      }
      //显示两点之间的距离和角度
      let dist = API_GetDistBetwTwoPoint(
        prePosL.x * baseNum,
        prePosL.y * baseNum,
        nextPosL.x * baseNum,
        nextPosL.y * baseNum
      );
      let angle = API_GetDegreesBetwTwoPoint(
        prePosL.x * baseNum,
        prePosL.y * baseNum,
        nextPosL.x * baseNum,
        nextPosL.y * baseNum
      );
      dist = dist.toFixed(2).toString();
      angle = angle.toFixed(2).toString();
      ctx.font = "16px Arial";
      ctx.fillStyle = "#f00";
      ctx.fillText( dist + "km " + angle + "度",nextPosS.x, nextPosS.y);
    }
  }
  //锚点
  if( paramAnchor.PosLArray.length > 0){
    if (paramAnchor.PosLArray.length > 0) {
      let prePosL = paramAnchor.PosLArray[0];
      let prePosS = API_GetScrnPoByLonLatPo(prePosL.x, prePosL.y, null);
      ctx.drawImage(paramAnchor.img,prePosS.x-10, prePosS.y-10,20,20);
    }
    for(let i=1,len=paramAnchor.PosLArray.length;i<len;i++){
      let prePosL = paramAnchor.PosLArray[i - 1];
      let nextPosL = paramAnchor.PosLArray[i];
      let prePosS = API_GetScrnPoByLonLatPo(prePosL.x, prePosL.y, null);
      let nextPosS = API_GetScrnPoByLonLatPo(nextPosL.x, nextPosL.y, null);
      //画线 画虚线
      ctx.beginPath();
      ctx.strokeStyle = "#555";
      ctx.moveTo(prePosS.x, prePosS.y);
      ctx.lineTo(nextPosS.x, nextPosS.y);
      ctx.stroke();
      ctx.closePath();
      //画图标，以贴图的方式实现 
      ctx.drawImage(paramAnchor.img,prePosS.x-10, prePosS.y-10,20,20);
      if(i==len-1){
        ctx.drawImage(paramAnchor.img,nextPosS.x-10, nextPosS.y-10,20,20);
      }
    }

  }
}

//函数节流，性能问题
function throttle(func, delay) {
  //结合了时间戳和定时器，使得在事件第一次触发时就立即执行
  //而事件最后一次触发后也会再执行一次
  var timer = null;
  var startTime = Date.now();
  return function() {
    var curTime = Date.now();
    var remaining = delay - (curTime - startTime);

    var context = this;
    var args = arguments;
    //throttle函数return的函数才是事件本身所绑定的函数，
    //所以要获得的也是这个函数的参数，从而传递给真正要执行的事件函数
    //而不是throttle函数的参数
    clearTimeout(timer); //定时器未触发之前清除定时器事件，但是定时器并不是null
    if (remaining <= 0) {
      func.apply(context, args);
      startTime = Date.now();
    } else {
      //remaining是在不断减少的，所以尽管timer每次触发都会清空上一次的timer
      //但总有一次是在还来不及清空时，就触发了的，所以，要么是时间戳触发，要么是定时器触发
      timer = setTimeout(function() {
        func.apply(context, args);
      }, remaining);
    }
  };
}

function wOnload2(){
//DOM
screenshot = document.getElementById("screenshot");
map = document.getElementById("map");
center = document.querySelector(".center");
mapCanvas = document.getElementById("map_canvas");
ctx = mapCanvas.getContext("2d");
barEBL = document.getElementById("elec_bearline");
barMeasure = document.getElementById("measure");
barAnchor=document.getElementById("anchor");
barCleanAnchor=document.getElementById("clean_anchor");
userCon=document.querySelector(".user");
offTop = center.offsetTop;
// paramAnchor.img=new Image();
// paramAnchor.img.src="D:/Work-web/HAITU/USVJH/image/images1/anchor1.png";
paramAnchor.img=new Image();
paramAnchor.img.src=require("../image/images1/anchor1.png");
//动态引入图片资源，则需要使用require命令，将该图片打包到静态资源中，不然会出现找不到正确路径
/*
事件
*/

//截屏
screenshot.onclick = function() {
  captureScreen();
};
//电子方位线功能
barEBL.onclick = function() {
  getElecBearLine();
};
//测距
barMeasure.onclick = function() {
  getDistAndAng();
};
//添加锚点
barAnchor.onclick=function(){
addAnchor();
}

barCleanAnchor.onclick=function(){
cleanAchor();
}
//map鼠标右键，取消画图
map.oncontextmenu = function(ev) {
  ev.preventDefault();
  if (boolToolBar.measure) {
    map.onclick = null;
  }
  if( boolToolBar.anchor){
  map.onclick=null;
  //发送post请求
 let xhr=new XMLHttpRequest();
 xhr.onreadystatechange=function()
        {
            if (xhr.readyState==4 && xhr.status==200)
            {
                //获得来自服务器的响应
                var data = xhr.responseText;
                // data=JSON.parse(data);
                console.log(data);
            }
        }
        xhr.open("post","/dataFile/anchor.json",true);//绝对路径，相对于服务器根目录
        xhr.setRequestHeader("Content-Type","application/json"); // 可以定义请求头带给后端
        var strdata=JSON.stringify(paramAnchor.PosLArray);
        xhr.send(strdata);
  }
  return false;
};
//将保存在服务端的需要画图的数据请求过来
 //发送get请求
let xhr=new XMLHttpRequest();
 xhr.onreadystatechange=function()
        {
            if (xhr.readyState==4 && xhr.status==200)
            {
                //获得来自服务器的响应
                var data = xhr.responseText;
                console.log(typeof(data));
                paramAnchor.PosLArray=JSON.parse(data);
            }
        }
        xhr.open("get","/dataFile/anchor.json?add=all",true);//绝对路径，相对于服务器根目录
        xhr.setRequestHeader("Accept","application/json");
        xhr.send(null);

        //登录之后，从cookie获取用户名，并将用户名显示在右侧工具栏上
        let xhrUser=new XMLHttpRequest();
        xhrUser.onreadystatechange=function()
               {
                   if (xhrUser.readyState==4 && xhrUser.status==200)
                   {
                       //获得来自服务器的响应
                       var data = xhrUser.responseText;
                       console.log(typeof(data));
                       username=data;
                       userCon.innerText=data;
                   }
               }
               xhrUser.open("get","/mainmap",true);//绝对路径，相对于服务器根目录
               xhrUser.setRequestHeader("Accept","text/plain");
               xhrUser.send(null);       
/*
更新canvas画图
*/
refreshCanvas();
}
wOnload2();

