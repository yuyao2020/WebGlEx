var VSHADER_SOURCE = 
'attribute vec4 a_Position;\n' +
'attribute vec4 a_Color;\n' +
'varying vec4 v_Color;\n' +
'uniform mat4 u_ProjMatrix;\n' +
'uniform mat4 u_ViewMatrix;\n' +
'uniform mat4 u_ModelMatrix;\n' +
'void main(){\n' +
' gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;\n' +
' v_Color = a_Color;\n' +
'}\n'; 

var FSHADER_SOURCE =
'#ifdef GL_ES\n' +
'precision mediump float;\n' +
'#endif\n' +
'varying vec4 v_Color;\n' +
'void main(){\n' +
' gl_FragColor = v_Color;\n' +
'}\n';

function main(){
  var canvas = document.getElementById('webgl');
 
  var gl = getWebGLContext(canvas);
  if(!gl){
    console.log('Failed1');
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

  var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
  var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  var u_ModelMatrix =gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if(!u_ProjMatrix || !u_ViewMatrix || !u_ModelMatrix){
    console.log('Failed4');
    return;
  }

  var ProjMatrix = new Matrix4();
  var ViewMatrix = new Matrix4();
  var ModelMatrix= new Matrix4();

  ProjMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
  ViewMatrix.setLookAt(0, 0, 5, 0, 0, -100, 0, 1, 0);
  ModelMatrix.setTranslate(0.75, 0, 0);

  gl.uniformMatrix4fv(u_ProjMatrix, false, ProjMatrix.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, ViewMatrix.elements);
  gl.uniformMatrix4fv(u_ModelMatrix,false, ModelMatrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.drawArrays(gl.TRIANGLES, 0, n);

  ModelMatrix.setTranslate(-0.75, 0, 0);
  
  gl.uniformMatrix4fv(u_ModelMatrix,false, ModelMatrix.elements);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl){
  var verticesColors = new Float32Array([
     0.0,  1.0,  -4.0,  0.4,  1.0,  0.4, // The back green one
    -0.5, -1.0,  -4.0,  0.4,  1.0,  0.4,
     0.5, -1.0,  -4.0,  1.0,  0.4,  0.4, 

     0.0,  1.0,  -2.0,  1.0,  1.0,  0.4, // The middle yellow one
    -0.5, -1.0,  -2.0,  1.0,  1.0,  0.4,
     0.5, -1.0,  -2.0,  1.0,  0.4,  0.4, 

     0.0,  1.0,   0.0,  0.4,  0.4,  1.0,  // The front blue one 
    -0.5, -1.0,   0.0,  0.4,  0.4,  1.0,
     0.5, -1.0,   0.0,  1.0,  0.4,  0.4,
  ]);

  var n = 9;

  var vertexColorBuffer = gl.createBuffer();
  if(!vertexColorBuffer){
    console.log('Failed5');
    return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  var FSIZE = verticesColors.BYTES_PER_ELEMENT;

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0){
    console.log('Failed6');
    return -1;
  }

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);

  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0){
    console.log('Failed7');
    return -1;
  }

  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE*3);
  gl.enableVertexAttribArray(a_Color)

  return n;
}