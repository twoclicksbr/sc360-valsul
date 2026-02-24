Leia o arquivo Claude.md na raiz do projeto antes de qualquer ação.

Execute os seguintes passos:

1. Escanear o backend (Laravel):
   - Listar todas as migrations em database/migrations/
   - Listar todos os models em app/Models/
   - Listar todas as requests em app/Http/Requests/
   - Listar todos os controllers em app/Http/Controllers/
   - Listar todas as rotas com: php artisan route:list
   - Verificar estrutura de pastas do projeto

2. Escanear o frontend (Metronic React):
   - Listar páginas em frontend/src/pages/
   - Verificar layouts em frontend/src/layouts/
   - Verificar configuração do frontend/vite.config.ts
   - Verificar frontend/src/auth/ (adapter e provider em uso)
   - Verificar frontend/src/routing/ (rotas definidas)

3. Comparar com o que está documentado no Claude.md (seções Backend e Frontend)

4. Atualizar o Claude.md com as diferenças encontradas:
   - Tabelas criadas que não estão documentadas
   - Campos que mudaram
   - Novos arquivos ou módulos no backend
   - Mudanças de configuração no frontend (vite, auth, rotas)
   - Qualquer divergência entre código e documentação

5. Manter a formatação e estrutura do Claude.md (seções Backend / Frontend separadas)

6. Mostrar resumo das alterações feitas

7. Executar: git add . && git commit -m "docs: sync Claude.md with project" && git push
