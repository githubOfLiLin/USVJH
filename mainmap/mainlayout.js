/*
整体布局，包括响应式布局的样式，以及响应式布局等
自定义按钮的按下弹起效果等
*/
/*
全局变量
*/
var rightmenu; //右侧菜单栏，包含分隔器
var center; //中间map+右侧菜单栏
var rightmenuSlicer; //右侧菜单和map的分隔器
var classRmTitle; //右侧菜单的二级菜单title部分,一批所有的二级菜单标题，用于绑定点击事件
var defBtns; //所有自定义按钮nodelist 为其添加按下弹起样式
var map;
var mapCanvas;
/*
initmap()
初始化地图
*/
function initmap() {
  var objMapInfo = [];
  var mapObj = document.getElementById("map");
  API_SetMapImgMode(1); //1=使用叠加谷歌地图模式
  API_SetMapMinMaxLevel(3, 16); //设置比例尺级别从3-16
  objMapInfo.div = "map"; //海图容器div的id
  if (browser["versions"].mobile) {
    objMapInfo.model = "android"; //用于android环境
  } else {
    objMapInfo.model = "pc"; //用于pc环境
  }
  API_InitYimaMap(objMapInfo); //初始化SDK
  API_SetMapImagesUrl("http://www.yimasoftdemo.cc:800/mapimg/"); //设置显示图片地址
  API_SetMapLevel(10, { x: 120.27548, y: 35.99195 }); //设置当前比例尺级别和中心点位置
  API_SetScaleLenInfoPosition(true, 20, 55); //显示比例尺长度
  API_SetShowToolBarOrNot(true, 80, 50); //显示工具条
  API_SetMousePoInfoDivPosition(true, 20, 20); //显示鼠标位置
  API_SetScaleInfoDivPosition(true, 20, 20); //显示比例尺位置
}

/*
实现右侧菜单的左侧边框可拖拽
同时改变地图框以及右侧菜单框的宽度
*/
function rightMenuDrag(event) {
  // //获取rightmenu左侧边框位置以及原始宽度
  var el = rightmenuSlicer;
  var dragable = false;
  dragable = true;
  var preLeftX = rightmenu.offsetLeft;
  var preWidth = rightmenu.offsetWidth;
  center.onmousemove = function(ev) {
    if (dragable) {
      var afWidth = preLeftX - ev.pageX + preWidth;
      center.style.cssText += "; padding-right:" + afWidth + "px;";
      rightmenu.style.cssText += "; width:" + afWidth + "px;";
      mapCanvas.width = map.clientWidth;
      mapCanvas.height = map.clientHeight;
    }
    return false;
  };
  center.onmouseup = function() {
    center.onmousemove = null;
    center.onmouseup = null;
  };
  return false; //IE中，使用return false 可以阻止事件的默认行为
}
/*
 *点击二级菜单标题，显示其对应的内容
 *并隐藏其后面的二级菜单内容
 */
function classRmTClick(ev) {
  var el = ev.target;
  var classRmContent = el.nextSibling;
  var visContent = document.querySelector(".class_rm_cont_visable"); //此刻正显示的二级菜单内容
  if (visContent != null) {
    visContent.classList.remove("class_rm_cont_visable"); //为元素删除类名
  }
  while (classRmContent != null && classRmContent.nodeType != 1) {
    classRmContent = classRmContent.nextSibling;
  }
  if (classRmContent) {
    classRmContent.classList.add("class_rm_cont_visable"); //为元素添加类名
  }
}

/*
该load事件触发在文件加载过程结束的时候。
此时，文档中的所有对象都位于DOM中，并且所有图像，脚本，链接和子框架都已完成加载
同时window.onload会导致页面刷新
*/
function wOnload() {
  // console.log(this);//this为window对象，并不是该script标签对象
  initmap();
  rightmenu = document.getElementById("rightmenu");
  center = document.querySelector(".center");
  classRmTitle = document.querySelectorAll(".class_rm_title");
  map = document.getElementById("map");
  mapCanvas = document.getElementById("map_canvas");
  //添加右侧菜单可拖动改变宽度事件
  rightmenuSlicer = document.querySelector(".rightmenu_slicer");
  mapCanvas.width = map.clientWidth;
  mapCanvas.height = map.clientHeight;
  rightmenuSlicer.onmousedown = function(ev) {
    rightMenuDrag(ev);
  };
  //添加二级菜单点击标题显示内容，且其他二级菜单收起内容事件
  for (let i = 0, len = classRmTitle.length; i < len; i++) {
    classRmTitle[i].onclick = function(ev) {
      classRmTClick(ev);
    };
  }

}
window.onload = function() {
  wOnload();
  require.ensure([], function() {
    var toolbarEv=require('./toolbar_event.js') //baidumap.js放在我们当前目录下
    //toolbarEv.wOnload2();
  })
};
/*
实现右侧菜单的左侧边框可拖拽
同时改变地图框以及右侧菜单框的宽度
*/
/*function rightMenuDrag(event){
    console.log("mousedown");
    //获取其左侧边框位置
    var el=event.target;
    var preLeftX=el.offsetLeft;
    var preWidth=el.offsetWidth;
    console.log(preWidth);
    var dragable=false;
    console.log(el,preLeftX,event.pageX);
    if(event.pageX>preLeftX&&event.pageX<preLeftX+6){
        dragable=true;
        console.log("mousedowntrue");
    }
    else{
        dragable=false;
    }
   
    center.onmousemove=function(ev){   
if(dragable){
    var afWidth=preLeftX-ev.pageX+preWidth;
    console.log(afWidth);
    center.style.cssText+="; padding-right:"+afWidth+"px; cursor:w-resize;";
    console.log(center.style.cssText);
    el.style.cssText+="; width:"+afWidth+"px;";
    console.log("mousemove");
}
return false;
    }
    center.onmouseup=function(){
        center.onmousemove=null;
        center.onmouseup=null;
        center.style.cssText+="cursor:auto;"
    }
    return false;
}*/
