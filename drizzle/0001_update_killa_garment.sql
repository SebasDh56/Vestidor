UPDATE `garments`
SET
  `material` = 'Paño artesanal de tacto suave',
  `image_url` = '/images/products/chaqueta-killa-reference.png',
  `image_focus` = 'center',
  `sizes` = '["S","M","L"]',
  `size_chart` = '[{"size":"S","chestMin":84,"chestMax":90,"shoulderWidth":43,"garmentLength":58},{"size":"M","chestMin":90,"chestMax":96,"shoulderWidth":45,"garmentLength":60},{"size":"L","chestMin":96,"chestMax":104,"shoulderWidth":47,"garmentLength":64}]',
  `updated_at` = CURRENT_TIMESTAMP
WHERE `slug` = 'chaqueta-killa-marfil';
