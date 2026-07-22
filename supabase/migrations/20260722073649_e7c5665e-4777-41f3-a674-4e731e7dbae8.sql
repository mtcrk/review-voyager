UPDATE public.reviews
SET text = split_part(text, E'\n\n[Çeviri]\n', 1)
WHERE platform = 'yandex' AND text LIKE '%' || E'\n\n[Çeviri]\n' || '%';