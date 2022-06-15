function I3dViewer(container) {
  this.container = container;
  this.model = null;
  this.size = null;

  this.getLoader = function (fileType) {
    switch (fileType) {
      case "stl":
        return new THREE.STLLoader();
      default:
        break;
    }
  };
}

I3dViewer.prototype.initRender = function () {
  this.renderer = new THREE.WebGLRenderer({ antialias: true });
  this.renderer.setSize(
    this.container.clientWidth,
    this.container.clientHeight
  );

  this.renderer.setClearColor(0xffffff);

  this.container.appendChild(this.renderer.domElement);
};

I3dViewer.prototype.initCamera = function () {
  this.camera = new THREE.PerspectiveCamera(
    45,
    this.container.clientWidth / this.container.clientHeight,
    0.1,
    1000
  );
  this.camera.position.set(0, 40, 50);
  this.camera.lookAt(new THREE.Vector3(0, 0, 0));
};

I3dViewer.prototype.initScene = function () {
  this.scene = new THREE.Scene();
};

I3dViewer.prototype.initLight = function (scene) {
  scene = scene ? scene : this.scene;

  scene.add(new THREE.AmbientLight(0x444444));

  this.light = new THREE.PointLight(0xffffff);
  this.light.position.set(0, 50, 50);

  this.light.castShadow = true;

  scene.add(this.light);
};

I3dViewer.prototype.loadModel = function (filePath, cb) {
  const loader = this.getLoader("stl");
  if (this.model) {
    this.scene.remove(this.model);

    this.model.geometry.dispose();
    this.model.material.dispose();
    this.model = null
  }

  loader.load(filePath, (geometry) => {
    //创建纹理
    var mat = new THREE.MeshLambertMaterial({ color: 0x00ffff });
    var mesh = new THREE.Mesh(geometry, mat);
    mesh.rotation.x = -0.5 * Math.PI; //将模型摆正

    const bbox = new THREE.Box3().setFromObject(mesh);
    this.size = bbox.getSize(new THREE.Vector3());

    mesh.scale.set(0.1, 0.1, 0.1); //缩放

    geometry.center(); //居中显示
    this.scene.add(mesh);
    this.model = mesh;

    cb && cb();
    // const b = new THREE.Box3().setFromObject(mesh);
    // const helper = new THREE.Box3Helper(b, new THREE.Color(0, 0, 0));

    // this.scene.add(helper);
  });
};
I3dViewer.prototype.initStats = function () {
  try {
    this.stats = new Stats();
    this.container.appendChild(this.stats.dom);
  } catch (error) {
    console.warn(error);
  }
};
I3dViewer.prototype.initControls = function () {
  try {
    this.controls = new THREE.OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    // 如果使用animate方法时，将此函数删除
    //controls.addEventListener( 'change', render );
    // 使动画循环使用时阻尼或自转 意思是否有惯性
    this.controls.enableDamping = true;
    //动态阻尼系数 就是鼠标拖拽旋转灵敏度
    //controls.dampingFactor = 0.25;
    //是否可以缩放
    this.controls.enableZoom = true;
    //是否自动旋转
    this.controls.autoRotate = false;
    this.controls.autoRotateSpeed = 0.5;
    //设置相机距离原点的最远距离
    this.controls.minDistance = 1;
    //设置相机距离原点的最远距离
    this.controls.maxDistance = 200;
    //是否开启右键拖拽
    this.controls.enablePan = true;
  } catch (error) {}
};

I3dViewer.prototype.render = function () {
  this.renderer.render(this.scene, this.camera);
};

I3dViewer.prototype.onWindowResize = function () {
  this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
  // 更新矩阵
  this.camera.updateProjectionMatrix();
  this.renderer.setSize(
    this.container.clientWidth,
    this.container.clientHeight
  );
};

I3dViewer.prototype.draw = function () {
  this.initRender();
  this.initScene();
  this.initCamera();
  this.initLight();
  // this.initStats();
  this.initControls();

  this.container.onresize = this.onWindowResize;
};

var viewer;
window.onload = () => {
  const container = document.getElementById("container");
  viewer = new I3dViewer(container);
  viewer.draw();

  function animate() {
    viewer.render();

    viewer.stats && viewer.stats.update();
    viewer.controls && viewer.controls.update();

    requestAnimationFrame(animate);
  }

  animate();
};

function makeThumbnail() {
  const canvas = document.querySelector("#container>canvas");
  const url = canvas.toDataURL();
  const i = document.getElementById("thumbnail");
  if (i) {
    i.src = url;
    return;
  }

  const img = document.createElement("img");
  img.className = "thumbnail";
  img.id = "thumbnail";

  img.onclick = () => {
    const viewer = document.querySelector(".viewer");
    viewer.style.visibility = "visible";
  };

  img.src = url;

  document.body.appendChild(img);
}

function off() {
  const viewer = document.querySelector(".viewer");
  viewer.style.visibility = "hidden";
}

function selectFile() {
  file.click();
}

function getFile() {
  console.log(viewer.scene);
  const f = file.files[0];
  const blob = new Blob([f], {
    type: "application/vnd.ms-pkistl;charset=utf-8",
  });
  const fileUrl = URL.createObjectURL(blob);
  viewer.loadModel(fileUrl, () => {
    // setting size
    const size = document.getElementById("size");
    if (size) {
      size.innerText = `长：${viewer.size.x},宽： ${viewer.size.y} ,高： ${viewer.size.z}`;
    } else {
      const el = document.createElement("div");
      el.id = "size";
      el.innerText = `长：${viewer.size.x},宽： ${viewer.size.y} ,高： ${viewer.size.z}`;
      document.body.appendChild(el);
    }
  });
  setTimeout(() => {
    makeThumbnail();
  }, 2000);
}


