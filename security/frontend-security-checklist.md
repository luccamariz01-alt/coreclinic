# Checklist de Seguranca (Supabase + Frontend)

## Chaves e ambientes
- Use `SUPABASE_URL` e `SUPABASE_ANON_KEY` no frontend (isso e esperado), mas garanta que RLS impede acesso indevido.
- Nunca coloque `service_role` no frontend (nem em HTML, nem em bundle, nem em Vercel env publico).
- Use variaveis de ambiente no deploy e rotacione chaves se vazarem.

## Autenticacao e sessao
- Prefira Supabase Auth (email/senha, magic link, OAuth) e use `supabase.auth.getSession()`/`onAuthStateChange`.
- Evite guardar dados sensiveis (PHI/PII) em `localStorage`. Se precisar de cache, prefira memoria e TTL curto.
- Sempre implemente logout (chame `supabase.auth.signOut()`).

## RLS e modelagem
- RLS por padrao: "deny all", depois permita so o necessario.
- Toda tabela de negocio deve ter `clinic_id` (ou `owner_id`) e politicas usando `auth.uid()`.
- Nunca use politica `USING (true)` para `authenticated` em tabelas com dados reais.
- Se tiver integracoes (n8n, webhooks), use `service_role` SOMENTE do lado servidor (Edge Function / server).

## XSS (o maior risco em SPAs estaticas)
- Evite `innerHTML` com dados do banco/usuario; prefira `textContent` e `createElement`.
- Se precisar renderizar HTML, sanitize com biblioteca robusta (ex: DOMPurify) e limite as tags/atributos.
- Nunca concatene valores em atributos/eventos (ex: `onclick="...${id}..."`).

## CSP e headers
- Configure Content-Security-Policy para bloquear inline script quando possivel.
- Adicione `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors 'none'`.
- Em HTTPS, habilite HSTS (`Strict-Transport-Security`).

## Dependencias e CDN
- Evite CDN para libs criticas em producao; prefira bundle fixo (com lockfile) ou use SRI.
- Se usar CDN, fixe versoes e aplique Subresource Integrity (SRI) quando suportado.

## Storage (arquivos)
- Bucket privado para qualquer dado sensivel.
- Politicas de Storage alinhadas com `clinic_id`/`owner_id`.
- Valide tipo/tamanho de upload no cliente e no servidor (quando aplicavel).

## Auditoria e logging
- Evite logar dados sensiveis no console (emails, CPFs, prontuario).
- Se precisar de auditoria, registre eventos (quem, quando, o que) do lado servidor.

