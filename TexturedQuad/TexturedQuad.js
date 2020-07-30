var VSHADER_SOURCE = 
'attribute vec4 a_Position;\n' +
'attribute vec2 a_TexCoord;\n' +
'varying vec2 v_TexCoord;\n' +
'void main(){\n' +
' gl_Position = a_Position;\n' +
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
    console.log('Failed 1');
    return;
  }

  if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
    console.log('Failed 2');
    return;
  }

  var n = initVertexBuffers(gl);//设置顶点信息
  if(n < 0){
    console.log('Failed 3');
    return;
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  if(!initTextures(gl, n)){
    console.log('Failed 4');
    return;
  }
}

function initVertexBuffers(gl){
  var verticesTexCoords = new Float32Array([
    -0.5,  0.5,  0.0, 1.0,
    -0.5, -0.5,  0.0, 0.0,
     0.5,  0.5,  1.0, 1.0,
     0.5, -0.5,  1.0, 0.0,
  ]);

  var n = 4;

  var vertexTexCoordBuffer = gl.createBuffer();
  if(!vertexTexCoordBuffer){
    console.log('Failed 5');
    return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);

  var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0){
    console.log('Failed 6');
    return -1;
  }

  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
  gl.enableVertexAttribArray(a_Position);

  var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
  if(a_TexCoord < 0){
    console.log('Failed 7');
    return -1;
  }

  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
  gl.enableVertexAttribArray(a_TexCoord);

  return n;
}

function initTextures(gl, n){//准备待加载的纹理图像
  var texture = gl.createTexture();
  if(!texture){
    console.log('Failed 8');
    return false;
  }

  var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
  if(!u_Sampler){
    console.log('Failed 9');
    return false;
  }

  var image = new Image();
  if(!image){
    console.log('Failed 10');
    return false;
  }

  image.onload = function(){loadTexture(gl, n, texture, u_Sampler, image);};

  image.src = '../resources/sky.jpg';

  return true;
}

function loadTexture(gl, n, texture, u_Sampler, image){//为webgl配置纹理
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);//对纹理图像进行Y轴反转
  
  gl.activeTexture(gl.TEXTURE0);//开启0号纹理单元

  gl.bindTexture(gl.TEXTURE_2D, texture);//完成纹理对象到纹理单元的绑定

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);//配置纹理参数

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);//纹理图像分配给纹理对象

  gl.uniform1i(u_Sampler, 0);//将0号纹理传递给片元着色器中的取样器变量

  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);

}