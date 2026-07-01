const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json());
// 托管前端静态文件
app.use(express.static(path.join(__dirname, '../public')));

// MySQL 数据库配置（你的环境：端口3308，密码haode）
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'haode',
  database: 'lianliankan',
  port: 3308,
  connectionLimit: 10,
  waitForConnections: true
};
const pool = mysql.createPool(dbConfig);

// 测试数据库连接
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL 数据库连接成功');
    conn.release();
  } catch (err) {
    console.log('❌ MySQL 连接失败:');
    console.log('请检查账号密码是否正确、MySQL服务是否启动、端口3308是否匹配');
    console.error(err);
  }
})();

// 接口1：提交分数
app.post('/api/score', async (req, res) => {
  const { nickname, score, time_used, use_hint, use_shuffle } = req.body;
  const sql = `
    INSERT INTO scores (nickname, score, time_used, use_hint, use_shuffle)
    VALUES (?, ?, ?, ?, ?)
  `;
  try {
    await pool.query(sql, [nickname, score, time_used, use_hint, use_shuffle]);
    res.json({ code: 200, msg: '提交成功' });
  } catch (err) {
    res.status(500).json({ code: 500, msg: '提交失败', err: err.message });
  }
});

// 接口2：获取排行榜（按分数降序）
app.get('/api/rankings', async (req, res) => {
  const sql = `
    SELECT nickname, score, time_used FROM scores
    ORDER BY score DESC, time_used ASC LIMIT 20
  `;
  try {
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ code: 500, msg: '获取榜单失败', err: err.message });
  }
});

// 启动服务
app.listen(PORT, () => {
  console.log('🚀 服务器启动成功');
  console.log(`🎮 游戏访问地址: http://localhost:${PORT}`);
});