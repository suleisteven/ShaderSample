// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
let ShaderComponent = require("ShaderComponent");

let _frag = ` 
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
                
                vec4 cc= texture2D(CC_Texture0, v_texCoord);
                
                //discard alpha for our simple demo, multiply by vertex color and return    
                gl_FragColor =vec4(sum.rgb, cc.a);
                
            }
            `;

cc.Class({
    extends: ShaderComponent,

    properties: {
    },

    onCreateCustomFrag : function()
    {
        return _frag;
    },

});
