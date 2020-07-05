//MultiPoint.js
//顶点着色器
//片元着色器
//function main()
//获取canvas元素
//获取webgl上下文
//初始化着色器程序
//设置顶点位置，initVertexBuffers(gl)
//设置背景色
//清空canvas
//绘制三个点，gl.drawArrays(gl.POINTS, 0, n) n is 3
/*function initVertexBuffers()
  1. 创建缓冲区对象，gl.createBuffer()
  2. 将缓冲区对象绑定到目标, gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  3. 向缓冲区对象写入数据， gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
  4. 将缓冲区对象分配给a_Position变量， gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0)
  5. 连接a_Position与分配给它的缓冲区对象
*/
//顶点着色器
var VSHADER_SOURCE= 
'attribute vec4 a_Position;\n' + 
'void main() {\n' +
'gl_Position = a_Position;\n' +
'gl_PointSize = 10.0;\n' +
'}\n';

//片元着色器
var FSHADER_SOURCE =
'void main() {\n' +
'gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
'}\n';

function main(){
  //获取canvas元素
  var canvas = document.getElementById('webgl');

  //获取WEBGL上下文
  var gl = getWebGLContext(canvas);
  if(!gl){
    console.log('Failed');
    return;
  }

  //初始化着色器程序
  if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
    console.log('Failed2');
    return;
  }

  //设置顶点位置
  var n =  initVertexBuffers(gl);
  if(n < 0){
    console.log('Failed to set the positions of the vertices');
    return;
  }
  
  //设置canvas背景色
  gl.clearColor(0, 0, 0, 1);

  //清除canvas
  gl.clear(gl.COLOR_BUFFER_BIT);

  //画点，画三个点
  gl.drawArrays(gl.POINTS, 0, n);
}

/*
使用缓冲区对象向顶点着色器传入多个顶点的数据,需要遵循以下五个步骤。处理
其他对象,如纹理对象(第4章)、顿缓冲区对象(第8章“光照”)时的步骤也比较类似,
我们来仔细研究一下:
1. 创建缓冲区对象(gl.createBuffer())。
2. 绑定缓冲区对象(gl.bindBuffer())。
3. 将数据写入缓冲区对象(gl.bufferData())。
4. 将缓冲区对象分配给一个 attribute 变量(g1.vertexAttribPointer())。
5. 开启 attribute 变量(gl.enableVertexAttribarray())。
*/
function initVertexBuffers(gl){
  var vertices = new Float32Array([
    0.0, 0.5,  -0.5, -0.5,  0.5, -0.5
  ]);
  var n = 3;

  var vertexBuffer = gl.createBuffer();
  if(!vertexBuffer){
    console.log('Failed to create the buffer object');
    return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0){
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }

  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(a_Position);

  return n;
}