


cc.Class({
    extends: cc.Component,

    properties: {
        childEnabled: {
            default: true,
            tooltip: '内部所有子控件是否也生效',
            notify: function (oldValue) {
                if (CC_EDITOR && this.isValid && this.node.children.length > 0) {
                    if (oldValue) {
                        this._initOriginProgram();
                    } else {
                        this._initCustomProgram();
                    }
                    this.node.children.forEach(element => {
                        this._setProgram(element._sgNode, oldValue ? this._originProgram : this._customProgram);
                    });
                }
            }
        },

        _default_vert : {
            default : `
                    attribute vec4 a_position;
                    attribute vec2 a_texCoord;
                    attribute vec4 a_color;
                    varying vec2 v_texCoord;
                    varying vec4 v_fragmentColor;
                    void main()
                    {
                        gl_Position = CC_PMatrix * a_position;
                        v_fragmentColor = a_color;
                        v_texCoord = a_texCoord;
                    }
                    `,
            serializable: false
        },
        _default_frag : {
            default : ` 
                    varying vec2 v_texCoord;
                    void main()
                    { 
                        gl_FragColor = texture2D(CC_Texture0, v_texCoord).rgba;
                    }
                    `,
            serializable: false
        },

    },

    editor: {
        requireComponent: cc.Sprite,
        executeInEditMode: true
    },


    // abstract
    onCreateCustomVert : function()
    {
        return this._default_vert;
    },
    onCreateCustomFrag : function()
    {
        return this._default_frag;
    },
    onCustomShaderCreated : function(glProgram)
    {
    },



    onEnable: function () {
        this._initCustomProgram();
        if (this.childEnabled) {
            this.node._sgNode.children.forEach(element => {
                this._setProgram(element, this._customProgram);
            });
        } else {
            this._setProgram(this.node.getComponent(cc.Sprite)._sgNode, this._customProgram);
            if (this.node.children.length > 0) {
                this._initOriginProgram();
                this.node.children.forEach(element => {
                    this._setProgram(element._sgNode, this._originProgram);
                });
            }
        }
    },

    onDisable: function () {
        this._initOriginProgram();
        this.node._sgNode.children.forEach(element => {
            this._setProgram(element, this._originProgram);
        });
    },

    _initCustomProgram: function() {
        if (!this._customProgram) {
            this._customProgram = new cc.GLProgram();
            if (cc.sys.isNative) {
                this._customProgram.initWithString(this.onCreateCustomVert(), this.onCreateCustomFrag());
            } else {
                this._customProgram.initWithVertexShaderByteArray(this.onCreateCustomVert(), this.onCreateCustomFrag());
                this._customProgram.addAttribute(cc.macro.ATTRIBUTE_NAME_POSITION, cc.macro.VERTEX_ATTRIB_POSITION);
                this._customProgram.addAttribute(cc.macro.ATTRIBUTE_NAME_COLOR, cc.macro.VERTEX_ATTRIB_COLOR);
                this._customProgram.addAttribute(cc.macro.ATTRIBUTE_NAME_TEX_COORD, cc.macro.VERTEX_ATTRIB_TEX_COORDS);
            }
            this._customProgram.link();
            this._customProgram.updateUniforms();
        }
        this.onCustomShaderCreated(this._customProgram);
    },

    _initOriginProgram: function() {
        if (!this._originProgram) {
            this._originProgram = new cc.GLProgram();
            if (cc.sys.isNative) {
                this._originProgram.initWithString(this._default_vert, this._default_frag);
            } else {
                this._originProgram.initWithVertexShaderByteArray(this._default_vert, this._default_frag);
                this._originProgram.addAttribute(cc.macro.ATTRIBUTE_NAME_POSITION, cc.macro.VERTEX_ATTRIB_POSITION);
                this._originProgram.addAttribute(cc.macro.ATTRIBUTE_NAME_COLOR, cc.macro.VERTEX_ATTRIB_COLOR);
                this._originProgram.addAttribute(cc.macro.ATTRIBUTE_NAME_TEX_COORD, cc.macro.VERTEX_ATTRIB_TEX_COORDS);
            }
            this._originProgram.link();
            this._originProgram.updateUniforms();
        }
    },

    _setProgram: function (sgNode, program) {
        if (cc.sys.isNative) {
            sgNode.setGLProgramState(cc.GLProgramState.getOrCreateWithGLProgram(program));
        } else {
            sgNode.setShaderProgram(program);
        }
        sgNode.children.forEach(element => {
            this._setProgram(element, program);
        });
    },
});
