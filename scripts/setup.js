// npm run setup — .env 를 만들고 API 키를 터미널에서 입력받는다 (엔터 = 건너뛰기)
import fs from "node:fs";
import readline from "node:readline/promises";
import { loadEnv, saveEnv, status } from "../src/config.js";

loadEnv(); // .env 가 없으면 .env.example 을 복사한다
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

console.log("\n골목픽 설정 — 값을 붙여넣고 엔터 (건너뛰려면 그냥 엔터)\n");
const s = status();
const a = await rl.question(`Claude API 키 (sk-ant-...) ${s.anthropic.set ? `[현재 ${s.anthropic.preview}] ` : ""}: `);
const h = await rl.question(`HeyYumi 토큰 ${s.heyyumi.set ? `[현재 ${s.heyyumi.preview}] ` : ""}: `);
rl.close();

const updates = {};
if (a.trim()) updates.ANTHROPIC_API_KEY = a.trim();
if (h.trim()) updates.HEYYUMI_API_KEY = h.trim();
saveEnv(updates);

console.log(`\n✅ .env 저장 완료 (모드: ${status().mode})`);
console.log(fs.existsSync("node_modules") ? "이제 npm start 로 실행하세요.\n" : "npm install 후 npm start 로 실행하세요.\n");
