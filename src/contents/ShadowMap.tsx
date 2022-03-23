import { useState, useEffect, useRef } from "react";
import { vec3, vec4 } from "gl-matrix";
import { Slider, Spin, Row, Col } from "antd";
import axios from "axios";

import { donghnut, panel } from "../Rlyeh/baseModels";
import { Light, LIGHT_TYPE } from "../Rlyeh/Light";
import { BasePhoneMat } from "../Rlyeh/object/materials/basePhoneMat";
import { Transform } from "../Rlyeh/object/Transform";
import { ResManager } from "../Rlyeh/ResManager";
import { Scenes } from "../Rlyeh/Scenes";

export default function ShadowMap() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const frame = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!(canvas.current && frame.current)) {
      return;
    }
    let glc = canvas.current;
    let framectx = frame.current.getContext("2d") as CanvasRenderingContext2D;
    let resMgr = new ResManager(
      "assets/resource/",
      "models/",
      "shaders/",
      "skyboxs/"
    );
    let scenes = new Scenes(glc, resMgr);
    let thegl = scenes.GL;
    scenes.framectx = framectx;
    let light_pos = vec3.fromValues(-10, 10, 1);
    let light_aim = vec3.fromValues(0, -10, 0);
    let light_color = vec4.fromValues(1, 1, 1, 1);
    let camera_pos = vec3.fromValues(10, 40, 10);
    let cameraAim = vec3.fromValues(0, -10, 0);
    let cameraUp = vec3.fromValues(0, 1, 0);
    let cameraInfo = [Math.PI / 3, glc.width / glc.height, 1, 1000];

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
    let textPath = [
      // shaders
      "shaders/base_phone_shadow.frag",
      "shaders/base_phone_shadow.vert",
      "shaders/base_phone.frag",
      "shaders/base_phone.vert",
      "shaders/shadow_only.frag",
      "shaders/shadow_only.vert",
      "shaders/text_phone.frag",
      "shaders/text_phone.vert",
    ];
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

    Promise.all(textPromises)
      .then(() => {
        setLoading(false);
        scenes.EnableShadow(512, 512);
        let donghnut1 = donghnut(30, 36, 1, 3, thegl!, resMgr, scenes.shadow);
        donghnut1.setInfo(scenes, (tran: Transform) => {
          (tran.Mesh[0].material as BasePhoneMat).smoothness = 1;
          tran.position = vec3.fromValues(1, 3, 2);
        });
        donghnut1.setEarlyDraw(
          (transform: Transform, gl: WebGLRenderingContext) => {
            transform.set_rz(Date.now() / 5000);
          }
        );

        let donghnut2 = donghnut(30, 36, 1, 3, thegl!, resMgr, scenes.shadow);
        donghnut2.setInfo(scenes, (tran: Transform) => {
          (tran.Mesh[0].material as BasePhoneMat).smoothness = 1;
          tran.position = vec3.fromValues(4, 4, 2);
          tran.scale = vec3.fromValues(0.5, 0.5, 0.5);
        });
        donghnut2.setParent(donghnut1);
        donghnut2.setEarlyDraw(
          (transform: Transform, gl: WebGLRenderingContext) => {
            transform.set_rx(-Date.now() / 2000);
            transform.set_ry(-Date.now() / 2000);
          }
        );

        let donghnut3 = donghnut(30, 36, 1, 3, thegl!, resMgr, scenes.shadow);
        donghnut3.setInfo(scenes, (tran: Transform) => {
          (tran.Mesh[0].material as BasePhoneMat).smoothness = 1;
          tran.position = vec3.fromValues(2, 2, 2);
          tran.scale = vec3.fromValues(0.2, 1, 0.2);
        });
        donghnut3.setParent(donghnut2);
        donghnut3.setEarlyDraw(
          (transform: Transform, gl: WebGLRenderingContext) => {
            transform.set_rz(Date.now() / 2000);
            transform.set_ry(Date.now() / 2000);
          }
        );
        let donghnut4 = donghnut(30, 36, 1, 3, thegl!, resMgr, scenes.shadow);
        donghnut4.setInfo(scenes, (tran: Transform) => {
          (tran.Mesh[0].material as BasePhoneMat).smoothness = 1;
          tran.position = vec3.fromValues(5, 5, 5);
        });
        donghnut4.setParent(donghnut3);
        donghnut4.setEarlyDraw(
          (transform: Transform, gl: WebGLRenderingContext) => {
            transform.set_rx(Date.now() / 2000);
            transform.set_rz(Date.now() / 2000);
          }
        );
        let ground = panel(30, thegl!, scenes.shadow, resMgr);
        ground.setInfo(scenes, (tran) => {
          tran.position = vec3.fromValues(0, -10, 0);
          (tran.Mesh[0].material as BasePhoneMat).smoothness = 1;
        });
        scenes.LoadSence([donghnut1, donghnut2, donghnut3, donghnut4, ground]);
        scenes.update = (s: Scenes) => {
          let img = new ImageData(
            new Uint8ClampedArray(
              scenes.lights["Main"].depthFrame.textData.buffer
            ),
            512,
            512
          );
          framectx.putImageData(img, 0, 0);
        };
        scenes.Run();
      })
      .catch((e) => {
        console.error(e);
      });
    return () => {
      scenes.End();
    };
  }, []);

  return (
    <div style={{ width: 1200 }}>
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
      <div style={{ width: 1610, margin: 10 }}>
        <canvas
          style={{ width: 1200, height: 800 }}
          width={1200}
          height={800}
          ref={canvas}
        ></canvas>
        <canvas
          style={{ float: "right", width: 400, height: 400 }}
          width={512}
          height={512}
          ref={frame}
        ></canvas>
      </div>
    </div>
  );
}
