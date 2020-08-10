/*
除了水平和垂直范围内的限制, WebGL 还限制观察者的可视深度,即“能够看多远”。
所有这些限制,包括水平视角、垂直视角和可视深度,定义了可视空间(view volume)。
有两类常用的可视空间:
长方体可视空间,也称盒状空间,由正射投影(orthographic projection)产生。（两原子模型）
四棱锥金字塔可视空间,由透视投影(perspective projection)产生。（深度感、自然，射击游戏）
*/
var VSHADER_SOURCE =
'attribute vec4 a_Position;\n' +
'attribute vec4 a_Color;\n' +
'uniform mat4 u_ProjMatrix;\n' +
'varying vec4 v_Color;\n' +
'void main(){\n' +
' gl_Position = u_ProjMatrix * a_Position;\n' +
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

    var nf = document.getElementById('nearFar');

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
    if(!u_ProjMatrix){
      console.log('Failed4');
      return;
    }

    var projMatrix = new Matrix4();

    document.onkeydown = function(ev){ keydown(ev, gl, n, u_ProjMatrix, projMatrix, nf);};

    draw(gl, n, u_ProjMatrix, projMatrix, nf);
  }

  function initVertexBuffers(gl){
    var verticesColors = new Float32Array([
     0.0,  0.6,  -0.4,  0.4,  1.0,  0.4, // The back green one
    -0.5, -0.4,  -0.4,  0.4,  1.0,  0.4,
     0.5, -0.4,  -0.4,  1.0,  0.4,  0.4, 
   
     0.5,  0.4,  -0.2,  1.0,  0.4,  0.4, // The middle yellow one
    -0.5,  0.4,  -0.2,  1.0,  1.0,  0.4,
     0.0, -0.6,  -0.2,  1.0,  1.0,  0.4, 

     0.0,  0.5,   0.0,  0.4,  0.4,  1.0, // The front blue one 
    -0.5, -0.5,   0.0,  0.4,  0.4,  1.0,
     0.5, -0.5,   0.0,  1.0,  0.4,  0.4,
    ]);
    var n = 9;

    var vertexColorbuffer = gl.createBuffer();
    if(!vertexColorbuffer){
      console.log('Failed5');
      return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

    var FSIZE = verticesColors.BYTES_PER_ELEMENT;

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if(a_Position < 0){
      console.log('Failed6');
      return -1;
    }

    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE*6, 0);
    gl.enableVertexAttribArray(a_Position);

    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if(a_Color < 0){
      console.log('Failed7');
      return -1;
    }

    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE*6, FSIZE*3);
    gl.enableVertexAttribArray(a_Color);

    return n;
  }

  var g_near = 0.0, g_far = 0.5;
  function keydown(ev, gl, n, u_ProjMatrix, projMatrix, nf){
    switch(ev.keyCode){
      case 39: g_near += 0.01; break;
      case 37: g_near -= 0.01; break;
      case 38: g_far += 0.01; break;
      case 40: g_far -= 0.01; break;
      default: return;
    }

    draw(gl, n, u_ProjMatrix, projMatrix, nf);
  }

  function draw(gl, n, u_ProjMatrix, projMatrix, nf){
    projMatrix.setOrtho(-1.0, 1.0, -1.0, 1.0, g_near, g_far);
    gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
    gl.clear(gl.COLOR_BUFFER_BIT);
    nf.innerHTML= 'near: ' + Math.round(g_near * 100)/100 + ', far: ' + Math.round(g_far*100)/100;
    gl.drawArrays(gl.TRIANGLES, 0, n); 
  }