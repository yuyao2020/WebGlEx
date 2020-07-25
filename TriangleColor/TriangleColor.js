var VSHADER_SOURCE = 
'attribute vec4 a_Position;\n' +
'void main(){\n' +
' gl_Position = a_Position;\n' +
'}\n';
/*
var FSHADER_SOURCE =
'void main(){\n' +
' gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
'}\n';
*/
var FSHADER_SOURCE =
'precision mediump float;\n' +
'uniform float u_Width;\n' +
'uniform float u_Height;\n' +
'void main(){\n' +
'gl_FragColor = vec4(gl_FragCoord.x/u_Width, 0.0, gl_FragCoord.y/u_Height, 1.0);\n' +
'}\n';

function main(){
  var canvas = document.getElementById('webgl');

  var gl = getWebGLContext(canvas);
  if(!gl){
    console.log('Failed 1');
    return;
  }

  if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
    console.log('Failed 2');
    return;
  }

  var n = initVertexBuffers(gl);
  if(n < 0){
    console.log('Failed 3');
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
    console.log('Failed 4');
    return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0){
    console.log('Failed 5');
    return -1;
  }

  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  var u_Width = gl.getUniformLocation(gl.program, 'u_Width');
  if(!u_Width){
    console.log('Failed 6');
    return;
  }

  var u_Height = gl.getUniformLocation(gl.program, 'u_Height');
  if(!u_Height){
    console.log('Failed 7');
    return;
  }

  gl.uniform1f(u_Width, gl.drawingBufferWidth);
  gl.uniform1f(u_Height, gl.drawingBufferHeight);

  gl.enableVertexAttribArray(a_Position);

  return n;
}