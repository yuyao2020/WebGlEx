var VSHADER_SOURCE = 
'attribute vec4 a_Position;\n' + 
'attribute vec2 a_TexCoord;\n' +
'varying vec2 v_TexCoord;\n' +
'uniform mat4 u_MvpMatrix;\n' +
'void main(){\n' +
' gl_Position = u_MvpMatrix * a_Position;\n' +
' v_TexCoord = a_TexCoord;\n' +
'}\n';

var FSHADER_SOURCE =
'#ifdef GL_ES\n' +
'precision mediump float;\n' +
'#endif\n' +
'uniform sampler2D u_Sampler;\n' +
'varying vec2 v_TexCoord;\n' +
'void main(){\n' +
' gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n' +
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

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  if(!u_MvpMatrix){
    console.log('Failed4');
    return;
  }

  var viewProjMatrix = new Matrix4();
  viewProjMatrix.setPerspective(30.0, canvas.width/canvas.height, 1.0, 100.0);
  viewProjMatrix.lookAt(3.0, 3.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

  var currentAngle = [0.0, 0.0];
  initEventHandlers(canvas, currentAngle);

  if(!initTextures(gl)){
    console.log('Failed5');
    return;
  }

  var tick = function(){
    draw(gl, n, viewProjMatrix, u_MvpMatrix, currentAngle);
    requestAnimationFrame(tick, canvas);//tick循环
  };
  tick();
}

function initTextures(gl){
  var texture = gl.createTexture();
  if(!texture){
    console.log('Failed6');
    return false;
  }

  var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
  if(!u_Sampler){
    console.log('Failed7');
    return false;
  }

  var image = new Image();
  if(!image){
    console.log('Failed8');
    return false;
  }

  image.onload = function(){loadTexture(gl, texture, u_Sampler, image);};
  image.src = '../resources/sky.jpg';

  return true;
}

function loadTexture(gl, texture, u_Sampler, image){
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

  gl.activeTexture(gl.TEXTURE0);

  gl.bindTexture(gl.TEXTURE_2D, texture);//纹理对象类型，webgl中，通过操纵纹理单元来操纵纹理对象

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);//配置纹理对象的参数

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);//纹理图像《=》纹理对象，纹理图像分配给纹理对象

  gl.uniform1i(u_Sampler, 0);//带有纹理图像的纹理0号纹理单元被传给u_Sampler（取样器）
}

function initVertexBuffers(gl){
    // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  var vertices = new Float32Array([   // Vertex coordinates
    1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
    1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
    1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
   -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
   -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,    // v7-v4-v3-v2 down
    1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0     // v4-v7-v6-v5 back
 ]);

 var texCoords = new Float32Array([   // Texture coordinates
     1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v0-v1-v2-v3 front
     0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0,    // v0-v3-v4-v5 right
     1.0, 0.0,   1.0, 1.0,   0.0, 1.0,   0.0, 0.0,    // v0-v5-v6-v1 up
     1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v1-v6-v7-v2 left
     0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0,    // v7-v4-v3-v2 down
     0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0     // v4-v7-v6-v5 back
 ]);

 // Indices of the vertices
 var indices = new Uint8Array([
    0, 1, 2,   0, 2, 3,    // front
    4, 5, 6,   4, 6, 7,    // right
    8, 9,10,   8,10,11,    // up
   12,13,14,  12,14,15,    // left
   16,17,18,  16,18,19,    // down
   20,21,22,  20,22,23     // back
 ]);

 var indexBuffer = gl.createBuffer();
 if(!indexBuffer){
   return -1;
 }

 if(!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position')) return -1;
 if(!initArrayBuffer(gl, texCoords, 2, gl.FLOAT, 'a_TexCoord')) return -1;

 gl.bindBuffer(gl.ARRAY_BUFFER, null);

 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
 gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

 return indices.length;
}

function initArrayBuffer(gl, data, num, type, attribute){
  var buffer = gl.createBuffer();
  if(!buffer){
    console.log('Failed9');
    return false;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if(a_attribute < 0){
    console.lof('Failed10');
    return false;
  }

  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  gl.enableVertexAttribArray(a_attribute);

  return true;
}

function initEventHandlers(canvas, currentAngle){//注册鼠标响应函数
  var dragging = false;
  var lastX = -1, lastY = -1;

  canvas.onmousedown = function(ev){
    var x = ev.clientX, y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();
    if(rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom){//rect.left是canvas左x坐标，x是鼠标点击客户区x坐标。
      lastX = x;
      lastY = y;
      dragging = true;//拖拽开始
    }
  };

  canvas.onmouseup = function(ev){dragging = false;};
  canvas.onmousemove = function(ev){
    var x = ev.clientX, y = ev.clientY;
    if(dragging){
      var factor = 100/canvas.height;
      var dx = factor * (x - lastX);
      var dy = factor * (y - lastY);

      currentAngle[0] = currentAngle[0] + dy;
      currentAngle[1] = currentAngle[1] + dx;
    }
    lastX = x; lastY =y;
  };
}

var g_MvpMatrix = new Matrix4();
function draw(gl, n, viewProjMatrix, u_MvpMatrix, currentAngle){
  g_MvpMatrix.set(viewProjMatrix);
  g_MvpMatrix.rotate(currentAngle[0], 1.0, 0.0, 0.0);
  g_MvpMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0);
  gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}