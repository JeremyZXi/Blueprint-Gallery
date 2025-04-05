import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 创建一个带service_role密钥的Supabase客户端
// 注意：这个客户端只在服务器端运行，密钥不会暴露给浏览器
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    const { action, type, id, name, adminPassword } = await request.json();
    
    // 验证管理员密码
    const expectedPassword = process.env.VITE_ADMIN_PASSWORD;
    if (adminPassword !== expectedPassword) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid admin password' },
        { status: 401 }
      );
    }

    // 确定表名
    const tableName = type === 'color' ? 'color_tags' : 'material_tags';

    // 处理不同的操作
    switch (action) {
      case 'add': {
        const { data, error } = await supabaseAdmin
          .from(tableName)
          .insert({ name })
          .select()
          .single();

        if (error) {
          console.error(`Error adding ${type} tag:`, error);
          return NextResponse.json(
            { error: error.message },
            { status: 500 }
          );
        }

        return NextResponse.json({ success: true, data });
      }

      case 'update': {
        const { error } = await supabaseAdmin
          .from(tableName)
          .update({ name })
          .eq('id', id);

        if (error) {
          console.error(`Error updating ${type} tag:`, error);
          return NextResponse.json(
            { error: error.message },
            { status: 500 }
          );
        }

        return NextResponse.json({ success: true });
      }

      case 'delete': {
        const { error } = await supabaseAdmin
          .from(tableName)
          .delete()
          .eq('id', id);

        if (error) {
          console.error(`Error deleting ${type} tag:`, error);
          return NextResponse.json(
            { error: error.message },
            { status: 500 }
          );
        }

        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in tag management API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 