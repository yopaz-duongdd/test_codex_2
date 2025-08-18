import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const app = express();
app.use(cors());
app.use(express.json());

let db;

async function initDb() {
  db = await open({
    filename: './data.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT,
      description TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );
    CREATE TABLE IF NOT EXISTS screens (
      id TEXT PRIMARY KEY,
      name TEXT,
      domain TEXT,
      urlPath TEXT,
      projectId TEXT,
      description TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT,
      projectId TEXT,
      createdAt TEXT
    );
    CREATE TABLE IF NOT EXISTS testScripts (
      id TEXT PRIMARY KEY,
      name TEXT,
      projectId TEXT,
      screenId TEXT,
      tagId TEXT,
      version INTEGER,
      fileName TEXT,
      fileContent TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );
    CREATE TABLE IF NOT EXISTS testResults (
      id TEXT PRIMARY KEY,
      testScriptId TEXT,
      status TEXT,
      startTime TEXT,
      endTime TEXT,
      errorMessage TEXT,
      screenshots TEXT,
      consoleErrors TEXT,
      steps TEXT,
      createdAt TEXT
    );`);
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Projects
app.get('/api/projects', async (_req, res) => {
  const rows = await db.all('SELECT * FROM projects');
  res.json(rows);
});

app.post('/api/projects', async (req, res) => {
  const id = generateId();
  const createdAt = new Date().toISOString();
  const updatedAt = createdAt;
  const { name, description } = req.body;
  await db.run(
    'INSERT INTO projects (id, name, description, createdAt, updatedAt) VALUES (?,?,?,?,?)',
    id,
    name,
    description,
    createdAt,
    updatedAt
  );
  const project = await db.get('SELECT * FROM projects WHERE id=?', id);
  res.json(project);
});

app.put('/api/projects/:id', async (req, res) => {
  const id = req.params.id;
  const updatedAt = new Date().toISOString();
  const { name, description } = req.body;
  await db.run(
    'UPDATE projects SET name=?, description=?, updatedAt=? WHERE id=?',
    name,
    description,
    updatedAt,
    id
  );
  const project = await db.get('SELECT * FROM projects WHERE id=?', id);
  res.json(project);
});

app.delete('/api/projects/:id', async (req, res) => {
  const id = req.params.id;
  await db.run('DELETE FROM projects WHERE id=?', id);
  await db.run('DELETE FROM screens WHERE projectId=?', id);
  await db.run('DELETE FROM tags WHERE projectId=?', id);
  const scripts = await db.all('SELECT id FROM testScripts WHERE projectId=?', id);
  for (const s of scripts) {
    await db.run('DELETE FROM testResults WHERE testScriptId=?', s.id);
  }
  await db.run('DELETE FROM testScripts WHERE projectId=?', id);
  res.json({ success: true });
});

// Screens
app.get('/api/screens', async (_req, res) => {
  const rows = await db.all('SELECT * FROM screens');
  res.json(rows);
});

app.post('/api/screens', async (req, res) => {
  const id = generateId();
  const createdAt = new Date().toISOString();
  const updatedAt = createdAt;
  const { name, domain, urlPath, projectId, description } = req.body;
  await db.run(
    'INSERT INTO screens (id,name,domain,urlPath,projectId,description,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?)',
    id,
    name,
    domain,
    urlPath,
    projectId,
    description,
    createdAt,
    updatedAt
  );
  const screen = await db.get('SELECT * FROM screens WHERE id=?', id);
  res.json(screen);
});

app.put('/api/screens/:id', async (req, res) => {
  const id = req.params.id;
  const updatedAt = new Date().toISOString();
  const { name, domain, urlPath, projectId, description } = req.body;
  await db.run(
    'UPDATE screens SET name=?, domain=?, urlPath=?, projectId=?, description=?, updatedAt=? WHERE id=?',
    name,
    domain,
    urlPath,
    projectId,
    description,
    updatedAt,
    id
  );
  const screen = await db.get('SELECT * FROM screens WHERE id=?', id);
  res.json(screen);
});

app.delete('/api/screens/:id', async (req, res) => {
  const id = req.params.id;
  await db.run('DELETE FROM screens WHERE id=?', id);
  await db.run('DELETE FROM testScripts WHERE screenId=?', id);
  res.json({ success: true });
});

// Tags
app.get('/api/tags', async (_req, res) => {
  const rows = await db.all('SELECT * FROM tags');
  res.json(rows);
});

app.post('/api/tags', async (req, res) => {
  const id = generateId();
  const createdAt = new Date().toISOString();
  const { name, projectId } = req.body;
  await db.run('INSERT INTO tags (id,name,projectId,createdAt) VALUES (?,?,?,?)', id, name, projectId, createdAt);
  const tag = await db.get('SELECT * FROM tags WHERE id=?', id);
  res.json(tag);
});

app.delete('/api/tags/:id', async (req, res) => {
  const id = req.params.id;
  await db.run('DELETE FROM tags WHERE id=?', id);
  res.json({ success: true });
});

// Test Scripts
app.get('/api/test-scripts', async (_req, res) => {
  const rows = await db.all('SELECT * FROM testScripts');
  res.json(rows);
});

app.post('/api/test-scripts', async (req, res) => {
  const id = generateId();
  const createdAt = new Date().toISOString();
  const updatedAt = createdAt;
  const { name, projectId, screenId, tagId, fileName, fileContent } = req.body;
  const version = 1;
  await db.run(
    'INSERT INTO testScripts (id,name,projectId,screenId,tagId,version,fileName,fileContent,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?)',
    id,
    name,
    projectId,
    screenId,
    tagId,
    version,
    fileName,
    fileContent,
    createdAt,
    updatedAt
  );
  const script = await db.get('SELECT * FROM testScripts WHERE id=?', id);
  res.json(script);
});

app.put('/api/test-scripts/:id', async (req, res) => {
  const id = req.params.id;
  const existing = await db.get('SELECT * FROM testScripts WHERE id=?', id);
  if (!existing) return res.status(404).end();
  const updatedAt = new Date().toISOString();
  const version = (existing.version || 1) + 1;
  const { name, projectId, screenId, tagId, fileName, fileContent } = req.body;
  await db.run(
    'UPDATE testScripts SET name=?, projectId=?, screenId=?, tagId=?, version=?, fileName=?, fileContent=?, updatedAt=? WHERE id=?',
    name,
    projectId,
    screenId,
    tagId,
    version,
    fileName,
    fileContent,
    updatedAt,
    id
  );
  const script = await db.get('SELECT * FROM testScripts WHERE id=?', id);
  res.json(script);
});

app.delete('/api/test-scripts/:id', async (req, res) => {
  const id = req.params.id;
  await db.run('DELETE FROM testScripts WHERE id=?', id);
  await db.run('DELETE FROM testResults WHERE testScriptId=?', id);
  res.json({ success: true });
});

// Test Results
function parseResult(row) {
  if (!row) return row;
  return {
    ...row,
    screenshots: row.screenshots ? JSON.parse(row.screenshots) : [],
    consoleErrors: row.consoleErrors ? JSON.parse(row.consoleErrors) : [],
    steps: row.steps ? JSON.parse(row.steps) : []
  };
}

app.get('/api/test-results', async (_req, res) => {
  const rows = await db.all('SELECT * FROM testResults');
  res.json(rows.map(parseResult));
});

app.post('/api/test-results', async (req, res) => {
  const id = generateId();
  const createdAt = new Date().toISOString();
  const {
    testScriptId,
    status,
    startTime,
    endTime,
    errorMessage,
    screenshots = [],
    consoleErrors = [],
    steps = []
  } = req.body;
  await db.run(
    'INSERT INTO testResults (id,testScriptId,status,startTime,endTime,errorMessage,screenshots,consoleErrors,steps,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?)',
    id,
    testScriptId,
    status,
    startTime,
    endTime,
    errorMessage,
    JSON.stringify(screenshots),
    JSON.stringify(consoleErrors),
    JSON.stringify(steps),
    createdAt
  );
  const result = await db.get('SELECT * FROM testResults WHERE id=?', id);
  res.json(parseResult(result));
});

app.delete('/api/test-results/:id', async (req, res) => {
  const id = req.params.id;
  await db.run('DELETE FROM testResults WHERE id=?', id);
  res.json({ success: true });
});

// Initialize sample data
app.post('/api/init', async (_req, res) => {
  const count = await db.get('SELECT COUNT(*) as c FROM projects');
  if (count.c > 0) return res.json({ success: true });

  // Sample projects
  const now = new Date().toISOString();
  const project1Id = generateId();
  await db.run('INSERT INTO projects (id,name,description,createdAt,updatedAt) VALUES (?,?,?,?,?)', project1Id, 'E-commerce Website', 'Main e-commerce platform testing', now, now);
  const project2Id = generateId();
  await db.run('INSERT INTO projects (id,name,description,createdAt,updatedAt) VALUES (?,?,?,?,?)', project2Id, 'Admin Dashboard', 'Backend admin panel testing', now, now);

  // Screens
  const s1id = generateId();
  await db.run('INSERT INTO screens (id,name,domain,urlPath,projectId,description,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?)', s1id, 'Login Page', 'https://example-store.com', '/login', project1Id, 'User authentication screen', now, now);
  const s2id = generateId();
  await db.run('INSERT INTO screens (id,name,domain,urlPath,projectId,description,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?)', s2id, 'Product List', 'https://example-store.com', '/products', project1Id, 'Product listing and search', now, now);

  // Tags
  const tag1id = generateId();
  await db.run('INSERT INTO tags (id,name,projectId,createdAt) VALUES (?,?,?,?)', tag1id, 'regression', project1Id, now);
  const tag2id = generateId();
  await db.run('INSERT INTO tags (id,name,projectId,createdAt) VALUES (?,?,?,?)', tag2id, 'smoke', project1Id, now);

  // Test script
  const scriptId = generateId();
  await db.run('INSERT INTO testScripts (id,name,projectId,screenId,tagId,version,fileName,fileContent,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?)', scriptId, 'Login Flow Test', project1Id, s1id, tag1id, 1, 'login-test.js', `const puppeteer = require('puppeteer');\n\n(async () => {\n  const browser = await puppeteer.launch();\n  const page = await browser.newPage();\n\n  await page.goto('https://example-store.com/login');\n  await page.type('#email', 'test@example.com');\n  await page.type('#password', 'password123');\n  await page.click('#login-button');\n\n  await browser.close();\n})();`, now, now);

  // Test result
  const resultId = generateId();
  await db.run('INSERT INTO testResults (id,testScriptId,status,startTime,endTime,screenshots,consoleErrors,steps,createdAt) VALUES (?,?,?,?,?,?,?,?,?)', resultId, scriptId, 'success', new Date(Date.now() - 300000).toISOString(), new Date(Date.now() - 290000).toISOString(), '[]', '[]', JSON.stringify([{ id: generateId(), stepNumber: 1, url: 'https://example-store.com/login', consoleErrors: [], timestamp: new Date(Date.now() - 295000).toISOString() }]), now);

  res.json({ success: true });
});

const PORT = 3001;
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
  });
});

