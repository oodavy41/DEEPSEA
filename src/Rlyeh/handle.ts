import { Scenes } from "./Scenes";

export class KeyBoardCtrl {
  scene: Scenes;
  mouseCtrlFlag: boolean;
  private mousePos: number[];
  private movement: boolean[];

  constructor(scene: Scenes) {
    this.scene = scene;
    this.mouseCtrlFlag = false;
    this.mousePos = [0, 0];
    this.movement = [false, false, false, false];
  }

  canv_on_click() {
    this.mouseCtrlFlag = !this.mouseCtrlFlag;
    this.mousePos[0] = 0;
    this.mousePos[1] = 0;
    console.log("canvas click", this.mouseCtrlFlag);
  }

  on_mouse_move(event: MouseEvent) {
    if (this.mouseCtrlFlag) {
      if (this.mousePos[0]) {
        let deltax = event.clientX - this.mousePos[0];
        let deltay = event.clientY - this.mousePos[1];
        this.scene.mainCamera.fps_ctrl(deltax, deltay, this.movement);
      }
      this.mousePos[0] = event.clientX;
      this.mousePos[1] = event.clientY;
    }
  }

  on_key_down(event: KeyboardEvent) {
    switch (event.keyCode) {
      case 87:
      case 87 + 32:
        this.movement[0] = true;
        break;
      case 65:
      case 65 + 32:
        this.movement[1] = true;
        break;
      case 83:
      case 83 + 32:
        this.movement[2] = true;
        break;
      case 68:
      case 68 + 32:
        this.movement[3] = true;
        break;
    }
  }

  on_key_up(event: KeyboardEvent) {
    switch (event.keyCode) {
      case 87:
        this.movement[0] = false;
        break;
      case 65:
        this.movement[1] = false;
        break;
      case 83:
        this.movement[2] = false;
        break;
      case 68:
        this.movement[3] = false;
        break;
    }
  }

  moveCtrl() {
    this.scene.mainCamera.movectrl(this.movement);
  }
  // LDchangex(event) {
  //   document.getElementById("LDxL").innerText = event.value;
  //   this.scene.lights["Main"].lightDirection[0] = event.value;
  // }
  // LDchangey(event) {
  //   document.getElementById("LDyL").innerText = event.value;
  //   this.scene.lights["Main"].lightDirection[1] = event.value;
  // }
  // LDchangez(event) {
  //   document.getElementById("LDzL").innerText = event.value;
  //   this.scene.lights["Main"].lightDirection[2] = event.value;
  // }
  // mlchange(event) {
  //   document.getElementById("mtls").innerText = event.value;
  // }
  // snchange(event) {
  //   document.getElementById("stns").innerText = event.value;
  // }
}
