//关键字千万不要拼错了。。
var VSHADER_SOURCE = 
'attribute vec4 a_Position;\n' +
'void main(){\n' +
'gl_Position = a_Position;\n' +
'}\n';

var FSHADER_SOURCE = 
'void main(){\n' +
'gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
'}\n';

function main () {
  var canvas = document.getElementById('webgl');

  var gl = getWebGLContext(canvas);
  if(!gl){
    console.log('Failed');
    return;
  }

  if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
    console.log('Failed2');
    return;
  }

  var n = initVertexBuffers(gl);
  if(n < 0){
    console.log('Failed3');
    return;
  }

  gl.clearColor(0, 0, 0, 1);

  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl){
  var vertices = new Float32Array([
    0, 0.5,  -0.5, -0.5,  0.5, -0.5
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
    console.log('Failed 4');
    return -1;
  }

  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0)//将刚建立的缓冲区对象分配给attribute变量，即a_Position

  gl.enableVertexAttribArray(a_Position);

  return n;
}