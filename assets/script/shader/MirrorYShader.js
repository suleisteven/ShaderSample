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
