# AI Voice Agent - Web Prototype

VAPI連携のAI音声エージェントWebプロトタイプ

## 技術スタック

- **Frontend**: Next.js 14 (App Router, TypeScript)
- **Backend**: Python FastAPI
- **Database**: Supabase (PostgreSQL + Auth + Realtime)
- **Voice Engine**: VAPI (vapi.ai)
- **AI Models**: GPT-4o (Vision含む)

## プロジェクト構造

```
voice-engine-studio/
├── frontend/          # Next.js アプリケーション
├── backend/           # FastAPI バックエンド
├── shared/            # 共通型定義
├── docker-compose.yml
├── .env.example
└── README.md
```

## 機能概要

1. **AI会話・音声エンジン (VAPI連携)**
   - 会話開始/終了ボタンでセッション管理
   - VAD（発話検知）による自然な会話
   - Hotwordコマンド（「撮影して」「録音して」）

2. **スタジオ機能 & パーソナルメモリ**
   - システムプロンプト設定
   - 音声ID、応答速度パラメータ調整
   - 長期記憶（Memory）によるパーソナライズ

3. **体験シミュレータ**
   - GPS/ジオフェンス シミュレーション
   - Push通知読み上げテスト

4. **デバイス連携**
   - Webカメラキャプチャ + Vision AI解析
   - 音声録音機能

5. **外部サービス連携**
   - Google Calendar/Docs 読み書き

## セットアップ

### 1. 環境変数の設定

```bash
cp .env.example .env
# .envファイルを編集して必要なAPIキーを設定
```

### 2. Docker Composeで起動

```bash
docker-compose up -d
```

### 3. アクセス

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 必要な外部アカウント/API

1. **VAPI** (vapi.ai) - 音声エンジン
2. **OpenAI** - GPT-4o (Vision含む)
3. **Supabase** - Database + Auth
4. **Google Cloud Console** - OAuth + Calendar/Docs API

## 開発

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

### Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## ライセンス

MIT
