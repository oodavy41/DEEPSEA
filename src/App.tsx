import { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import { Layout, Menu, Breadcrumb } from "antd";

import Home from "./contents/Home";
import BasicScene from "./contents/BasicScene";
import PBRMaterial from "./contents/PBRMaterial";
import ShadowMap from "./contents/ShadowMap";

import "antd/lib/style/index.css";
import logo from "./logo.svg";
import "./App.css";

const { Header, Content, Footer } = Layout;

function App() {
  const [count, setCount] = useState(0);

  return (
    <BrowserRouter>
      <Layout className="layout">
        <Header>
          <div className="logo" />
          <Menu theme="dark" mode="horizontal" defaultSelectedKeys={["2"]}>
            {["Home", "BasicScene", "PBRMaterial", "ShadowMap"].map(
              (path, index) => {
                const key = path + (index + 1);
                return (
                  <Menu.Item key={key}>
                    <Link to={path === "Home" ? "/" : path}>{path}</Link>
                  </Menu.Item>
                );
              }
            )}
          </Menu>
        </Header>
        <Content style={{ padding: "0 50px" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="BasicScene" element={<BasicScene />} />
            <Route path="PBRMaterial" element={<PBRMaterial />} />
            <Route path="ShadowMap" element={<ShadowMap />} />
          </Routes>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Ant Design ©2018 Created by Ant UED
        </Footer>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
