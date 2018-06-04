var scene, camera, renderer, stats;
var clock = new THREE.Clock(true);
var smokeMaterial;
var controls;
var particleCount, particles, particleSystem;
var yVelocity = 5.0;
var planeGeometry, planeMaterial, plane;
var dt = 0.01;
//SHADERS
var pathToShaders = './shaders';
var pathToChunks  = './chunks';

var shaders = new ShaderLoader( pathToShaders , pathToChunks );
shaders.load( 'vertex' , 'VERT'  , 'vertex'      );
shaders.load( 'frag' , 'FRAG'  , 'fragment'    );


shaders.shaderSetLoaded = function(){
        init();
        animate();
};



function render()
{
    //uppdatera dt bara en gång
   smokeMaterial.uniforms.time.value += dt; //update uniform time variable in shaders
   smokeMaterial.uniforms.cameraPos.value = camera.position;
   renderer.render( scene, camera );
}

function animate()
{
  requestAnimationFrame(animate);
  dt = clock.getDelta() / 2.0 ;


  for (var i = 0; i < particleCount; i++)
  {
      var particle = particles.vertices[i];

      particle.y += 0.5 * dt;
      // uncomment for spiral motion, seems to be unstable to mix with curl noise
      //particle.x += 0.5 * particle.z * particle.y * dt;
      //particle.z += -0.5 * particle.x * particle.y * dt;
      if (particle.y > 2.0 + Math.random() * 0.2) {
          particle.y = Math.random() * 0.5;
          var angle = Math.random() * 2 * Math.PI;
          var r = Math.random() * 0.6;
          particle.x = r * Math.cos(angle);
          particle.z = r * Math.sin(angle);
      }

  }
  particleSystem.geometry.verticesNeedUpdate = true;

  controls.update();
  render();
  stats.update();
}


function init()
{
    //create scene
    scene = new THREE.Scene();

    //CAMERA
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 10000 );
    camera.position.z = 10;  //adjust camera position, pos z axis is pointing out from the screen
    camera.position.y = 0;
    controls = new THREE.OrbitControls( camera, renderer );

    //RENDERER
    renderer = new THREE.WebGLRenderer({alpha: true}); //use webGL renderer
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );




    //number of particles in system
    particleCount = 300000;
     
    // Particles are just individual vertices in a geometry
    // Create the geometry that will hold all of the vertices
    particles = new THREE.Geometry();


    // Create the vertices and add them to the particles geometry
    for (var p = 0; p < particleCount; p++) {
        // spawn particles in a cylinder
        var y = Math.random() * 3 ;
        var angle = Math.random() * 2 * Math.PI;
        var r = Math.random() * 0.6;
        var x = r * Math.cos(angle);
        var z = r * Math.sin(angle);
        // one particle is represented by one vertice
        var particle = new THREE.Vector3(x, y, z);
        particle.velocity = new THREE.Vector3(
            0.0, 0.003, 0.0
        );
        // Add the vertex to the geometry
        particles.vertices.push(particle);
    }

    // initialize uniforms sent to shaders
    var texload = new THREE.TextureLoader();
    var tex = texload.load("textures/smokeparticle.png");
    var uniforms = {
        time: { type:'f', value: 1.0},
        texture: {type:'t', value: tex},
        cameraPos: new THREE.Uniform(new THREE.Vector3(camera.position))
    };

    smokeMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: shaders.vertexShaders.VERT,
        fragmentShader: shaders.fragmentShaders.FRAG,
       // blending: THREE.AdditiveBlending, // additive blending looks really bad, best skip it
        transparent: true,
        depthTest: false
    });


    // Create the particle system
    particleSystem = new THREE.Points(particles, smokeMaterial);
    particleSystem.sortParticles = true;
    // add it to the scene
    scene.add(particleSystem);

    smokeMaterial.needsUpdate = true;


    // PLANE
    // planeGeometry = new THREE.PlaneGeometry(5, 5, 12);
    // planeMaterial = new THREE.MeshBasicMaterial(
    //     {
    //         color:0xff0000,
    //         side: THREE.DoubleSide
    //     });
    // plane = new THREE.Mesh(planeGeometry, planeMaterial);
    // plane.rotateX(Math.PI/2);
    //scene.add(plane);
    // var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    // scene.add( directionalLight );
    ///var objLoader = new THREE.OBJLoader();
    // var teapotMaterial = new THREE.MeshLambertMaterial(
    //     {
    //        color:0xff0000
    //     }
    // );
    // objLoader.load(
    //     "textures/teapot.obj",
    //     function(object){
    //         object.traverse(function(child){
    //             if (child instanceof THREE.Mesh)
    //                 child.material = planeMaterial;
    //         });
    //         object.position.set(-3, -2.6, 0);
    //         scene.add(object);
    //     }
    // );


    var container = document.getElementById( 'container' );
    container.appendChild( renderer.domElement );

    stats = new Stats();
    container.appendChild( stats.dom );
}