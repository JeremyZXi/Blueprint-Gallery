# Blueprint Gallery

A modern web platform for showcasing and managing IB Design Technology IA projects.

## Overview

Blueprint Gallery is a specialized application designed to showcase student IA (Internal Assessment) design projects. The platform allows students to submit their design work, including PDFs and images, while administrators can review, approve, reject, and manage these submissions. The approved projects are displayed in a filterable gallery for visitors to browse and explore.

## Features

### For Students and Visitors

- **Browse Gallery**: Explore approved IA projects with filtering options by material, color, and function
- **Submit Projects**: Upload IA projects with comprehensive details:
  - Personal information (name, grade level, email)
  - Project title and description
  - Material and color classifications
  - Functional categories
  - PDF documentation
  - Multiple project images (minimum 3, maximum 6)

### For Administrators

- **Admin Dashboard**: View submission statistics and manage content
- **Approval System**: Review pending submissions and approve or reject them
- **Rejected Items Management**: View rejected submissions with options to:
  - Move them back to pending status for reconsideration
  - Permanently delete them from the system
- **Classification System**: Organize and categorize submissions (coming soon)

## Technical Implementation

- **Frontend**: React with TypeScript, using ReactRouter for navigation
- **Styling**: TailwindCSS for responsive modern design
- **Backend Storage**: Supabase for database and file storage
- **Authentication**: Simple password-based admin authentication
- **API**: Custom API endpoints for submission, approval, and rejection processes

## Project Structure

- `/app` - Main application code
  - `/components` - Reusable UI components
  - `/routes` - Page definitions and routing
  - `/utils` - Utility functions for Supabase integration
  - `/api` - API endpoint implementations

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables in `.env.local`:
   ```
   VITE_ADMIN_PASSWORD=yourpassword
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## Configuration

### Supabase Setup

1. Create a Supabase project
2. Set up a 'submissions' table with the following fields:
   - id (uuid, primary key)
   - firstName (text)
   - lastName (text)
   - gradeLevel (text)
   - email (text)
   - title (text)
   - material (array)
   - color (array)
   - function (array)
   - status (text: 'pending', 'approved', or 'rejected')
   - createdAt (timestamp)
   - pdfUrl (text)
   - imageUrls (array)
   - description (text)
   - submissionType (text: 'MYP', 'DP', or 'IA')
3. Create a 'submissions' storage bucket for files

### EmailJS Setup

1. Create an account on [EmailJS](https://www.emailjs.com/)
2. Create a new service connecting to your email provider (Gmail, Outlook, etc.)
3. Create the following email templates:
   - Rejection template with parameters: `to_email`, `to_name`, `project_title`, `rejection_reason`
   - Approval template with parameters: `to_email`, `to_name`, `project_title`
4. Add the EmailJS configuration to your `.env.local` file:
   ```
   VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
   VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
   VITE_EMAILJS_REJECTION_TEMPLATE_ID=your_emailjs_rejection_template_id
   VITE_EMAILJS_APPROVAL_TEMPLATE_ID=your_emailjs_approval_template_id
   ```

## Usage

### Student Submission Process

1. Navigate to the Submit IA page
2. Select the submission type (MYP, DP, or IA)
3. Fill in personal and project details
4. Select relevant categories for material, color, and function
5. Upload PDF documentation and at least 3 project images
6. Submit for admin review

### Admin Review Process

1. Access the admin panel through the Admin link
2. Enter the admin password to gain access
3. View the dashboard for submission statistics
4. Navigate to the Pending tab to review new submissions
5. Approve or reject submissions as appropriate
6. Manage rejected submissions in the Rejected tab

## License

[MIT License](LICENSE)

## Acknowledgements

- This project was built to support design technology students in showcasing their work
- Utilizes Supabase for backend functionality
- Built with modern React patterns and TailwindCSS

# 关于敏感配置

为了安全地存储和使用 API 密钥等敏感信息，本项目使用环境变量：

1. 创建一个 `.env.local` 文件来存储敏感凭证:
   ```
   # EmailJS 配置
   EMAILJS_PUBLIC_KEY=your_public_key
   EMAILJS_SERVICE_ID=your_service_id
   EMAILJS_TEMPLATE_ID=your_template_id
   ```

2. 确保该文件已添加到 `.gitignore` 中，防止意外提交

3. 系统会自动从 `.env.local` 文件加载这些环境变量，并通过 `config.ts` 文件管理

环境变量方法的优势是可以在不同环境中使用不同的配置值，比如开发环境和生产环境。

# 关于统一提交系统

从2023年更新开始，Blueprint Gallery采用了统一提交系统：

1. **旧版多表系统**：之前使用不同表存储不同类型的提交
   - `submissions` 表存储IA提交
   - `submissions_myp` 表存储MYP提交
   - `submissions_dp` 表存储DP提交

2. **新版统一系统**：现在所有提交都存储在`submissions`表中，通过`submissionType`字段区分
   - `submissionType: 'MYP'` 表示MYP项目
   - `submissionType: 'DP'` 表示DP项目 
   - `submissionType: 'IA'` 或NULL（兼容旧数据）表示IA项目

3. **数据库兼容**：系统会尝试从统一表查询数据，如果失败则回退到旧表获取
   - 提交页面提供选择提交类型的选项（MYP、DP或IA）
   - 画廊页面会根据用户访问的区域（MYP、DP或IA）自动筛选对应类型的提交

4. **数据库迁移**：如果您从旧版系统升级，请运行迁移脚本添加`submissionType`字段
   ```sql
   -- 添加提交类型字段
   ALTER TABLE submissions 
   ADD COLUMN IF NOT EXISTS "submissionType" TEXT;
   
   -- 更新现有记录为默认IA类型
   UPDATE submissions 
   SET "submissionType" = 'IA' 
   WHERE "submissionType" IS NULL;
   ```

如有任何疑问，请联系系统管理员获取更多信息。

### Database Update for Submission Types

If you're upgrading from an older version of Blueprint Gallery, you need to update your database schema:

1. Run the following SQL in your Supabase SQL editor to add the submissionType field:
   ```sql
   -- 添加提交类型字段
   ALTER TABLE submissions 
   ADD COLUMN IF NOT EXISTS "submissionType" TEXT;
   
   -- 更新现有记录为默认IA类型
   UPDATE submissions 
   SET "submissionType" = 'IA' 
   WHERE "submissionType" IS NULL;
   ```
   
2. Alternatively, you can run the SQL file included in the project:
   ```
   supabase db execute < add_submission_type.sql
   ```
