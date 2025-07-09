#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

interface BlenderExecutionOptions {
  background?: boolean;
  script?: string;
  blendFile?: string;
  outputDir?: string;
  pythonExpr?: string;
}

class BlenderMCPServer {
  private server: Server;
  private blenderPath: string;

  constructor() {
    this.server = new Server(
      {
        name: 'mcp-blender',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Default Blender path - can be customized
    this.blenderPath = '/Applications/Blender.app/Contents/MacOS/Blender';
    
    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getTools(),
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'execute_blender_script':
            return await this.executeBlenderScript(args);
          case 'render_scene':
            return await this.renderScene(args);
          case 'create_blender_script':
            return await this.createBlenderScript(args);
          case 'run_python_expression':
            return await this.runPythonExpression(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    });
  }

  private getTools(): Tool[] {
    return [
      {
        name: 'execute_blender_script',
        description: 'Execute a Python script in Blender',
        inputSchema: {
          type: 'object',
          properties: {
            script: {
              type: 'string',
              description: 'Python script to execute in Blender',
            },
            blendFile: {
              type: 'string',
              description: 'Optional .blend file to open',
            },
            background: {
              type: 'boolean',
              description: 'Run in background mode (default: true)',
              default: true,
            },
          },
          required: ['script'],
        },
      },
      {
        name: 'render_scene',
        description: 'Render a Blender scene',
        inputSchema: {
          type: 'object',
          properties: {
            blendFile: {
              type: 'string',
              description: 'Path to the .blend file to render',
            },
            outputDir: {
              type: 'string',
              description: 'Output directory for rendered images',
            },
            frame: {
              type: 'number',
              description: 'Specific frame to render (optional)',
            },
            animation: {
              type: 'boolean',
              description: 'Render animation (default: false)',
              default: false,
            },
          },
          required: ['blendFile'],
        },
      },
      {
        name: 'create_blender_script',
        description: 'Create a Python script file for Blender',
        inputSchema: {
          type: 'object',
          properties: {
            filename: {
              type: 'string',
              description: 'Name of the script file',
            },
            script: {
              type: 'string',
              description: 'Python script content',
            },
            directory: {
              type: 'string',
              description: 'Directory to save the script (default: current directory)',
            },
          },
          required: ['filename', 'script'],
        },
      },
      {
        name: 'run_python_expression',
        description: 'Run a Python expression in Blender and return the result',
        inputSchema: {
          type: 'object',
          properties: {
            expression: {
              type: 'string',
              description: 'Python expression to evaluate',
            },
            blendFile: {
              type: 'string',
              description: 'Optional .blend file to open',
            },
          },
          required: ['expression'],
        },
      },
    ];
  }

  private async executeBlenderScript(args: any) {
    const { script, blendFile, background = true } = args;
    
    // Create temporary script file
    const tempScriptPath = join(process.cwd(), 'temp_blender_script.py');
    writeFileSync(tempScriptPath, script);

    let command = `"${this.blenderPath}"`;
    
    if (blendFile) {
      command += ` "${blendFile}"`;
    }
    
    if (background) {
      command += ' --background';
    }
    
    command += ` --python "${tempScriptPath}"`;

    try {
      const { stdout, stderr } = await execAsync(command);
      
      return {
        content: [
          {
            type: 'text',
            text: `Script executed successfully.\nOutput: ${stdout}\n${stderr ? `Errors: ${stderr}` : ''}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to execute Blender script: ${error}`);
    }
  }

  private async renderScene(args: any) {
    const { blendFile, outputDir, frame, animation = false } = args;
    
    let command = `"${this.blenderPath}" "${blendFile}" --background`;
    
    if (outputDir) {
      command += ` --render-output "${outputDir}/"`;
    }
    
    if (frame !== undefined) {
      command += ` --frame ${frame}`;
    }
    
    if (animation) {
      command += ' --render-anim';
    } else {
      command += ' --render-frame 1';
    }

    try {
      const { stdout, stderr } = await execAsync(command);
      
      return {
        content: [
          {
            type: 'text',
            text: `Render completed.\nOutput: ${stdout}\n${stderr ? `Errors: ${stderr}` : ''}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to render scene: ${error}`);
    }
  }

  private async createBlenderScript(args: any) {
    const { filename, script, directory = process.cwd() } = args;
    
    if (!existsSync(directory)) {
      mkdirSync(directory, { recursive: true });
    }
    
    const fullPath = join(directory, filename);
    writeFileSync(fullPath, script);
    
    return {
      content: [
        {
          type: 'text',
          text: `Script created successfully at: ${fullPath}`,
        },
      ],
    };
  }

  private async runPythonExpression(args: any) {
    const { expression, blendFile } = args;
    
    // Create a temporary script that evaluates the expression and prints the result
    const script = `
import bpy
result = ${expression}
print(f"RESULT: {result}")
`;
    
    const tempScriptPath = join(process.cwd(), 'temp_expression_script.py');
    writeFileSync(tempScriptPath, script);

    let command = `"${this.blenderPath}"`;
    
    if (blendFile) {
      command += ` "${blendFile}"`;
    }
    
    command += ` --background --python "${tempScriptPath}"`;

    try {
      const { stdout, stderr } = await execAsync(command);
      
      // Extract the result from the output
      const resultMatch = stdout.match(/RESULT: (.+)/);
      const result = resultMatch ? resultMatch[1] : 'No result found';
      
      return {
        content: [
          {
            type: 'text',
            text: `Expression result: ${result}\nFull output: ${stdout}\n${stderr ? `Errors: ${stderr}` : ''}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to evaluate Python expression: ${error}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Blender MCP server running on stdio');
  }
}

const server = new BlenderMCPServer();
server.run().catch(console.error);