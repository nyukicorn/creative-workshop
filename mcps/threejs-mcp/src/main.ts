import WebSocket, { WebSocketServer } from 'ws';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, GetPromptRequestSchema, ListPromptsRequestSchema, ListResourcesRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import fs from 'fs';
import path from 'path';

// Initialize WebSocket server
const wss = new WebSocketServer({ port: 8082 });
let clientConnection: WebSocket | null = null;
let sceneState: any = null;

wss.on('connection', (ws: WebSocket) => {
  console.error('Client connected');
  clientConnection = ws;

  ws.on('message', (message: string) => {
    try {
      sceneState = JSON.parse(message);
      console.error('Updated scene state:', sceneState);
    } catch (e) {
      console.error('Invalid scene state message:', message);
    }
  });

  ws.on('close', () => {
    console.error('Client disconnected');
    clientConnection = null;
    sceneState = null;
  });
});

// Initialize MCP server
const server = new Server(
  { name: "threejs_mcp_server", version: "1.0.0" },
  { capabilities: { prompts: {}, tools: {} } }
);

server.onerror = (error) => {
  console.error("[MCP Error]", error);
};

process.on("SIGINT", async () => {
  wss.close()
  await server.close();
  process.exit(0);
});

// Define MCP tools
const tools = [
  {
    name: "addObject",
    description: "Add an object to the scene",
    inputSchema: {
      type: "object",
      properties: {
        type: { type: "string" },
        position: { type: "array", items: { type: "number" }, minItems: 3, maxItems: 3 },
        color: { type: "string" }
      },
      required: ["type", "position", "color"]
    }
  },
  {
    name: "moveObject",
    description: "Move an object to a new position",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        position: { type: "array", items: { type: "number" }, minItems: 3, maxItems: 3 }
      },
      required: ["id", "position"]
    }
  },
  {
    name: "removeObject",
    description: "Remove an object",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" }
      },
      required: ["id"]
    }
  },
  {
    name: "startRotation",
    description: "Start rotating an object around the y-axis",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },        // The ID of the object (e.g., "cube1")
        speed: { type: "number" }      // Rotation speed in radians per frame
      },
      required: ["id", "speed"]
    }
  },
  {
    name: "stopRotation",
    description: "Stop rotating an object",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" }         // The ID of the object
      },
      required: ["id"]
    }
  },
  {
    name: "getSceneState",
    description: "Get the current scene state",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "loadGLB",
    description: "Load a GLB file into the scene",
    inputSchema: {
      type: "object",
      properties: {
        filePath: { type: "string", description: "Path to the GLB file" },
        position: { type: "array", items: { type: "number" }, minItems: 3, maxItems: 3, description: "Position [x, y, z]" },
        scale: { type: "number", description: "Scale factor", default: 1 }
      },
      required: ["filePath"]
    }
  },
  {
    name: "createViewer",
    description: "Create an HTML viewer for a GLB file",
    inputSchema: {
      type: "object",
      properties: {
        glbPath: { type: "string", description: "Path to the GLB file" },
        outputPath: { type: "string", description: "Output HTML file path" },
        title: { type: "string", description: "Page title", default: "3D Model Viewer" }
      },
      required: ["glbPath", "outputPath"]
    }
  },
  {
    name: "bridgeFromBlender",
    description: "Bridge function to receive models from Blender MCP",
    inputSchema: {
      type: "object",
      properties: {
        blenderAssetPath: { type: "string", description: "Path to Blender asset folder" },
        targetGLB: { type: "string", description: "Target GLB filename" }
      },
      required: ["blenderAssetPath", "targetGLB"]
    }
  }
];

const prompts = [
  {
    name: "asset-creation-strategy",
    description: "Defines the preferred strategy for creating assets in ThreeJS",
    arguments: []
  }
]

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));
server.setRequestHandler(ListPromptsRequestSchema, async () => ({ prompts }));

