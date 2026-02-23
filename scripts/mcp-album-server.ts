import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";

/**
 * Initialize the MCP Server
 */
const server = new Server(
  {
    name: "album-manager",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Step 1: List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_albums",
        description: "List all albums from the local database",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "add_album",
        description: "Add a new album to the local database",
        inputSchema: {
          type: "object",
          properties: {
            title: { type: "string", description: "The title of the album" },
            description: { type: "string", description: "A brief description of the album" },
          },
          required: ["title"],
        },
      },
    ],
  };
});

/**
 * Step 2: Handle tool execution
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const dbPath = path.join(process.cwd(), "db", "albums.json");

  if (request.params.name === "list_albums") {
    try {
      const data = await fs.readFile(dbPath, "utf-8");
      return {
        content: [{ type: "text", text: data }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error}` }],
        isError: true,
      };
    }
  }

  if (request.params.name === "add_album") {
    try {
      const { title, description } = request.params.arguments as { title: string; description?: string };
      
      const data = await fs.readFile(dbPath, "utf-8");
      const albums = JSON.parse(data);
      
      const newAlbum = {
        id: `manual_${Date.now()}`,
        title,
        description: description || "",
        lastSynced: new Date().toISOString(),
      };
      
      albums.push(newAlbum);
      await fs.writeFile(dbPath, JSON.stringify(albums, null, 2));

      return {
        content: [{ type: "text", text: `Successfully added album: ${title}` }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error adding album: ${error}` }],
        isError: true,
      };
    }
  }

  throw new Error(`Tool not found: ${request.params.name}`);
});

/**
 * Step 3: Start the server using Stdio transport
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Album Manager MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
