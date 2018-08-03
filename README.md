### 灰度算法（算法思路：对每个像素颜色进行采样，然后改变rgb值，乘上灰度图的公认常量）
```
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
```
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
```
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
```
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
```
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

```
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
