//HelloPoint2.js
/*利用attribute向着色器传数据，步骤：
1. 在顶点着色器中申明attribute变量。
2. 将attribute变量赋值给gl_Position变量。
3. 向attribute变量传输数据。
*/

//顶点着色器
var VSHADER_SOURCE = 
'attribute vec4 a_Position;\n' +   //存储限定符 + 类型 + 变量名
'attribute float a_PointSize;\n'+
'void main() {\n' + 
'gl_Position = a_Position;\n' +    //attribute变量赋值给gl_Position
'gl_PointSize = a_PointSize;\n' +
'}\n';

//片元着色器 
var FSHADER_SOURCE =
'void main() {\n' + 
'gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +  //设置颜色 38
'}\n';

function main() {
//获取canvas元素
var canvas = document.getElementById('webgl');

//获取webgl绘图上下文
var gl = getWebGLContext(canvas);
if(!gl){
  console.log('Failed to get the rendering context for WebGL');
  return;
}

//初始化着色器程序
if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
  console.log('Failed to initialize shaders');
  return;
 }

 //获取attribute变量的存储位置
 var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
 var a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
 if (a_Position < 0) {
   console.log('Failed to get the storage location of a_Position');
   return;
 }

 //将顶点位置传输给attribute变量
 gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);
 gl.vertexAttrib1f(a_PointSize, 20.0);

 //设置canvas背景色
 gl.clearColor(1.0, 0.5, 0.0, 1.0);
 //清除canvas
 gl.clear(gl.COLOR_BUFFER_BIT);

 //绘制一个点
 gl.drawArrays(gl.POINTS, 0, 1);
}
