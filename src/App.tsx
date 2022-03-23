import { useState } from "react";

import { Layout, Menu } from "antd";

import Home from "./contents/Home";
import BasicScene from "./contents/BasicScene";
import PBRMaterial from "./contents/PBRMaterial";
import ShadowMap from "./contents/ShadowMap";

import "antd/lib/style/index.css";
import "./App.css";

const { Header, Content, Footer } = Layout;

function App() {
  const [path, setPath] = useState("Home");

  return (
    <Layout className="layout">
      <Header>
        <div className="logo" />
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={["2"]}>
          {["Home", "BasicScene", "PBRMaterial", "ShadowMap"].map(
            (path, index) => {
              const key = path + (index + 1);
              return (
                <Menu.Item key={key} onClick={() => setPath(path)}>
                  <label>{path}</label>
                </Menu.Item>
              );
            }
          )}
        </Menu>
      </Header>
      <Content style={{ padding: "0 50px" }}>
        {
          {
            Home: <Home key="Home" />,
            BasicScene: <BasicScene key="BasicScene" />,
            PBRMaterial: <PBRMaterial key="PBRMaterial" />,
            ShadowMap: <ShadowMap key="ShadowMap" />,
          }[path]
        }
      </Content>
      <Footer style={{ textAlign: "center" }}>
        Ant Design ©2018 Created by Ant UED
      </Footer>
    </Layout>
  );
}

export default App;
