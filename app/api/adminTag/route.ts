import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../utils/supabase";

export async function POST(request: NextRequest) {
  try {
    const { action, tagType, name, id, password } = await request.json();

    // 验证管理员密码
    const expectedPassword = process.env.VITE_ADMIN_PASSWORD;
    if (password !== expectedPassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 根据操作类型执行相应的数据库操作
    switch (action) {
      case "add": {
        // 确定表名
        const tableName = tagType === "color" ? "color_tags" : "material_tags";
        
        // 添加新标签
        const { data, error } = await supabase
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
        // 确定表名
        const tableName = tagType === "color" ? "color_tags" : "material_tags";
        
        // 更新标签
        const { error } = await supabase
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
        // 确定表名
        const tableName = tagType === "color" ? "color_tags" : "material_tags";
        
        // 删除标签
        const { error } = await supabase
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
    console.error("Error in adminTag API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 