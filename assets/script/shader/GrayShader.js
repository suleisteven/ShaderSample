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
            void main()
            {
                vec4 v = texture2D(CC_Texture0, v_texCoord).rgba;
                float f = v.r * 0.299 + v.g * 0.587 + v.b * 0.114;
                gl_FragColor = vec4(f, f, f, v.a);
            }
            `;

cc.Class({
    extends: ShaderComponent,

    properties: {
    },


    onLoad () {
    },

    onCreateCustomFrag : function()
    {
        return _frag;
    },

});
