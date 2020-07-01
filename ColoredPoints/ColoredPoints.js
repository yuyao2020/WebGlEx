//ColoredPoints.js
//顶点着色器
//片元着色器
var VSHADER_SOURCE =
'attribute vec4 a_Position;\n' +
'void main(){\n' +
'gl_Position = a_Position;\n' +
'gl_PointSize = 10.0;\n' +
'}\n';

var FSHADER_SOURCE = 
'precision mediump float;\n' + //精度限定词
'uniform vec4 u_FragColor;\n' +
'void main(){\n' +
'gl_FragColor = u_FragColor;\n' +
'}\n';
function main(){
  //获取canvas元素
  //获取webgl上线文
  //初始化着色器
  //获取a_position、u_FragColor变量的存储位置
  //注册鼠标点击时的事件响应函数
  //设置canvas背景色
  //清楚canvas
  var canvas = document.getElementById('webgl');  //获取canvas元素

  var gl = getWebGLContext(canvas);  //获取webgl上下文
  if(!gl){
    console.log("failed!!!");
    return;
  }

  if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){ //初始化着色器程序
    console.log("Failed to initialize shaders");
    return;
  }

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position'); //获取a_Position变量位置
  if(a_Position < 0){
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor'); //获取u_FragColor变量位置
  if(!u_FragColor){
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }
  canvas.onmousedown = function(ev){click(ev, gl, canvas, a_Position, u_FragColor) }; //注册鼠标点击时的响应函数
  
  gl.clearColor(0.0, 0.5, 0.0, 1.0);  //设置canvas清除背景色

  gl.clear(gl.COLOR_BUFFER_BIT);  //清除canvas

}

var g_points = []; //鼠标点击位置数组
var g_colors = []; //存储点颜色的数组
function click(ev, gl, canvas, a_Position, u_FragColor) {
  var x = ev.clientX; //点击x坐标
  var y = ev.clientY; //点击y坐标
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  g_points.push([x, y]);//将坐标存储在g_points数组中

  if(x >= 0.0 && y >= 0.0){
    g_colors.push([1.0, 0.0, 0.0, 1.0]); //红色
  }else if(x < 0.0 && y < 0.0){
    g_colors.push([0.0, 1.0, 0.0, 1.0]); //绿色
  }else {
    g_colors.push([1.0, 1.0, 1.0, 1.0]); //白色
  }

  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_points.length;
  for(var i = 0; i < len; i++){
    var xy = g_points[i];
    var rgba = g_colors[i];

    gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0); //点的位置传递到a_position变量中
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]); //将点的颜色传递到u_FragColor变量中
    gl.drawArrays(gl.POINTS, 0, 1); //画！
  }

}