// server.setRequestHandler(ListResourcesRequestSchema, async () => ({ resources: [] }));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: input } = request.params;

  console.error("request: ===================", request)
  console.error("state: ===================", sceneState)

  if (name === "addObject") {
    if (!clientConnection) {
      return {
        content: [
            {
              type: "text",
              text: "No client connection available"
            }
          ]
      };
    }
    const command = { action: "addObject", ...(input as any) };
    clientConnection.send(JSON.stringify(command));
    return {
      content: [
        {
          type: "text",
          text: "sent"
        }
      ]
    };
  } else if (name === "moveObject") {
    if (!clientConnection) {
      return {
        content: [
            {
              type: "text",
              text: "No client connection available"
            }
          ]
      };
    }
    const command = { action: "moveObject", ...(input as any) };
    clientConnection.send(JSON.stringify(command));
    return {
      content: [
        {
          type: "text",
          text: "sent"
        }
      ]
    };
  } else if (name === 'removeObject') {
    if (!clientConnection) {
      return {
        content: [
            {
              type: "text",
              text: "No client connection available"
            }
          ]
      };
    }
    const command = { action: "removeObject", ...(input as any) };
    clientConnection.send(JSON.stringify(command));
    return {
      content: [
        {
          type: "text",
          text: "sent"
        }
      ]
     };
  } else if (name === "getSceneState") {
    if (sceneState) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(sceneState?.data, null, 2)
          }
        ]
      };
    } else {
      return {
        content: [
          {
            type: "text",
            text: "No scene state available"
          }
        ]
      };
    }
  } else if (name === "startRotation") {
    if (!clientConnection) {
      return {
        content: [
            {
              type: "text",
              text: "No client connection available"
            }
          ]
      };
    }
    const command = {
      action: "startRotation",
      id: input?.id,
      speed: input?.speed
    };
    clientConnection.send(JSON.stringify(command));
    return {
      content: [
        {
          type: "text",
          text: "sent"
        }
      ]
    };
  } else if (name === "stopRotation") {
    if (!clientConnection) {
      return {
        content: [
            {
              type: "text",
              text: "No client connection available"
            }
          ]
      };
    }
    const command = {
      action: "stopRotation",
      id: input?.id
    };
    clientConnection.send(JSON.stringify(command));
    return {
      content: [
        {
          type: "text",
          text: "sent"
        }
      ]
    };
  } else if (name === "loadGLB") {
    if (!clientConnection) {
      return {
        content: [
          {
            type: "text",
            text: "No client connection available"
          }
        ]
      };
    }
    const command = {
      action: "loadGLB",
      filePath: input?.filePath,
      position: input?.position || [0, 0, 0],
      scale: input?.scale || 1
    };
    clientConnection.send(JSON.stringify(command));
    return {
      content: [
        {
          type: "text",
          text: `GLB file ${input?.filePath} loading sent to client`
        }
      ]
    };
  } else if (name === "createViewer") {
    try {
      const glbPath = input?.glbPath as string;
      const outputPath = input?.outputPath as string;
      const title = (input?.title as string) || "3D Model Viewer";
      
      const htmlContent = createViewerHTML(glbPath, title);
      fs.writeFileSync(outputPath, htmlContent);
      
      return {
        content: [
          {
            type: "text",
            text: `HTML viewer created at: ${outputPath}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error creating viewer: ${error}`
          }
        ]
      };
    }
  } else if (name === "bridgeFromBlender") {
    try {
      const blenderAssetPath = input?.blenderAssetPath as string;
      const targetGLB = input?.targetGLB as string;
      const fullPath = path.join(blenderAssetPath, targetGLB);
      
      if (!fs.existsSync(fullPath)) {
        return {
          content: [
            {
              type: "text",
              text: `GLB file not found: ${fullPath}`
            }
          ]
        };
      }
      
      // Copy to local assets if needed or load directly
      if (clientConnection) {
        const command = {
          action: "loadGLB",
          filePath: fullPath,
          position: [0, 0, 0],
          scale: 1
        };
        clientConnection.send(JSON.stringify(command));
      }
      
      return {
        content: [
          {
            type: "text",
            text: `Blender asset bridged successfully: ${targetGLB} from ${blenderAssetPath}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Bridge error: ${error}`
          }
        ]
      };
    }
  }
  return {
    content: [
      {
        type: "text",
        text: "Tool not found"
      }
    ]
  };;
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  if (request.params.name !== "asset-creation-strategy") {
    throw new Error("Unknown prompt");
  }
  return {
    description: "Defines the preferred strategy for creating assets in ThreeJS",
    messages: [{
      role: "assistant",
      content: {
        type: "text",
        text: `
          When creating 3D content in ThreeJS, always start by checking if integrations are available:
          0. Before anything, always check the scene from getSceneState() tool
          1. Response of getSceneState() tool always give you with the format delimited by ### format ###
             ###
              {
                [
                  {
                    id: "cube1",
                    type: "cube",
                    position: [0, 0, 0],
                    color: "red",
                    ...
                  }
                ]
              }
             ###
          2. Always find the id of the object in response of getSceneState() tool
          3. Always use the id of the object to manipulate it with other tools
        `
      }
    }]
  };
});

// HTML viewer template function
function createViewerHTML(glbPath: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { margin: 0; padding: 0; background: #222; color: white; font-family: Arial, sans-serif; }
        #container { width: 100%; height: 100vh; position: relative; }
        #info { position: absolute; top: 10px; left: 10px; z-index: 100; }
        canvas { display: block; }
    </style>
</head>
<body>
    <div id="container">
        <div id="info">
            <h3>${title}</h3>
            <p>Model: ${path.basename(glbPath)}</p>
            <p>Controls: Mouse to rotate, scroll to zoom</p>
        </div>
    </div>

    <script type="importmap">
    {
        "imports": {
            "three": "https://unpkg.com/three@0.170.0/build/three.module.js",
            "three/addons/": "https://unpkg.com/three@0.170.0/examples/jsm/"
        }
    }
    </script>

    <script type="module">
        import * as THREE from 'three';
        import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x222222);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('container').appendChild(renderer.domElement);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        // Load GLB model
        const loader = new GLTFLoader();
        loader.load('${glbPath}', (gltf) => {
            const model = gltf.scene;
            scene.add(model);

            // Auto-fit camera
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / 2 * Math.tan(fov * 2));
            camera.position.set(center.x, center.y, center.z + cameraZ * 2);
            camera.lookAt(center);
            controls.target.copy(center);

            console.log('Model loaded successfully');
        }, (progress) => {
            console.log('Loading progress:', progress);
        }, (error) => {
            console.error('Error loading model:', error);
        });

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        animate();
    </script>
</body>
</html>`;
}

// Start MCP server with stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
