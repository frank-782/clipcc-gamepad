import { Extension, api, type } from 'clipcc-extension';
import Controller from './Controller.js/Controller';
import './Controller.js/Controller.layouts'

class GamepadExtension extends Extension {
    constructor() {
        super();
        this.gamepad = null
        this.pressButton = []
        this.buttonMenu = this.buttonMenu.bind(this)
        this.joystickPress = this.joystickPress.bind(this)
        this.onInit = this.onInit.bind(this)
        this.onFoundGamepad = this.onFoundGamepad.bind(this)
        this.isConnect = this.isConnect.bind(this)
        this.isButtonPress = this.isButtonPress.bind(this)
        this.onGamepadPress = this.onGamepadPress.bind(this)
        this.onGamepadRelease = this.onGamepadRelease.bind(this)
    }
    onInit() {
        Controller.search();
        window.addEventListener('gc.controller.found', this.onFoundGamepad, false);
        window.addEventListener('gc.button.press', this.onGamepadPress, false);
        window.addEventListener('gc.button.hold', this.onGamepadPress, false);
        window.addEventListener('gc.button.release', this.onGamepadPress, false);
        api.addCategory({
            categoryId: 'frank.gamepad.category',
            messageId: 'frank.gamepad.name',
            color: '#66CCFF'
        });
        api.addBlock({
            opcode: 'frank.gamepad.isConnect',
            type: type.BlockType.BOOLEAN,
            messageId: 'frank.gamepad.isConnect',
            categoryId: 'frank.gamepad.category',
            function: () => this.isConnect()
        });
        api.addBlock({
            opcode: 'frank.gamepad.gamepadName',
            type: type.BlockType.REPORTER,
            messageId: 'frank.gamepad.gamepadName',
            categoryId: 'frank.gamepad.category',
            function: () => this.gamepad ? this.gamepad.name : ''
        });
        api.addBlock({
            opcode: 'frank.gamepad.onPress',
            type: type.BlockType.HAT,
            messageId: 'frank.gamepad.onPress',
            categoryId: 'frank.gamepad.category',
            param: {
                BUTTON: {
                    type: type.ParameterType.STRING,
                    menu: () => this.buttonMenu(),
                    default: ''
                }
            },
            function: args => {
                if (!this.gamepad) return false
                return this.gamepad.inputs.buttons[args.BUTTON] ? this.gamepad.inputs.buttons[args.BUTTON].pressed : false
            }
        });
        api.addBlock({
            opcode: 'frank.gamepad.isPress',
            type: type.BlockType.BOOLEAN,
            messageId: 'frank.gamepad.isPress',
            categoryId: 'frank.gamepad.category',
            param: {
                BUTTON: {
                    type: type.ParameterType.STRING,
                    menu: () => this.buttonMenu(),
                    default: ''
                }
            },
            function: args => this.isButtonPress(args.BUTTON)
        });
        api.addBlock({
            opcode: 'frank.gamepad.joystick',
            type: type.BlockType.REPORTER,
            messageId: 'frank.gamepad.joystick',
            categoryId: 'frank.gamepad.category',
            param: {
                STICKS: {
                    type: type.ParameterType.STRING,
                    menu: () => {
                        if (!this.gamepad) return [['','']]
                        const joystick = [];
                        for (const index in this.gamepad.inputs.analogSticks) {
                            const button = this.gamepad.inputs.analogSticks[index].name
                            joystick.push([button, button]);
                        }
                        return joystick
                    },
                    default: ''
                },
                VALUE: {
                    type: type.ParameterType.NUMBER,
                    menu: [{
                        messageId: 'frank.gamepad.menu.x',
                        value: 'x'
                    },
                    {
                        messageId: 'frank.gamepad.menu.y',
                        value: 'y'
                    },
                    {
                        messageId: 'frank.gamepad.menu.degrees',
                        value: 'degrees'
                    },
                    {
                        messageId: 'frank.gamepad.menu.radians',
                        value: 'radians'
                    }
                    ],
                    default: 'x'
                }
            },
            function: args => this.joystickPress(args.STICKS, args.VALUE)
        });
    }
    onUninit() {
        window.removeEventListener('gc.controller.found', this.onFoundGamepad, false);
        window.removeEventListener('gc.button.press', this.onGamepadPress, false);
        window.removeEventListener('gc.button.hold', this.onGamepadPress, false);
        window.removeEventListener('gc.button.release', this.onGamepadPress, false);
        api.removeCategory('frank.gamepad.category')
    }
    buttonMenu () {
        if (!this.gamepad) return [['','']]
            const buttons = [];
            for (const index in this.gamepad.inputs.buttons) {
                const button = this.gamepad.inputs.buttons[index].name
                buttons.push([button, button]);
            }
        return buttons
    }
    joystickPress (sticks, value) {
        if (!this.gamepad) return 0
        const gamepadJoystick = this.gamepad.inputs.analogSticks
        for (const i in gamepadJoystick) {
            const b = gamepadJoystick[i];
            if (b.name === sticks) {
                switch (value) {
                    case 'x':
                        return b.position.x
                    case 'y':
                        return b.position.y
                    case 'degrees':
                        return b.angle.degrees
                    case 'radians':
                        return b.angle.radians
                    default:
                        return NaN
                }
            }
        }
        return NaN
    }
    isButtonPress (button) {
        if (!this.gamepad) return false
        const gamepadButton = this.gamepad.inputs.buttons;
        for (const i in gamepadButton) {
            const b = gamepadButton[i];
            if (b.name === button && b.pressed) {
                return true
            }
        }
        return false
    }
    onGamepadPress(event) {
        const button = event.detail;
        if (!this.pressButton.includes(button.name) && button.pressed) {
            this.pressButton.push(button.name)
        } else {
            this.pressButton.map((value,index,arr) => {
                if (value == button.name) {
                    return arr.pop(index)
                }
            })
        }
        // console.log(button);
    }
    onGamepadRelease(event) {
        const button = event.detail;
        if (this.pressButton.includes(button.name)) {
            this.pressButton.map((value,index,arr) => {
                if (value == button.name) {
                    return arr.pop(index)
                }
            })
        }
        // console.log(this.pressButton);
    }

    onFoundGamepad(event) {
        const controller = event.detail.controller;
        console.log(`Gamepad found ${controller.name} index:${controller.index}`)
        this.gamepad = Controller.getController(controller.index)
        // console.log(this.gamepad)
    }
    
    isConnect() {
        return !!this.gamepad
    }
}

export default GamepadExtension;
