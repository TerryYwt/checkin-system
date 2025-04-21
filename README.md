# 商家管理系統

這是一個基於 Vue 3 和 Express.js 的商家管理系統，提供完整的商家和用戶管理功能。

## 系統功能

### 1. 管理員功能

#### 1.1 用戶管理
- 用戶列表查看
- 新增用戶
- 編輯用戶資訊
- 重置用戶密碼
- 啟用/停用用戶帳號
- 用戶搜尋和篩選

#### 1.2 商家管理
- 商家列表查看
- 新增商家
- 編輯商家資訊
- 重置商家密碼
- 啟用/停用商家帳號
- 商家搜尋和篩選

### 2. 商家功能

#### 2.1 儀表板
- 今日簽到統計
- 服務完成率
- 今日簽到列表
- 客戶狀態更新
- 快速操作按鈕

#### 2.2 QR 碼掃描
- 相機掃描功能
- 手動輸入 QR 碼
- 掃描結果顯示
- 簽到確認
- 掃描歷史記錄

### 3. 系統功能

#### 3.1 權限管理
- 基於角色的訪問控制
- JWT 認證
- 管理員和商家權限分離

#### 3.2 郵件服務
- 新用戶歡迎郵件
- 密碼重置通知
- 系統通知

## 技術架構詳解

### 前端架構 (Vue 3)

#### 1. 頁面組件
- `Admin.vue`: 管理員主頁面
  - 用戶管理
  - 商家管理
  - 系統設置
- `MerchantDashboard.vue`: 商家儀表板
  - 簽到統計
  - 客戶列表
  - 狀態更新
- `MerchantScanner.vue`: QR 碼掃描頁面
  - 相機掃描
  - 手動輸入
  - 掃描歷史

#### 2. 共用組件
- `UserForm.vue`: 用戶表單組件
- `MerchantForm.vue`: 商家表單組件
- `StatusBadge.vue`: 狀態標籤組件
- `SearchBar.vue`: 搜尋欄組件

#### 3. 狀態管理
- Vuex/Pinia 存儲
  - 用戶狀態
  - 商家狀態
  - 系統設置

#### 4. 路由配置
- 管理員路由
- 商家路由
- 認證路由

### 後端架構 (Express.js)

#### 1. API 路由
- `/api/admin/users`: 用戶管理 API
  - GET /: 獲取用戶列表
  - POST /: 創建新用戶
  - PUT /:id: 更新用戶
  - DELETE /:id: 刪除用戶
  - POST /:id/reset-password: 重置密碼

- `/api/admin/merchants`: 商家管理 API
  - GET /: 獲取商家列表
  - POST /: 創建新商家
  - PUT /:id: 更新商家
  - DELETE /:id: 刪除商家
  - POST /:id/reset-password: 重置密碼

- `/api/merchant/checkin`: 簽到相關 API
  - POST /scan: 掃描 QR 碼
  - POST /confirm: 確認簽到
  - GET /history: 獲取簽到歷史

#### 2. 中間件
- `auth.js`: 認證中間件
  - JWT 驗證
  - 角色檢查
- `error.js`: 錯誤處理中間件
- `logger.js`: 日誌記錄中間件

#### 3. 服務層
- `emailService.js`: 郵件服務
  - 發送歡迎郵件
  - 發送密碼重置郵件
- `qrService.js`: QR 碼服務
  - 生成 QR 碼
  - 驗證 QR 碼

### 資料庫設計 (MySQL/PostgreSQL)

#### 1. 用戶表 (users)
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  role ENUM('admin', 'merchant', 'user') NOT NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  last_login DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 2. 商家表 (merchants)
```sql
CREATE TABLE merchants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  store_name VARCHAR(100) NOT NULL,
  contact_person VARCHAR(50) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 3. 簽到記錄表 (checkin_records)
```sql
CREATE TABLE checkin_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  merchant_id INT NOT NULL,
  user_id INT NOT NULL,
  checkin_time DATETIME NOT NULL,
  status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (merchant_id) REFERENCES merchants(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 4. 索引設計
- users: username, email
- merchants: user_id, store_name
- checkin_records: merchant_id, user_id, checkin_time

## 安裝與設置

### 環境要求
- Node.js 14+
- MySQL 5.7+ 或 PostgreSQL 10+
- SMTP 郵件伺服器

### 安裝步驟

1. 克隆專案
```bash
git clone [repository-url]
```

2. 安裝依賴
```bash
# 前端
cd frontend
npm install

# 後端
cd backend
npm install
```

3. 設置環境變數
```env
# 後端 .env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=checkin_system
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_password
```

4. 初始化資料庫
```bash
cd backend
npm run migrate
```

5. 啟動服務
```bash
# 後端
cd backend
npm run dev

# 前端
cd frontend
npm run dev
```

## 使用說明

### 管理員登入
1. 訪問系統管理頁面
2. 使用管理員帳號登入
3. 進入用戶或商家管理頁面

### 商家登入
1. 訪問商家登入頁面
2. 使用商家帳號登入
3. 使用 QR 碼掃描功能或查看儀表板

## 安全注意事項

1. 請定期更換 JWT 密鑰
2. 確保資料庫密碼安全
3. 使用安全的 SMTP 伺服器
4. 定期備份資料庫
5. 監控系統日誌

## 開發團隊

- 開發者：[開發者名稱]
- 聯絡方式：[聯絡方式]

## 授權

[授權資訊]

## Zeabur Deployment

### Configuration Files

1. **Backend Configuration**
   - Template file: `backend/zeabur.yaml.template`
   - Create actual file: `backend/zeabur.yaml`
   - Replace environment variables with actual values
   - Never commit `zeabur.yaml` to Git

2. **Frontend Configuration**
   - Template file: `frontend/zeabur.yaml.template`
   - Create actual file: `frontend/zeabur.yaml`
   - Replace environment variables with actual values
   - Never commit `zeabur.yaml` to Git

### Environment Variables

Required environment variables for deployment:

```bash
# Database Configuration
DB_HOST=your_mysql_host
DB_PORT=3306
DB_NAME=checkin
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT Configuration
JWT_SECRET=your_jwt_secret

# Test Account Passwords
TEST_ADMIN_PASSWORD=your_test_admin_password
TEST_MERCHANT_PASSWORD=your_test_merchant_password

# API Configuration
API_URL=https://your-backend-url.zeabur.app
```

### Deployment Steps

1. Create MySQL database in Zeabur
2. Set up environment variables in Zeabur dashboard
3. Deploy backend service
4. Deploy frontend service
5. Configure custom domain (optional) 