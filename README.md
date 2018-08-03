### 什么是Shader？

Shaders是一段GLSL小程序，运行在GPU上而非CPU。它们使用OpenGL Shading Language (GLSL)语言编写，看上去像C或C++，但却是另外一种不同的语言。使用shader就像你写个普通程序一样：写代码编译，最，后链接在一起才生成最终的程序。


### Shader中的数据类型
基础数据类型：int、float、double、uint、bool  
两种容器：向量(Vector)和矩阵(Matrix)  
GLSL中的向量是一个可以包含有1、2、3或者4个分量的容器，分量的类型可以是前面默认基础类型的任意一个。它们可以是下面的形式（n代表分量的数量）：vecn,bvecn,ivecn,uvecn,dvecn;  
大多数时候我们使用vecn，因为float足够满足大多数要求了。一个向量的分量可以通过vec.x这种方式获取，这里x是指这个向量的第一个分量。你可以分别使用.x、.y、.z和.w来获取它们的第1、2、3、4个分量。GLSL也允许你对颜色使用rgba，或是对纹理坐标使用stpq访问相同的分量

### Shader常用修饰符介绍
attribute
表示只读的顶点数据，只用在顶点着色器中。数据来自当前的顶点状态或者顶点数组。它必须是全局范围声明的，不能在函数内部。一个attribute可以是浮点数类型的标量，向量，或者矩阵。不可以是数组或则结构体。

uniform
一致变量。在着色器执行期间一致变量的值是不变的。与const常量不同的是，这个值在编译时期是未知的是由着色器外部初始化的。一致变量在顶点着色器和片段着色器之间是共享的。它也只能在全局范围进行声明。

varying
顶点着色器的输出。例如颜色或者纹理坐标，（插值后的数据）作为片段着色器的只读输入数据。必须是全局范围声明的全局变量。可以是浮点数类型的变量，向量，矩阵。不能是数组或者结构体。



## 实例
### 灰度算法（算法思路：对每个像素颜色进行采样，然后改变rgb值，乘上灰度图的公认常量）
```shader
varying vec4 v_fragmentColor;
varying vec2 v_texCoord;
void main()
{    
    vec4 c = v_fragmentColor * texture2D(CC_Texture0, v_texCoord);    
    gl_FragColor.xyz = vec3(0.2126*c.r + 0.7152*c.g + 0.0722*c.b);    
    gl_FragColor.w = c.w;
}
```

### 水平镜像（算法思路：判断纹理坐标x位置，如果超过一半，则使用左半边对称的坐标点，然后对图像进行采样）
```shader
varying vec2 v_texCoord;
varying vec4 v_fragmentColor;
void main()
{
    vec2 uv = v_texCoord;
    if(uv.x > 0.5)
    {
        uv.x = 1.0 - uv.x;
    }

    vec4 c = v_fragmentColor * texture2D(CC_Texture0, uv);
    gl_FragColor = c;
}
```

### 垂直镜像（算法思路：判断纹理坐标y位置，如果超过一半，则使用左半边对称的坐标点，然后对图像进行采样）
```shader
varying vec2 v_texCoord;
varying vec4 v_fragmentColor;
void main()
{
    vec2 uv = v_texCoord;
    if(uv.y > 0.5)
    {
        uv.y = 1.0 - uv.y;
    }

    vec4 c = v_fragmentColor * texture2D(CC_Texture0, uv);
    gl_FragColor = c;
}
```

### 颜色翻转（算法思路：对每个像素颜色进行采样，然后改变rgb值，将rgb的颜色值进行反转）
```shader
varying vec2 v_texCoord;
varying vec4 v_fragmentColor;
void main()
{
    vec4 c = v_fragmentColor * texture2D(CC_Texture0, v_texCoord);
    gl_FragColor.xyz = vec3(1.0-c.r, 1.0-c.g, 1.0-c.b);
    gl_FragColor.w = c.w;
}
```

### 旋涡
```shader
precision highp float;
varying vec4 v_fragmentColor;
varying vec2 v_texCoord;
uniform float globalTime;
uniform float radiusX;
uniform float angleX;
void main(){
    float vTime = globalTime;
    vec2 positionToUse = v_texCoord;
    vec2 center = vec2(0.5,0.5);
    float dist = distance(center, positionToUse);

    if(dist < radiusX)
    {
        positionToUse -= center;
        float percent = (radiusX - dist) / radiusX;
        if(percent < 1.0 && percent >= 0.0)
        {
            float theta = percent * percent * angleX * 8.0;
            float s = sin(theta);
            float c = cos(theta);
            positionToUse = vec2(dot(positionToUse, vec2(c, -s)), dot(positionToUse, vec2(s, c)));
        }
        positionToUse += center;    
    }
    gl_FragColor = texture2D(CC_Texture0, positionToUse);
}
```

### 高斯模糊（"模糊"，就是将图像中每个像素值进行重置的过程，这个过程采用将每一个像素都设置成周边像素的平均值；高斯模糊将周边像素按照权重值进行计算相加）

```shader
precision mediump float;
varying vec2 v_texCoord;
const float resolution = 1000.0;
void main()
{
    vec2 dir = vec2(1.0,1.0);    
    float radius = 5.0;    

    //this will be our RGBA sum    
    vec4 sum = vec4(0.0);

    //our original texcoord for this fragment    
    vec2 tc = v_texCoord;

    //the amount to blur, i.e. how far off center to sample from     
    //1.0 -> blur by one pixel    
    //2.0 -> blur by two pixels, etc.    
    float blur = radius/resolution;

    //the direction of our blur    
    //(1.0, 0.0) -> x-axis blur    
    //(0.0, 1.0) -> y-axis blur    
    float hstep = dir.x;
    float vstep = dir.y;

    //apply blurring, using a 9-tap filter with predefined gaussian weights 
    sum += texture2D(CC_Texture0, vec2(tc.x - 4.0*blur*hstep, tc.y - 4.0*blur*vstep)) * 0.0162162162;
    sum += texture2D(CC_Texture0, vec2(tc.x - 3.0*blur*hstep, tc.y - 3.0*blur*vstep)) * 0.0540540541;
    sum += texture2D(CC_Texture0, vec2(tc.x - 2.0*blur*hstep, tc.y - 2.0*blur*vstep)) * 0.1216216216;
    sum += texture2D(CC_Texture0, vec2(tc.x - 1.0*blur*hstep, tc.y - 1.0*blur*vstep)) * 0.1945945946;    
    sum += texture2D(CC_Texture0, vec2(tc.x, tc.y)) * 0.2270270270;
    sum += texture2D(CC_Texture0, vec2(tc.x + 1.0*blur*hstep, tc.y + 1.0*blur*vstep)) * 0.1945945946;
    sum += texture2D(CC_Texture0, vec2(tc.x + 2.0*blur*hstep, tc.y + 2.0*blur*vstep)) * 0.1216216216;
    sum += texture2D(CC_Texture0, vec2(tc.x + 3.0*blur*hstep, tc.y + 3.0*blur*vstep)) * 0.0540540541;
    sum += texture2D(CC_Texture0, vec2(tc.x + 4.0*blur*hstep, tc.y + 4.0*blur*vstep)) * 0.0162162162;
    vec4 cc= texture2D(CC_Texture0,v_texCoord);

    //discard alpha for our simple demo, multiply by vertex color and return    
    gl_FragColor =vec4(sum.rgb, cc.a);
}
```
