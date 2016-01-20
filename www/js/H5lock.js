(function(){window.H5lock=function(e){this.height=e.height,this.width=e.width,this.chance=5,this.chooseType=Number(window.localStorage.getItem("chooseType"))||e.chooseType},H5lock.prototype.drawCle=function(e,t){this.ctx.strokeStyle="#1e2329",this.ctx.fillStyle="gray",this.ctx.lineWidth=20,this.ctx.beginPath(),this.ctx.arc(e,t,6,0,Math.PI*2,!0),this.ctx.stroke(),this.ctx.closePath(),this.ctx.imageSmoothingEnabled=!0,this.ctx.fill()},H5lock.prototype.drawPoint=function(){for(var e=0;e<this.lastPoint.length;e++)this.ctx.strokeStyle="#1e2329",this.ctx.fillStyle="#304d87",this.ctx.lineWidth=2,this.ctx.beginPath(),this.ctx.arc(this.lastPoint[e].x,this.lastPoint[e].y,this.r,0,Math.PI*2,!0),this.ctx.stroke(),this.ctx.closePath(),this.ctx.fill(),this.ctx.fillStyle="#FFF",this.ctx.beginPath(),this.ctx.arc(this.lastPoint[e].x,this.lastPoint[e].y,this.r/4,0,Math.PI*2,!0),this.ctx.closePath(),this.ctx.fill()},H5lock.prototype.drawStatusPoint=function(e){for(var t=0;t<this.lastPoint.length;t++)this.ctx.strokeStyle=e,this.ctx.beginPath(),this.ctx.arc(this.lastPoint[t].x,this.lastPoint[t].y,this.r,0,Math.PI*2,!0),this.ctx.closePath(),this.ctx.stroke()},H5lock.prototype.drawLine=function(e,t){this.ctx.strokeStyle="#fff",this.ctx.beginPath(),this.ctx.lineWidth=3,this.ctx.moveTo(this.lastPoint[0].x,this.lastPoint[0].y),console.log(this.lastPoint.length);for(var n=1;n<this.lastPoint.length;n++)this.ctx.lineTo(this.lastPoint[n].x,this.lastPoint[n].y);this.ctx.lineTo(e.x,e.y),this.ctx.stroke(),this.ctx.closePath()},H5lock.prototype.createCircle=function(){var e=this.chooseType,t=0;this.r=this.ctx.canvas.width/(2+4*e),this.lastPoint=[],this.arr=[],this.restPoint=[];var n=this.r;for(var r=0;r<e;r++)for(var i=0;i<e;i++){t++;var s={x:i*4*n+3*n,y:r*4*n+3*n,index:t};this.arr.push(s),this.restPoint.push(s)}this.ctx.clearRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);for(var r=0;r<this.arr.length;r++)this.drawCle(this.arr[r].x,this.arr[r].y)},H5lock.prototype.getPosition=function(e){var t=e.currentTarget.getBoundingClientRect(),n={x:e.touches[0].clientX-t.left,y:e.touches[0].clientY-t.top};return n},H5lock.prototype.update=function(e){this.ctx.clearRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);for(var t=0;t<this.arr.length;t++)this.drawCle(this.arr[t].x,this.arr[t].y);this.drawPoint(this.lastPoint),this.drawLine(e,this.lastPoint);for(var t=0;t<this.restPoint.length;t++)if(Math.abs(e.x-this.restPoint[t].x)<this.r&&Math.abs(e.y-this.restPoint[t].y)<this.r){this.drawPoint(this.restPoint[t].x,this.restPoint[t].y),this.lastPoint.push(this.restPoint[t]),this.restPoint.splice(t,1);break}},H5lock.prototype.checkPass=function(e,t){var n="",r="";for(var i=0;i<e.length;i++)n+=e[i].index+e[i].index;for(var i=0;i<t.length;i++)r+=t[i].index+t[i].index;return n===r},H5lock.prototype.storePass=function(e){this.pswObj.step==1?this.checkPass(this.pswObj.fpassword,e)?(this.pswObj.step=2,this.pswObj.spassword=e,document.getElementById("title").innerHTML="密码保存成功",this.drawStatusPoint("#2CFF26"),window.localStorage.setItem("passwordxx",JSON.stringify(this.pswObj.spassword)),window.localStorage.setItem("chooseType",this.chooseType)):(document.getElementById("title").innerHTML="两次不一致，重新输入",this.drawStatusPoint("red"),delete this.pswObj.step):this.pswObj.step==2?this.checkPass(this.pswObj.spassword,e)?(document.getElementById("title").innerHTML="解锁成功",this.drawStatusPoint("#2CFF26")):(this.drawStatusPoint("red"),this.chance--,this.chance?document.getElementById("title").innerHTML="密码错误，还能输入"+this.chance+"次":(alert("密码错误5次，需要重新登录"),this.updatePassword(),document.getElementById("title").innerHTML="请绘制解锁图案")):(this.pswObj.step=1,this.pswObj.fpassword=e,document.getElementById("title").innerHTML="请再次绘制解锁图案")},H5lock.prototype.makeState=function(){this.pswObj.step==2?(document.getElementById("updatePassword").style.display="block",document.getElementById("title").innerHTML="请解锁"):this.pswObj.step==1?document.getElementById("updatePassword").style.display="none":document.getElementById("updatePassword").style.display="none"},H5lock.prototype.setChooseType=function(e){chooseType=e,init()},H5lock.prototype.updatePassword=function(){window.localStorage.removeItem("passwordxx"),window.localStorage.removeItem("chooseType"),this.chance=5,this.pswObj={},document.getElementById("title").innerHTML="请绘制解锁图案",this.reset()},H5lock.prototype.initDom=function(){var e=document.createElement("div");this.w=window.innerWidth,e.className="unlock";var t='<dl><dd class="user_img"></dd><dt class="user_name">weishili@jd.com</dt></dl><h1 id="title" class="title">绘制手势图案</h1><canvas id="canvas" width="'+this.w+'" height="'+this.w+'"></canvas>'+'<a id="updatePassword">忘记手势密码</a>';e.setAttribute("style","position: absolute;top:0;bottom:0;"),e.innerHTML=t,document.body.appendChild(e)},H5lock.prototype.init=function(){this.initDom(),this.pswObj=window.localStorage.getItem("passwordxx")?{step:2,spassword:JSON.parse(window.localStorage.getItem("passwordxx"))}:{},this.lastPoint=[],this.makeState(),this.touchFlag=!1,this.canvas=document.getElementById("canvas"),this.ctx=this.canvas.getContext("2d"),this.createCircle(),this.bindEvent()},H5lock.prototype.reset=function(){this.makeState(),this.createCircle()},H5lock.prototype.bindEvent=function(){var e=this;this.canvas.addEventListener("touchstart",function(t){t.preventDefault();var n=e.getPosition(t);console.log(n);for(var r=0;r<e.arr.length;r++)if(Math.abs(n.x-e.arr[r].x)<e.r&&Math.abs(n.y-e.arr[r].y)<e.r){e.touchFlag=!0,e.drawPoint(e.arr[r].x,e.arr[r].y),e.lastPoint.push(e.arr[r]),e.restPoint.splice(r,1);break}},!1),this.canvas.addEventListener("touchmove",function(t){e.touchFlag&&e.update(e.getPosition(t))},!1),this.canvas.addEventListener("touchend",function(t){e.touchFlag&&(e.touchFlag=!1,e.storePass(e.lastPoint),setTimeout(function(){e.reset()},300))},!1),document.addEventListener("touchmove",function(e){e.preventDefault()},!1)}})(),define("H5lock.js",[],function(){return window.H5lock});