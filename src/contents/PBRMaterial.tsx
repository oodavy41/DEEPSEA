// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { vec3, vec4 } from "gl-matrix";
import { Slider, Spin, Row, Col } from "antd";
import axois from "axios";
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
import axios from "axios";
// @ts-check
export default function PBRMaterial() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

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

    let light_pos = vec3.fromValues(10, 0, 1);
    let light_aim = vec3.fromValues(0, 0, 0);
    let light_color = vec4.fromValues(1, 1, 1, 1);
    let camera_pos = vec3.fromValues(0, 20, 0);
    let cameraAim = vec3.fromValues(0, 0, 0);
    let cameraUp = vec3.fromValues(-1, 0, 0);
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

        let donghnuts = [];
        for (let i = 0; i < 11; i++) {
          for (let j = 0; j < 11; j++) {
            let obj = donghnut(8, 32, 0.15, 0.5, thegl, resMgr, false);
            obj.setInfo(scenes, (tran: Transform) => {
              (tran.Mesh[0].material as BasePhoneMat).setTex(sbTex);
              tran.position = vec3.fromValues(-10 + i * 2, 0, -10 + j * 2);
              tran.rotation = vec3.fromValues(90, 0, 0);
              (tran.Mesh[0].material as BasePhoneMat).metalless = i / 10;
              (tran.Mesh[0].material as BasePhoneMat).smoothness = Math.pow(
                1.5,
                j
              );
            });
            donghnuts.push(obj);
          }
        }

        setLoading(false);
        scenes.LoadSence([sb, ...donghnuts]);
        scenes.update = (s: Scenes) => {};
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
      <canvas
        style={{ width: 1200, height: 800 }}
        width={1200}
        height={800}
        ref={canvas}
      ></canvas>
    </div>
  );
}
