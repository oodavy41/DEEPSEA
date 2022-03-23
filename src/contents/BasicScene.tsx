// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { vec3, vec4 } from "gl-matrix";
import { Slider, Spin, Row, Col } from "antd";

import { donghnut, skybox } from "@Rlyeh/baseModels";
import { KeyBoardCtrl } from "@Rlyeh/handle";
import { Light, LIGHT_TYPE } from "@Rlyeh/Light";
import { objLoader } from "@Rlyeh/loader";
import { BasePhoneMat } from "@Rlyeh/object/materials/BasePhoneMat";
import { ReflectMat } from "@Rlyeh/object/materials/ReflectMat";
import { RefractMat } from "@Rlyeh/object/materials/RefractMat";
import { TexPhoneMat } from "@Rlyeh/object/materials/TexPhoneMat";
import { Transform } from "@Rlyeh/object/Transform";
import { ResManager } from "@Rlyeh/ResManager";
import { Scenes } from "@Rlyeh/Scenes";
// @ts-check
import axios from "axios";
import { CTransform } from "../Rlyeh/component/CTransform";

export default function BasicScene() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [lightX, setLightX] = useState(0);
  const [lightY, setLightY] = useState(0);
  const lightRef = useRef([0, 0]);
  const eventListeners = useRef<((event: Event) => void)[]>([]);

  useEffect(() => {
    if (!canvas.current) {
      return;
    }
    let glc = canvas.current;

    let resMgr = new ResManager(
      "assets/resource/",
      "models/",
      "shaders/",
      "skyboxs/"
    );
    let scenes = new Scenes(glc, resMgr);
    let inputHandel = new KeyBoardCtrl(scenes);
    let thegl = scenes.GL;

    eventListeners.current = [
      (event) => inputHandel.canv_on_click(event),
      (event) => inputHandel.on_mouse_move(event),
      (event) => inputHandel.on_key_down(event),
      (event) => inputHandel.on_key_up(event),
    ];
    canvas.current.addEventListener("click", eventListeners.current[0]);
    document.body.addEventListener("mousemove", eventListeners.current[1]);
    document.body.addEventListener("keypress", eventListeners.current[2]);
    document.body.addEventListener("keyup", eventListeners.current[3]);

    let light_pos = vec3.fromValues(10, 0, 1);
    let light_aim = vec3.fromValues(0, 0, 0);
    let light_color = vec4.fromValues(1, 1, 1, 1);
    let camera_pos = vec3.fromValues(-15, 8, 16);
    let cameraAim = vec3.fromValues(0, 0, -5);
    let cameraUp = vec3.fromValues(0, 1, 0);
    let cameraInfo = [Math.PI / 3, glc.width / glc.height, 0.01, 100];

    scenes.lights["Main"] = new Light(
      LIGHT_TYPE.DIRECTION,
      light_pos,
      light_aim,
      light_color
    );
    scenes.mainCamera.position = camera_pos;
    scenes.mainCamera.cameraAim = cameraAim;
    scenes.mainCamera.cameraUp = cameraUp;
    scenes.mainCamera.cameraInfo = cameraInfo;

    let resPath = "assets/resource/";
    let imgPath = [
      // skybox
      "skyboxs/bs2/X.png",
      "skyboxs/bs2/-X.png",
      "skyboxs/bs2/Y.png",
      "skyboxs/bs2/-Y.png",
      "skyboxs/bs2/Z.png",
      "skyboxs/bs2/-Z.png",
      // models
      "models/teapot/default.jpg",
    ];
    let textPath = [
      // shaders
      "shaders/anim_edge_phone.frag",
      "shaders/anim_edge_phone.vert",
      "shaders/anim_phone.frag",
      "shaders/anim_phone.vert",
      "shaders/base_phone.frag",
      "shaders/base_phone.vert",
      "shaders/reflect_mat.frag",
      "shaders/reflect_mat.vert",
      "shaders/refract_mat.frag",
      "shaders/refract_mat.vert",
      "shaders/shadow_only.frag",
      "shaders/shadow_only.vert",
      "shaders/skybox.frag",
      "shaders/skybox.vert",
      "shaders/text_phone.frag",
      "shaders/text_phone.vert",
      // texture
      "models/teapot/default.mtl",
      "models/teapot/teapot.obj",
    ];

    let imagePromises = imgPath.map((path, i) => {
      return new Promise<void>((res, rej) => {
        let to = setTimeout(rej, 10000);
        let im = new Image();
        im.onload = () => {
          resMgr.add(`${resPath}${path}`, im);
          clearTimeout(to);
          res();
        };
        im.src = `${resPath}${path}`;
      });
    });

    let textPromises = textPath.map((path, i) => {
      return new Promise<void>((res, rej) => {
        let to = setTimeout(rej, 10000);
        axios
          .get(`${resPath}${path}`, { responseType: "text" })
          .then((response) => {
            resMgr.add(`${resPath}${path}`, response.data);
            clearTimeout(to);
            res();
          });
      });
    });

    Promise.all([...imagePromises, ...textPromises])
      .then(() => {
        let sb = skybox(
          [
            `${resPath}${imgPath[0]}`,
            `${resPath}${imgPath[1]}`,
            `${resPath}${imgPath[2]}`,
            `${resPath}${imgPath[3]}`,
            `${resPath}${imgPath[4]}`,
            `${resPath}${imgPath[5]}`,
          ],
          thegl,
          resMgr
        );
        sb.setEarlyDraw((transform: Transform, gl: WebGLRenderingContext) => {
          transform.position = scenes.mainCamera.position;
          gl.cullFace(gl.FRONT);
        });
        sb.setLateDraw((transform: Transform, gl: WebGLRenderingContext) => {
          gl.cullFace(gl.BACK);
        });
        scenes.skybox = sb.Tranforms["skybox"];
        let sbTex = sb.Tranforms["skybox"].Mesh[0].material["tex"];

        let donghnut1 = donghnut(30, 36, 1, 3, thegl, resMgr, false);
        donghnut1.setInfo(scenes, (tran: Transform) => {
          (tran.Mesh[0].material as BasePhoneMat).setTex(sbTex);
          tran.position = vec3.fromValues(1, 3, 2);
          (tran.Mesh[0].material as BasePhoneMat).metalless = 0.8;
          (tran.Mesh[0].material as BasePhoneMat).smoothness = 8;
        });
        donghnut1.setEarlyDraw(
          (transform: Transform, gl: WebGLRenderingContext) => {
            transform.set_rz(Date.now() / 5000);
          }
        );

        let donghnut2 = donghnut(30, 36, 1, 3, thegl, resMgr, false);
        donghnut2.setInfo(scenes, (tran: Transform) => {
          (tran.Mesh[0].material as BasePhoneMat).setTex(sbTex);
          tran.position = vec3.fromValues(4, 4, 2);
          tran.scale = vec3.fromValues(0.5, 0.5, 0.5);
          (tran.Mesh[0].material as BasePhoneMat).metalless = 0.1;
          (tran.Mesh[0].material as BasePhoneMat).smoothness = 4;
        });
        donghnut2.setParent(donghnut1);
        donghnut2.setEarlyDraw(
          (transform: Transform, gl: WebGLRenderingContext) => {
            transform.set_rx(-Date.now() / 2000);
            transform.set_ry(-Date.now() / 2000);
          }
        );

        let donghnut3 = donghnut(30, 36, 1, 3, thegl, resMgr, false);
        donghnut3.setInfo(scenes, (tran: Transform) => {
          (tran.Mesh[0].material as BasePhoneMat).setTex(sbTex);
          tran.position = vec3.fromValues(2, 2, 2);
          tran.scale = vec3.fromValues(0.2, 1, 0.2);
          (tran.Mesh[0].material as BasePhoneMat).metalless = 0.1;
          (tran.Mesh[0].material as BasePhoneMat).smoothness = 0.1;
        });
        donghnut3.setParent(donghnut2);
        donghnut3.setEarlyDraw(
          (transform: Transform, gl: WebGLRenderingContext) => {
            transform.set_rz(Date.now() / 2000);
            transform.set_ry(Date.now() / 2000);
          }
        );
        let donghnut4 = donghnut(30, 36, 1, 3, thegl, resMgr, false);
        donghnut4.setInfo(scenes, (tran: Transform) => {
          (tran.Mesh[0].material as BasePhoneMat).setTex(sbTex);
          tran.position = vec3.fromValues(5, 5, 5);
          (tran.Mesh[0].material as BasePhoneMat).metalless = 0.1;
          (tran.Mesh[0].material as BasePhoneMat).smoothness = 0.1;
        });
        donghnut4.setParent(donghnut3);
        donghnut4.setEarlyDraw(
          (transform: Transform, gl: WebGLRenderingContext) => {
            transform.set_rx(Date.now() / 2000);
            transform.set_rz(Date.now() / 2000);
          }
        );

        let teapot = objLoader(
          `${resPath}models/teapot/`,
          "teapot.obj",
          scenes.mtllib,
          scenes.GL,
          "text_phone",
          resMgr
        );
        teapot.setInfo(scenes, (tran: CTransform) => {
          tran.position = vec3.fromValues(5, -5, 0);
          tran.scale = vec3.fromValues(40, 40, 40);
        });

        let teapot2 = objLoader(
          `${resPath}models/teapot/`,
          "teapot.obj",
          scenes.mtllib,
          scenes.GL,
          "reflect_mat",
          resMgr
        );
        teapot2.setInfo(scenes, (tran: CTransform) => {
          (tran.Mesh[0].material as ReflectMat).setTex(sbTex);
          tran.position = vec3.fromValues(0, -5, 0);
          tran.scale = vec3.fromValues(40, 40, 40);
        });

        let teapot3 = objLoader(
          `${resPath}models/teapot/`,
          "teapot.obj",
          scenes.mtllib,
          scenes.GL,
          "refract_mat",
          resMgr
        );
        teapot3.setInfo(scenes, (tran: CTransform) => {
          (tran.Mesh[0].material as RefractMat).setTex(sbTex);
          tran.position = vec3.fromValues(0, -5, 5);
          tran.scale = vec3.fromValues(40, 40, 40);
        });

        setLoading(false);
        scenes.LoadSence([
          sb,
          donghnut1,
          donghnut2,
          donghnut3,
          donghnut4,
          teapot,
          teapot2,
          teapot3,
        ]);
        scenes.update = (s: Scenes) => {
          inputHandel.moveCtrl();
          scenes.lights["Main"].position = vec3.fromValues(
            lightRef.current[0],
            lightRef.current[1],
            2
          );
        };
        scenes.Run();
      })
      .catch((e) => {
        console.error(e);
      });
    return () => {
      canvas.current?.removeEventListener("click", eventListeners.current[0]);
      document.body.removeEventListener("mousemove", eventListeners.current[1]);
      document.body.removeEventListener("keypress", eventListeners.current[2]);
      document.body.removeEventListener("keyup", eventListeners.current[3]);
      scenes.End();
    };
  }, []);

  useEffect(() => {
    lightRef.current = [lightX, lightY];
  }, [lightX, lightY]);

  return (
    <div style={{ width: 1200 }}>
      <h2>Click to rotate,WASD to move</h2>
      <Row>
        <Col span={4}>LightX</Col>
        <Col span={8}>
          <Slider
            defaultValue={1}
            max={10}
            min={-10}
            onChange={setLightX}
          ></Slider>
        </Col>
      </Row>
      <Row>
        <Col span={4}>LightY</Col>
        <Col span={8}>
          <Slider
            defaultValue={1}
            max={10}
            min={-10}
            onChange={setLightY}
          ></Slider>
        </Col>
      </Row>
      {loading && (
        <div
          style={{
            display: "table",
            width: "fit-content",
            height: 800,
            margin: "0 auto ",
          }}
        >
          <Spin
            style={{
              display: "table-cell",
              verticalAlign: "middle",
            }}
            tip="Loading..."
          ></Spin>
        </div>
      )}
      <canvas
        style={{
          width: 1200,
          height: 800,
          visibility: loading ? "hidden" : "visible",
        }}
        width={1200}
        height={800}
        ref={canvas}
      ></canvas>
    </div>
  );
}
