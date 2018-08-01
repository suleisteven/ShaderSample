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
                vec4 c = v_fragmentColor * texture2D(CC_Texture0, v_texCoord);
                gl_FragColor.xyz = vec3(1.0-c.r, 1.0-c.g, 1.0-c.b);
                gl_FragColor.w = c.w;
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