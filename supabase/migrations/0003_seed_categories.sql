-- Vila Bele - Gestão de Despesas
-- 0003_seed_categories.sql: categorias iniciais (editável depois pelo admin)

insert into public.categories (name, icon, sort_order) values
  ('Elétrica', 'Zap', 1),
  ('Hidráulica', 'Droplets', 2),
  ('Jardinagem', 'Trees', 3),
  ('Piscina', 'Waves', 4),
  ('Pintura', 'PaintRoller', 5),
  ('Materiais de Construção', 'BrickWall', 6),
  ('Mão de Obra', 'HardHat', 7),
  ('Limpeza', 'Sparkles', 8),
  ('Equipamentos', 'Wrench', 9),
  ('Segurança / Câmeras', 'ShieldCheck', 10),
  ('Outros', 'Package', 11);
