-- 创建颜色标签表
CREATE TABLE IF NOT EXISTS color_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 创建材质标签表
CREATE TABLE IF NOT EXISTS material_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 添加一些初始的颜色标签
INSERT INTO color_tags (name) VALUES
    ('Red'),
    ('Blue'),
    ('Green'),
    ('Black'),
    ('White'),
    ('Yellow'),
    ('Orange'),
    ('Purple'),
    ('Pink'),
    ('Brown'),
    ('Gray'),
    
    ('Silver'),
    ('Gold')
ON CONFLICT (name) DO NOTHING;

-- 添加一些初始的材质标签
INSERT INTO material_tags (name) VALUES
    ('Alloy'),
    ('Wood'),
    ('Plastic'),
    ('Glass'),
    ('Fabric'),
    ('Composite'),
    ('Metal'),
    ('Ceramic'),
    ('Leather'),
    ('Paper'),
    ('Rubber'),
    ('Stone')
ON CONFLICT (name) DO NOTHING;

-- 确保在submissions表中有相应的字段
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS color TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS material TEXT[] DEFAULT '{}';

-- 添加RLS (Row Level Security) 策略
-- 任何人都可以查看这些标签
ALTER TABLE color_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view color tags" ON color_tags
    FOR SELECT USING (true);
    
CREATE POLICY "Anyone can view material tags" ON material_tags
    FOR SELECT USING (true);
    
-- 只有经过身份验证的用户（管理员）才能修改标签
CREATE POLICY "Only authenticated users can insert color tags" ON color_tags
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    
CREATE POLICY "Only authenticated users can update color tags" ON color_tags
    FOR UPDATE USING (auth.role() = 'authenticated');
    
CREATE POLICY "Only authenticated users can delete color tags" ON color_tags
    FOR DELETE USING (auth.role() = 'authenticated');
    
CREATE POLICY "Only authenticated users can insert material tags" ON material_tags
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    
CREATE POLICY "Only authenticated users can update material tags" ON material_tags
    FOR UPDATE USING (auth.role() = 'authenticated');
    
CREATE POLICY "Only authenticated users can delete material tags" ON material_tags
    FOR DELETE USING (auth.role() = 'authenticated'); 