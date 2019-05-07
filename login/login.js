const $ = require("../common/jquery-3.3.1.min.js");
//zaiinput输入框中按enter键，值为空时不可提交
var $formElm;
var $userName; //用户名输入框
var $userPass; //密码输入框

/*
 *验证用户名和密码格式是否正确
 */
function checkUserMsg(ev) {
        //用户名：任意非空字符
        let nameValue = $($userName).val();
        let namePattern = /.*/g;
        //密码：6-18位英文字符/下划线/数字
        let passValue = $($userPass).val();
        let passPattern = /^\w{6,18}$/;
        if (!nameValue.trim()) {
          ev.preventDefault();
          alert("用户名不能为空");
        } else if (!namePattern.test(nameValue)) {
          ev.preventDefault();
          alert("用户名格式不正确");
        } else if (!passValue.trim()) {
          ev.preventDefault();
          alert("请输入密码");
        } else if (!passPattern.test(passValue)) {
          ev.preventDefault();
          alert("密码格式不正确");
        }
  }

$(function() {
  $userName = $(".username");
  $userPass = $(".userpass");
  $formElm=$("form");
  $($formElm).on("submit",function(event){
    checkUserMsg(event);
  });
});
