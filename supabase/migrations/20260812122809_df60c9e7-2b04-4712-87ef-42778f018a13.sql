INSERT INTO public.blocked_email_domains(domain, reason) VALUES
 ('gmwio.com','disposable email'),
 ('mailinator.com','disposable email'),
 ('guerrillamail.com','disposable email'),
 ('10minutemail.com','disposable email'),
 ('tempmail.com','disposable email'),
 ('temp-mail.org','disposable email'),
 ('yopmail.com','disposable email'),
 ('sharklasers.com','disposable email'),
 ('trashmail.com','disposable email'),
 ('dispostable.com','disposable email'),
 ('getnada.com','disposable email'),
 ('maildrop.cc','disposable email'),
 ('mohmal.com','disposable email'),
 ('emailondeck.com','disposable email'),
 ('fakemail.net','disposable email'),
 ('throwawaymail.com','disposable email'),
 ('mailnesia.com','disposable email'),
 ('moakt.com','disposable email'),
 ('inboxkitten.com','disposable email'),
 ('tempmailo.com','disposable email')
ON CONFLICT (domain) DO NOTHING;

DELETE FROM public.businesses WHERE user_id = '1baaf7c0-1de1-4bbf-b886-7dffcc3c7b6c';
DELETE FROM public.profiles WHERE user_id = '1baaf7c0-1de1-4bbf-b886-7dffcc3c7b6c';
DELETE FROM auth.users WHERE id = '1baaf7c0-1de1-4bbf-b886-7dffcc3c7b6c';