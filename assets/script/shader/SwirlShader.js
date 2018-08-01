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
        `;

cc.Class({
    extends: ShaderComponent,

    properties: {
        _angleX : {
            default : 0,
            serializable : false,
        },
        _radiusX : {
            default : 0,
            serializable : false,
        },
        _globalTime : 0,

        _glProgram :{
          default : null,
          serializable:false,
        },

        _u_iGlobalTime : 0,
        _u_radiusX : 0,
        _u_angleX : 0,
    },


    onLoad() {
    },

    onCreateCustomFrag: function () {
        return _frag;
    },

    onCustomShaderCreated : function(glProgram)
    {
        this._glProgram = glProgram;

        this._u_radiusX = this._glProgram.getUniformLocationForName("radiusX");
        this._u_angleX = this._glProgram.getUniformLocationForName("angleX");
        this._u_iGlobalTime = this._glProgram.getUniformLocationForName("globalTime");

    },

    _doShaderUniform : function()
    {
        if (cc.sys.isNative) {
            let glProgram_state = cc.GLProgramState.getOrCreateWithGLProgram(this._glProgram);
            glProgram_state.setUniformFloat("iGlobalTime", this._globalTime);
            glProgram_state.setUniformFloat("radiusX", this._radiusX);
            glProgram_state.setUniformFloat("angleX", this._angleX);
        } else {

            this._glProgram.setUniformLocationWith1f(this._u_iGlobalTime, this._globalTime);
            this._glProgram.setUniformLocationWith1f(this._u_radiusX, this._radiusX);
            this._glProgram.setUniformLocationWith1f(this._u_angleX, this._angleX);
        }
    },

    update(dt)
    {

        if(this._glProgram)
        {
            this._glProgram.use();

            this._globalTime += dt;

            let m_angleSpeed = 0.5;
            let m_radiusSpeed = 0.5;

            this._angleX = this._angleX + m_angleSpeed * dt;
            this._radiusX = this._radiusX + m_radiusSpeed * dt;

            this._doShaderUniform();
        }
    }

});