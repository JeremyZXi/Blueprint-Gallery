import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 创建一个具有服务端角色的Supabase客户端（绕过RLS限制）
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    const { action, tagType, name, id, adminPassword } = await request.json();

    // 验证管理员密码
    const expectedPassword = process.env.VITE_ADMIN_PASSWORD;
    if (adminPassword !== expectedPassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 确定表名
    const tableName = tagType === "color" ? "color_tags" : "material_tags";

    // 根据操作类型执行相应的数据库操作
    switch (action) {
      case "add": {
        const { data, error } = await supabaseAdmin
          .from(tableName)
          .insert({ name })
          .select()
          .single();

        if (error) {
          console.error(`Error adding ${tagType} tag:`, error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, tag: data });
      }

      case "update": {
        const { error } = await supabaseAdmin
          .from(tableName)
          .update({ name })
          .eq("id", id);

        if (error) {
          console.error(`Error updating ${tagType} tag:`, error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
      }

      case "delete": {
        const { error } = await supabaseAdmin
          .from(tableName)
          .delete()
          .eq("id", id);

        if (error) {
          console.error(`Error deleting ${tagType} tag:`, error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in manageTags API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 